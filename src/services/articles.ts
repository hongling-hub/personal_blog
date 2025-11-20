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
  getLikedArticles: () => Promise<Article[]>;
  getCollectedArticles: () => Promise<Article[]>;
  getById: (id: string) => Promise<Article>;
  create: (data: Article) => Promise<Article>;
  update: (id: string, data: Partial<Article>) => Promise<Article>;
  addComment: (articleId: string, commentData: CommentData) => Promise<any>;
  toggleLike: (id: string) => Promise<any>;
  toggleCollect: (id: string) => Promise<any>;
  delete: (id: string) => Promise<any>;
  search: (query: string) => Promise<Article[]>;
}

export default {
  // 搜索文章
  search: (query: string) => fetch(`/api/articles/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),

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
  
  // 获取用户点赞的文章
  getLikedArticles: () => fetch('/api/articles/liked', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),
  
  // 获取用户收藏的文章
  getCollectedArticles: () => fetch('/api/articles/collected', {
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

  // 点赞/取消点赞文章
  toggleLike: (id: string) => fetch(`/api/articles/${id}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).then(res => res.json()),

  // 收藏/取消收藏文章
  toggleCollect: (id: string) => fetch(`/api/articles/${id}/collect`, {
    method: 'POST',
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