import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function LoadingSpinner({ size = 'md', text = null }) {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 text-sm">
          {text}
        </p>
      )}
      {!text && (
        <p className="mt-4 text-gray-600 text-sm">
          {t('general.loading')}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;
