import React from 'react';
import { exportStudentListToCsv } from '../utils/exportCsv';
import { Edit2, Trash2, GraduationCap, CheckCircle2, AlertTriangle, Building, Briefcase, Download } from 'lucide-react';

export default function StudentTable({ students, onEditStudent, onDeleteStudent, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading student records...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <GraduationCap size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Students Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
          No records match the current tier, branch, or search criteria. Try adjusting the filters or register a new student.
        </p>
      </div>
    );
  }

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Tier 1':
        return <span className="badge badge-tier-1">★ Tier 1 (Super Dream)</span>;
      case 'Tier 2':
        return <span className="badge badge-tier-2">Tier 2 (Core / IT)</span>;
      case 'Tier 3':
        return <span className="badge badge-tier-3">Tier 3 (Mass)</span>;
      default:
        return <span className="badge badge-tier-training">Needs Training</span>;
    }
  };

  const getStatusBadge = (status, company, pkg) => {
    switch (status) {
      case 'Placed':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span className="badge-status placed">
              <span className="status-dot" /> Placed
            </span>
            {company && (
              <span style={{ fontSize: '0.72rem', color: '#6ee7b7', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Building size={11} /> {company} {pkg ? `(${pkg} LPA)` : ''}
              </span>
            )}
          </div>
        );
      case 'In-Progress':
        return (
          <span className="badge-status in-progress">
            <span className="status-dot pulse" /> Interviewing
          </span>
        );
      case 'Needs Training':
        return (
          <span className="badge-status needs-training">
            <AlertTriangle size={11} /> Remedial
          </span>
        );
      default:
        return (
          <span className="badge-status eligible">
            <CheckCircle2 size={11} /> Eligible
          </span>
        );
    }
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-heading)'
            }}>
              <th style={{ padding: '1rem 1.25rem' }}>Student / Roll No</th>
              <th style={{ padding: '1rem 1rem' }}>Branch</th>
              <th style={{ padding: '1rem 1rem' }}>CGPA / Backlogs</th>
              <th style={{ padding: '1rem 1rem' }}>Segregated Tier</th>
              <th style={{ padding: '1rem 1rem' }}>Technical Skills</th>
              <th style={{ padding: '1rem 1rem' }}>Placement Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Student Info */}
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {student.roll_no} • {student.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Department */}
                <td style={{ padding: '1rem 1rem' }}>
                  <span style={{
                    padding: '0.2rem 0.55rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.75rem'
                  }}>
                    {student.department}
                  </span>
                </td>

                {/* CGPA & Backlogs */}
                <td style={{ padding: '1rem 1rem' }}>
                  <div>
                    <span style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: student.cgpa >= 8.5 ? '#fbbf24' : student.cgpa >= 7.0 ? '#a5b4fc' : '#f8fafc'
                    }}>
                      {student.cgpa.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / 10.0</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: student.backlogs > 0 ? '#fda4af' : '#6ee7b7' }}>
                    {student.backlogs === 0 ? '✓ 0 Backlogs' : `⚠ ${student.backlogs} Backlog(s)`}
                  </div>
                </td>

                {/* Tier Badge */}
                <td style={{ padding: '1rem 1rem' }}>
                  {getTierBadge(student.tier)}
                </td>

                {/* Skills Chips */}
                <td style={{ padding: '1rem 1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxWidth: '280px' }}>
                    {student.skills && student.skills.length > 0 ? (
                      student.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="skill-chip">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No skills listed</span>
                    )}
                    {student.skills && student.skills.length > 4 && (
                      <span className="skill-chip" style={{ color: 'var(--accent-primary)', borderColor: 'var(--border-highlight)' }}>
                        +{student.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </td>

                {/* Placement Status */}
                <td style={{ padding: '1rem 1rem' }}>
                  {getStatusBadge(student.placement_status, student.company_placed, student.package_lpa)}
                </td>

                {/* Actions */}
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => onEditStudent(student)}
                      className="btn-icon"
                      title="Edit student"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student.id, student.name)}
                      className="btn-icon"
                      title="Delete student"
                      style={{ color: '#fda4af' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer Info & Export */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <span>Showing {students.length} student records • <span style={{ fontFamily: 'var(--font-mono)' }}>Sorted by CGPA (Descending)</span></span>
        
        <button
          onClick={() => exportStudentListToCsv(students, 'segregated_list')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          title="Download the currently filtered student list as CSV"
        >
          <Download size={13} />
          Export Table (CSV)
        </button>
      </div>
    </div>
  );
}
