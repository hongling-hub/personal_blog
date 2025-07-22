import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Menu, Input, Space, Avatar, Dropdown, Button, Badge } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, HomeOutlined, FileTextOutlined, StarOutlined, SettingOutlined, LogoutOutlined, MessageOutlined, QuestionCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

const { Search } = Input;

const Header: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 添加token验证函数
  const isTokenValid = (token: string): boolean => {
    try {
      // 解码JWT payload检查过期时间
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };
  
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const isValid = isTokenValid(token);
      if (!isValid) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }
  };
  
  useEffect(() => {
    checkAuthStatus();
    
    // 每30秒检查一次token状态
    const intervalId = setInterval(checkAuthStatus, 30000);
    
    // 监听token过期事件
    const handleTokenExpired = () => checkAuthStatus();
    window.addEventListener('tokenExpired', handleTokenExpired);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人主页',
      onClick: () => navigate('/profile'),
    },
    { key: 'articles', icon: <FileTextOutlined />, label: '创作者中心', onClick: () => navigate('/creator-center'),
      
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
      }
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="../src/assets/images/logo/image.png" alt="CSDN Logo" className={styles.logoImg} />
          </Link>
        </div>

        <nav className={styles.nav}>
          <Menu mode="horizontal" selectedKeys={['home']} items={[
            {
              key: 'home',
              icon: <HomeOutlined />,
              label: <Link to="/">首页</Link>,
            },
            {
              key: 'articles',
              icon: <FileTextOutlined />,
              label: <Link to="/articles">博客</Link>,
            },
            {
              key: 'courses',
              icon: <ReadOutlined />,
              label: <Link to="/courses">课程</Link>,
            },
            {
              key: 'questions',
              icon: <QuestionCircleOutlined />,
              label: <Link to="/questions">问答</Link>,
            },
            {
              key: 'messages',
              icon: <MessageOutlined />,
              label: <Link to="/messages">消息</Link>,
            },
            { key: 'vip', label: <Link to="/vip" className={styles.vipLink}>VIP</Link> }
          ]} />
        </nav>

        <div className={styles.actions}>
          <Space size="middle">
            <Button type="primary" icon={<FileTextOutlined />} onClick={() => navigate('/write-article')}>写博客</Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'comment', label: '评论' },
                  { key: 'like', label: '赞和收藏' },
                  { key: 'follower', label: '新增粉丝' },
                  { key: 'message', label: '私信' },
                  { key: 'notification', label: (
                    <span>
                      系统通知 <Badge count={2} size="small" />
                    </span>
                  )}
                ]
              }}
              trigger={['hover']}
              placement="bottomRight"
            >
              <Badge count={5}>
                <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
              </Badge>
            </Dropdown>
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar 
                src={user?.avatar || "../src/assets/images/avatar/default.png"} 
                size="large" 
                style={{ cursor: 'pointer' ,marginLeft: '1rem'}}
              />
              </Dropdown>
            ) : (
              <Button 
                type="default" 
                shape="circle" 
                size="large" 
                className={styles.loginButton} 
                onClick={() => navigate('/login')}
              >
                登录
              </Button>
            )}
          </Space>
        </div>
        <div className={styles.subHeader}>
        <div className={styles.searchContainer}>
          <Search
            placeholder="搜索文章、作者、标签"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
          />
        </div>
      </div>
      </div>
    </header>
  );
};

export default Header;