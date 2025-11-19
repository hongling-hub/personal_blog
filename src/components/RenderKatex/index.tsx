import React from 'react';
import MarkdownIt from 'markdown-it';
import katexPlugin from 'markdown-it-katex';
import styles from './index.module.scss'; // 引入样式文件

// 初始化markdown-it实例并配置katex插件
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
.use(katexPlugin, {
  throwOnError: false,
  displayMode: true,
});

interface RenderKatexProps {
  content: string;
}

const RenderKatex: React.FC<RenderKatexProps> = ({ content }) => {
  // 使用markdown-it渲染内容
  const renderedContent = md.render(content || '');

  return (
    <div 
      className={styles['article-content']} // 使用样式文件中的类
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default RenderKatex;