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

      return {
        success: true,
        token: response.token,
        message: response.message || '登录成功'
      };
    } catch (error) {
      console.error('登录请求失败:', error);
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
      throw new Error(typeof error === 'string' ? error : '网络错误，请稍后重试');
    }
  }
};