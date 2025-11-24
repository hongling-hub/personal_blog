import { createApiInterceptor } from '../utils/apiInterceptor';

// 删除某条回复
function deleteReply(commentId: string, replyId: string) {
  return fetch(`/api/comments/${commentId}/replies/${replyId}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

// 获取当前用户的所有评论
function getMyComments() {
  return fetch('/api/comments/my').then(res => res.json());
}

const commentService = {
  // 获取当前用户的所有评论
  getMyComments,
  // ...existing code...
  getComments: (articleId: string, sortType?: string) => {
    let url = `/api/comments/article/${articleId}`;
    if (sortType) {
      url += `?sort=${sortType}`;
    }
    return fetch(url).then(res => res.json());
  },
  createComment: (data: { articleId: string; content: string; author: string }) => {
    return fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
  },
  likeComment: (commentId: string) => {
    return fetch(`/api/comments/${commentId}/like`, {
      method: 'POST'
    }).then(res => res.json());
  },
  unlikeComment: (commentId: string) => {
    return fetch(`/api/comments/${commentId}/like`, {
      method: 'DELETE'
    }).then(res => res.json());
  },
  likeReply: (commentId: string, replyId: string) => {
    return fetch(`/api/comments/${commentId}/replies/${replyId}/like`, {
      method: 'POST'
    }).then(res => res.json());
  },
  unlikeReply: (commentId: string, replyId: string) => {
    return fetch(`/api/comments/${commentId}/replies/${replyId}/like`, {
      method: 'POST'
    }).then(res => res.json());
  },
  deleteComment: (commentId: string) => {
    return fetch(`/api/comments/${commentId}`, {
      method: 'DELETE'
    }).then(res => res.json());
  },
  createReply: (commentId: string, content: string) => {
    // 获取当前文章ID（从URL或其他地方）
    const articleId = window.location.pathname.split('/').pop();
    return fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        articleId, 
        content, 
        parentCommentId: commentId 
      })
    }).then(res => res.json())
  },
  deleteReply,
};

export default commentService;

