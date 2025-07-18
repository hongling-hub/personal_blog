import React from 'react';
import styles from './index.module.scss';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        <div className={styles.footerColumns}>
          <div className={styles.footerColumn}>
            <h3>关于我们</h3>
            <ul>
              <li><a href="/about">公司简介</a></li>
              <li><a href="/join">加入我们</a></li>
              <li><a href="/advertise">广告服务</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>帮助中心</h3>
            <ul>
              <li><a href="/faq">常见问题</a></li>
              <li><a href="/rules">社区规范</a></li>
              <li><a href="/feedback">意见反馈</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>合作伙伴</h3>
            <ul>
              <li><a href="/partners">企业合作</a></li>
              <li><a href="/education">教育合作</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} yhl. 保留所有权利
          <div className={styles.links}>
            <a href="/terms">使用条款</a> | <a href="/privacy">隐私政策</a> | <a href="/cookies">Cookie政策</a>
          </div>
        </div>
      </div>
    </footer>
  );
}