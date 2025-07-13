import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/auth';
// 确保路径正确
import styles from './index.module.scss';
// @ts-ignore 忽略找不到模块或类型声明的错误

interface LoginValues {
  username: string;
  password: string;
  captcha: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const Login: React.FC = () => {
  const [captcha, setCaptcha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 刷新验证码
  const refreshCaptcha = () => {
    try {
      setCaptcha(`/api/auth/captcha?t=${Date.now()}`);
    } catch (error) {
      console.error('刷新验证码失败:', error);
      message.error('验证码加载失败');
    }
  };

  // 初始化验证码
  useEffect(() => {
    refreshCaptcha();
  }, []);

  // 提交登录表单
  const onFinish = async (values: LoginValues) => {
    setLoading(true);
    try {
      const response: LoginResponse = await authService.login({
        username: values.username,
        password: values.password,
        captcha: values.captcha
      });

      if (!response) {
        throw new Error('无响应数据');
      }

      if (response.success) {
        message.success('登录成功');
        navigate('/', { replace: true }); // 使用replace避免回退到登录页
      } else {
        throw new Error(response.message || '登录失败，请检查用户名、密码和验证码');
      }
    } catch (error) {
      const err = error as Error;
      message.error(err.message || '登录失败');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>用户登录</div>
        <Form<LoginValues>
          name="login"
          initialValues={{ 
            username: '',
            password: '',
            captcha: '' 
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { 
                required: true, 
                message: '请输入用户名!' 
              },
              {
                min: 4,
                max: 16,
                message: '用户名长度应在4-16个字符之间'
              }
            ]}
            hasFeedback
          >
            <Input 
              prefix={<UserOutlined className={styles.prefixIcon} />} 
              placeholder="请输入用户名" 
              size="large"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { 
                required: true, 
                message: '请输入密码!' 
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/,
                message: '密码需包含大小写字母和数字，长度8-16位'
              }
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className={styles.prefixIcon} />}
              placeholder="请输入密码"
              size="large"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="captcha"
            rules={[
              { 
                required: true, 
                message: '请输入验证码!' 
              },
              {
                len: 4,
                message: '验证码长度为4位'
              }
            ]}
          >
            <Input
              prefix={<SafetyOutlined className={styles.prefixIcon} />}
              placeholder="请输入验证码"
              size="large"
              addonAfter={
                <img 
                  src={captcha} 
                  onClick={refreshCaptcha} 
                  alt="验证码" 
                  className={styles.captchaImg}
                  title="点击刷新验证码"
                />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
              className={styles.submitButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;