import React from 'react';
import { List, Tag, Button, Spin } from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

interface ArticleItem {
  _id: string;
  title: string;
  desc: string;
  content: string;
  author: { username: string; avatar: string };
  views: number;
  likeCount: number;
  coverImage: string;
  tags: string[];
  publishTime: string;
}

interface ArticleListProps {
  articles: ArticleItem[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onArticleClick: (id: string) => void;
  showAction?: boolean;
  emptyText?: string;
  onDeleteArticle?: (id: string) => void;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
  onEditArticle?: (id: string) => void;
  showViewButton?: boolean;
  onViewArticle?: (id: string) => void;
  loadMoreRef?: React.RefObject<HTMLDivElement>;
  showNoMoreData?: boolean;
}

const ArticleList: React.FC<ArticleListProps> = ({ 
  articles, 
  loading, 
  loadingMore = false,
  hasMore = false,
  onArticleClick, 
  showAction = true, 
  emptyText = "暂无文章数据",
  onDeleteArticle,
  showDeleteButton = false, // 默认不显示删除按钮，确保首页不显示
  showEditButton = false, // 默认不显示编辑按钮
  onEditArticle,
  showViewButton = false, // 默认不显示浏览按钮
  onViewArticle,
  loadMoreRef,
  showNoMoreData = true
}) => {
  return (
    <div className={styles.articleContainer}>
      <div className={styles.mainContent}>
        {!loading && articles.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', color: '#f0f0f0' }}>💭</div>
              <p style={{ fontSize: '16px', color: '#999' }}>{emptyText}</p>
            </div>
          </div>
        ) : (
          <>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={articles}
              loading={loading}
              renderItem={(item: ArticleItem) => (
                <List.Item
                    key={item._id}
                    className={styles.articleItem}
                    onClick={() => onArticleClick(item._id)}
                  style={{ cursor: showAction ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1 }}>
                      <List.Item.Meta
                        title={<Link to={`/article/${item._id}`}>{item.title}</Link>}
                        description={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ 
                              display: '-webkit-box', 
                              WebkitLineClamp: 3, 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>{item.desc || (item.content ? item.content.substring(0, 200) + '...' : '')}</div>
                            {(showDeleteButton && onDeleteArticle) || (showEditButton && onEditArticle) || (showViewButton && onViewArticle) ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                  <span>{dayjs(item.publishTime).format('YYYY-MM-DD')}</span>
                                  <span>{item.author.username}</span>
                                  <span>{item.views}浏览</span>
                                  <span>{item.likeCount}点赞</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {showViewButton && onViewArticle && (
                                    <Button 
                                      type="text" 
                                      icon={<EyeOutlined />} 
                                      onClick={(e) => {
                                        e.stopPropagation(); // 阻止事件冒泡
                                        onViewArticle(item._id);
                                      }}
                                    >
                                      浏览
                                    </Button>
                                  )}
                                  {showEditButton && onEditArticle && (
                                    <Button 
                                      type="text" 
                                      icon={<EditOutlined />} 
                                      onClick={(e) => {
                                        e.stopPropagation(); // 阻止事件冒泡
                                        onEditArticle(item._id);
                                      }}
                                    >
                                      编辑
                                    </Button>
                                  )}
                                  {showDeleteButton && onDeleteArticle && (
                                    <Button 
                                      type="text" 
                                      danger 
                                      icon={<DeleteOutlined />} 
                                      onClick={(e) => {
                                        e.stopPropagation(); // 阻止事件冒泡
                                        onDeleteArticle(item._id);
                                      }}
                                    >
                                      删除
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <span>{dayjs(item.publishTime).format('YYYY-MM-DD')}</span>
                                <span>{item.author.username}</span>
                                <span>{item.views}浏览</span>
                                <span>{item.likeCount}点赞</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {item.tags?.slice(0, 3).map(tag => (
                                <Tag key={tag} style={{ marginRight: '4px' }}>{tag}</Tag>
                              ))}
                              {item.tags?.length > 3 && <Tag>...</Tag>}
                            </div>
                          </div>
                        }
                      />
                    </div>
                    {item.coverImage && (
                      <div className={styles.articleImage} style={{ flexShrink: 0 }}>
                        <img src={item.coverImage} alt={item.title} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </List.Item>
            )}
            />
            
            {/* 滚动加载更多指示器 */}
            {hasMore && (
              <div 
                ref={loadMoreRef}
                className={styles.loadMoreIndicator}
              >
                {loadingMore ? (
                  <Spin size="large" />
                ) : (
                  <div className={styles.loadingText}>
                    滚动加载更多...
                  </div>
                )}
              </div>
            )}
            
            {/* 没有更多数据的提示 */}
            {showNoMoreData && !hasMore && articles.length > 0 && (
              <div className={styles.noMoreData}>
                没有更多数据了
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticleList;