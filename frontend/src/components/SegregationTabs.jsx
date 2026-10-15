import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function SegregationTabs({
  selectedTier,
  setSelectedTier,
  selectedDept,
  setSelectedDept,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  analytics
}) {
  const tiers = [
    { id: 'All', label: 'All Students', count: analytics?.total_students },
    { id: 'Tier 1', label: 'Tier 1 (Super Dream)', count: analytics?.tiers?.tier_1, badgeClass: 'badge-tier-1' },
    { id: 'Tier 2', label: 'Tier 2 (Core / IT)', count: analytics?.tiers?.tier_2, badgeClass: 'badge-tier-2' },
    { id: 'Tier 3', label: 'Tier 3 (Mass / Standard)', count: analytics?.tiers?.tier_3, badgeClass: 'badge-tier-3' },
    { id: 'Needs Training', label: 'Needs Training', count: analytics?.tiers?.needs_training, badgeClass: 'badge-tier-training' },
  ];

  const departments = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const statuses = ['All', 'Eligible', 'Placed', 'In-Progress', 'Needs Training'];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      
      {/* Tier Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Filter size={13} /> Tier:
        </span>
        {tiers.map(t => {
          const isActive = selectedTier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              style={{
                background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Selectors */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, roll no, or skills (e.g. Python, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.4rem', paddingRight: searchQuery ? '2rem' : '0.85rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label className="form-label" style={{ margin: 0, fontSize: '0.75rem' }}>Branch:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="form-select"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Branches' : d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label className="form-label" style={{ margin: 0, fontSize: '0.75rem' }}>Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

    </div>
  );
}
