import React from 'react';
import styles from './RecommendedReading.module.scss';
import { Link } from 'react-router-dom';

interface RecommendedArticle {
  id: string;
  title: string;
  author: string;
  views: number;
}

interface RecommendedReadingProps {
  articles: RecommendedArticle[];
}

const RecommendedReading: React.FC<RecommendedReadingProps> = ({ articles }) => {
  return (
    <div className={styles.sidebarCard}>
      <div className={styles.sidebarTitle}>推荐阅读</div>
      <div className={styles.recommendedArticles}>
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            className={styles.recommendedArticleLink}
          >
            <div className={styles.recommendedArticle}>
              <div className={styles.recommendedTitle}>{article.title}</div>
              <div className={styles.recommendedMeta}>
                {article.author} · {article.views.toLocaleString()}阅读
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedReading;