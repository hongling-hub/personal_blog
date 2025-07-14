import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/auth';
import ParticleBackground from '@/components/ParticleBackground';
import styles from './index.module.scss';

const { TabPane } = Tabs;

// 登录表单接口
interface LoginValues {
  username: string;
  password: string;
  captcha: string;
}

// 注册表单接口
interface RegisterValues {
  username: string;
  password: string;
  confirmPassword: string;
  captcha: string;
}

const AuthPage: React.FC = () => {
  const [captcha, setCaptcha] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('login');
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

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

  // 登录表单提交
  const handleLogin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const response = await authService.login({
        username: values.username,
        password: values.password,
        captcha: values.captcha
      });

      if (response.success) {
        message.success('登录成功');
        navigate('/', { replace: true });
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

  // 注册表单提交
  const handleRegister = async (values: RegisterValues) => {
    setLoading(true);
    try {
      const response = await authService.register({
        username: values.username,
        password: values.password,
        captcha: values.captcha
      });

      if (response.success) {
        message.success('注册成功，请登录');
        setActiveKey('login'); // 切换到登录表单
        registerForm.resetFields(); // 重置注册表单
        refreshCaptcha();
      } else {
        throw new Error(response.message || '注册失败');
      }
    } catch (error) {
      const err = error as Error;
      message.error(err.message || '注册失败');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <ParticleBackground />
      <div className={styles.container}>
        <div className={styles.content}>
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            className={styles.tabs}
            centered
          >
            <TabPane tab="登录" key="login">
              <div className={styles.title}>欢迎回来</div>
              <div className={styles.subtitle}>请登录您的账号</div>
              <Form<LoginValues>
                form={loginForm}
                name="login"
                initialValues={{ username: '', password: '', captcha: '' }}
                onFinish={handleLogin}
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: '请输入用户名!' },
                    { min: 4, max: 16, message: '用户名长度应在4-16个字符之间' }
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
                    { required: true, message: '请输入密码!' },
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
                    { required: true, message: '请输入验证码!' },
                    { len: 4, message: '验证码长度为4位' }
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
            </TabPane>

            <TabPane tab="注册" key="register">
              <div className={styles.title}>创建账号</div>
              <div className={styles.subtitle}>注册新账号</div>
              <Form<RegisterValues>
                form={registerForm}
                name="register"
                initialValues={{ username: '', password: '', confirmPassword: '', captcha: '' }}
                onFinish={handleRegister}
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: '请输入用户名!' },
                    { min: 4, max: 16, message: '用户名长度应在4-16个字符之间' }
                  ]}
                  hasFeedback
                >
                  <Input 
                    prefix={<UserOutlined className={styles.prefixIcon} />} 
                    placeholder="请输入用户名"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码!' },
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
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  rules={[
                    { required: true, message: '请确认密码!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次密码输入不一致!'));
                      },
                    })
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined className={styles.prefixIcon} />}
                    placeholder="请再次输入密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="captcha"
                  rules={[{ required: true, message: '请输入验证码!' }]}
                >
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Input
                      prefix={<SafetyOutlined className={styles.prefixIcon} />}
                      placeholder="请输入验证码"
                      size="large"
                      style={{ flex: 1 }}
                    />
                    <img
                      src={captcha}
                      alt="验证码"
                      onClick={refreshCaptcha}
                      style={{ 
                        cursor: 'pointer', 
                        width: '100px', 
                        height: '40px', 
                        objectFit: 'cover' 
                      }}
                    />
                  </div>
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
                    注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;