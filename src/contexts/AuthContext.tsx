import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, User } from '../types';

interface AuthContextType {
  state: AuthState;
  login: (accessToken: string, user: Omit<User, 'accessToken' | 'tokenExpiry'>) => void;
  logout: () => void;
  refreshToken: (newAccessToken: string) => void;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN'; payload: string };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case 'LOGIN_ERROR':
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case 'REFRESH_TOKEN':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          accessToken: action.payload,
          tokenExpiry: new Date(Date.now() + 3600000) // 1 hour from now
        } : null
      };
    
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    console.log('🔍 AuthContext: Checking localStorage for stored user...');
    const storedUser = localStorage.getItem('studentApp_user');
    
    if (storedUser) {
      console.log('📦 Found stored user data');
      try {
        const user: User = JSON.parse(storedUser);
        console.log('👤 Parsed user:', { 
          email: user.email, 
          name: user.name, 
          tokenExpiry: user.tokenExpiry,
          hasToken: !!user.accessToken,
          tokenLength: user.accessToken?.length || 0
        });
        
        // Check for obviously invalid tokens (mock tokens, too short, etc.)
        if (!user.accessToken || user.accessToken.length < 50 || user.accessToken.includes('mock')) {
          console.log('❌ Token appears to be invalid/mock, removing from storage');
          localStorage.removeItem('studentApp_user');
          return;
        }
        
        // Check if token is still valid (expiry check)
        if (user.tokenExpiry && new Date(user.tokenExpiry) > new Date()) {
          console.log('✅ Token appears valid, auto-logging in');
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          console.log('❌ Token expired, removing from storage');
          localStorage.removeItem('studentApp_user');
        }
      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        localStorage.removeItem('studentApp_user');
      }
    } else {
      console.log('📭 No stored user found');
    }
  }, []);

  // Save user to localStorage when state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('studentApp_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('studentApp_user');
    }
  }, [state.user]);

  const login = (accessToken: string, userInfo: Omit<User, 'accessToken' | 'tokenExpiry'>) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const user: User = {
        ...userInfo,
        accessToken,
        tokenExpiry: new Date(Date.now() + 3600000) // 1 hour from now
      };
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Failed to process login' });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const refreshToken = (newAccessToken: string) => {
    dispatch({ type: 'REFRESH_TOKEN', payload: newAccessToken });
  };

  const isTokenExpired = (): boolean => {
    if (!state.user?.tokenExpiry) return true;
    return new Date(state.user.tokenExpiry) <= new Date();
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    refreshToken,
    isTokenExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
