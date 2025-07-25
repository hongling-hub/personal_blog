import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from './contexts/UserContext';

const PrivateRoute = () => {
  const { user, loading } = useUser();
  const location = useLocation();

  // 加载中不做重定向
  if (loading) {
    return null;
  }

  // 未登录且不在登录/注册页面，重定向到登录页
  if (!user && !['/login', '/register'].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;