import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorData = error.response?.data;
      return {
        success: false,
        message: errorData?.message || 'Error al iniciar sesión',
        code: errorData?.code,
        email: errorData?.email,
      };
    }
  };

  const register = async (email, password, name, hospital) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name,
        hospital,
      });

      // Registro exitoso - NO auto-login, usuario debe verificar email primero
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrarse',
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      const { user: userData, accessToken, refreshToken } = response.data.data;

      // Auto-login después de verificar
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return {
        success: true,
        message: response.data.message,
        user: userData,
      };
    } catch (error) {
      console.error('Verify email error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al verificar email',
        code: error.response?.data?.code,
      };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al reenviar verificación',
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      const { user: userData } = response.data.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return {
        success: true,
        user: userData,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar perfil',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        updateUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
