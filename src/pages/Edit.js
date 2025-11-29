import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { firestoreService } from '../services/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

function Edit() {
  const { classId } = useParams();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    fetchClassAndCards();
  }, [classId]);

  const fetchClassAndCards = async () => {
    try {
      const cards = await firestoreService.getClassFlashcards(classId);
      setFlashcards(cards);
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast.error(t('general.error'));
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = (cardId) => {
    const card = flashcards.find(c => c.id === cardId);
    setEditingCard({
      id: cardId,
      front: card.front,
      back: card.back
    });
  };

  const handleSaveCard = async () => {
    if (!editingCard.front.trim() || !editingCard.back.trim()) {
      toast.error(t('general.error'));
      return;
    }

    setSaving(true);
    try {
      await firestoreService.updateFlashcard(editingCard.id, {
        front: editingCard.front.trim(),
        back: editingCard.back.trim()
      });

      setFlashcards(prev => prev.map(card => 
        card.id === editingCard.id 
          ? { ...card, front: editingCard.front.trim(), back: editingCard.back.trim() }
          : card
      ));

      setEditingCard(null);
      toast.success(t('edit.saved'));
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error(t('general.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = async () => {
    const newCard = {
      front: '',
      back: ''
    };
    setEditingCard({ ...newCard, id: 'new' });
  };

  const handleSaveNewCard = async () => {
    if (!editingCard.front.trim() || !editingCard.back.trim()) {
      toast.error(t('general.error'));
      return;
    }

    setSaving(true);
    try {
      const newCard = await firestoreService.createFlashcard(
        classId, 
        editingCard.front.trim(), 
        editingCard.back.trim()
      );

      setFlashcards(prev => [...prev, newCard]);
      setEditingCard(null);
      toast.success(t('edit.saved'));
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error(t('general.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm(t('general.confirm'))) {
      return;
    }

    try {
      await firestoreService.deleteFlashcard(cardId);
      setFlashcards(prev => prev.filter(card => card.id !== cardId));
      toast.success(t('general.success'));
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error(t('general.error'));
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  if (loading) {
    return <LoadingSpinner text={t('general.loading')} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/classes')}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            {t('general.back')}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('edit.title')}
            </h1>
            <p className="text-gray-600 text-sm">
              {flashcards.length} {t('classes.cards')}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleAddCard}
          disabled={editingCard !== null}
          className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('edit.addCard')}
        </button>
      </div>

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCard.id === 'new' ? t('edit.addCard') : t('edit.title')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('edit.front')}
                  </label>
                  <textarea
                    value={editingCard.front}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, front: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder={t('edit.front')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('edit.back')}
                  </label>
                  <textarea
                    value={editingCard.back}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, back: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder={t('edit.back')}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('edit.cancel')}
                </button>
                
                <button
                  onClick={editingCard.id === 'new' ? handleSaveNewCard : handleSaveCard}
                  disabled={saving || !editingCard.front.trim() || !editingCard.back.trim()}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {t('edit.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flashcards List */}
      {flashcards.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('classes.empty')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('edit.addCard')}
          </p>
          <button
            onClick={handleAddCard}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('edit.addCard')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {flashcards.map((card, index) => (
            <div
              key={card.id}
              className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    {t('study.card')} {index + 1}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCard(card.id)}
                      disabled={editingCard !== null}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      disabled={editingCard !== null}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('edit.front')}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 min-h-[4rem] text-gray-800">
                      {card.front}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('edit.back')}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 min-h-[4rem] text-gray-800">
                      {card.back}
                    </div>
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

export default Edit;
