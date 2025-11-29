import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const firestoreService = {
  // Classes operations
  async createClass(userId, name, description = '') {
    try {
      const classData = {
        userId,
        name,
        description,
        createdAt: serverTimestamp(),
        lastStudiedAt: null,
        cardCount: 0
      };
      const docRef = await addDoc(collection(db, 'classes'), classData);
      return { id: docRef.id, ...classData };
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  async getUserClasses(userId) {
    try {
      const q = query(
        collection(db, 'classes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  async updateClass(classId, data) {
    try {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, data);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  async deleteClass(classId) {
    try {
      // First delete all flashcards in this class
      const flashcards = await this.getClassFlashcards(classId);
      for (const flashcard of flashcards) {
        await deleteDoc(doc(db, 'flashcards', flashcard.id));
      }
      
      // Then delete the class
      await deleteDoc(doc(db, 'classes', classId));
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  // Flashcards operations
  async createFlashcard(classId, front, back) {
    try {
      const flashcardData = {
        classId,
        front,
        back,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'flashcards'), flashcardData);
      return { id: docRef.id, ...flashcardData };
    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  },

  async createMultipleFlashcards(classId, flashcardsData) {
    try {
      const promises = flashcardsData.map(card => 
        this.createFlashcard(classId, card.front, card.back)
      );
      const results = await Promise.all(promises);
      
      // Update class card count
      await this.updateClass(classId, { 
        cardCount: flashcardsData.length 
      });
      
      return results;
    } catch (error) {
      console.error('Error creating multiple flashcards:', error);
      throw error;
    }
  },

  async getClassFlashcards(classId) {
    try {
      const q = query(
        collection(db, 'flashcards'),
        where('classId', '==', classId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      throw error;
    }
  },

  async updateFlashcard(flashcardId, data) {
    try {
      const flashcardRef = doc(db, 'flashcards', flashcardId);
      await updateDoc(flashcardRef, data);
    } catch (error) {
      console.error('Error updating flashcard:', error);
      throw error;
    }
  },

  async deleteFlashcard(flashcardId) {
    try {
      await deleteDoc(doc(db, 'flashcards', flashcardId));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  },

  // Performance operations
  async getClassPerformance(userId, classId) {
    try {
      const q = query(
        collection(db, 'performance'),
        where('userId', '==', userId),
        where('classId', '==', classId),
        orderBy('completedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching performance:', error);
      throw error;
    }
  },

  async getBestPerformance(userId, classId) {
    try {
      const performances = await this.getClassPerformance(userId, classId);
      if (performances.length === 0) return null;
      
      // Find best accuracy and best time
      const bestAccuracy = Math.max(...performances.map(p => p.accuracy));
      const bestTime = Math.min(...performances.map(p => p.completionTime));
      
      return {
        bestAccuracy,
        bestTime,
        totalSessions: performances.length
      };
    } catch (error) {
      console.error('Error fetching best performance:', error);
      throw error;
    }
  },

  async getCardErrorStats(userId, classId) {
    try {
      const performances = await this.getClassPerformance(userId, classId);
      const errorCount = {};
      
      performances.forEach(session => {
        if (session.cardErrors && Array.isArray(session.cardErrors)) {
          session.cardErrors.forEach(cardId => {
            errorCount[cardId] = (errorCount[cardId] || 0) + 1;
          });
        }
      });
      
      // Get flashcard details for error stats
      const flashcards = await this.getClassFlashcards(classId);
      const cardMap = flashcards.reduce((acc, card) => {
        acc[card.id] = card;
        return acc;
      }, {});
      
      // Convert to array and sort by error count
      const errorStats = Object.entries(errorCount)
        .map(([cardId, errors]) => ({
          cardId,
          card: cardMap[cardId],
          errorCount: errors
        }))
        .filter(stat => stat.card) // Only include cards that still exist
        .sort((a, b) => b.errorCount - a.errorCount);
      
      return errorStats;
    } catch (error) {
      console.error('Error fetching card error stats:', error);
      throw error;
    }
  }
};
