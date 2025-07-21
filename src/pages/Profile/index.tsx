import React from 'react';
import { Avatar, Button, Tabs } from 'antd';
import styles from './index.module.scss';

// 定义用户信息类型
interface UserProfile {
  username: string;
  avatar: string;
  bioItems: string[];
  joinDate: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
    collections: number;
    tags: number;
    likes: number;
  };
}

const { TabPane } = Tabs;

const ProfilePage: React.FC = () => {
  // 模拟用户数据
  const userData: UserProfile = {
    username: '用户879455850472',
    avatar: 'https://cdn-icons-png.flaticon.com/512/2650/2650869.png', // 替换成实际头像地址
    bioItems: ['+ 你从事什么职业？', '+ 你有哪些爱好？'],
    joinDate: '2025-07-18',
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
      collections: 1,
      tags: 0,
      likes: 0,
    },
  };

// 调整return部分的结构
return (
  <div className={styles.Page}>
    {/* 内容区 */}
    <div className={styles.contentArea}>
      <div className={styles.profilePage}>
        {/* 顶部信息区域 */}
        <div className={styles.topSection}>
          <div className={styles.avatarWrapper}>
            <Avatar src={userData.avatar} size={80} className={styles.avatar} />
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.username}>{userData.username}</h2>
            <div className={styles.bio}>
              {userData.bioItems.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
            <Button type="primary" className={styles.settingBtn}>
              设置
            </Button>
          </div>
        </div>

        {/* 徽章区域 */}
        <div className={styles.badgeSection}>
          <span>获得徽章</span>
          <div className={styles.badgeList}>
            {/* 这里可以动态渲染徽章，暂时放一个示例 */}
            {Array.from({ length: userData.stats.posts }).map((_, i) => (
              <span key={i} className={styles.badge}>{i + 1}</span>
            ))}
          </div>
        </div>

  {/* 标签栏区域 */}
      <Tabs className={styles.tabs}>
        <TabPane tab="动态" key="1">
          <div className={styles.emptyState}>
            <img
              src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              alt="empty"
              className={styles.emptyImg}
            />
            <p>这里什么都没有</p>
          </div>
        </TabPane>
        <TabPane tab="文章" key="2">
          <div className={styles.emptyState}>
            <p>暂无文章内容</p>
          </div>
        </TabPane>
        <TabPane tab="专栏" key="3">
          <div className={styles.emptyState}>
            <p>暂无专栏内容</p>
          </div>
        </TabPane>
        <TabPane tab="沸点" key="4">
          <div className={styles.emptyState}>
            <p>暂无沸点内容</p>
          </div>
        </TabPane>
        <TabPane tab="收藏集" key="5">
          <div className={styles.emptyState}>
            <p>可查看已收藏内容</p>
          </div>
        </TabPane>
        <TabPane tab="关注" key="6">
          <div className={styles.emptyState}>
            <p>暂无关注内容</p>
          </div>
        </TabPane>
        <TabPane tab="作品" key="7">
          <div className={styles.emptyState}>
            <p>暂无作品内容</p>
          </div>
        </TabPane>
        <TabPane tab={`赞 ${userData.stats.likes}`} key="8">
          <div className={styles.emptyState}>
            <p>暂无点赞内容</p>
          </div>
        </TabPane>
      </Tabs>
        
      </div>
    </div>

    {/* 侧边栏 */}
    <div className={styles.sidebar}>
      <div className={styles.statsSide}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>关注了</span>
          <span className={styles.statValue}>{userData.stats.following}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>关注者</span>
          <span className={styles.statValue}>{userData.stats.followers}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>收藏集</span>
          <span className={styles.statValue}>{userData.stats.collections}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>关注标签</span>
          <span className={styles.statValue}>{userData.stats.tags}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>加入于</span>
          <span className={styles.statValue}>{userData.joinDate}</span>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProfilePage;