interface Article {
  title: string;
  tags: string;
  content: string;
  isPublic: boolean;
  markdown: string;
}

export default {
  // 获取文章列表
  getList: () => fetch('/api/articles').then(res => res.json()),
  
  // 获取文章详情
  getDetail: (id: string) => fetch(`/api/articles/${id}`).then(res => res.json()),
  
  // 创建文章
  create: (data: Article) => fetch('/api/articles', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
};