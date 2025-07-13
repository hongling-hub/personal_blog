import React from 'react';
import './index.scss';

type ErrorPageProps = {
  statusCode?: number;
  message?: string;
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 404,
  message = '页面不存在或无法访问'
}) => {
  return (
    <div className="error-container">
      <h1 className="error-code">{statusCode}</h1>
      <p className="error-message">{message}</p>
      <button 
        className="error-button" 
        onClick={() => window.location.href = '/'}
      >
        返回首页
      </button>
    </div>
  );
};