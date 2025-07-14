import React, { useState, useEffect } from 'react';
import { Avatar, Form, Button, List, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import commentService from '@/services/comments';
import styles from './index.module.scss';

const { TextArea } = Input;

interface CommentType {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  createTime: string;
  replies?: CommentType[];
}

interface CommentListProps {
  articleId: string;
}

const CommentList: React.FC<CommentListProps> = ({ articleId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await commentService.getComments(articleId);
        setComments(data);
      } catch (error) {
        message.error('获取评论失败');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [articleId]);

  const handleSubmit = async () => {
    if (!value) {
      message.warning('请输入评论内容');
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await commentService.addComment(articleId, value);
      setComments([...comments, newComment]);
      setValue('');
      message.success('评论成功');
    } catch (error) {
      message.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className={styles.commentList}>
      {comments.length > 0 && (
        <List
          dataSource={comments}
          header={`${comments.length} 条评论`}
          itemLayout="horizontal"
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={item.avatar || <Avatar icon={<UserOutlined />} />}
                title={item.author}
                description={
                  <>
                    <div>{item.content}</div>
                    <div style={{ marginTop: 8 }}>{item.createTime}</div>
                  </>
                }
              />
            </List.Item>
          )}
          loading={loading}
        />
      )}

      <div style={{ marginTop: 16 }}>
        <Form.Item>
          <TextArea
            rows={4}
            onChange={handleChange}
            value={value}
            placeholder="写下你的评论..."
          />
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            loading={submitting}
            onClick={handleSubmit}
            type="primary"
          >
            发表评论
          </Button>
        </Form.Item>
      </div>
    </div>
  );
};

export default CommentList;