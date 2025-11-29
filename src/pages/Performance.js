import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { firestoreService } from '../services/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line,
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function Performance() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [bestPerformance, setBestPerformance] = useState(null);
  const [cardErrors, setCardErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [currentUser]);

  useEffect(() => {
    if (selectedClassId) {
      fetchPerformanceData();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const userClasses = await firestoreService.getUserClasses(currentUser.uid);
      setClasses(userClasses);
      
      if (userClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(userClasses[0].id);
        setSelectedClass(userClasses[0]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(t('general.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    if (!selectedClassId) return;
    
    setDataLoading(true);
    try {
      const [performances, best, errors] = await Promise.all([
        firestoreService.getClassPerformance(currentUser.uid, selectedClassId),
        firestoreService.getBestPerformance(currentUser.uid, selectedClassId),
        firestoreService.getCardErrorStats(currentUser.uid, selectedClassId)
      ]);

      // Format performance data for charts
      const chartData = performances.map((perf, index) => ({
        session: index + 1,
        accuracy: perf.accuracy,
        time: Math.round(perf.completionTime / 60), // Convert to minutes
        date: perf.completedAt?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString()
      })).reverse(); // Show oldest to newest

      setPerformanceData(chartData);
      setBestPerformance(best);
      setCardErrors(errors.slice(0, 5)); // Show top 5 problematic cards
      
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error(t('general.error'));
    } finally {
      setDataLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    
    const classData = classes.find(c => c.id === classId);
    setSelectedClass(classData);
  };

  const formatTime = (minutes) => {
    if (minutes < 1) return '< 1 min';
    return `${minutes} min`;
  };

  if (loading) {
    return <LoadingSpinner text={t('general.loading')} />;
  }

  if (classes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {t('classes.empty')}
          </h3>
          <p className="text-gray-600">
            {t('home.createFirst')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('performance.title')}
        </h1>
        
        {/* Class Selector */}
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('performance.selectClass')}
          </label>
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={handleClassChange}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {classes.map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {dataLoading ? (
        <LoadingSpinner text={t('general.loading')} />
      ) : !selectedClassId || performanceData.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('performance.noData')}
          </h3>
          <p className="text-gray-600">
            {selectedClass ? selectedClass.name : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bestPerformance && (
              <>
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('performance.bestScore')}
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {bestPerformance.bestAccuracy}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('performance.time')} (Melhor)
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatTime(Math.round(bestPerformance.bestTime / 60))}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Sessões
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {bestPerformance.totalSessions}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Accuracy Evolution */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('performance.evolution')} - {t('performance.accuracy')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="session" 
                      label={{ value: 'Sessão', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Precisão (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Precisão']}
                      labelFormatter={(label) => `Sessão ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time Evolution */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('performance.evolution')} - {t('performance.time')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="session" 
                      label={{ value: 'Sessão', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Tempo (min)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} min`, 'Tempo']}
                      labelFormatter={(label) => `Sessão ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="time" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card Errors */}
          {cardErrors.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('performance.cardErrors')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cardErrors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="card.front" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      label={{ value: 'Erros', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [value, 'Erros']}
                      labelFormatter={(label) => `Pergunta: ${label}`}
                    />
                    <Bar dataKey="errorCount" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Performance;
