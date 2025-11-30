import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Classes from './pages/Classes';
import Create from './pages/Create';
import Study from './pages/Study';
import Edit from './pages/Edit';
import Performance from './pages/Performance';

// Styles
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main>
              <Routes>
                <Route path="/flashcards-with-ai/login" element={<Login />} />
                
                <Route 
                  path="/flashcards-with-ai" 
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/flashcards-with-ai/classes" 
                  element={
                    <PrivateRoute>
                      <Classes />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/flashcards-with-ai/create" 
                  element={
                    <PrivateRoute>
                      <Create />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/flashcards-with-ai/study/:classId" 
                  element={
                    <PrivateRoute>
                      <Study />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/flashcards-with-ai/edit/:classId" 
                  element={
                    <PrivateRoute>
                      <Edit />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/flashcards-with-ai/performance" 
                  element={
                    <PrivateRoute>
                      <Performance />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </main>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
