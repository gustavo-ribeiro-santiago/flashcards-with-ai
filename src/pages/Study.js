import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { firestoreService } from '../services/firestore';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BookOpen, 
  RotateCcw, 
  Check, 
  X, 
  ArrowRight, 
  Trophy,
  Clock,
  Target,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

function Study() {
  const { classId } = useParams();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studySession, setStudySession] = useState({
    startTime: null,
    correctAnswers: 0,
    totalAnswered: 0,
    cardErrors: []
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [savingPerformance, setSavingPerformance] = useState(false);

  useEffect(() => {
    fetchClassAndCards();
  }, [classId]);

  const fetchClassAndCards = async () => {
    try {
      const cards = await firestoreService.getClassFlashcards(classId);
      
      if (cards.length === 0) {
        toast.error(t('general.error'));
        navigate('/classes');
        return;
      }

      // Shuffle cards for varied study experience
      const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
      setFlashcards(shuffledCards);
      setStudySession(prev => ({ ...prev, startTime: Date.now() }));
      
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast.error(t('general.error'));
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect) => {
    const currentCard = flashcards[currentCardIndex];
    
    setStudySession(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      totalAnswered: prev.totalAnswered + 1,
      cardErrors: isCorrect 
        ? prev.cardErrors 
        : [...prev.cardErrors, currentCard.id]
    }));

    // Move to next card or complete study session
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      completeStudySession();
    }
  };

  const completeStudySession = async () => {
    setSavingPerformance(true);
    
    try {
      const endTime = Date.now();
      const completionTime = Math.round((endTime - studySession.startTime) / 1000); // in seconds
      const accuracy = studySession.totalAnswered > 0 
        ? Math.round((studySession.correctAnswers / flashcards.length) * 100) 
        : 0;

      // Save performance data
      await apiService.savePerformance({
        user_id: currentUser.uid,
        class_id: classId,
        accuracy: accuracy,
        completion_time: completionTime,
        correct_answers: studySession.correctAnswers,
        total_questions: flashcards.length,
        card_errors: studySession.cardErrors
      });

      // Update class last studied time
      await firestoreService.updateClass(classId, {
        lastStudiedAt: new Date()
      });

      setIsCompleted(true);
      
    } catch (error) {
      console.error('Error saving performance:', error);
      toast.error(t('general.error'));
    } finally {
      setSavingPerformance(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracy = () => {
    return studySession.totalAnswered > 0 
      ? Math.round((studySession.correctAnswers / flashcards.length) * 100)
      : 0;
  };

  const getCompletionTime = () => {
    if (!studySession.startTime) return 0;
    return Math.round((Date.now() - studySession.startTime) / 1000);
  };

  if (loading) {
    return <LoadingSpinner text={t('general.loading')} />;
  }

  if (isCompleted) {
    const accuracy = getAccuracy();
    const completionTime = getCompletionTime();
    
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-8 text-center">
            <Trophy className="h-16 w-16 text-white mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              {t('study.completed')}
            </h1>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">
                    {t('study.accuracy')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-500">
                  {studySession.correctAnswers}/{flashcards.length} {t('study.correct')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">
                    {t('study.time')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatTime(completionTime)}
                </div>
                <div className="text-sm text-gray-500">
                  {t('study.time')}
                </div>
              </div>
            </div>
            
            {savingPerformance && (
              <div className="text-center mb-6">
                <LoadingSpinner size="sm" text={t('general.loading')} />
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/classes')}
                className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('study.backToClasses')}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                {t('study.title')} {t('general.again')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('study.title')}
        </h1>
        <div className="text-gray-600">
          {t('study.card')} {currentCardIndex + 1} {t('study.of')} {flashcards.length}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {studySession.correctAnswers}
          </div>
          <div className="text-sm text-gray-600">{t('study.correct')}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {studySession.totalAnswered - studySession.correctAnswers}
          </div>
          <div className="text-sm text-gray-600">{t('study.incorrect')}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(getCompletionTime())}
          </div>
          <div className="text-sm text-gray-600">{t('study.time')}</div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-8">
        <div className="p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="text-lg font-medium text-gray-900 mb-6 min-h-[3rem] flex items-center justify-center">
              {currentCard.front}
            </div>
            
            {showAnswer && (
              <div className="border-t border-gray-200 pt-6">
                <div className="text-lg text-gray-800 min-h-[3rem] flex items-center justify-center">
                  {currentCard.back}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            {t('study.showAnswer')}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className="flex items-center justify-center px-6 py-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="h-5 w-5 mr-2" />
              {t('study.incorrect')}
            </button>
            
            <button
              onClick={() => handleAnswer(true)}
              className="flex items-center justify-center px-6 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="h-5 w-5 mr-2" />
              {t('study.correct')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Study;
