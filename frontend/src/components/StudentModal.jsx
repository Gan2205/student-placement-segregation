import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Check } from 'lucide-react';

export default function StudentModal({ isOpen, onClose, onSave, studentToEdit }) {
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [cgpa, setCgpa] = useState(8.0);
  const [backlogs, setBacklogs] = useState(0);
  const [skills, setSkills] = useState('');
  const [placementStatus, setPlacementStatus] = useState('Eligible');
  const [companyPlaced, setCompanyPlaced] = useState('');
  const [packageLpa, setPackageLpa] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setRollNo(studentToEdit.roll_no || '');
      setName(studentToEdit.name || '');
      setEmail(studentToEdit.email || '');
      setDepartment(studentToEdit.department || 'CSE');
      setCgpa(studentToEdit.cgpa ?? 8.0);
      setBacklogs(studentToEdit.backlogs ?? 0);
      setSkills(studentToEdit.skills?.join(', ') || '');
      setPlacementStatus(studentToEdit.placement_status || 'Eligible');
      setCompanyPlaced(studentToEdit.company_placed || '');
      setPackageLpa(studentToEdit.package_lpa ?? '');
    } else {
      setRollNo('');
      setName('');
      setEmail('');
      setDepartment('CSE');
      setCgpa(8.0);
      setBacklogs(0);
      setSkills('');
      setPlacementStatus('Eligible');
      setCompanyPlaced('');
      setPackageLpa('');
    }
    setErrorMsg('');
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!rollNo.trim() || !name.trim() || !email.trim()) {
      setErrorMsg('Please fill in Roll Number, Full Name, and Email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        roll_no: rollNo.trim(),
        name: name.trim(),
        email: email.trim(),
        department,
        cgpa: parseFloat(cgpa),
        backlogs: parseInt(backlogs, 10),
        skills: skillsArray,
        placement_status: placementStatus,
        company_placed: placementStatus === 'Placed' && companyPlaced.trim() ? companyPlaced.trim() : null,
        package_lpa: placementStatus === 'Placed' && packageLpa ? parseFloat(packageLpa) : null,
      };

      await onSave(payload, studentToEdit?.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save student record');
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
              <GraduationCap size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
              {studentToEdit ? 'Edit Student Record' : 'Register New Student'}
            </h3>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                required
                disabled={!!studentToEdit}
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="2024CS099"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Branch / Dept *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-select"
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">CGPA (0.0 - 10.0) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Active Backlogs *</label>
              <input
                type="number"
                min="0"
                max="20"
                required
                value={backlogs}
                onChange={(e) => setBacklogs(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills (Comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, React, SQL, AWS, Docker"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Placement Status</label>
              <select
                value={placementStatus}
                onChange={(e) => setPlacementStatus(e.target.value)}
                className="form-select"
              >
                <option value="Eligible">Eligible</option>
                <option value="Placed">Placed</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Needs Training">Needs Training</option>
                <option value="Opted Out">Opted Out</option>
              </select>
            </div>

            {placementStatus === 'Placed' && (
              <>
                <div className="form-group">
                  <label className="form-label">Company Placed</label>
                  <input
                    type="text"
                    value={companyPlaced}
                    onChange={(e) => setCompanyPlaced(e.target.value)}
                    placeholder="e.g. Google"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={packageLpa}
                    onChange={(e) => setPackageLpa(e.target.value)}
                    placeholder="e.g. 14.5"
                    className="form-input"
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Check size={16} />
              {isSubmitting ? 'Saving...' : studentToEdit ? 'Update Student' : 'Register Student'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
