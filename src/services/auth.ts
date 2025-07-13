interface LoginParams {
  username: string;
  password: string;
  captcha?: string; // 添加验证码字段
}

interface RegisterParams {
  username: string;
  password: string;
  // 其他注册字段...
}

export default {
  // 用户登录
  login: (data: LoginParams) => 
    fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()),
  
  // 用户注册
  register: (data: RegisterParams) => fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
};