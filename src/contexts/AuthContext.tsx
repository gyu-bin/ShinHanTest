import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', 'admin');
      params.append('password', 'aisnb');

      const { data } = await axios.post(
          'https://aip-stg.sktai.io/api/v1/auth/login',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
      );

      const accessToken = data.access_token || data.token;
      console.log('accessToken:', accessToken);
      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem('auth_token', accessToken);
      } else {
        throw new Error('토큰을 받아올 수 없습니다.');
      }
    } catch (err) {
      console.error('로그인 실패:', err);
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      // 토큰이 있으면 유효성 검사
      try {
        const tokenData = JSON.parse(atob(savedToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenData.exp > currentTime) {
          setToken(savedToken);
          setIsLoading(false);
        } else {
          // 토큰이 만료되었으면 새로 로그인
          localStorage.removeItem('auth_token');
          login();
        }
      } catch (error) {
        // 토큰 파싱 실패시 새로 로그인
        localStorage.removeItem('auth_token');
        login();
      }
    } else {
      login(); // ✅ 자동 로그인
    }
  }, []);

  const value: AuthContextType = {
    token,
    isLoading,
    error,
    login,
    logout,
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 반드시 AuthProvider 내부에서 사용해야 합니다.');
  }
  return context;
};