import { ErrorPage } from '@/pages/ErrorPage';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import ArticleDetail from './pages/ArticleDetail';
import WriteArticle from './pages/WriteArticle';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> }, // 根路径'/'会自动渲染Home组件
      { path: 'home', element: <Home /> },
      { path: 'article/:id', element: <ArticleDetail /> },
      { path: 'write-article', element: <WriteArticle /> },
      { path: 'write', element: <WriteArticle /> },
      { path: 'admin', element: <AdminDashboard /> }
    ],
    errorElement: <ErrorPage /> // 添加错误处理页面
  },
  { path: 'login', element: <AuthPage /> },
  { path: 'register', element: <AuthPage /> }
],{
  basename: '/' // 确保基础路径正确
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);