import React from 'react';
import { BarChart3, TrendingUp, Award, Layers, CheckCircle2, ShieldCheck, Database, Server, Globe } from 'lucide-react';

export default function AnalyticsView({ analytics }) {
  if (!analytics) return null;

  const {
    total_students = 0,
    total_companies = 0,
    tiers = { tier_1: 0, tier_2: 0, tier_3: 0, needs_training: 0 },
    status = { eligible: 0, placed: 0, in_progress: 0, needs_training: 0 },
    placed_percentage = 0,
    avg_package_lpa = 0,
    highest_package_lpa = 0,
    department_breakdown = []
  } = analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Level Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Tier Distribution Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="var(--accent-primary)" />
            Segregation Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Tier 1 (Super Dream)', count: tiers.tier_1, color: '#f59e0b', sub: 'CGPA ≥ 8.5' },
              { label: 'Tier 2 (Core / IT)', count: tiers.tier_2, color: '#6366f1', sub: 'CGPA ≥ 7.0' },
              { label: 'Tier 3 (Mass)', count: tiers.tier_3, color: '#06b6d4', sub: 'CGPA ≥ 6.0' },
              { label: 'Needs Training', count: tiers.needs_training, color: '#f43f5e', sub: 'Remedial' },
            ].map((t, idx) => {
              const percent = total_students > 0 ? Math.round((t.count / total_students) * 100) : 0;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{t.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: t.color, fontWeight: 700 }}>
                      {t.count} ({percent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: t.color, borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Placement Status Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#10b981" />
            Recruitment Funnel
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Successfully Placed', count: status.placed, color: '#10b981' },
              { label: 'Eligible for Placement', count: status.eligible, color: '#38bdf8' },
              { label: 'In Interviews / In-Progress', count: status.in_progress, color: '#f59e0b' },
              { label: 'Requires Training / Remedial', count: status.needs_training, color: '#f43f5e' },
            ].map((s, idx) => {
              const percent = total_students > 0 ? Math.round((s.count / total_students) * 100) : 0;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>
                      {s.count} ({percent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: s.color, borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salary & Recruitment Stats */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#38bdf8" />
              Compensation Highlights
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Package</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {avg_package_lpa} LPA
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Highest Package</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  {highest_package_lpa} LPA
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Over <strong style={{ color: 'var(--text-primary)' }}>{total_companies} recruitment partners</strong> currently registered for campus placement drives.
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '0.85rem',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: '#a5b4fc'
          }}>
            ✓ Continuous Tier Segregation enabled with live environmental variables synchronization.
          </div>
        </div>
      </div>

      {/* Branch-wise Breakdown Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-primary)" />
          Branch / Department Breakdown
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Branch</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Students</th>
                <th style={{ padding: '0.75rem 1rem' }}>Placed Students</th>
                <th style={{ padding: '0.75rem 1rem' }}>Placement Rate</th>
                <th style={{ padding: '0.75rem 1rem' }}>Average CGPA</th>
              </tr>
            </thead>
            <tbody>
              {department_breakdown.map((dept, idx) => {
                const rate = dept.total > 0 ? Math.round((dept.placed / dept.total) * 100) : 0;
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {dept.department}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)' }}>
                      {dept.total}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                      {dept.placed}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        background: rate >= 50 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: rate >= 50 ? '#10b981' : '#f59e0b'
                      }}>
                        {rate}%
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: '#fbbf24', fontWeight: 700 }}>
                      {dept.avg_cgpa.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture & Environment Configuration Overview Card */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--accent-primary)" />
          Systematic Architecture & Environmental Keys Overview
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          This project stores and manages data in a systematic 3-tier architecture with strictly isolated environment keys.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {/* Frontend Box */}
          <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Globe size={16} /> Frontend Layer (React + Vite)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Environment File: <code style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>frontend/.env</code>
            </div>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.1rem' }}>
              <li><code>VITE_API_BASE_URL</code>: Base URL for backend endpoints</li>
              <li><code>VITE_APP_TITLE</code>: Dynamic branding title</li>
              <li><code>VITE_INSTITUTION_NAME</code>: College / campus identifier</li>
            </ul>
          </div>

          {/* Backend Box */}
          <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Server size={16} /> Backend Layer (FastAPI)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Environment File: <code style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>backend/.env</code>
            </div>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.1rem' }}>
              <li><code>PORT / HOST</code>: Server network bind address</li>
              <li><code>DATABASE_URL</code>: SQLite / SQL connection string</li>
              <li><code>TIER_1_MIN_CGPA / TIER_2_MIN_CGPA</code>: Dynamic thresholds</li>
              <li><code>SECRET_KEY & ALLOWED_ORIGINS</code>: Security & CORS</li>
            </ul>
          </div>

          {/* Database Box */}
          <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Database size={16} /> Data Storage Layer (SQLite)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Database File: <code style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>backend/database.db</code>
            </div>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.1rem' }}>
              <li><code>students</code> table: Full academic and tier history</li>
              <li><code>companies</code> table: Hiring drives & requirements</li>
              <li>Lifespan initialization with auto-seeding</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
