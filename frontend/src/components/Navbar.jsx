import React from 'react';
import { Layers, Building2, BarChart3, PlusCircle, RefreshCw, Radio, UploadCloud } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  backendConnected,
  onOpenStudentModal,
  onOpenCompanyModal,
  onOpenBulkImport,
  onRecalculateTiers,
  isRecalculating
}) {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'PlacementSegregator Pro';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

  return (
    <header className="glass-panel" style={{ marginBottom: '2rem', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Connection Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Layers size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{appTitle}</h1>
              <div 
                title={`Backend: ${apiBase}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: backendConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: backendConnected ? '#10b981' : '#ef4444',
                  border: `1px solid ${backendConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <div className={`status-dot ${backendConnected ? 'pulse' : ''}`} />
                {backendConnected ? 'API ONLINE' : 'API OFFLINE'}
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Systematic Student Placement Segregation & Eligibility System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('segregation')}
            className={`btn btn-sm ${activeTab === 'segregation' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Layers size={16} />
            Students Segregation
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`btn btn-sm ${activeTab === 'eligibility' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Building2 size={16} />
            Company Eligibility Filter
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <BarChart3 size={16} />
            Analytics
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={onRecalculateTiers}
            disabled={isRecalculating}
            className="btn btn-secondary btn-sm"
            title="Recalculate all student tiers using environment thresholds"
          >
            <RefreshCw size={14} className={isRecalculating ? 'pulse' : ''} />
            {isRecalculating ? 'Recalculating...' : 'Sync Tiers'}
          </button>
          <button
            onClick={onOpenBulkImport}
            className="btn btn-secondary btn-sm"
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              color: '#a5b4fc',
              borderColor: 'rgba(99, 102, 241, 0.3)'
            }}
            title="Import student records in bulk from Excel (.xlsx) or CSV"
          >
            <UploadCloud size={15} />
            Bulk Import
          </button>
          <button
            onClick={onOpenCompanyModal}
            className="btn btn-secondary btn-sm"
          >
            <Building2 size={15} />
            + Company
          </button>
          <button
            onClick={onOpenStudentModal}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={15} />
            + Student
          </button>
        </div>

      </div>
    </header>
  );
}
