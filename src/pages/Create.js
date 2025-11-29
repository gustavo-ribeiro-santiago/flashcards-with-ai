import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { firestoreService } from '../services/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

function Create() {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [theme, setTheme] = useState('');
  const [numCards, setNumCards] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!theme.trim()) {
      toast.error(t('create.error'));
      return;
    }

    setLoading(true);
    
    try {
      // Generate flashcards using AI
      const aiResponse = await apiService.generateFlashcards(
        theme.trim(),
        numCards,
        language,
        currentUser.uid
      );

      if (!aiResponse.flashcards || aiResponse.flashcards.length === 0) {
        throw new Error('No flashcards generated');
      }

      // Create class in Firestore
      const newClass = await firestoreService.createClass(
        currentUser.uid,
        theme.trim(),
        `${t('create.title')} - ${theme.trim()}`
      );

      // Save flashcards to Firestore
      await firestoreService.createMultipleFlashcards(
        newClass.id,
        aiResponse.flashcards
      );

      toast.success(t('create.success'));
      navigate(`/edit/${newClass.id}`);
      
    } catch (error) {
      console.error('Error creating flashcards:', error);
      toast.error(t('create.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('create.title')}
        </h1>
        <p className="text-gray-600">
          {t('auth.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center space-x-2 text-white">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              IA Generativa
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label 
              htmlFor="theme" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t('create.theme')}
            </label>
            <input
              type="text"
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder={t('create.themePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label 
              htmlFor="numCards" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t('create.numCards')}
            </label>
            <select
              id="numCards"
              value={numCards}
              onChange={(e) => setNumCards(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            >
              <option value={5}>5 {t('classes.cards')}</option>
              <option value={10}>10 {t('classes.cards')}</option>
              <option value={15}>15 {t('classes.cards')}</option>
              <option value={20}>20 {t('classes.cards')}</option>
              <option value={25}>25 {t('classes.cards')}</option>
              <option value={30}>30 {t('classes.cards')}</option>
              <option value={40}>40 {t('classes.cards')}</option>
              <option value={50}>50 {t('classes.cards')}</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {language === 'pt' ? 'Como funciona?' : 'How does it work?'}
                </p>
                <p>
                  {language === 'pt' 
                    ? 'Nossa IA irá gerar flashcards educativos e precisos sobre o tema escolhido. Você poderá editar o conteúdo após a geração.'
                    : 'Our AI will generate educational and accurate flashcards about your chosen theme. You can edit the content after generation.'
                  }
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-8">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 font-medium">
                {t('create.generating')}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {language === 'pt' 
                  ? 'Isso pode levar alguns segundos...'
                  : 'This may take a few seconds...'
                }
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {t('create.generate')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          )}
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          {language === 'pt' 
            ? '💡 Dica: Seja específico no tema para obter melhores resultados!'
            : '💡 Tip: Be specific with your theme for better results!'
          }
        </p>
      </div>
    </div>
  );
}

export default Create;
