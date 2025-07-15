import React, { useState } from 'react';
import { Button, Card, Form, Input, message, Radio, Space, Modal, Select } from 'antd';
import { SaveOutlined, EyeOutlined } from '@ant-design/icons';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useNavigate } from 'react-router-dom';
import articleService from '@/services/articles';
import styles from './index.module.scss';

interface ArticleFormValues {
  title: string;
  tags: string[];
  content: string;
  isPublic: boolean;
}

const { TextArea } = Input;

const WriteArticle: React.FC = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
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
    setPreviewContent(content);
    setPreviewVisible(true);
  };

  const handleWordCount = (value: string | undefined) => {
    const text = value || '';
    setWordCount(text.trim().length);
  };

  return (
    <div className={styles.container}>
      <Card 
        title="撰写文章" 
        style={{ border: 'none' }}
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
                validator: (_, value) => 
                  Array.isArray(value) && value.length > 0 
                    ? Promise.resolve() 
                    : Promise.reject(new Error('至少需要一个标签'))
              }
            ]}
          >
            <Select
              mode="tags"
              placeholder="请输入标签，按回车确认"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入文章内容!' }]}
          >
            <MDEditor 
              value={content}
              onChange={(val) => {
                setContent(val || '');
                handleWordCount(val);
              }}
              height={500}
              preview="edit"
              visibleDragbar={false}
              data-color-mode="light"
              extraCommands={[
                 commands.title1,
                 commands.title2,
                 commands.title3,
               ]}
            />
            <div style={{ marginTop: 8, color: '#666' }}>
              字数统计: {wordCount}
            </div>
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
              <Modal
                title="文章预览"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width="80%"
              >
                <MDEditor.Markdown source={previewContent} />
              </Modal>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WriteArticle;
