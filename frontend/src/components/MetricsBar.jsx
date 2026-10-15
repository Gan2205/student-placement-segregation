import React from 'react';
import { Award, Briefcase, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function MetricsBar({ analytics }) {
  if (!analytics) return null;

  const {
    total_students = 0,
    tiers = { tier_1: 0, tier_2: 0, tier_3: 0, needs_training: 0 },
    status = { placed: 0, eligible: 0 },
    placed_percentage = 0,
    avg_package_lpa = 0,
    highest_package_lpa = 0,
  } = analytics;

  const cards = [
    {
      title: 'Total Students',
      value: total_students,
      subtitle: `${status.placed} placed (${placed_percentage}%)`,
      icon: Users,
      color: 'var(--accent-primary)',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.3)',
    },
    {
      title: 'Tier 1 (Super Dream)',
      value: tiers.tier_1,
      subtitle: 'CGPA ≥ 8.5 • 0 Backlogs',
      icon: Award,
      color: 'var(--tier-1-text)',
      bg: 'var(--tier-1-bg)',
      border: 'var(--tier-1-border)',
      badge: 'Tier 1',
    },
    {
      title: 'Tier 2 (Core / IT)',
      value: tiers.tier_2,
      subtitle: 'CGPA ≥ 7.0 • ≤ 1 Backlog',
      icon: Briefcase,
      color: 'var(--tier-2-text)',
      bg: 'var(--tier-2-bg)',
      border: 'var(--tier-2-border)',
      badge: 'Tier 2',
    },
    {
      title: 'Tier 3 (Mass / Standard)',
      value: tiers.tier_3,
      subtitle: 'CGPA ≥ 6.0 • ≤ 2 Backlogs',
      icon: CheckCircle,
      color: 'var(--tier-3-text)',
      bg: 'var(--tier-3-bg)',
      border: 'var(--tier-3-border)',
      badge: 'Tier 3',
    },
    {
      title: 'Needs Training',
      value: tiers.needs_training,
      subtitle: 'Requires academic uplift',
      icon: AlertCircle,
      color: 'var(--tier-training-text)',
      bg: 'var(--tier-training-bg)',
      border: 'var(--tier-training-border)',
      badge: 'Remedial',
    },
    {
      title: 'Placement Packages',
      value: `${avg_package_lpa} LPA`,
      subtitle: `Highest: ${highest_package_lpa} LPA`,
      icon: TrendingUp,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.title}</span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={16} />
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: c.color,
                fontFamily: 'var(--font-heading)',
                lineHeight: 1.1,
                marginBottom: '0.35rem'
              }}>
                {c.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {c.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
