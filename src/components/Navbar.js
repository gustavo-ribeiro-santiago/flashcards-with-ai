import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Brain, Home, BookOpen, Plus, BarChart3, LogOut, Globe, Menu, X } from 'lucide-react';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false); // Close mobile menu after logout
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/flashcards-with-ai" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                {t('auth.title')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/flashcards-with-ai"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/flashcards-with-ai') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>{t('nav.home')}</span>
              </Link>

              <Link
                to="/flashcards-with-ai/classes"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/flashcards-with-ai/classes') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>{t('nav.classes')}</span>
              </Link>

              <Link
                to="/flashcards-with-ai/create"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/flashcards-with-ai/create') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>{t('nav.create')}</span>
              </Link>

              <Link
                to="/flashcards-with-ai/performance"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/flashcards-with-ai/performance') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>{t('nav.performance')}</span>
              </Link>
            </div>
          )}

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-bold">
                {language === 'pt' ? 'PT' : 'EN'}
              </span>
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/flashcards-with-ai/login"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Toggle - Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-bold">
                {language === 'pt' ? 'PT' : 'EN'}
              </span>
            </button>

            {/* Mobile menu button */}
            {currentUser && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}

            {/* Mobile Login Button */}
            {!currentUser && (
              <Link
                to="/flashcards-with-ai/login"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {currentUser && isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {/* Mobile Navigation Links */}
              <Link
                to="/flashcards-with-ai"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/flashcards-with-ai') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>{t('nav.home')}</span>
              </Link>

              <Link
                to="/flashcards-with-ai/classes"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/flashcards-with-ai/classes') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>{t('nav.classes')}</span>
              </Link>

              <Link
                to="/flashcards-with-ai/create"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/flashcards-with-ai/create') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span>{t('nav.create')}</span>
              </Link>

              <Link
                to="/flashcards-with-ai/performance"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/flashcards-with-ai/performance') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>{t('nav.performance')}</span>
              </Link>

              {/* Mobile User Section */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-3 mb-3">
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {currentUser.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
