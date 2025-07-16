import React, { useState, useRef } from 'react';
import { Button, Card, Form, Input, message, Radio, Space, Modal, Select } from 'antd';
import { SaveOutlined, EyeOutlined, UndoOutlined, RedoOutlined, BoldOutlined, ItalicOutlined, StrikethroughOutlined, OrderedListOutlined, UnorderedListOutlined, BlockOutlined, CodeOutlined, TableOutlined, PictureOutlined, LinkOutlined, UnderlineOutlined, VideoCameraOutlined, CalculatorOutlined } from '@ant-design/icons';
import type { MDEditorProps, TextAreaTextApi, ExecuteState, TextRange } from '@uiw/react-md-editor';
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor';
import { 
  bold, italic, strikethrough, orderedListCommand, unorderedListCommand, divider,
  hr, quote, code, table, image, link, 
  title1, title2, title3 
} from '@uiw/react-md-editor/commands';
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

const zhCN = { 
  toolbar: { 
    undo: '撤销', 
    redo: '重做', 
    history: '历史', 
    format: '格式', 
    bold: '加粗', 
    italic: '斜体', 
    underline: '下划线', 
    strikethrough: '删除线', 
    textColor: '颜色', 
    backgroundColor: '背景', 
    olist: '有序列表', 
    ulist: '无序列表', 
    alignLeft: '左对齐', 
    alignCenter: '居中对齐', 
    alignRight: '右对齐', 
    alignJustify: '两端对齐', 
    hr: '水平线', 
    quote: '块引用', 
    code: '代码', 
    table: '表格', 
    image: '图像', 
    video: '视频', 
    formula: '公式', 
    link: '链接', 
    template: '模板', 
    toc: '目录', 
    md: '使用MD编辑器',
    title1: '一级标题',
    title2: '二级标题',
    title3: '三级标题'
  }, 
};

// 自定义命令
const customCommands = {
  undo: {
    name: 'undo',
    keyCommand: 'undo',
    buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><UndoOutlined style={{fontSize:'16px'}}/><span>撤销</span></div> },
    execute: (state?: ExecuteState, api?: TextAreaTextApi) => {
      if (!api) return;}
  },
  redo: {
    name: 'redo',
    keyCommand: 'redo',
    buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><RedoOutlined style={{fontSize:'16px'}}/><span>重做</span></div> },
    execute: () => {}
  },
  // 下划线命令示例
  underline: {
  name: 'underline',
  keyCommand: 'underline',
  buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><UnderlineOutlined style={{fontSize:'16px'}}/><span>下划线</span></div> },
  execute: () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      if (selectedText) {
        const newText = `__${selectedText}__`;
        range.deleteContents();
        range.insertNode(document.createTextNode(newText));
      }
    }
  }
},
  video: {
    name: 'video',
    keyCommand: 'video',
     execute: (state?: ExecuteState, api?: TextAreaTextApi) => {
       if (!api) return;
      const url = prompt('请输入视频URL');
      if (url) {
        api.replaceSelection(`\n<video src="${url}" controls></video>\n`);
      }
    },
    buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><VideoCameraOutlined style={{fontSize:'16px'}}/><span>视频</span></div> }
  },
  math: {
    name: 'math',
    keyCommand: 'math',
    execute: (state: ExecuteState, api: TextAreaTextApi) => {
      api.replaceSelection('\n$$\n\\LaTeX\n$$\n');
    },
    buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><CalculatorOutlined style={{fontSize:'16px'}}/><span>公式</span></div> }
  }
};

const WriteArticle: React.FC = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [editorHistory, setEditorHistory] = useState<string[]>(['']);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false);
  const navigate = useNavigate();
  const editorRef = useRef<TextAreaTextApi>(null);



  
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

   // 定义撤销和重做函数
  const handleUndo = (state: ExecuteState, api: TextAreaTextApi) => {
    if (currentIndex > 0) {
      setIsUndoRedo(true);
      setCurrentIndex(prev => prev - 1);
      setContent(editorHistory[currentIndex - 1]);
    }
  };

  const handleRedo = (state: ExecuteState, api: TextAreaTextApi) => {
    if (currentIndex < editorHistory.length - 1) {
      setIsUndoRedo(true);
      setCurrentIndex(prev => prev + 1);
      setContent(editorHistory[currentIndex + 1]);
    }
  };



  const handleWordCount = (value?: string) => {
    const text = value || '';
    setWordCount(text.trim().length);
  };

  const [visibleDragbar, setVisibleDragbar] = useState(false);
const emptyRange: TextRange = { start: 0, end: 0 };

// 处理视频插入
const handleVideoInsert = () => {
  const videoUrl = prompt('请输入视频URL:');
  if (videoUrl) {
    setContent(prev => `${prev}\n<video src="${videoUrl}" controls width="100%"/>\n`);
  }
};

