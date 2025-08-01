import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// 定义评论统计数据类型
interface CommentStats {
  [articleId: string]: number; // 文章ID对应评论数
}

// 定义上下文类型
interface CommentContextType {
  commentStats: CommentStats;
  updateCommentCount: (articleId: string, count: number) => void;
  getTotalComments: () => number;
}

// 创建上下文
const CommentContext = createContext<CommentContextType | undefined>(undefined);

// 上下文提供者组件
export const CommentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [commentStats, setCommentStats] = useState<CommentStats>({});

  // 使用useCallback包装，确保函数引用稳定
  const updateCommentCount = useCallback((articleId: string, count: number) => {
    setCommentStats(prev => ({
      ...prev,
      [articleId]: count
    }));
  }, []);

  // 获取所有文章的评论总数
  const getTotalComments = () => {
    return Object.values(commentStats).reduce((total, count) => total + count, 0);
  };

  return (
    <CommentContext.Provider value={{ commentStats, updateCommentCount, getTotalComments }}>
      {children}
    </CommentContext.Provider>
  );
};

// 自定义Hook便于组件使用上下文
export const useComment = () => {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  return context;
};

// 导出上下文供TypeScript使用
export default CommentContext;