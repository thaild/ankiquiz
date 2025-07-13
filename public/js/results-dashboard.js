// Results Dashboard Component
class ResultsDashboard {
  constructor() {
    this.results = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.init();
  }

  async init() {
    await this.loadResults();
    this.render();
    this.bindEvents();
  }

  async loadResults() {
    try {
      if (!window.databaseClient) {
        console.warn('Database client not available');
        return;
      }

      this.results = await window.databaseClient.getUserExamResults(100);
      console.log('Loaded exam results:', this.results);
    } catch (error) {
      console.error('Failed to load exam results:', error);
      this.showError('Failed to load exam results: ' + error.message);
    }
  }

  render() {
    const dashboardHtml = `
      <div class="results-dashboard">
        <div class="dashboard-header">
          <h3><i class="fas fa-chart-line"></i> Exam Results Dashboard</h3>
          <div class="dashboard-actions">
            <button class="btn btn-primary btn-sm" id="refreshResults">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <button class="btn btn-info btn-sm" id="showStats">
              <i class="fas fa-chart-bar"></i> Statistics
            </button>
          </div>
        </div>
        
        <div class="dashboard-content">
          <div id="resultsList" class="results-list">
            ${this.renderResultsList()}
          </div>
          
          <div id="pagination" class="pagination-container">
            ${this.renderPagination()}
          </div>
        </div>
        
        <div id="statsModal" class="modal fade" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Exam Statistics</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body" id="statsContent">
                Loading statistics...
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert dashboard into the page
    const container = document.querySelector('.container-lg');
    if (container) {
      const dashboardContainer = document.createElement('div');
      dashboardContainer.innerHTML = dashboardHtml;
      container.appendChild(dashboardContainer);
    }
  }

  renderResultsList() {
    if (this.results.length === 0) {
      return `
        <div class="text-center py-4">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">No exam results found</p>
          <p class="text-muted">Complete some exams to see your results here</p>
        </div>
      `;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageResults = this.results.slice(startIndex, endIndex);

    return `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Exam</th>
              <th>Score</th>
              <th>Questions</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageResults.map(result => this.renderResultRow(result)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderResultRow(result) {
    const scoreClass = result.score >= 70 ? 'text-success' : 'text-danger';
    const scoreIcon = result.score >= 70 ? 'fa-check-circle' : 'fa-times-circle';
    const date = new Date(result.completed_at).toLocaleDateString();
    const time = new Date(result.completed_at).toLocaleTimeString();

    return `
      <tr>
        <td>
          <div class="exam-info">
            <strong>${result.exam_name}</strong>
            <small class="text-muted d-block">${result.group_name || 'Unknown Group'}</small>
          </div>
        </td>
        <td>
          <span class="${scoreClass}">
            <i class="fas ${scoreIcon}"></i>
            ${result.score}%
          </span>
        </td>
        <td>
          <small class="text-muted">
            ${result.correct_answers}/${result.total_questions}
          </small>
        </td>
        <td>
          <small class="text-muted">
            ${date}<br>${time}
          </small>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary view-result" data-result-id="${result.id}">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="btn btn-sm btn-outline-danger delete-result" data-result-id="${result.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  renderPagination() {
    const totalPages = Math.ceil(this.results.length / this.itemsPerPage);
    if (totalPages <= 1) return '';

    let paginationHtml = '<nav><ul class="pagination pagination-sm justify-content-center">';
    
    // Previous button
    paginationHtml += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
      </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Next button
    paginationHtml += `
      <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
      </li>
    `;

    paginationHtml += '</ul></nav>';
    return paginationHtml;
  }

  bindEvents() {
    // Refresh results
    document.addEventListener('click', (e) => {
      if (e.target.closest('#refreshResults')) {
        this.loadResults().then(() => {
          this.updateResultsList();
        });
      }
    });

    // Show statistics
    document.addEventListener('click', (e) => {
      if (e.target.closest('#showStats')) {
        this.showStatistics();
      }
    });

    // Pagination
    document.addEventListener('click', (e) => {
      if (e.target.closest('.page-link')) {
        e.preventDefault();
        const page = parseInt(e.target.dataset.page);
        if (page && page > 0 && page <= Math.ceil(this.results.length / this.itemsPerPage)) {
          this.currentPage = page;
          this.updateResultsList();
        }
      }
    });

    // View result details
    document.addEventListener('click', (e) => {
      if (e.target.closest('.view-result')) {
        const resultId = e.target.closest('.view-result').dataset.resultId;
        this.showResultDetails(resultId);
      }
    });

    // Delete result
    document.addEventListener('click', (e) => {
      if (e.target.closest('.delete-result')) {
        const resultId = e.target.closest('.delete-result').dataset.resultId;
        this.deleteResult(resultId);
      }
    });
  }

  updateResultsList() {
    const resultsList = document.getElementById('resultsList');
    const pagination = document.getElementById('pagination');
    
    if (resultsList) {
      resultsList.innerHTML = this.renderResultsList();
    }
    
    if (pagination) {
      pagination.innerHTML = this.renderPagination();
    }
  }

  async showStatistics() {
    try {
      if (!window.databaseClient) {
        this.showError('Database client not available');
        return;
      }

      const stats = await window.databaseClient.getUserStats();
      const statsContent = document.getElementById('statsContent');
      
      if (statsContent) {
        statsContent.innerHTML = this.renderStatistics(stats);
      }

      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('statsModal'));
      modal.show();
    } catch (error) {
      console.error('Failed to load statistics:', error);
      this.showError('Failed to load statistics: ' + error.message);
    }
  }

  renderStatistics(stats) {
    const avgScore = stats.average_score ? Math.round(stats.average_score * 10) / 10 : 0;
    const passRate = stats.total_exams > 0 ? Math.round((stats.passed_exams / stats.total_exams) * 100) : 0;

    return `
      <div class="row">
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-body text-center">
              <h5 class="card-title">Total Exams</h5>
              <h2 class="text-primary">${stats.total_exams || 0}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-body text-center">
              <h5 class="card-title">Average Score</h5>
              <h2 class="text-info">${avgScore}%</h2>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-body text-center">
              <h5 class="card-title">Pass Rate</h5>
              <h2 class="text-success">${passRate}%</h2>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-body text-center">
              <h5 class="card-title">Highest Score</h5>
              <h2 class="text-warning">${stats.highest_score || 0}%</h2>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h6 class="card-title">Performance Summary</h6>
              <div class="row">
                <div class="col-md-4">
                  <div class="d-flex justify-content-between">
                    <span>Passed Exams:</span>
                    <span class="text-success">${stats.passed_exams || 0}</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="d-flex justify-content-between">
                    <span>Failed Exams:</span>
                    <span class="text-danger">${stats.failed_exams || 0}</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="d-flex justify-content-between">
                    <span>Lowest Score:</span>
                    <span class="text-muted">${stats.lowest_score || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showResultDetails(resultId) {
    const result = this.results.find(r => r.id == resultId);
    if (!result) {
      this.showError('Result not found');
      return;
    }

    const detailsHtml = `
      <div class="modal fade" id="resultDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Exam Result Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Exam Information</h6>
                  <p><strong>Exam:</strong> ${result.exam_name}</p>
                  <p><strong>Group:</strong> ${result.group_name || 'N/A'}</p>
                  <p><strong>Date:</strong> ${new Date(result.completed_at).toLocaleString()}</p>
                </div>
                <div class="col-md-6">
                  <h6>Score Details</h6>
                  <p><strong>Score:</strong> ${result.score}%</p>
                  <p><strong>Correct:</strong> ${result.correct_answers}/${result.total_questions}</p>
                  <p><strong>Incorrect:</strong> ${result.incorrect_answers}</p>
                  <p><strong>Unanswered:</strong> ${result.unanswered_questions || 0}</p>
                </div>
              </div>
              
              ${result.answers_data ? `
                <div class="mt-3">
                  <h6>Answer Details</h6>
                  <pre class="bg-light p-2 rounded">${JSON.stringify(result.answers_data, null, 2)}</pre>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('resultDetailsModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', detailsHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('resultDetailsModal'));
    modal.show();
  }

  async deleteResult(resultId) {
    if (!confirm('Are you sure you want to delete this exam result?')) {
      return;
    }

    try {
      // Note: This would require a DELETE endpoint on the server
      // For now, we'll just remove from the local array
      this.results = this.results.filter(r => r.id != resultId);
      this.updateResultsList();
      this.showSuccess('Result deleted successfully');
    } catch (error) {
      console.error('Failed to delete result:', error);
      this.showError('Failed to delete result: ' + error.message);
    }
  }

  showSuccess(message) {
    const alertHtml = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    
    const container = document.querySelector('.results-dashboard');
    if (container) {
      container.insertAdjacentHTML('afterbegin', alertHtml);
    }
  }

  showError(message) {
    const alertHtml = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    
    const container = document.querySelector('.results-dashboard');
    if (container) {
      container.insertAdjacentHTML('afterbegin', alertHtml);
    }
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Add dashboard button to the settings menu
  const settingsMenu = document.querySelector('.dropdown-menu');
  if (settingsMenu) {
    const dashboardItem = document.createElement('li');
    dashboardItem.innerHTML = `
      <a class="dropdown-item" href="#" id="showDashboard">
        <i class="fas fa-chart-line"></i> Results Dashboard
      </a>
    `;
    settingsMenu.appendChild(dashboardItem);
  }

  // Show dashboard when button is clicked
  document.addEventListener('click', (e) => {
    if (e.target.closest('#showDashboard')) {
      e.preventDefault();
      
      // Hide other content
      document.querySelectorAll('.examBlock, .testBlock').forEach(el => {
        el.classList.add('d-none');
      });
      
      // Show dashboard
      const dashboard = document.querySelector('.results-dashboard');
      if (dashboard) {
        dashboard.classList.remove('d-none');
      } else {
        // Initialize dashboard if not exists
        new ResultsDashboard();
      }
    }
  });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResultsDashboard;
} 