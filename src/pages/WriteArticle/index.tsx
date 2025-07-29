import React, { useState } from 'react';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import styles from './index.module.scss';
import { useEffect } from 'react';
import { Badge, Input, Tag, Upload, Button } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import {BellOutlined, CalendarOutlined} from '@ant-design/icons';
import { useUser } from '../../contexts/UserContext';
import { DatePicker, message } from 'antd';
import articlesService from '../../services/articles';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import SubHeader from '../../components/SubHeader';
const WriteArticle: React.FC = () => {
  const { user, loading: userLoading, updateUser } = useUser();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [publishTime, setPublishTime] = useState<Dayjs | null>(null);
  const [showPublishTimePicker, setShowPublishTimePicker] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

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

    // 在组件中添加图片上传处理函数
  const onUploadImg = async (files: FileList, callback: (urls: string[]) => void) => {
    const urls = await Promise.all(
      Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          // 这里模拟上传过程，实际应该调用你的API
          const reader = new FileReader();
          reader.onload = (e) => {
            // 这里应该返回实际图片URL，而不是dataURL
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      })
    );
    callback(urls);
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


  // 生成文章摘要
  const generateDesc = (content: string, maxLength = 200) => {
    const plainText = content.replace(/[#*\[\]()_~`>]/g, '').replace(/\n/g, ' ');
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
  };

  // 处理文章提交
  const handleArticleSubmit = async (isDraft: boolean, publishImmediately: boolean = false) => {
    if (!title.trim() || !content.trim()) {
      message.error('标题和内容不能为空');
      return;
    }

    if (!user) {
      message.error('请先登录');
      return;
    }

    setIsSubmitting(true);

    try {
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        markdown: content.trim(),
        tags: tags,
        isDraft: isDraft,
        isPublic: !isDraft && (publishImmediately || (publishTime?.isBefore(dayjs()) ?? false)),
        coverImage: coverImage || '',
        desc: generateDesc(content),
        author: user._id,
        authorAvatar: user.avatar || '',
        publishTime: !isDraft ? (publishImmediately ? new Date().toISOString() : publishTime?.toISOString()) : undefined
      };

      const result = await articlesService.create(articleData);
console.log('Created article result:', result);

      if (isDraft) {
        message.success('草稿保存成功');
      } else if (publishImmediately) {
        message.success('文章发布成功');
        navigate(`/article/${result._id}`);
      } else {
        message.success('定时发布设置成功');
        navigate(`/article/${result._id}`);
      }
    } catch (error) {
      console.error('提交文章失败:', error);
      if ((error as any).status === 401) {
        // 处理未授权错误，清除token并重定向到登录页
        localStorage.removeItem('token');
        updateUser(null);
        message.error('登录已过期，请重新登录');
        navigate('/login');
      } else {
        message.error('提交失败，请重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 保存草稿
  const handleSaveDraft = () => handleArticleSubmit(true);

  // 发布文章
  const handlePublish = () => handleArticleSubmit(false, true);

  // 定时发布
  const handleSchedulePublish = () => {
    setPublishTime(null); // 重置发布时间
    setShowPublishTimePicker(true); // 显示时间选择器
  };

  // 确认定时发布
  const confirmSchedulePublish = () => {
    if (!publishTime) {
      message.error('请选择发布时间');
      return;
    }
    handleArticleSubmit(false, false);
  };

  return (
      <div className={styles.container}>
        {/* 顶部导航 */}
        <SubHeader />

        {/* 主内容区域 */}
        <div className={styles.editorContainer}>
          <MdEditor
            value={content}
             showToolbarName={true}
            onChange={(val: string) => setContent(val || '')}
            preview={false}
             showCodeRowNumber={true}
             onUploadImg={onUploadImg} 
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
            </div>
          </div>

          {/* 封面预览 */}
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

          {/* 文章标题 */}
          <div className={styles.settingItem}>
            <label className={styles.label}>
              文章标题
              <span className={styles.helpIcon}>ⓘ</span>
            </label>
            <input type="text" className={styles.titleInput} value={title} onChange={(e) => setTitle(e.target.value)} />
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

        {/* 定时发布选择器 */}
        {showPublishTimePicker && (
          <div className={styles.publishTimePickerOverlay}>
            <div className={styles.publishTimePicker}>
              <DatePicker
                showTime
                value={publishTime}
                onChange={(date) => setPublishTime(date)}
                placeholder="选择发布时间"
                format="YYYY-MM-DD HH:mm"
                disabledDate={(current) => current && current < dayjs().subtract(1, 'day')}
              />
              <Button onClick={() => setShowPublishTimePicker(false)}>取消</Button>
              <Button type="primary" onClick={confirmSchedulePublish}>确认</Button>
            </div>
          </div>
        )}

        {/* 底部固定发布设置 */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomBarContent}>
            <button className={styles.draftBtn} onClick={handleSaveDraft} disabled={isSubmitting || userLoading}>
              保存草稿
            </button>
            <button
              className={styles.timerBtn}
              onClick={handleSchedulePublish}
              disabled={isSubmitting}
            >
              定时发布
            </button>
            <button className={styles.publishBtn} onClick={handlePublish} disabled={isSubmitting || userLoading}>
              发布文章
            </button>
          </div>
        </div>
      </div>
  );
};

export default WriteArticle;