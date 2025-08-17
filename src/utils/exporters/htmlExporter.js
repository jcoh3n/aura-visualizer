/**
 * Exporteur HTML pour les rapports interactifs
 * Génère des pages HTML avec graphiques interactifs et données intégrées
 */

export class HTMLExporter {
  constructor() {
    this.template = null
  }

  /**
   * Exporte les données en HTML
   * @param {Object} data - Données à exporter
   */
  async export(data) {
    try {
      const htmlContent = await this.generateHTMLReport(data)
      
      // Download the HTML file
      const filename = this.generateFilename(data.settings.title)
      this.downloadHTML(htmlContent, filename)
      
    } catch (error) {
      console.error('Erreur génération HTML:', error)
      throw new Error(`Impossible de générer le rapport HTML: ${error.message}`)
    }
  }

  /**
   * Génère le contenu HTML complet
   * @param {Object} data - Données du rapport
   * @returns {string} Contenu HTML
   */
  async generateHTMLReport(data) {
    const styles = this.generateCSS()
    const scripts = this.generateJavaScript(data)
    const body = this.generateBody(data)
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.settings.title}</title>
    <style>${styles}</style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/index.min.js"></script>
</head>
<body>
    ${body}
    <script>${scripts}</script>
</body>
</html>`
  }

  /**
   * Génère les styles CSS
   * @returns {string} CSS
   */
  generateCSS() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .header {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      
      .header h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .header p {
        color: #666;
        font-size: 1.1em;
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .stat-card {
        background: white;
        border-radius: 15px;
        padding: 25px;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
      }
      
      .stat-value {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 5px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .stat-label {
        color: #666;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .section {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      .section h2 {
        font-size: 1.8em;
        margin-bottom: 20px;
        color: #333;
        border-bottom: 3px solid #667eea;
        padding-bottom: 10px;
      }
      
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 25px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
      }
      
      .filter-group {
        display: flex;
        flex-direction: column;
        min-width: 200px;
      }
      
      .filter-group label {
        font-weight: 600;
        margin-bottom: 5px;
        color: #555;
      }
      
      .filter-group select {
        padding: 8px 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.3s ease;
      }
      
      .filter-group select:focus {
        outline: none;
        border-color: #667eea;
      }
      
      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 30px;
        margin-bottom: 30px;
      }
      
      .chart-container {
        background: white;
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      .chart-title {
        font-size: 1.2em;
        font-weight: 600;
        margin-bottom: 15px;
        color: #333;
      }
      
      .chart-canvas {
        width: 100% !important;
        height: 300px !important;
      }
      
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      
      .data-table th,
      .data-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      
      .data-table th {
        background: #f8f9fa;
        font-weight: 600;
        color: #555;
      }
      
      .data-table tr:hover {
        background: #f8f9fa;
      }
      
      .question-analysis {
        margin-bottom: 25px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
        border-left: 4px solid #667eea;
      }
      
      .question-title {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: 10px;
        color: #333;
      }
      
      .question-stats {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
      }
      
      .question-stat {
        text-align: center;
      }
      
      .question-stat-value {
        font-size: 1.5em;
        font-weight: bold;
        color: #667eea;
      }
      
      .question-stat-label {
        font-size: 0.8em;
        color: #666;
      }
      
      .export-buttons {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 1000;
      }
      
      .export-btn {
        padding: 10px 15px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s ease;
      }
      
      .export-btn:hover {
        background: #5a6fd8;
      }
      
      .footer {
        text-align: center;
        padding: 30px;
        color: white;
        font-size: 0.9em;
      }
      
      @media (max-width: 768px) {
        .charts-grid {
          grid-template-columns: 1fr;
        }
        
        .filters {
          flex-direction: column;
        }
        
        .export-buttons {
          position: relative;
          top: auto;
          right: auto;
          justify-content: center;
          margin-bottom: 20px;
        }
      }
    `
  }

  /**
   * Génère le contenu du body HTML
   * @param {Object} data - Données du rapport
   * @returns {string} HTML du body
   */
  generateBody(data) {
    const headerSection = this.generateHeader(data)
    const statsSection = this.generateStatsSection(data)
    const filtersSection = data.options.includeFilters ? this.generateFiltersSection(data) : ''
    const chartsSection = data.options.includeInteractiveCharts ? this.generateChartsSection(data) : ''
    const analysisSection = this.generateAnalysisSection(data)
    const dataSection = this.generateDataSection(data)
    const footer = this.generateFooter(data)
    
    return `
      <div class="export-buttons">
        <button class="export-btn" onclick="exportToPDF()">📄 PDF</button>
        <button class="export-btn" onclick="exportToExcel()">📊 Excel</button>
        <button class="export-btn" onclick="printReport()">🖨️ Imprimer</button>
      </div>
      
      <div class="container">
        ${headerSection}
        ${statsSection}
        ${filtersSection}
        ${chartsSection}
        ${analysisSection}
        ${dataSection}
      </div>
      
      ${footer}
    `
  }

  /**
   * Génère la section header
   * @param {Object} data - Données du rapport
   * @returns {string} HTML header
   */
  generateHeader(data) {
    const date = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    return `
      <div class="header">
        <h1>${data.settings.title}</h1>
        <p>${data.settings.description || 'Rapport d\'analyse de questionnaire'}</p>
        <p><strong>Généré le:</strong> ${date}</p>
        ${data.settings.author ? `<p><strong>Auteur:</strong> ${data.settings.author}</p>` : ''}
      </div>
    `
  }

  /**
   * Génère la section des statistiques
   * @param {Object} data - Données du rapport
   * @returns {string} HTML stats
   */
  generateStatsSection(data) {
    const totalResponses = data.responses.length
    const questionsCount = data.selectedQuestions.length
    const completionRate = this.calculateCompletionRate(data.responses)
    const completeResponses = data.responses.filter(r => r._metadata?.completion_rate === 100).length
    
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${totalResponses}</div>
          <div class="stat-label">Total Réponses</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${questionsCount}</div>
          <div class="stat-label">Questions Analysées</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${completionRate.toFixed(1)}%</div>
          <div class="stat-label">Taux Completion</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${completeResponses}</div>
          <div class="stat-label">Réponses Complètes</div>
        </div>
      </div>
    `
  }

  /**
   * Génère la section des filtres
   * @param {Object} data - Données du rapport
   * @returns {string} HTML filters
   */
  generateFiltersSection(data) {
    const choiceQuestions = data.selectedQuestions.filter(id => {
      const question = data.questionnaire.questions[id]
      return question && ['single_choice', 'multiple_choice'].includes(question.type)
    })
    
    if (choiceQuestions.length === 0) return ''
    
    const filterControls = choiceQuestions.map(questionId => {
      const question = data.questionnaire.questions[questionId]
      const options = Object.entries(question.options)
        .map(([value, label]) => `<option value="${value}">${label}</option>`)
        .join('')
      
      return `
        <div class="filter-group">
          <label>${question.label}</label>
          <select onchange="applyFilter('${questionId}', this.value)">
            <option value="">Toutes les réponses</option>
            ${options}
          </select>
        </div>
      `
    }).join('')
    
    return `
      <div class="section">
        <h2>Filtres Dynamiques</h2>
        <div class="filters">
          ${filterControls}
          <div class="filter-group">
            <label>&nbsp;</label>
            <button class="export-btn" onclick="clearAllFilters()">Effacer les filtres</button>
          </div>
        </div>
        <div id="filtered-stats"></div>
      </div>
    `
  }

  /**
   * Génère la section des graphiques
   * @param {Object} data - Données du rapport
   * @returns {string} HTML charts
   */
  generateChartsSection(data) {
    const chartContainers = data.selectedQuestions.map(questionId => {
      const question = data.questionnaire.questions[questionId]
      if (!question) return ''
      
      return `
        <div class="chart-container">
          <div class="chart-title">${question.label}</div>
          <canvas id="chart-${questionId}" class="chart-canvas"></canvas>
        </div>
      `
    }).join('')
    
    return `
      <div class="section">
        <h2>Visualisations Interactives</h2>
        <div class="charts-grid">
          ${chartContainers}
        </div>
      </div>
    `
  }

  /**
   * Génère la section d'analyse
   * @param {Object} data - Données du rapport
   * @returns {string} HTML analysis
   */
  generateAnalysisSection(data) {
    const questionAnalyses = data.selectedQuestions.map(questionId => {
      const question = data.questionnaire.questions[questionId]
      if (!question) return ''
      
      const stats = this.calculateQuestionStatistics(question, data.responses)
      
      return `
        <div class="question-analysis">
          <div class="question-title">${question.label}</div>
          <div class="question-stats">
            <div class="question-stat">
              <div class="question-stat-value">${stats.total}</div>
              <div class="question-stat-label">Réponses</div>
            </div>
            <div class="question-stat">
              <div class="question-stat-value">${stats.completion_rate.toFixed(1)}%</div>
              <div class="question-stat-label">Taux</div>
            </div>
            <div class="question-stat">
              <div class="question-stat-value">${stats.missing}</div>
              <div class="question-stat-label">Manquantes</div>
            </div>
          </div>
          ${this.generateQuestionInsights(question, stats)}
        </div>
      `
    }).join('')
    
    return `
      <div class="section">
        <h2>Analyse Détaillée</h2>
        ${questionAnalyses}
      </div>
    `
  }

  /**
   * Génère les insights pour une question
   * @param {Object} question - Question
   * @param {Object} stats - Statistiques
   * @returns {string} HTML insights
   */
  generateQuestionInsights(question, stats) {
    if (['single_choice', 'multiple_choice'].includes(question.type) && stats.distribution) {
      const topResponse = stats.distribution[0]
      return `
        <p><strong>Réponse principale:</strong> ${topResponse.label} (${topResponse.count} réponses, ${topResponse.percentage.toFixed(1)}%)</p>
      `
    } else if (question.type === 'text' && stats.responses) {
      return `
        <p><strong>Réponses uniques:</strong> ${stats.unique_responses} | <strong>Longueur moyenne:</strong> ${stats.avg_length.toFixed(1)} caractères</p>
      `
    } else if (question.type === 'numeric') {
      return `
        <p><strong>Moyenne:</strong> ${stats.mean?.toFixed(2)} | <strong>Min:</strong> ${stats.min} | <strong>Max:</strong> ${stats.max}</p>
      `
    }
    
    return ''
  }

  /**
   * Génère la section des données
   * @param {Object} data - Données du rapport
   * @returns {string} HTML data
   */
  generateDataSection(data) {
    if (!data.options.embedData) return ''
    
    // Sample of first 10 responses
    const sampleData = data.responses.slice(0, 10)
    const headers = ['ID', ...data.selectedQuestions.map(id => {
      const question = data.questionnaire.questions[id]
      return question ? question.label.substring(0, 30) + '...' : id
    })]
    
    const rows = sampleData.map((response, index) => {
      const cells = [
        index + 1,
        ...data.selectedQuestions.map(questionId => {
          const value = response[questionId]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') {
            return value.label || value.text || value.value || JSON.stringify(value)
          }
          return value
        })
      ]
      
      return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`
    }).join('')
    
    return `
      <div class="section">
        <h2>Aperçu des Données (10 premières réponses)</h2>
        <table class="data-table">
          <thead>
            <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="margin-top: 15px; color: #666; font-style: italic;">
          Total: ${data.responses.length} réponses (seules les 10 premières sont affichées)
        </p>
      </div>
    `
  }

  /**
   * Génère le footer
   * @param {Object} data - Données du rapport
   * @returns {string} HTML footer
   */
  generateFooter(data) {
    return `
      <div class="footer">
        <p>Rapport généré par Aura Visualizer - ${new Date().toLocaleDateString('fr-FR')}</p>
        <p>Données confidentielles - Usage interne uniquement</p>
      </div>
    `
  }

  /**
   * Génère le JavaScript pour l'interactivité
   * @param {Object} data - Données du rapport
   * @returns {string} JavaScript code
   */
  generateJavaScript(data) {
    const dataJson = JSON.stringify(data, null, 2)
    
    return `
      // Data
      const reportData = ${dataJson};
      let filteredData = [...reportData.responses];
      let activeFilters = {};
      
      // Initialize charts
      document.addEventListener('DOMContentLoaded', function() {
        initializeCharts();
        updateFilteredStats();
      });
      
      function initializeCharts() {
        reportData.selectedQuestions.forEach(questionId => {
          const question = reportData.questionnaire.questions[questionId];
          if (!question) return;
          
          const canvas = document.getElementById('chart-' + questionId);
          if (!canvas) return;
          
          createQuestionChart(canvas, question, questionId);
        });
      }
      
      function createQuestionChart(canvas, question, questionId) {
        const ctx = canvas.getContext('2d');
        const stats = calculateQuestionStats(question, questionId, filteredData);
        
        if (['single_choice', 'multiple_choice'].includes(question.type) && stats.distribution) {
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: stats.distribution.map(item => item.label),
              datasets: [{
                label: 'Réponses',
                data: stats.distribution.map(item => item.count),
                backgroundColor: [
                  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
                ]
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const percentage = ((context.parsed.y / stats.total) * 100).toFixed(1);
                      return context.parsed.y + ' réponses (' + percentage + '%)';
                    }
                  }
                }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }
          });
        }
      }
      
      function calculateQuestionStats(question, questionId, responses) {
        const relevantResponses = responses
          .map(response => response[questionId])
          .filter(value => value !== undefined && value !== null && value !== '');
        
        const stats = {
          total: relevantResponses.length,
          missing: responses.length - relevantResponses.length,
          completion_rate: responses.length > 0 ? (relevantResponses.length / responses.length) * 100 : 0
        };
        
        if (['single_choice', 'multiple_choice'].includes(question.type)) {
          const counts = {};
          relevantResponses.forEach(value => {
            const code = typeof value === 'object' ? value.code : value;
            counts[code] = (counts[code] || 0) + 1;
          });
          
          stats.distribution = Object.entries(counts).map(([code, count]) => ({
            code: parseInt(code),
            label: question.options[code] || 'Option ' + code,
            count,
            percentage: (count / relevantResponses.length) * 100
          })).sort((a, b) => b.count - a.count);
        }
        
        return stats;
      }
      
      function applyFilter(questionId, value) {
        if (value === '') {
          delete activeFilters[questionId];
        } else {
          activeFilters[questionId] = value;
        }
        
        updateFilteredData();
        updateCharts();
        updateFilteredStats();
      }
      
      function clearAllFilters() {
        activeFilters = {};
        const selects = document.querySelectorAll('.filters select');
        selects.forEach(select => select.value = '');
        
        updateFilteredData();
        updateCharts();
        updateFilteredStats();
      }
      
      function updateFilteredData() {
        filteredData = reportData.responses.filter(response => {
          return Object.entries(activeFilters).every(([questionId, filterValue]) => {
            const responseValue = response[questionId];
            if (typeof responseValue === 'object') {
              return responseValue.code == filterValue;
            }
            return responseValue == filterValue;
          });
        });
      }
      
      function updateCharts() {
        Chart.helpers.each(Chart.instances, function(instance) {
          instance.destroy();
        });
        initializeCharts();
      }
      
      function updateFilteredStats() {
        const statsDiv = document.getElementById('filtered-stats');
        if (!statsDiv) return;
        
        const activeFiltersCount = Object.keys(activeFilters).length;
        if (activeFiltersCount === 0) {
          statsDiv.innerHTML = '';
          return;
        }
        
        statsDiv.innerHTML = 
          '<p style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 5px;">' +
          '<strong>Filtres actifs:</strong> ' + activeFiltersCount + ' | ' +
          '<strong>Réponses filtrées:</strong> ' + filteredData.length + ' / ' + reportData.responses.length +
          '</p>';
      }
      
      function exportToPDF() {
        window.print();
      }
      
      function exportToExcel() {
        alert('Fonctionnalité d\\'export Excel à implémenter');
      }
      
      function printReport() {
        window.print();
      }
      
      // Print styles
      const printStyles = document.createElement('style');
      printStyles.textContent = \`
        @media print {
          .export-buttons { display: none !important; }
          .section { page-break-inside: avoid; }
          .chart-container { page-break-inside: avoid; }
        }
      \`;
      document.head.appendChild(printStyles);
    `
  }

  /**
   * Télécharge le fichier HTML
   * @param {string} content - Contenu HTML
   * @param {string} filename - Nom du fichier
   */
  downloadHTML(content, filename) {
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Utilitaires
   */
  
  calculateCompletionRate(responses) {
    if (!responses || responses.length === 0) return 0
    
    const totalRate = responses.reduce((sum, response) => {
      return sum + (response._metadata?.completion_rate || 0)
    }, 0)
    
    return totalRate / responses.length
  }

  calculateQuestionStatistics(question, responses) {
    const relevantResponses = responses
      .map(response => response[question.id])
      .filter(value => value !== undefined && value !== null && value !== '')
    
    const stats = {
      total: relevantResponses.length,
      missing: responses.length - relevantResponses.length,
      completion_rate: responses.length > 0 ? (relevantResponses.length / responses.length) * 100 : 0
    }
    
    if (['single_choice', 'multiple_choice'].includes(question.type)) {
      const counts = {}
      relevantResponses.forEach(value => {
        const code = typeof value === 'object' ? value.code : value
        counts[code] = (counts[code] || 0) + 1
      })
      
      stats.distribution = Object.entries(counts).map(([code, count]) => ({
        code: parseInt(code),
        label: question.options[code] || `Option ${code}`,
        count,
        percentage: (count / relevantResponses.length) * 100
      })).sort((a, b) => b.count - a.count)
    } else if (['text', 'open'].includes(question.type)) {
      stats.responses = relevantResponses
      stats.unique_responses = [...new Set(relevantResponses.map(r => 
        typeof r === 'object' ? r.text : r
      ))].length
      stats.avg_length = relevantResponses.reduce((sum, r) => {
        const text = typeof r === 'object' ? r.text : r
        return sum + (text?.length || 0)
      }, 0) / relevantResponses.length
    } else if (question.type === 'numeric') {
      const numericValues = relevantResponses.map(v => {
        const value = typeof v === 'object' ? v.value : parseFloat(v)
        return isNaN(value) ? null : value
      }).filter(v => v !== null)
      
      if (numericValues.length > 0) {
        stats.min = Math.min(...numericValues)
        stats.max = Math.max(...numericValues)
        stats.mean = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length
        stats.median = numericValues.sort((a, b) => a - b)[Math.floor(numericValues.length / 2)]
      }
    }
    
    return stats
  }

  generateFilename(title) {
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${cleanTitle}_${timestamp}.html`
  }
}
