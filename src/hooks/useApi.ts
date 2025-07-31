import { useAuth } from '../contexts/AuthContext';
import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://aip-stg.sktai.io/api/v1';

export const useApi = () => {
  const { token, login } = useAuth();
  
  const apiCall = async <T>(
    endpoint: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> => {
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          Authorization: `Bearer ${token}`,
          ...config.headers,
        },
        ...config,
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // 토큰이 만료되었거나 유효하지 않으면 재로그인 시도
        console.log('토큰이 만료되었습니다. 재로그인을 시도합니다.');
        await login();
        throw new Error('인증이 만료되었습니다. 페이지를 새로고침해주세요.');
      }
      throw error;
    }
  };

  const get = <T>(endpoint: string, config?: AxiosRequestConfig) =>
    apiCall<T>(endpoint, { ...config, method: 'GET' });

  const post = <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    apiCall<T>(endpoint, { ...config, method: 'POST', data });

  const put = <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    apiCall<T>(endpoint, { ...config, method: 'PUT', data });

  const del = <T>(endpoint: string, config?: AxiosRequestConfig) =>
    apiCall<T>(endpoint, { ...config, method: 'DELETE' });

  return {
    get,
    post,
    put,
    delete: del,
    token,
  };
}; 