interface Article {
  title: string;
  tags: string[];
  content: string;
  isPublic: boolean;
  markdown: string;
  isDraft?: boolean;
  publishTime?: string;
  coverImage?: string;
  desc?: string;
  comments?: { _id: string; content: string; author: string; createdAt: string; }[];
  author?: {
    _id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    bio?: string;
  };

}

interface CommentData {
  content: string;
}

interface ArticlesService {
  getList: () => Promise<Article[]>;
  getUserArticles: () => Promise<Article[]>;
  getFollowingArticles: () => Promise<Article[]>;
  getById: (id: string) => Promise<Article>;
  create: (data: Article) => Promise<Article>;
  update: (id: string, data: Partial<Article>) => Promise<Article>;
  addComment: (articleId: string, commentData: CommentData) => Promise<any>;
  like: (id: string) => Promise<any>;
  cancelLike: (id: string) => Promise<any>;
  collect: (id: string) => Promise<any>;
  cancelCollect: (id: string) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

export default {
  // 获取文章列表
  getList: () => fetch('/api/articles').then(res => res.json()),

  // 获取当前用户的所有文章（包括草稿）
  getUserArticles: () => fetch('/api/articles/user', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),
  
  // 获取关注作者的文章
  getFollowingArticles: () => fetch('/api/articles/following', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),
  
  // 获取文章详情
  getById: (id: string) => fetch(`/api/articles/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),
  
  // 创建文章
  create: (data: Article) => fetch('/api/articles', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(async res => {
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.message || '创建文章失败';
      const error = new Error(message);
      (error as any).status = res.status;
      throw error;
    }
    return res.json();
  }),

  // 更新文章
  update: (id: string, data: Partial<Article>) => fetch(`/api/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),

  // 添加评论
  addComment: (articleId: string, commentData: CommentData) => fetch(`/api/articles/${articleId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),

  // 点赞文章
  like: (id: string) => fetch(`/api/articles/${id}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),

  // 取消点赞
  cancelLike: (id: string) => fetch(`/api/articles/${id}/like`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),

  // 收藏文章
  collect: (id: string) => fetch(`/api/articles/${id}/collect`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),

  // 取消收藏
  cancelCollect: (id: string) => fetch(`/api/articles/${id}/collect`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),

  // 删除文章
  delete: (id: string) => fetch(`/api/articles/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json())
};