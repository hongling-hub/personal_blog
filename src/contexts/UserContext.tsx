import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth';

// 定义用户信息类型
interface User {
  username: string;
  avatar: string;
  [key: string]: any;
}

// 定义上下文类型
interface UserContextType {
  user: User | null;
  updateUser: (userData: User | null) => void;
  loading: boolean;
}

// 创建上下文
const UserContext = createContext<UserContextType | undefined>(undefined);

// 上下文提供者组件
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getUserInfo();
        setUser(userData);
      }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        // 清除无效token
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
  };

  // 初始化时获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 更新用户信息
  const updateUser = (userData: User | null) => {
    setUser(userData);
  };

  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // token被移除，登出
          setUser(null);
        } else if (!user) {
          // token被添加，但用户状态为空，重新获取用户信息
          fetchUserInfo();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, updateUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// 自定义Hook便于组件使用上下文
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// 导出上下文供TypeScript使用
export default UserContext;