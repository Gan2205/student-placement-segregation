/**
 * CSV Export Utility for Student Placement Segregation System
 */

function escapeCsvCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // Replace quotes with double quotes and wrap in quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Downloads candidate eligibility results after checking company compatibility.
 */
export function exportEligibilityToCsv(students, criteriaUsed, onlyEligible = false) {
  if (!students || students.length === 0) {
    alert('No student records to export.');
    return;
  }

  const targetName = criteriaUsed?.target_name || 'Custom Criteria';
  const headers = [
    'Roll Number',
    'Full Name',
    'Email',
    'Branch / Department',
    'CGPA',
    'Active Backlogs',
    'Segregated Tier',
    'Eligibility Status',
    'Match Score (%)',
    'Target Company / Drive',
    'Missing Criteria / Reasons',
    'Student Skills',
    'Placement Status',
    'Company Placed',
    'Package (LPA)'
  ];

  const rows = students.map(s => {
    const skillsStr = Array.isArray(s.skills) ? s.skills.join(', ') : (s.skills || '');
    const missingStr = Array.isArray(s.missing_criteria) && s.missing_criteria.length > 0 
      ? s.missing_criteria.join(' | ') 
      : 'None (Fully Qualified)';
    const eligibilityLabel = s.is_eligible ? 'ELIGIBLE' : 'INELIGIBLE';
    const matchScoreStr = s.match_score !== undefined ? `${s.match_score}%` : 'N/A';

    return [
      escapeCsvCell(s.roll_no),
      escapeCsvCell(s.name),
      escapeCsvCell(s.email),
      escapeCsvCell(s.department),
      escapeCsvCell(s.cgpa?.toFixed(2)),
      escapeCsvCell(s.backlogs),
      escapeCsvCell(s.tier),
      escapeCsvCell(eligibilityLabel),
      escapeCsvCell(matchScoreStr),
      escapeCsvCell(targetName),
      escapeCsvCell(missingStr),
      escapeCsvCell(skillsStr),
      escapeCsvCell(s.placement_status),
      escapeCsvCell(s.company_placed || 'N/A'),
      escapeCsvCell(s.package_lpa ? `${s.package_lpa} LPA` : 'N/A')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const sanitizedTarget = targetName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const typePrefix = onlyEligible ? 'eligible_candidates' : 'all_evaluated_candidates';
  link.setAttribute('href', url);
  link.setAttribute('download', `${typePrefix}_${sanitizedTarget}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads general student list from the segregation view.
 */
export function exportStudentListToCsv(students, filterLabel = 'students') {
  if (!students || students.length === 0) {
    alert('No student records to export.');
    return;
  }

  const headers = [
    'Roll Number',
    'Full Name',
    'Email',
    'Department',
    'CGPA',
    'Backlogs',
    'Tier',
    'Skills',
    'Placement Status',
    'Placed Company',
    'Package (LPA)'
  ];

  const rows = students.map(s => {
    const skillsStr = Array.isArray(s.skills) ? s.skills.join(', ') : (s.skills || '');
    return [
      escapeCsvCell(s.roll_no),
      escapeCsvCell(s.name),
      escapeCsvCell(s.email),
      escapeCsvCell(s.department),
      escapeCsvCell(s.cgpa?.toFixed(2)),
      escapeCsvCell(s.backlogs),
      escapeCsvCell(s.tier),
      escapeCsvCell(skillsStr),
      escapeCsvCell(s.placement_status),
      escapeCsvCell(s.company_placed || 'N/A'),
      escapeCsvCell(s.package_lpa ? `${s.package_lpa} LPA` : 'N/A')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `students_${filterLabel.toLowerCase().replace(/\s+/g, '_')}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
