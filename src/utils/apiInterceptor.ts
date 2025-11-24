import { message } from 'antd';
import { useUser } from '../contexts/UserContext';

// 全局token过期处理标志
let isHandlingTokenExpired = false;

// 统一的API请求拦截器
export const createApiInterceptor = () => {
  // 原始的fetch函数
  const originalFetch = window.fetch;

  // 重写fetch函数
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // 添加Authorization头
    const token = localStorage.getItem('token');
    if (token) {
      init = {
        ...init,
        headers: {
          ...init?.headers,
          'Authorization': `Bearer ${token}`
        }
      };
    }

    try {
      const response = await originalFetch(input, init);
      
      // 检查响应状态
      if (response.status === 401) {
        // 避免重复处理token过期
        if (!isHandlingTokenExpired) {
          isHandlingTokenExpired = true;
          
          // 先尝试刷新token
          const refreshed = await refreshToken();
          if (refreshed) {
            // 刷新成功，重新发送原始请求
            isHandlingTokenExpired = false;
            
            // 重新添加Authorization头
            const newToken = localStorage.getItem('token');
            if (newToken) {
              const newInit = {
                ...init,
                headers: {
                  ...init?.headers,
                  'Authorization': `Bearer ${newToken}`
                }
              };
              
              // 重新发送请求
              return await originalFetch(input, newInit);
            }
          }
          
          // 刷新失败或没有refresh token，清除本地token
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // 显示登录过期提示
          message.error('登录已过期，请重新登录');
          
          // 重定向到登录页
          if (window.location.pathname !== '/auth/login' && 
              window.location.pathname !== '/auth/register') {
            window.location.href = '/auth/login';
          }
          
          // 重置处理标志
          setTimeout(() => {
            isHandlingTokenExpired = false;
          }, 3000);
        }
        
        // 抛出错误，让调用方知道请求失败
        throw new Error('登录已过期');
      }
      
      return response;
    } catch (error) {
      // 如果是网络错误，显示提示
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        message.error('网络连接失败，请检查网络连接');
      }
      
      throw error;
    }
  };

  // 返回清理函数
  return () => {
    window.fetch = originalFetch;
  };
};

// 检查token是否即将过期（提前15分钟检查）
export const checkTokenExpiry = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // 解析JWT token（不验证签名，只获取过期时间）
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // 转换为毫秒
    const currentTime = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    
    // 如果token将在15分钟内过期，返回true
    return (expiryTime - currentTime) < fifteenMinutes;
  } catch (error) {
    console.error('解析token失败:', error);
    return false;
  }
};

// 刷新token的函数
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.accessToken);
      console.log('Token自动刷新成功');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('刷新token失败:', error);
    return false;
  }
};

// 定期检查token状态的函数
export const startTokenMonitor = () => {
  // 每分钟检查一次token状态
  setInterval(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    if (checkTokenExpiry()) {
      // token即将过期，尝试刷新
      const refreshed = await refreshToken();
      if (!refreshed) {
        // 刷新失败，只在用户有token时才提示
        message.warning('登录状态即将过期，请保存当前操作');
      }
    }
  }, 60000); // 每分钟检查一次
};