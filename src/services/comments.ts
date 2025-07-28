interface Comment {
  id: string;
  articleId: string;
  author: {
    username: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export default {
  // 获取文章评论
  getComments: (articleId: string, sortType?: string) => {
    let url = `/api/comments/article/${articleId}`;
    if (sortType) {
      url += `?sort=${sortType}`;
    }
    return fetch(url).then(res => res.json());
  },
    
  // 添加评论
  createComment: (data: { articleId: string; content: string; author: string }) =>
      fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
    }).then(res => res.json()),

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

  deleteComment: (commentId: string) => 
    fetch(`/api/comments/${commentId}`, {
      method: 'DELETE'
    }).then(res => res.json()),

  createReply: (commentId: string, content: string) => 
    fetch(`/api/comments/${commentId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    }).then(res => res.json())
}