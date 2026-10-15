import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MetricsBar from './components/MetricsBar';
import SegregationTabs from './components/SegregationTabs';
import StudentTable from './components/StudentTable';
import CompanyEligibilityFilter from './components/CompanyEligibilityFilter';
import AnalyticsView from './components/AnalyticsView';
import StudentModal from './components/StudentModal';
import CompanyModal from './components/CompanyModal';
import BulkImportModal from './components/BulkImportModal';
import { api } from './api/client';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('segregation');
  
  // Data states
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Filter states
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check health and load initial analytics & companies
  const checkConnectionAndLoadMeta = useCallback(async () => {
    try {
      await api.checkHealth();
      setBackendConnected(true);

      const [analyticsData, companiesData] = await Promise.all([
        api.getAnalytics(),
        api.getCompanies()
      ]);
      setAnalytics(analyticsData);
      setCompanies(companiesData);
    } catch (err) {
      setBackendConnected(false);
      console.warn('Backend currently unreachable:', err.message);
    }
  }, []);

  // Fetch filtered students
  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const data = await api.getStudents({
        tier: selectedTier,
        department: selectedDept,
        status: selectedStatus,
        search: searchQuery
      });
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [selectedTier, selectedDept, selectedStatus, searchQuery]);

  useEffect(() => {
    checkConnectionAndLoadMeta();
  }, [checkConnectionAndLoadMeta]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle student save (create or update)
  const handleSaveStudent = async (payload, studentId) => {
    if (studentId) {
      await api.updateStudent(studentId, payload);
      showToast(`Student ${payload.name} updated successfully!`);
    } else {
      await api.createStudent(payload);
      showToast(`Student ${payload.name} registered and segregated!`);
    }
    fetchStudents();
    checkConnectionAndLoadMeta();
  };

  // Handle student deletion
  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove student "${studentName}"?`)) {
      try {
        await api.deleteStudent(studentId);
        showToast(`Student "${studentName}" removed.`, 'info');
        fetchStudents();
        checkConnectionAndLoadMeta();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Handle company create
  const handleSaveCompany = async (payload) => {
    await api.createCompany(payload);
    showToast(`Recruitment partner "${payload.name}" registered!`);
    checkConnectionAndLoadMeta();
  };

  // Handle recalculate tiers
  const handleRecalculateTiers = async () => {
    setIsRecalculating(true);
    try {
      const res = await api.recalculateTiers();
      showToast(res.message || 'Tiers synchronized from environment configuration.');
      fetchStudents();
      checkConnectionAndLoadMeta();
    } catch (err) {
      showToast(err.message || 'Failed to recalculate tiers', 'error');
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="app-container">
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#38bdf8' : '#10b981',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.2s ease-out'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : toast.type === 'info' ? <Info size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendConnected={backendConnected}
        onOpenStudentModal={() => {
          setStudentToEdit(null);
          setIsStudentModalOpen(true);
        }}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
        onRecalculateTiers={handleRecalculateTiers}
        isRecalculating={isRecalculating}
      />

      {/* Backend Disconnection Banner if API is down */}
      {!backendConnected && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#fca5a5',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} />
            <span>
              Backend API is currently offline. Ensure FastAPI is running on <code>http://127.0.0.1:8000</code>.
            </span>
          </div>
          <button
            onClick={checkConnectionAndLoadMeta}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Real-time Placement Metrics Strip */}
      <MetricsBar analytics={analytics} />

      {/* Main Tab Content */}
      <main>
        {activeTab === 'segregation' && (
          <div>
            <SegregationTabs
              selectedTier={selectedTier}
              setSelectedTier={setSelectedTier}
              selectedDept={selectedDept}
              setSelectedDept={setSelectedDept}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              analytics={analytics}
            />

            <StudentTable
              students={students}
              onEditStudent={(student) => {
                setStudentToEdit(student);
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              isLoading={isLoadingStudents}
            />
          </div>
        )}

        {activeTab === 'eligibility' && (
          <CompanyEligibilityFilter
            companies={companies}
            onRefreshCompanies={checkConnectionAndLoadMeta}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView analytics={analytics} />
        )}
      </main>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSave={handleSaveCompany}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportSuccess={(res) => {
          showToast(res.message);
          fetchStudents();
          checkConnectionAndLoadMeta();
        }}
      />

    </div>
  );
}
