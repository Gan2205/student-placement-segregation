import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { exportEligibilityToCsv } from '../utils/exportCsv';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Sliders,
  Sparkles,
  ArrowRight,
  GraduationCap,
  AlertTriangle,
  Award,
  Layers,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export default function CompanyEligibilityFilter({ companies, onRefreshCompanies }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [minCgpa, setMinCgpa] = useState(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('Python, SQL, DSA');
  const [allowedDepts, setAllowedDepts] = useState(['CSE', 'IT', 'ECE']);

  const [filterResult, setFilterResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState('eligible');
  const [errorMsg, setErrorMsg] = useState('');

  const allDepts = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

  // When company dropdown changes, synchronize default criteria
  useEffect(() => {
    if (selectedCompanyId && companies) {
      const comp = companies.find(c => c.id === parseInt(selectedCompanyId, 10));
      if (comp) {
        setMinCgpa(comp.min_cgpa);
        setMaxBacklogs(comp.max_backlogs);
        setRequiredSkillsInput(comp.required_skills.join(', '));
        if (comp.allowed_departments.includes('All')) {
          setAllowedDepts([...allDepts]);
        } else {
          setAllowedDepts(comp.allowed_departments);
        }
      }
    }
  }, [selectedCompanyId, companies]);

  // Initial evaluation on mount
  useEffect(() => {
    handleRunFilter();
  }, []);

  const handleRunFilter = async () => {
    setIsEvaluating(true);
    setErrorMsg('');
    try {
      const skillsList = requiredSkillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        company_id: selectedCompanyId ? parseInt(selectedCompanyId, 10) : null,
        min_cgpa: parseFloat(minCgpa),
        max_backlogs: parseInt(maxBacklogs, 10),
        required_skills: skillsList,
        allowed_departments: allowedDepts.length === allDepts.length ? ['All'] : allowedDepts,
      };

      const result = await api.evaluateEligibility(payload);
      setFilterResult(result);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to evaluate eligibility');
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleDept = (dept) => {
    if (allowedDepts.includes(dept)) {
      if (allowedDepts.length > 1) {
        setAllowedDepts(allowedDepts.filter(d => d !== dept));
      }
    } else {
      setAllowedDepts([...allowedDepts, dept]);
    }
  };

  const handleSelectAllDepts = () => {
    setAllowedDepts([...allDepts]);
  };

  return (
    <div>
      {/* Criteria Filter Controls Panel */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sliders size={18} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Company Eligibility Matcher</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Filter and rank students against company criteria (CGPA cutoff, allowed backlogs, branch, & tech stack).
            </p>
          </div>

          {/* Quick Select Company Preset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>Load Preset:</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="form-select"
              style={{ minWidth: '220px', padding: '0.55rem 0.85rem' }}
            >
              <option value="">-- Custom Filter Criteria --</option>
              {companies?.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role}) • {c.package_lpa} LPA
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Parameters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {/* Min CGPA Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Minimum CGPA Cutoff</label>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                {parseFloat(minCgpa).toFixed(1)} / 10.0
              </span>
            </div>
            <input
              type="range"
              min="5.0"
              max="9.5"
              step="0.1"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              style={{
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer',
                width: '100%',
                marginTop: '0.3rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>5.0 (Flexible)</span>
              <span>7.5 (Standard)</span>
              <span>9.0 (Marquee)</span>
            </div>
          </div>

          {/* Max Backlogs */}
          <div className="form-group">
            <label className="form-label">Maximum Allowed Backlogs</label>
            <select
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(e.target.value)}
              className="form-select"
            >
              <option value="0">0 (Strictly No Active Backlogs)</option>
              <option value="1">Up to 1 Backlog</option>
              <option value="2">Up to 2 Backlogs</option>
              <option value="3">Up to 3 Backlogs</option>
            </select>
          </div>

          {/* Required Skills Input */}
          <div className="form-group">
            <label className="form-label">Required Technical Skills (Comma-separated)</label>
            <input
              type="text"
              value={requiredSkillsInput}
              onChange={(e) => setRequiredSkillsInput(e.target.value)}
              placeholder="e.g. Python, SQL, React, AWS"
              className="form-input"
            />
          </div>
        </div>

        {/* Allowed Departments Multi-selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Allowed Branches / Departments:</label>
            <button
              onClick={handleSelectAllDepts}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Select All Branches
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allDepts.map(dept => {
              const isSelected = allowedDepts.includes(dept);
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDept(dept)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected ? '✓ ' : ''}{dept}
                </button>
              );
            })}
          </div>
        </div>

        {/* Run Filter Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleRunFilter}
            disabled={isEvaluating}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem' }}
          >
            <Sparkles size={16} />
            {isEvaluating ? 'Evaluating Candidates...' : 'Run Eligibility Segregation'}
          </button>
        </div>

        {errorMsg && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* Filter Results Section */}
      {filterResult && (
        <div>
          {/* Summary KPI Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target Recruitment</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {filterResult.criteria_used?.target_name || 'Custom Criteria'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Evaluated</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {filterResult.total_evaluated}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Eligible Students</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                {filterResult.total_eligible}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 500 }}>
                  ({filterResult.total_evaluated > 0 ? Math.round((filterResult.total_eligible / filterResult.total_evaluated) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f43f5e' }}>
              <div style={{ fontSize: '0.75rem', color: '#fda4af' }}>Ineligible / Excluded</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e', marginTop: '0.2rem' }}>
                {filterResult.total_ineligible}
              </div>
            </div>
          </div>

          {/* Results Action & Tab Switcher Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            {/* Results Tab Switcher */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveResultTab('eligible')}
                className={`btn btn-sm ${activeResultTab === 'eligible' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  background: activeResultTab === 'eligible' ? 'rgba(16, 185, 129, 0.2)' : undefined,
                  color: activeResultTab === 'eligible' ? '#10b981' : undefined,
                  borderColor: activeResultTab === 'eligible' ? '#10b981' : undefined
                }}
              >
                <CheckCircle2 size={16} />
                Eligible Candidates ({filterResult.total_eligible})
              </button>
              <button
                onClick={() => setActiveResultTab('ineligible')}
                className={`btn btn-sm ${activeResultTab === 'ineligible' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  background: activeResultTab === 'ineligible' ? 'rgba(244, 63, 94, 0.2)' : undefined,
                  color: activeResultTab === 'ineligible' ? '#fda4af' : undefined,
                  borderColor: activeResultTab === 'ineligible' ? '#f43f5e' : undefined
                }}
              >
                <XCircle size={16} />
                Ineligible Candidates ({filterResult.total_ineligible})
              </button>
            </div>

            {/* CSV Download Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => exportEligibilityToCsv(filterResult.eligible_students, filterResult.criteria_used, true)}
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  borderColor: 'rgba(16, 185, 129, 0.35)',
                  fontWeight: 700
                }}
                title="Download CSV shortlist of all eligible candidates"
              >
                <Download size={14} />
                Download Eligible List (CSV)
              </button>

              <button
                onClick={() => exportEligibilityToCsv(
                  [...filterResult.eligible_students, ...filterResult.ineligible_students],
                  filterResult.criteria_used,
                  false
                )}
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#a5b4fc',
                  borderColor: 'rgba(99, 102, 241, 0.3)'
                }}
                title="Download complete evaluation report of all evaluated students with compatibility scores and reasons"
              >
                <FileSpreadsheet size={14} />
                Download Full Report (CSV)
              </button>
            </div>
          </div>

          {/* Candidate Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1rem'
          }}>
            {(activeResultTab === 'eligible' ? filterResult.eligible_students : filterResult.ineligible_students).map((cand) => {
              const isEligible = cand.is_eligible;
              return (
                <div
                  key={cand.id}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: `4px solid ${isEligible ? '#10b981' : '#f43f5e'}`
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{cand.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {cand.roll_no} • {cand.department}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: cand.match_score >= 80 ? '#10b981' : cand.match_score >= 60 ? '#fbbf24' : '#f43f5e'
                        }}>
                          {cand.match_score}% Match
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compatibility</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: `${cand.match_score}%`,
                        height: '100%',
                        background: isEligible
                          ? 'linear-gradient(90deg, #10b981, #38bdf8)'
                          : 'linear-gradient(90deg, #f43f5e, #fb923c)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>

                    {/* Academic Metrics Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      padding: '0.65rem',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.85rem',
                      fontSize: '0.75rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>CGPA:</span>
                        <div style={{ fontWeight: 700, color: cand.cgpa >= minCgpa ? '#6ee7b7' : '#fda4af' }}>
                          {cand.cgpa.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Backlogs:</span>
                        <div style={{ fontWeight: 700, color: cand.backlogs <= maxBacklogs ? '#6ee7b7' : '#fda4af' }}>
                          {cand.backlogs}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Tier:</span>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {cand.tier}
                        </div>
                      </div>
                    </div>

                    {/* Skills Breakdown */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Candidate Technical Skills:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {cand.skills?.map((skill, idx) => {
                          const isDemanded = filterResult.criteria_used?.required_skills?.some(
                            r => r.toLowerCase() === skill.toLowerCase()
                          );
                          return (
                            <span
                              key={idx}
                              className={`skill-chip ${isDemanded ? 'matched' : ''}`}
                            >
                              {isDemanded ? '✓ ' : ''}{skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Missing criteria notice if ineligible */}
                    {!isEligible && cand.missing_criteria && cand.missing_criteria.length > 0 && (
                      <div style={{
                        padding: '0.6rem 0.75rem',
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: '#fda4af',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <AlertTriangle size={13} /> Missing Qualification:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                          {cand.missing_criteria.map((crit, cIdx) => (
                            <li key={cIdx}>{crit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Status Indicator Bar */}
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status: {cand.placement_status}</span>
                    <span style={{
                      fontWeight: 700,
                      color: isEligible ? '#10b981' : '#f43f5e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {isEligible ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {isEligible ? 'Meets Criteria' : 'Ineligible'}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Empty state within the selected result tab */}
          {(activeResultTab === 'eligible' ? filterResult.eligible_students : filterResult.ineligible_students).length === 0 && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No students found in the {activeResultTab} category for this criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
