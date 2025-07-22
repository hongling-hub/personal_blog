import React from 'react';
import { Badge, Dropdown, MenuProps } from 'antd';
import { BellOutlined, UserOutlined, FileTextOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './index.module.scss';

const SubHeader: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    updateUser({});
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人主页',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'articles',
      icon: <FileTextOutlined />,
      label: '创作者中心',
      onClick: () => navigate('/creator-center'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const notificationMenuItems: MenuProps['items'] = [
    { key: 'comment', label: '评论' },
    { key: 'like', label: '赞和收藏' },
    { key: 'follower', label: '新增粉丝' },
    { key: 'message', label: '私信' },
    {
      key: 'notification',
      label: (
        <span>
          系统通知 <Badge count={2} size="small" />
        </span>
      ),
    },
  ];

  return (
    <div className={styles.headerBar}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <img src="../src/assets/images/logo/image.png" alt="CSDN Logo" className={styles.logoImg} />
          </div>
          <div style={{ fontSize: '18px' }} className={styles.pushPage}>发布文章</div>
        </div>
        <div className={styles.headerRight}>
          <Dropdown menu={{ items: notificationMenuItems }} trigger={['hover']} placement="bottomRight">
            <Badge count={5}>
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>
          </Dropdown>
          <Dropdown menu={{ items: userMenuItems }} trigger={['hover']} placement="bottomRight">
            <img
              src={user?.avatar || "../src/assets/images/avatar/default.png"}
              alt="User Avatar"
              className={styles.avatarImg}
            />
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default SubHeader;