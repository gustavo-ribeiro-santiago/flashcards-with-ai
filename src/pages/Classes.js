import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { firestoreService } from '../services/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, Plus, Play, Edit3, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

function Classes() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, [currentUser]);

  const fetchClasses = async () => {
    if (!currentUser) return;
    
    try {
      const userClasses = await firestoreService.getUserClasses(currentUser.uid);
      setClasses(userClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(t('general.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`${t('general.confirm')} ${className}?`)) {
      return;
    }

    setDeleteLoading(classId);
    try {
      await firestoreService.deleteClass(classId);
      setClasses(classes.filter(c => c.id !== classId));
      toast.success(t('general.success'));
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error(t('general.error'));
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return t('classes.never');
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('classes.title')}
        </h1>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('classes.createNew')}
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {t('classes.empty')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('home.createFirst')}
          </p>
          <Link
            to="/create"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('classes.createNew')}
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {classItem.name}
                  </h3>
                  <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0 ml-2" />
                </div>
                
                {classItem.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {classItem.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{classItem.cardCount || 0} {t('classes.cards')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {t('classes.lastStudied')} {formatDate(classItem.lastStudiedAt)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link
                    to={`/study/${classItem.id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t('classes.study')}
                  </Link>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit/${classItem.id}`}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      {t('classes.edit')}
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                      disabled={deleteLoading === classItem.id}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === classItem.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      {t('classes.delete')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Classes;
