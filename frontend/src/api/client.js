/**
 * API Client for Student Placement Segregation System
 * Dynamically configured via environmental keys (.env)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.detail || `API Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // System Health
  async checkHealth() {
    return request('/health');
  },

  // Analytics & Summary
  async getAnalytics() {
    return request('/analytics/summary');
  },

  // Students & Segregation
  async getStudents(params = {}) {
    const query = new URLSearchParams();
    if (params.tier && params.tier !== 'All') query.append('tier', params.tier);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.status && params.status !== 'All') query.append('placement_status', params.status);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/students${queryString}`);
  },

  async getStudentById(id) {
    return request(`/students/${id}`);
  },

  async createStudent(studentData) {
    return request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  async updateStudent(id, studentData) {
    return request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  async deleteStudent(id) {
    return request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  async recalculateTiers() {
    return request('/students/recalculate-tiers', {
      method: 'POST',
    });
  },

  async bulkUploadStudents(file, updateExisting = true) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('update_existing', updateExisting ? 'true' : 'false');

    const response = await fetch(`${BASE_URL}/students/bulk-upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to upload student file');
    }
    return data;
  },

  getImportTemplateUrl() {
    return `${BASE_URL}/students/import-template`;
  },

  // Companies & Eligibility Filter
  async getCompanies() {
    return request('/companies');
  },

  async createCompany(companyData) {
    return request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  },

  async evaluateEligibility(filterCriteria) {
    return request('/companies/eligibility-filter', {
      method: 'POST',
      body: JSON.stringify(filterCriteria),
    });
  },
};
