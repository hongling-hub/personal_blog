import React, { useState } from 'react';
import { Button, Card, Form, Input, message, Radio, Space } from 'antd';
import { SaveOutlined, EyeOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { useNavigate } from 'react-router-dom';
import articleService from '@/services/articles';
import styles from './index.module.scss';

interface ArticleFormValues {
  title: string;
  tags: string;
  content: string;
  isPublic: boolean;
}

const { TextArea } = Input;

const WriteArticle: React.FC = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: Omit<ArticleFormValues, 'content'>) => {
    setLoading(true);
    try {
      await articleService.create({
        ...values,
        content,
        isPublic,
        markdown: content,
      });
      message.success('文章保存成功');
      navigate('/', { replace: true });
    } catch (error) {
      const err = error as Error;
      message.error(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // 实现预览逻辑，可以跳转到预览页或打开弹窗
    message.info('预览功能待实现');
  };

  return (
    <div className={styles.container}>
      <Card 
        title="撰写文章" 
        bordered={false}
        className={styles.card}
      >
        <Form<ArticleFormValues>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ isPublic: true }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[
              { required: true, message: '请输入标题!' },
              { max: 100, message: '标题不能超过100个字符' }
            ]}
          >
            <Input 
              placeholder="请输入文章标题" 
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
            rules={[
              { required: true, message: '请输入标签!' },
              { 
                pattern: /^[\w\u4e00-\u9fa5]+(,[\w\u4e00-\u9fa5]+)*$/,
                message: '多个标签请用英文逗号分隔' 
              }
            ]}
            extra="多个标签请用英文逗号分隔"
          >
            <TextArea 
              placeholder="例如：React,前端开发,TypeScript" 
              autoSize={{ minRows: 1, maxRows: 3 }}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入文章内容!' }]}
          >
            <MDEditor 
              value={content}
              onChange={(val) => setContent(val || '')}
              height={500}
              preview="edit"
              visibleDragbar={false}
            />
          </Form.Item>

          <Form.Item 
            label="可见性"
            name="isPublic"
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              value={isPublic}
              onChange={(e) => setIsPublic(e.target.value)}
            >
              <Radio value={true}>公开</Radio>
              <Radio value={false}>私密</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                保存文章
              </Button>
              <Button 
                icon={<EyeOutlined />}
                onClick={handlePreview}
                size="large"
              >
                预览
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WriteArticle;