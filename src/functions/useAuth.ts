import { useContext } from 'react';
import { AuthContext }  from '../contexts/AuthContext.tsx';
import type { AuthContextType } from '../types';

export function useAuth() {
  const context : AuthContextType | undefined = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}