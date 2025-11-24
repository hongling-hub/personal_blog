import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Menu, Input, Space, Avatar, Dropdown, Button, Badge, Modal, message } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, HomeOutlined, FileTextOutlined, StarOutlined, SettingOutlined, LogoutOutlined, MessageOutlined, QuestionCircleOutlined, ReadOutlined, DeleteOutlined } from '@ant-design/icons';
import articlesService from '@/services/articles';
import authService from '../../services/auth';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

const { Search } = Input;

const Header: React.FC = () => {
  const { user, updateUser, loading } = useUser();
  const navigate = useNavigate();
  const isLoggedIn = !!user;
  

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: '注销账号',
      icon: <DeleteOutlined />,
      content: '您确定要注销账号吗？此操作不可撤销，您的所有数据（文章、评论等）都将被永久删除！',
      okText: '确定注销',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await authService.deleteAccount();
          message.success('账号注销成功');
          // 清空本地存储并跳转到首页
          localStorage.clear();
          updateUser(null);
          navigate('/');
        } catch (error) {
          message.error(error instanceof Error ? error.message : '注销账号失败，请重试');
        }
      }
    });
  };

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
          localStorage.removeItem('refreshToken');
          updateUser(null);
          navigate('/');
        }
    },
    {
      key: 'deleteAccount',
      icon: <DeleteOutlined />,
      label: '注销账号',
      danger: true,
      onClick: handleDeleteAccount,
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="../src/assets/images/logo/image.png" alt="Logo" className={styles.logoImg} />
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
        <div className={styles.fixedSearch}>
        <div className={styles.searchContainer} style={{minWidth: '150px'}}>
          <Search
            placeholder="搜索文章、作者、标签"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={async (value) => {
              if (value) {
                try {
                  const results = await articlesService.search(value);
                  // 将搜索结果存储在localStorage中，以便搜索结果页面可以获取
                  localStorage.setItem('searchResults', JSON.stringify(results));
                  localStorage.setItem('searchQuery', value);
                  // 导航到搜索结果页面
                  navigate('/search');
                } catch (error) {
                  console.error('搜索失败:', error);
                }
              }
            }}
          />
        </div>
      </div>
      </div>
    </header>
  );
};

export default Header;