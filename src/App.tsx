import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useLocation, Navigate } from 'react-router-dom';

const { Content } = Layout;

export default function App() {
  const location = useLocation();
  
  // 根路径重定向到首页
  if (location.pathname === '/') {
    return <Navigate to="/home" replace />;
  }
  return (
    <Layout className="app-container">
      <Header />
      <Content className="app-content">
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  );
}

import './App.css';