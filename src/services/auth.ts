import axios from 'axios';
import { message } from 'antd';
interface LoginParams {
  username: string;
  password: string;
  captcha: string;
}

interface RegisterParams {
  username: string;
  password: string;
  captcha: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
}

interface UserInfoResponse {
  id: string;
  username: string;
  avatar: string;
  createdAt: string;
  stats: {
    followers: number;
    following: number;
    collections: number;
    tags: number;
    likes: number;
    posts: number;
  }
}

// 定义关注用户类型
interface FollowingUser {
  _id: string;
  username: string;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
  createdAt: string;
}

export default {
  // 用户登录
  login: async (data: LoginParams): Promise<LoginResponse> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const response = await res.json();

if (!res.ok) {
  throw new Error(response.message || '登录失败');
}

// 保存token到本地存储
localStorage.setItem('token', response.token);

return {
        success: true,
        token: response.token,
        message: response.message || '登录成功'
      };
    } catch (error) {
    console.error('登录请求失败:', error);
    const errorMessage = error instanceof Error ? error.message : '登录失败';
    message.error(errorMessage);
    throw new Error(typeof error === 'string' ? error : '网络错误，请稍后重试');
  }
  },

  // 用户注册
  register: async (data: RegisterParams): Promise<RegisterResponse> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          captcha: data.captcha
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.message || '注册失败');
      }

      return {
        success: true,
        message: response.message || '注册成功'
      };
    } catch (error) {
      console.error('注册请求失败:', error);
      // 更详细的错误处理，提取可能的响应消息
      let errorMessage = '网络错误，请稍后重试';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      throw new Error(errorMessage);
    }
  },

  // 获取用户信息
  getUserInfo: async (): Promise<UserInfoResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }
      
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('获取用户信息失败');
      }
      
      return await res.json();
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new Error(typeof error === 'string' ? error : '网络错误，请稍后重试');
    }
  },

  // 上传头像
  updateUsername: async (newUsername: string): Promise<{ success: boolean; username: string }> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    const response = await axios.patch('/api/auth/update-username',
      { newUsername },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
  uploadAvatar: async (file: File): Promise<string> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('上传头像失败');
      }
      
      const data = await res.json();
      return data.avatar;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw new Error(typeof error === 'string' ? error : '网络错误，请稍后重试');
    }
  },

  // 关注作者
  follow: async (authorId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }
      
      const res = await fetch(`/api/users/follow/${authorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || '关注失败');
      }
      
      return await res.json();
    } catch (error) {
      console.error('关注失败:', error);
      const errorMessage = error instanceof Error ? error.message : '网络错误，请稍后重试';
      throw new Error(errorMessage);
    }
  },

  // 取消关注作者
  unfollow: async (authorId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }
      
      const res = await fetch(`/api/users/unfollow/${authorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || '取消关注失败');
      }
      
      return await res.json();
    } catch (error) {
      console.error('取消关注失败:', error);
      const errorMessage = error instanceof Error ? error.message : '网络错误，请稍后重试';
      throw new Error(errorMessage);
    }
  },

  // 检查是否关注作者
  checkFollowing: async (authorId: string): Promise<{ isFollowing: boolean }> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }
      
      const res = await fetch(`/api/users/check-following/${authorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('检查关注状态失败');
      }
      
      return await res.json();
    } catch (error) {
      console.error('检查关注状态失败:', error);
      throw new Error(typeof error === 'string' ? error : '网络错误，请稍后重试');
    }
  },

  // 获取当前用户关注的用户列表
  getFollowingUsers: async (): Promise<FollowingUser[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }
      
      const res = await fetch('/api/users/following', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('获取关注用户列表失败');
      }
      
      return await res.json();
    } catch (error) {
      console.error('获取关注用户列表失败:', error);
      throw new Error(typeof error === 'string' ? error : '网络错误，请稍后重试');
    }
  }
};