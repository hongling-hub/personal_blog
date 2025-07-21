import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = () => {
  // 检查本地存储中是否有令牌
  const hasToken = !!localStorage.getItem('token');
  const location = useLocation();

  // 如果没有令牌且当前不在登录/注册页面，则重定向到登录页
  if (!hasToken && !['/login', '/register'].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;