// 处理数学公式插入
const handleMathInsert = () => {
  const mathContent = prompt('请输入LaTeX数学公式:');
  if (mathContent) {
    setContent(prev => `${prev}\n$$\n${mathContent}\n$$\n`);
  }
};
    // 在组件内部重新定义命令对象
  const editorCommands = {
    undo: {
      name: 'undo',
      keyCommand: 'undo',
      buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><UndoOutlined style={{fontSize:'16px'}}/><span>撤销</span></div> },
      execute: handleUndo
    },
    redo: {
      name: 'redo',
      keyCommand: 'redo',
      buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><RedoOutlined style={{fontSize:'16px'}}/><span>重做</span></div> },
      execute: handleRedo
    },
    underline: {
      name: 'underline',
      keyCommand: 'underline',
      buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><UnderlineOutlined style={{fontSize:'16px'}}/><span>下划线</span></div> },
      execute: () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString();
          if (selectedText) {
            const newText = `__${selectedText}__`;
            range.deleteContents();
            range.insertNode(document.createTextNode(newText));
          }
        }
      }
    },
    video: {
      name: 'video',
      keyCommand: 'video',
      execute: (state: ExecuteState, api: TextAreaTextApi) => {
        const url = prompt('请输入视频URL');
        if (url) {
          api.replaceSelection(`\n<video src="${url}" controls></video>\n`);
        }
      },
      buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><VideoCameraOutlined style={{fontSize:'16px'}}/><span>视频</span></div> }
    },
    math: {
      name: 'math',
      keyCommand: 'math',
      execute: (state: ExecuteState, api: TextAreaTextApi) => {
        api.replaceSelection('\n$$\n\\LaTeX\n$$\n');
      },
      buttonProps: { children: <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:'12px',padding:'0 4px'}}><CalculatorOutlined style={{fontSize:'16px'}}/><span>公式</span></div> }
    }
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
            <div>
              
              <div className="custom-toolbar" style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                  <ul style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, flexWrap: 'wrap' }}>
                    {/* 撤销重做 */}
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => { const api = editorRef.current; if (api) handleUndo({ text: content, selection: emptyRange, selectedText: '', command: editorCommands.undo }, api); }}
                        title="撤销"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <UndoOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>撤销</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => { const api = editorRef.current; if (api) handleRedo({ text: content, selection: emptyRange, selectedText: '', command: editorCommands.redo }, api); }}
                        title="重做"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <RedoOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>重做</span>
                      </button>
                    </li>

                    {/* 文本样式 */}
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const selectedText = range.toString();
                            if (selectedText) {
                              const newText = `**${selectedText}**`;
                              range.deleteContents();
                              range.insertNode(document.createTextNode(newText));
                            }
                          }
                        }}
                        title="加粗"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <BoldOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>加粗</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const selectedText = range.toString();
                            if (selectedText) {
                              const newText = `*${selectedText}*`;
                              range.deleteContents();
                              range.insertNode(document.createTextNode(newText));
                            }
                          }
                        }}
                        title="斜体"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <ItalicOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>斜体</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const selectedText = range.toString();
                            if (selectedText) {
                              const newText = `__${selectedText}__`;
                              range.deleteContents();
                              range.insertNode(document.createTextNode(newText));
                            }
                          }
                        }}
                        title="下划线"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <UnderlineOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>下划线</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const selectedText = range.toString();
                            if (selectedText) {
                              const newText = `~~${selectedText}~~`;
                              range.deleteContents();
                              range.insertNode(document.createTextNode(newText));
                            }
                          }
                        }}
                        title="删除线"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <StrikethroughOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>删除线</span>
                      </button>
                    </li>

                    {/* 列表 */}
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n1. 有序列表项`)}
                        title="有序列表"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <OrderedListOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>有序列表</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n- 无序列表项`)}
                        title="无序列表"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <UnorderedListOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>无序列表</span>
                      </button>
                    </li>

                    {/* 格式 */}
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n# 一级标题`)}
                        title="一级标题"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <BlockOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>一级标题</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n## 二级标题`)}
                        title="二级标题"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <BlockOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>二级标题</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n### 三级标题`)}
                        title="三级标题"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <BlockOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>三级标题</span>
                      </button>
                    </li>

                    {/* 插入内容 */}
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n---`)}
                        title="水平线"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <RedoOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>水平线</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n> 块引用`)}
                        title="块引用"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <CodeOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>块引用</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n\`\`\`\n代码块\n\`\`\``)}
                        title="代码"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <CodeOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>代码</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => setContent(prev => `${prev}\n| 表头 | 表头 |\n|------|------|\n| 内容 | 内容 |`)}
                        title="表格"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <TableOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>表格</span>
                      </button>
                    </li>

                    {/* 媒体 */}
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => {
                          const url = prompt('请输入图片URL');
                          if (url) setContent(prev => `${prev}\n![图片](${url})`);
                        }}
                        title="图像"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <PictureOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>图像</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={handleVideoInsert}
                        title="视频"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <VideoCameraOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>视频</span>
                      </button>
                    </li>

                    {/* 其他 */}
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={() => {
                          const url = prompt('请输入链接URL');
                          const text = prompt('请输入链接文本');
                          if (url && text) setContent(prev => `${prev}\n[${text}](${url})`);
                        }}
                        title="链接"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <LinkOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>链接</span>
                      </button>
                    </li>
                    <li style={{ margin: '0 4px' }}>
                      <button
                        onClick={handleMathInsert}
                        title="公式"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <CalculatorOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                        <span style={{ fontSize: 12 }}>公式</span>
                      </button>
                    </li>
                  </ul>
                </div>
                <MDEditor 
                  ref={editorRef}
                  value={content}
                  onChange={(val) => {
                    setContent(val || '');
                    handleWordCount(val);
                    if (!isUndoRedo) {
                      const newHistory = editorHistory.slice(0, currentIndex + 1);
                      newHistory.push(val || '');
                      setEditorHistory(newHistory);
                      setCurrentIndex(newHistory.length - 1);
                    }
                    setIsUndoRedo(false);
                  }}
                  height={500}
                  preview="edit"
                  visibleDragbar={visibleDragbar}
                  data-color-mode="light"
                  commands={[]} // 清空默认命令
                  extraCommands={[]} // 清空额外命令
                />
              <div style={{ marginTop: 8, color: '#666' }}>
                字数统计: {wordCount}
              </div>
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