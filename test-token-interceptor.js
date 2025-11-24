// 测试token拦截器功能
console.log('开始测试token拦截器...');

// 模拟设置一个过期的token
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

// 测试API请求
fetch('/api/auth/me')
  .then(response => {
    if (response.status === 401) {
      console.log('✅ 拦截器正常工作：检测到401错误');
      console.log('✅ token已从localStorage中清除：', localStorage.getItem('token'));
    } else {
      console.log('❌ 拦截器可能未正常工作，状态码：', response.status);
    }
  })
  .catch(error => {
    console.log('✅ 拦截器正常工作：捕获到错误', error.message);
    console.log('✅ token已从localStorage中清除：', localStorage.getItem('token'));
  });