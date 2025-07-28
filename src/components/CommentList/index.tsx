import React, { useState, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import { Avatar, Button, List, Input, message } from 'antd';
import { UserOutlined, HeartOutlined, HeartFilled, MessageOutlined } from '@ant-design/icons';
import commentService from '@/services/comments';
import styles from './index.module.scss';
import { useUser } from '../../contexts/UserContext';

const { TextArea } = Input;

import { CommentType } from '../../types.d';

interface CommentListProps {
  articleId: string;
  refreshKey?: number;
}

const CommentList: React.FC<CommentListProps> = ({ articleId, refreshKey }) => {
  console.log('CommentList接收到的articleId:', articleId);
  if (!articleId) {
    console.error('CommentList未接收到有效的articleId');
  }
  const { user } = useUser();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [sortType, setSortType] = useState('latest');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentService.getComments(articleId, sortType);
    console.log('获取到的评论数据:', data);
    // 从localStorage加载点赞状态
    const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}');
    const commentsWithLikes = data.map((comment: CommentType) => ({ 
      ...comment, 
      isLiked: likedComments[comment.id] || false 
    }));
    setComments(commentsWithLikes);
    } catch (error) {
      message.error('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    try {
      const updatedComment = comment.isLiked
        ? await commentService.unlikeComment(commentId)
        : await commentService.likeComment(commentId);
      
      const newIsLiked = !comment.isLiked;
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, ...updatedComment, isLiked: newIsLiked } : c
    ));
    
    // 更新localStorage中的点赞状态
    const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}');
    if (newIsLiked) {
      likedComments[commentId] = true;
    } else {
      delete likedComments[commentId];
    }
    localStorage.setItem('likedComments', JSON.stringify(likedComments));
    } catch (error) {
      message.error(comment.isLiked ? '取消点赞失败' : '点赞失败');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user || !window.confirm('确定要删除这条评论吗？')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      message.success('评论已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId, sortType, refreshKey]);

  const handleSubmit = async () => {
    if (!value) {
      message.warning('请输入评论内容');
      return;
    }


    if (!user) {
      message.warning('请先登录再发表评论');
      return;
    }

    setSubmitting(true);
    try {
        console.log('提交评论前检查 - 用户对象:', user);
console.log('提交评论前检查 - 参数:', { articleId, userExists: !!user, userId: user?.id || user?._id || user?.userId, content: value, article: articleId, author: user?.id || user?._id || user?.userId });
        
        if (!articleId) {
          throw new Error('缺少文章ID');
        }
        if (!user.username) {
          throw new Error('用户未登录或缺少用户名');
        }
        await commentService.createComment({
          articleId: articleId,
          content: value,
          author: user.id
        });
      setValue('');
      message.success('评论成功');
      fetchComments(); // 提交后重新获取评论列表
    } catch (error) {
      message.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setShowReplyForm(!showReplyForm);
    setReplyContent('');
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!replyContent.trim()) {
      message.warning('请输入回复内容');
      return;
    }

    try {
      const newReply = await commentService.createReply(commentId, replyContent);
      setComments(comments.map(comment => 
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      setShowReplyForm(false);
      message.success('回复成功');
    } catch (error) {
      message.error('回复失败');
    }
  };

  return (
    <div className={styles.commentList}>
      <div className={styles.commentHeader}>
        <div className={styles.commentTitle}>评论 {comments.length}</div>
      </div>
      <div className={styles.commentInputWrapper}>
        <Avatar className={styles.commentAvatar} icon={<UserOutlined />} />
        <TextArea
          rows={4}
          onChange={handleChange}
          value={value}
          placeholder="写下你的评论..."
          className={styles.commentInput}
        />
        <Button
          loading={submitting}
          onClick={handleSubmit}
          type="primary"
          className={styles.commentSubmitButton}
        >
          发表评论
        </Button>
      </div>
      {comments.length > 0 ? (
        <>
          <div className={styles.sortOptions}>
            <button 
              className={sortType === 'hottest' ? styles.activeSort : ''}
              onClick={() => setSortType('hottest')}
            >
              最热
            </button>
            <button 
              className={sortType === 'latest' ? styles.activeSort : ''}
              onClick={() => setSortType('latest')}
            >
              最新
            </button>
          </div>
          <List
            dataSource={comments}
            itemLayout="horizontal"
            renderItem={(item) => (
              <List.Item className={styles.commentItem}>
                <List.Item.Meta
                  avatar={(item.author?.avatar ? <Avatar src={item.author.avatar} /> : <Avatar icon={<UserOutlined />} />)}
                  title={item.author?.username || '匿名用户'}
                  description={
                    <>
                      <div>{item.content}</div>
                      <div style={{ marginTop: 8 }}>{dayjs(item.createdAt).format('YYYY-MM-DD')}</div>
                      <div className={styles.commentActions} style={{ marginTop: 8 }}>
                        <span onClick={() => handleLike(item.id)} className={`${styles.actionButton} ${item.isLiked ? 'active' : ''}`}>
                          {item.isLiked ? <HeartFilled /> : <HeartOutlined />} {item.likeCount > 0 ? item.likeCount : '点赞'}
                        </span>
                        <span onClick={() => handleReply(item.id)} className={styles.actionButton}>
                          <MessageOutlined /> {(item.replies?.length ?? 0) > 0 ? (item.replies?.length ?? 0) : '回复'}
                        </span>
                        {user?.username === item.author.username && (
                          <span onClick={() => handleDelete(item.id)} className={styles.actionButton}>删除</span>
                        )}
                      </div>
                      {showReplyForm && replyingTo === item.id && (
                        <div style={{ marginTop: 16 }}>
                          <TextArea
                            rows={2}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="写下你的回复..."
                          />
                          <Button
                            type="primary"
                            onClick={() => handleReplySubmit(item.id)}
                            style={{ marginTop: 8 }}
                          >
                            提交回复
                          </Button>
                        </div>
                      )}
                      {item.replies && item.replies.length > 0 && (
                        <List
                          dataSource={item.replies}
                          renderItem={(reply) => (
                            <List.Item className={styles.replyItem}>
                              <List.Item.Meta
                                avatar={reply.author.avatar ? <Avatar src={reply.author.avatar} /> : <Avatar icon={<UserOutlined />} />}
                                title={reply.author.username}
                                description={
                                  <>
                                    <div>{reply.content}</div>
                                    <div style={{ marginTop: 8 }}>{reply.createdAt}</div>
                                  </>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
            loading={loading}
          />
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
           
          </div>
          <p>暂无评论数据</p>
        </div>
      )}
    </div>
  );
};

export default CommentList;

