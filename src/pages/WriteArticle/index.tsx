import React, { useState } from 'react';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import styles from './index.module.scss';
import { useEffect } from 'react';
import { Badge, Input, Tag, Upload, message } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import {BellOutlined} from '@ant-design/icons';
const WriteArticle: React.FC = () => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [editorImages, setEditorImages] = useState<string[]>([]);

  // 处理封面上传
  const handleCoverUpload: UploadProps['beforeUpload'] = (file: RcFile, fileList: RcFile[]) => {
    return new Promise((resolve, reject) => {
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
          message.error('请上传图片文件');
          resolve(false);
          return;
        }
      if (file.size > 2 * 1024 * 1024) {
          message.error('图片大小不能超过2MB');
          resolve(false);
          return;
        }

      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
          setCoverImage(e.target?.result as string);
          resolve(false);
        };
      reader.readAsDataURL(file);
    });
  };

  // 从编辑器内容提取图片
  const extractImagesFromContent = (content: string) => {
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    const images: string[] = [];
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
    return images;
  };

  // 监听内容变化，更新编辑器图片列表
  useEffect(() => {
    const images = extractImagesFromContent(content);
    setEditorImages(images);
  }, [content]);


  const addTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };


  const handleSubmit = () => {
    // 提交文章逻辑
    console.log({ title, tags, content });
  };

  return (
      <div className={styles.container}>
        {/* 顶部导航 */}
        <div className={styles.headerBar}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.logo}>
                <img src="../src/assets/images/logo/image.png" alt="CSDN Logo" className={styles.logoImg} />
              </div>
              <div style={{fontSize: '18px'}} className={styles.pushPage}>发布文章</div>
            </div>
         <div className={styles.headerRight}>
           <div>
            <img src="../src/assets/images/avatar/default.png" alt="CSDN Logo" className={styles.avatarImg} />
          </div>
          <div className={styles.bell}>
            <Badge count={5}>
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>
          </div>
         </div>
          </div>
        </div>

        



        {/* 文章 */}
        

        {/* 主内容区域 */}
        <div className={styles.editorContainer}>
          <MdEditor
            value={content}
             showToolbarName={true}
            onChange={(val: string) => setContent(val || '')}
            preview={false}
             showCodeRowNumber={true}
            className={styles.editor}
            toolbar={[
              'bold', 'italic', 'strikethrough', 'hr', 'title', 'divider',
              'link', 'quote', 'code', 'image', 'divider',
              'unordered-list', 'ordered-list', 'check-list', 'divider',
              'fullscreen', 'preview', 'html-preview'
            ]}
          />
        </div>
       
               {/* 文章设置区域 */}
        <div className={styles.articleSettings}>
          {/* 文章标签 */}
          <div className={styles.settingItem}>
            <label className={styles.label}>
              文章标签<span className={styles.required}>*</span>
              <span className={styles.helpIcon}>ⓘ</span>
            </label>
            <div className={styles.tagContainer}>
              {tags.map((tag, index) => (
                <Tag key={index} closable onClose={() => removeTag(index)}>
                  {tag}
                </Tag>
              ))}
              {tags.length < 5 && (
                <Input
                  className={styles.tagInput}
                  placeholder="输入标签后按回车添加"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onPressEnter={addTag}
                />
              )}
            </div>
          </div>

          {/* 添加封面 */}
          <div className={styles.settingItem}>
            <label className={styles.label}>
              添加封面
              <span className={styles.helpIcon}>ⓘ</span>
            </label>
            <div className={styles.coverUploadContainer}>
              <Upload
                name="cover"
                beforeUpload={handleCoverUpload}
                showUploadList={false}
                maxCount={1}
              >
                <div className={styles.uploadBox}>
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="封面预览"
                      className={styles.coverPreviewImage}
                    />
                  ) : (
                    <>                      
                      <span className={styles.uploadPlus}>+</span>
                      <div className={styles.uploadText}>从本地上传</div>
                    </>
                  )}
                </div>
              </Upload>
              <div className={styles.coverPreview}>
                {editorImages.length > 0 ? (
                  <div className={styles.imageGrid}>
                    {editorImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`内容图片 ${index + 1}`}
                        className={styles.contentImage}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyPreviewText}>
                    暂无内容图片，请在正文中添加图片
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 文章摘要 */}
          <div className={styles.settingItem}>
            <label className={styles.label}>
              文章摘要
              <span className={styles.helpIcon}>ⓘ</span>
            </label>
            <textarea
              className={styles.summaryInput}
              placeholder="摘要：会在推荐、列表等场景外露，帮助读者快速了解内容，支持一键将正文前 256 字符键入摘要文本框"
              maxLength={256}
            ></textarea>
            <div className={styles.summaryCounter}>0 / 256</div>
            <button className={styles.aiSummaryBtn}>AI 提取摘要</button>
          </div>

          {/* 分类专栏 */}
          <div className={styles.settingItem}>
            <label className={styles.label}>
              分类专栏
              <span className={styles.helpIcon}>ⓘ</span>
            </label>
            <button className={styles.addColumnBtn}>+ 新建分类专栏</button>
          </div>

          {/* 文章类型 */}
          {/* <div className={styles.settingItem}>
            <label className={styles.label}>
              文章类型
              <span className={styles.helpIcon}>ⓘ</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioItem}>
                <input type="radio" name="articleType" defaultChecked /> 原创
                <span className={styles.verifiedBadge}>✓</span>
              </label>
              <label className={styles.radioItem}>
                <input type="radio" name="articleType" /> 转载
              </label>
              <label className={styles.radioItem}>
                <input type="radio" name="articleType" /> 翻译
              </label>
            </div>
          </div> */}

          {/* 文章备份
          <div className={styles.settingItem}>
            <label className={styles.checkboxItem}>
              <input type="checkbox" /> 同时备份到GitCode
            </label>
            <div className={styles.policyText}>
              您已同意GitCode 用户协议和隐私政策，我们会为您自动创建账号并备份文章至我的项目。
            </div>
          </div> */}

          {/* 可见范围 */}
          <div className={styles.settingItem}>
            <label className={styles.label}>
              可见范围
              <span className={styles.helpIcon}>ⓘ</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioItem}>
                <input type="radio" name="visibility" defaultChecked /> 全部可见
              </label>
              <label className={styles.radioItem}>
                <input type="radio" name="visibility" /> 仅我可见
              </label>
              <label className={styles.radioItem}>
                <input type="radio" name="visibility" /> 粉丝可见
              </label>
            </div>
          </div>
        </div>

        {/* 底部固定发布设置 */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomBarContent}>
            <button className={styles.draftBtn}>保存草稿</button>
             <button className={styles.timerBtn}>定时发布</button>
            <button className={styles.publishBtn}>发布文章</button>
          </div>
        </div>
      </div>
  );
};

export default WriteArticle;