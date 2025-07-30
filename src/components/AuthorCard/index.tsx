import React from 'react';
import { Avatar, Tooltip, Badge, Button } from 'antd';
import styles from './AuthorCard.module.scss';

type AuthorCardProps = {
  article: {
    author: {
      avatar: string;
      username: string;
      isVerified: boolean;
      bio?: string;
      articleCount: number;
      readCount: number;
      followerCount: number;
    };
  };
  isAuthor: boolean;
};

const AuthorCard: React.FC<AuthorCardProps> = ({ article, isAuthor }) => {
  return (
    <div className={styles.authorCard}>
      <div className={styles.authorInfoLine}>
        <div>
          <Avatar src={article.author.avatar} alt={article.author.username} className={styles.authorAvatar} />
        </div>
        <div>
          <div className={styles.authorName}>{article.author.username}</div>
        </div>
      </div>
      <div className={styles.authorInfo}>
        <div className={styles.authorNameContainer}>
          {article.author.isVerified && (
            <Tooltip title="已认证">
              <Badge status="success" className={styles.verifiedBadge} />
            </Tooltip>
          )}
        </div>
        {article.author.bio && <div className={styles.authorBio}>{article.author.bio}</div>}
        <div className={styles.authorStats}>
          <div className={styles.statItem}>{article.author.articleCount} 文章</div>
          <div className={styles.statItem}>{article.author.readCount} 阅读</div>
          <div className={styles.statItem}>{article.author.followerCount} 粉丝</div>
        </div>
        {!isAuthor && (
          <div className={styles.authorInfoLineButton}>
            <Button type="primary" size="small" className={styles.followButton}>关注</Button>
            <Button size="small" className={styles.messageButton}>私信</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;