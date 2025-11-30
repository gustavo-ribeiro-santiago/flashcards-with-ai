import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Brain, LogIn } from 'lucide-react';

function Login() {
  const { currentUser, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  if (currentUser) {
    return <Navigate to="/flashcards-with-ai" />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Brain className="h-16 w-16 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.subtitle')}
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <LogIn className="h-5 w-5 mr-2" />
            {t('auth.loginGoogle')}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {t('auth.subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
