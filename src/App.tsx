import { useEffect, useRef, useCallback } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
// CommentProvider已在main.tsx中导入并使用，此处移除重复导入

const { Content } = Layout;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // 使用ref存储当前计时器ID，避免闭包问题和不必要的重渲染
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 处理用户登出
  const handleLogout = useCallback(() => {
    // 清除本地存储的令牌
    localStorage.removeItem('token');
    // 重定向到登录页
    navigate('/auth/login');
  }, [navigate]);
  
  // 重置不活动计时器
  const resetTimer = useCallback(() => {
    // 清除现有的计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // 设置新的计时器 (2小时 = 7200000毫秒)
    const newTimer = setTimeout(handleLogout, 7200000);
    timerRef.current = newTimer;
  }, [handleLogout]);
  
  useEffect(() => {
    // 初始设置计时器
    resetTimer();
    
    // 添加用户活动监听器
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // 清除函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);
  
  // 根路径重定向到首页
  if (location.pathname === '/') {
    return <Navigate to="/home" replace />;
  }
  
  return (
      <Layout className="app-container">

        <Content className="app-content">
          <Outlet />
      </Content>
    </Layout>
  );
}

import './App.css';