import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success('Login realizado com sucesso!');
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout.');
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
