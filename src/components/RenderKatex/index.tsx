import React from 'react';
import MarkdownIt from 'markdown-it';
import katexPlugin from 'markdown-it-katex';
import tocPlugin from 'markdown-it-toc-done-right';
import styles from './index.module.scss'; // 引入样式文件

// 初始化markdown-it实例并配置插件
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
.use(katexPlugin, {
  throwOnError: false,
  displayMode: true,
})
.use(tocPlugin, {
  level: [1, 2, 3], // 支持的标题级别
  containerClass: 'article-toc', // 目录容器的CSS类名
  listClass: 'article-toc-list', // 目录列表的CSS类名
  itemClass: 'article-toc-item', // 目录项的CSS类名
  linkClass: 'article-toc-link', // 目录链接的CSS类名
  anchorLink: true, // 添加锚点链接
  tocFirstLevel: 1, // 目录起始级别
  markerPattern: /^\[toc\]$/im, // 确保[toc]标记能被正确识别
  listType: 'ul', // 使用无序列表
});

interface RenderKatexProps {
  content: string;
}

const RenderKatex: React.FC<RenderKatexProps> = ({ content }) => {
  let preprocessedContent = content || '';
  
  // 处理@TOC标记，确保它能被正确转换为[toc]
  if (preprocessedContent.includes('@TOC')) {
    // 使用全局替换，确保所有@TOC标记都被替换
    preprocessedContent = preprocessedContent.split('@TOC').join('[toc]');
  }
  
  // 处理@[TOC](目录)格式的标记
  if (preprocessedContent.includes('@[TOC]')) {
    // 使用正则表达式替换@[TOC](...)格式为[toc]
    preprocessedContent = preprocessedContent.replace(/@\[TOC\]\([^)]*\)/g, '[toc]');
  }
  
  // 确保[toc]标记前后有空行，这样markdown-it-toc-done-right插件能正确识别
  if (preprocessedContent.includes('[toc]')) {
    // 确保[toc]前面有换行
    preprocessedContent = preprocessedContent.replace(/([^\n])(\[toc\])/g, '$1\n$2');
    // 确保[toc]后面有换行
    preprocessedContent = preprocessedContent.replace(/(\[toc\])([^\n])/g, '$1\n$2');
    
    // 如果[toc]在开头，确保前面有换行
    if (preprocessedContent.startsWith('[toc]')) {
      preprocessedContent = '\n' + preprocessedContent;
    }
    // 如果[toc]在结尾，确保后面有换行
    if (preprocessedContent.endsWith('[toc]')) {
      preprocessedContent = preprocessedContent + '\n';
    }
  }
  
  // 使用markdown-it渲染预处理后的内容
  const renderedContent = md.render(preprocessedContent);

  return (
    <div 
      className={styles['article-content']} // 使用样式文件中的类
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default RenderKatex;