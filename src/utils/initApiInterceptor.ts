import { createApiInterceptor, startTokenMonitor } from './apiInterceptor';

// 初始化API拦截器
export const initApiInterceptor = () => {
  // 创建API拦截器
  const cleanup = createApiInterceptor();
  
  // 启动token状态监控
  startTokenMonitor();
  
  // 返回清理函数
  return cleanup;
};

// 默认导出初始化函数
export default initApiInterceptor;