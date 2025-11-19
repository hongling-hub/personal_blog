// 删除某条回复
function deleteReply(commentId: string, replyId: string) {
  const token = localStorage.getItem('token');
  return fetch(`/api/comments/${commentId}/replies/${replyId}`, {
    method: 'DELETE',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  }).then(res => res.json());
}

const commentService = {
  // ...existing code...
  getComments: (articleId: string, sortType?: string) => {
    let url = `/api/comments/article/${articleId}`;
    if (sortType) {
      url += `?sort=${sortType}`;
    }
    const token = localStorage.getItem('token');
    return fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }).then(res => res.json());
  },
  createComment: (data: { articleId: string; content: string; author: string }) => {
    const token = localStorage.getItem('token');
    return fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json());
  },
  likeComment: (commentId: string) => {
    const token = localStorage.getItem('token');
    return fetch(`/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json());
  },
  unlikeComment: (commentId: string) => {
    const token = localStorage.getItem('token');
    return fetch(`/api/comments/${commentId}/like`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json());
  },
  likeReply: (commentId: string, replyId: string) => {
    const token = localStorage.getItem('token');
    return fetch(`/api/comments/${commentId}/replies/${replyId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json());
  },
  unlikeReply: (commentId: string, replyId: string) => {
    const token = localStorage.getItem('token');
    return fetch(`/api/comments/${commentId}/replies/${replyId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json());
  },
  deleteComment: (commentId: string) => {
    const token = localStorage.getItem('token');
    return fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }).then(res => res.json());
  },
  createReply: (commentId: string, content: string) => {
    const token = localStorage.getItem('token');
    // 获取当前文章ID（从URL或其他地方）
    const articleId = window.location.pathname.split('/').pop();
    return fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

