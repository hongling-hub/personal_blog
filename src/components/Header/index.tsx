import React from 'react';
import { Menu, Input, Space, Avatar, Dropdown, Button, Badge } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, HomeOutlined, FileTextOutlined, StarOutlined, SettingOutlined, LogoutOutlined, MessageOutlined, QuestionCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

const { Search } = Input;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人主页',
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
            <Button type="primary" icon={<FileTextOutlined />}>写博客</Button>
            <Badge count={5}>
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="default" shape="circle" size="large" className={styles.loginButton} onClick={() => navigate('/login')}>登录</Button>
            </Dropdown>
          </Space>
        </div>
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
    </header>
  );
};

export default Header;