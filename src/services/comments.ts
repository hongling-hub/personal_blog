interface Comment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createTime: string;
}

export default {
  // 获取文章评论
  getComments: (articleId: string) => 
    fetch(`/api/comments/${articleId}`).then(res => res.json()),
    
  // 添加评论
  createComment: (data: { articleId: string; content: string }) =>
    fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
}