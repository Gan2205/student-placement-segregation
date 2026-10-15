import React, { useState, useRef } from 'react';
import { api } from '../api/client';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  Check,
  RefreshCw
} from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadStats, setUploadStats] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    setUploadStats(null);
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Please select a valid CSV (.csv) or Excel (.xlsx / .xls) spreadsheet.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      const res = await api.bulkUploadStudents(selectedFile, updateExisting);
      setUploadStats(res.stats);
      if (onImportSuccess) {
        onImportSuccess(res);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Bulk upload failed. Please verify file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open(api.getImportTemplateUrl(), '_blank');
  };

  const resetModal = () => {
    setSelectedFile(null);
    setUploadStats(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={resetModal}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Bulk Import Students</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Import large batches from Excel (.xlsx) or CSV sheets
              </span>
            </div>
          </div>
          <button onClick={resetModal} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Template Download Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <Info size={16} color="var(--accent-primary)" />
            <span>Need the standard layout? Download sample spreadsheet template.</span>
          </div>
          <button
            onClick={handleDownloadTemplate}
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
          >
            <Download size={13} />
            Sample Template (.csv)
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-sm)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Report State */}
        {uploadStats ? (
          <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}>
              <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
              <h4 style={{ fontSize: '1.1rem', color: '#10b981', marginBottom: '0.25rem' }}>
                Bulk Import Completed Successfully!
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                All records were validated, mapped to branches, and segregated into placement tiers.
              </p>
            </div>

            {/* KPI Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Rows</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {uploadStats.total_rows}
                </div>
              </div>
              <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>Newly Added</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  +{uploadStats.imported}
                </div>
              </div>
              <div style={{ padding: '0.85rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>Updated</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                  {uploadStats.updated}
                </div>
              </div>
              <div style={{ padding: '0.85rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#fda4af' }}>Skipped</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                  {uploadStats.skipped}
                </div>
              </div>
            </div>

            {/* Sample Imported Badges */}
            {uploadStats.sample_imported && uploadStats.sample_imported.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Recently Segregated Candidates:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {uploadStats.sample_imported.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({s.roll_no})</span>
                      <span style={{
                        color: s.tier === 'Tier 1' ? '#fbbf24' : s.tier === 'Tier 2' ? '#a5b4fc' : '#7dd3fc',
                        fontWeight: 700
                      }}>
                        {s.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error notifications if any rows had issues */}
            {uploadStats.errors && uploadStats.errors.length > 0 && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: '#fda4af',
                marginBottom: '1.5rem',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Row Parsing Warnings:</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {uploadStats.errors.map((err, eIdx) => (
                    <li key={eIdx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setUploadStats(null);
                }}
                className="btn btn-secondary"
              >
                Upload Another File
              </button>
              <button
                type="button"
                onClick={resetModal}
                className="btn btn-primary"
              >
                <Check size={16} />
                Done & View Students
              </button>
            </div>
          </div>
        ) : (
          /* File Upload Dropzone Form */
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: isDragging ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '1.25rem'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <UploadCloud size={26} />
              </div>

              {selectedFile ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#6ee7b7' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready to process
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                    Drop your Excel (.xlsx) or CSV file here, or <span style={{ color: 'var(--accent-primary)' }}>browse</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Auto-maps columns: Roll No, Name, Email, Branch, CGPA, Backlogs, Skills, Status
                  </div>
                </div>
              )}
            </div>

            {/* Duplicate Roll No Handling Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.5rem',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <input
                type="checkbox"
                id="updateExistingCheckbox"
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="updateExistingCheckbox" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Update existing student records if matching Roll Number is found (Recommended)
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={resetModal} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || isUploading}
                onClick={handleUpload}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={16} className="pulse" />
                    Processing & Segregating...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Import & Auto-Segregate
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
