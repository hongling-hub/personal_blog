import { ErrorPage } from '@/pages/ErrorPage';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { UserProvider } from './contexts/UserContext';
import { CommentProvider } from './contexts/CommentContext';
import App from './App';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import ArticleDetail from './pages/ArticleDetail';
import WriteArticle from './pages/WriteArticle';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import CreatorCenter from './pages/CreatorCenter';

import './index.css';
import 'antd/dist/reset.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'home', element: <Home /> },
      { 
        element: <PrivateRoute />,
        children: [
          { path: 'article/:id', element: <ArticleDetail /> },
          { path: 'write-article', element: <WriteArticle /> },
          { path: 'write', element: <WriteArticle /> },
          { path: 'write/:id', element: <WriteArticle /> },
          { path: 'admin', element: <AdminDashboard /> },
          { path: 'profile', element: <Profile /> },
          { path: 'creator-center', element: <CreatorCenter /> }
        ]
      }
    ],
    errorElement: <ErrorPage />
  },
  { path: 'login', element: <AuthPage /> },
  { path: 'register', element: <AuthPage /> }
],{
  basename: '/'
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
        <CommentProvider>
          <RouterProvider router={router} />
        </CommentProvider>
    </UserProvider>
  </React.StrictMode>
);