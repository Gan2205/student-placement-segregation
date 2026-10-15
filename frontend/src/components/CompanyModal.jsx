import React, { useState } from 'react';
import { X, Building2, Check } from 'lucide-react';

export default function CompanyModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [minCgpa, setMinCgpa] = useState(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [requiredSkills, setRequiredSkills] = useState('');
  const [allowedDepartments, setAllowedDepartments] = useState('CSE, IT, ECE');
  const [packageLpa, setPackageLpa] = useState(12.0);
  const [driveDate, setDriveDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !role.trim() || !industry.trim()) {
      setErrorMsg('Please specify Company Name, Industry, and Job Role.');
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const deptsArray = allowedDepartments
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        industry: industry.trim(),
        role: role.trim(),
        min_cgpa: parseFloat(minCgpa),
        max_backlogs: parseInt(maxBacklogs, 10),
        required_skills: skillsArray,
        allowed_departments: deptsArray.length > 0 ? deptsArray : ['All'],
        package_lpa: parseFloat(packageLpa),
        drive_date: driveDate || null,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create recruitment company');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Register Recruitment Partner</h3>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oracle"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Industry *</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Cloud & Enterprise"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Recruitment Role *</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Associate Software Engineer"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Offered Package (LPA) *</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={packageLpa}
                onChange={(e) => setPackageLpa(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Min CGPA *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Backlogs *</label>
              <input
                type="number"
                min="0"
                max="10"
                required
                value={maxBacklogs}
                onChange={(e) => setMaxBacklogs(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Drive Date</label>
              <input
                type="date"
                value={driveDate}
                onChange={(e) => setDriveDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills (Comma-separated)</label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. Java, Spring Boot, SQL, DSA"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allowed Departments (Comma-separated or 'All')</label>
            <input
              type="text"
              value={allowedDepartments}
              onChange={(e) => setAllowedDepartments(e.target.value)}
              placeholder="e.g. CSE, IT, ECE or All"
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Check size={16} />
              {isSubmitting ? 'Registering...' : 'Register Company'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
