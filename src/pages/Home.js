import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { firestoreService } from '../services/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, Plus, Brain, TrendingUp } from 'lucide-react';

function Home() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [recentClasses, setRecentClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentClasses = async () => {
      if (!currentUser) return;
      
      try {
        const classes = await firestoreService.getUserClasses(currentUser.uid);
        setRecentClasses(classes.slice(0, 3)); // Get only the 3 most recent classes
      } catch (error) {
        console.error('Error fetching recent classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentClasses();
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Brain className="h-16 w-16 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('home.welcome')}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('home.description')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Link
          to="/create"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <Plus className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">{t('nav.create')}</h3>
              <p className="text-blue-100 text-sm">{t('create.title')}</p>
            </div>
          </div>
        </Link>

        <Link
          to="/classes"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">{t('nav.classes')}</h3>
              <p className="text-green-100 text-sm">{t('classes.title')}</p>
            </div>
          </div>
        </Link>

        <Link
          to="/performance"
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">{t('nav.performance')}</h3>
              <p className="text-purple-100 text-sm">{t('performance.title')}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Classes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t('home.recentClasses')}
        </h2>
        
        {recentClasses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('home.noClasses')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('home.createFirst')}
            </p>
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('classes.createNew')}
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {classItem.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {classItem.cardCount || 0} {t('classes.cards')}
                </p>
                <div className="flex space-x-2">
                  <Link
                    to={`/study/${classItem.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {t('classes.study')}
                  </Link>
                  <Link
                    to={`/edit/${classItem.id}`}
                    className="flex-1 text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                  >
                    {t('classes.edit')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {recentClasses.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              to="/classes"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {t('classes.title')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
