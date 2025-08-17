/**
 * Exporteur PDF pour les rapports de questionnaires
 * Génère des rapports PDF professionnels avec graphiques et statistiques
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export class PDFExporter {
  constructor() {
    this.doc = null
    this.currentY = 20
    this.pageHeight = 297 // A4 height in mm
    this.pageWidth = 210  // A4 width in mm
    this.margin = 20
    this.lineHeight = 7
  }

  /**
   * Exporte les données en PDF
   * @param {Object} data - Données à exporter
   */
  async export(data) {
    try {
      this.doc = new jsPDF('p', 'mm', 'a4')
      this.currentY = this.margin
      
      // Generate PDF content
      await this.generateReport(data)
      
      // Save the PDF
      const filename = this.generateFilename(data.settings.title)
      this.doc.save(filename)
      
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      throw new Error(`Impossible de générer le PDF: ${error.message}`)
    }
  }

  /**
   * Génère le contenu du rapport PDF
   * @param {Object} data - Données du rapport
   */
  async generateReport(data) {
    // Title page
    this.addTitlePage(data)
    
    // Executive summary
    this.addNewPage()
    this.addExecutiveSummary(data)
    
    // Statistics overview
    if (data.options.includeStatistics) {
      this.addNewPage()
      this.addStatisticsOverview(data)
    }
    
    // Question analysis
    await this.addQuestionAnalysis(data)
    
    // Charts
    if (data.options.includeCharts) {
      await this.addCharts(data)
    }
    
    // Raw data
    if (data.options.includeRawData) {
      this.addRawData(data)
    }
    
    // Footer on all pages
    this.addFooters(data)
  }

  /**
   * Ajoute la page de titre
   * @param {Object} data - Données du rapport
   */
  addTitlePage(data) {
    const centerX = this.pageWidth / 2
    
    // Main title
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(data.settings.title, centerX, 60, { align: 'center' })
    
    // Subtitle
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Rapport d\'analyse de questionnaire', centerX, 75, { align: 'center' })
    
    // Author and date
    this.doc.setFontSize(12)
    if (data.settings.author) {
      this.doc.text(`Auteur: ${data.settings.author}`, centerX, 100, { align: 'center' })
    }
    
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    this.doc.text(`Date: ${currentDate}`, centerX, 110, { align: 'center' })
    
    // Description
    if (data.settings.description) {
      this.doc.setFontSize(11)
      const lines = this.doc.splitTextToSize(data.settings.description, this.pageWidth - 2 * this.margin)
      this.doc.text(lines, this.margin, 130)
    }
    
    // Summary stats box
    this.addSummaryBox(data, 160)
  }

  /**
   * Ajoute une boîte de résumé des statistiques
   * @param {Object} data - Données du rapport
   * @param {number} y - Position Y
   */
  addSummaryBox(data, y) {
    const boxHeight = 40
    const boxY = y
    
    // Draw box
    this.doc.setDrawColor(200, 200, 200)
    this.doc.setFillColor(248, 249, 250)
    this.doc.rect(this.margin, boxY, this.pageWidth - 2 * this.margin, boxHeight, 'FD')
    
    // Stats
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    
    const stats = [
      `Total réponses: ${data.responses.length}`,
      `Questions analysées: ${data.selectedQuestions.length}`,
      `Taux de completion moyen: ${this.calculateCompletionRate(data.responses).toFixed(1)}%`,
      `Date de génération: ${new Date().toLocaleDateString('fr-FR')}`
    ]
    
    stats.forEach((stat, index) => {
      const x = this.margin + 10
      const statY = boxY + 10 + (index * 8)
      this.doc.text(stat, x, statY)
    })
  }

  /**
   * Ajoute le résumé exécutif
   * @param {Object} data - Données du rapport
   */
  addExecutiveSummary(data) {
    this.addSectionTitle('Résumé Exécutif')
    
    const summary = this.generateExecutiveSummary(data)
    this.addParagraph(summary)
    
    // Key findings
    this.addSubsectionTitle('Points Clés')
    const keyFindings = this.generateKeyFindings(data)
    keyFindings.forEach(finding => {
      this.addBulletPoint(finding)
    })
  }

  /**
   * Ajoute l'aperçu des statistiques
   * @param {Object} data - Données du rapport
   */
  addStatisticsOverview(data) {
    this.addSectionTitle('Aperçu Statistique')
    
    // Response statistics
    this.addSubsectionTitle('Statistiques de Réponse')
    
    const responseStats = this.calculateResponseStatistics(data)
    this.addStatisticsTable(responseStats)
    
    // Question type distribution
    this.addSubsectionTitle('Distribution par Type de Question')
    
    const questionTypes = this.calculateQuestionTypeDistribution(data)
    this.addQuestionTypeTable(questionTypes)
  }

  /**
   * Ajoute l'analyse des questions
   * @param {Object} data - Données du rapport
   */
  async addQuestionAnalysis(data) {
    this.addNewPage()
    this.addSectionTitle('Analyse Détaillée des Questions')
    
    for (const questionId of data.selectedQuestions) {
      const question = data.questionnaire.questions[questionId]
      if (!question) continue
      
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage()
      }
      
      this.addQuestionSection(question, data)
    }
  }

  /**
   * Ajoute une section pour une question
   * @param {Object} question - Question à analyser
   * @param {Object} data - Données du rapport
   */
  addQuestionSection(question, data) {
    this.addSubsectionTitle(question.label)
    
    // Question info
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'italic')
    this.doc.text(`Type: ${question.type} | ID: ${question.id}`, this.margin, this.currentY)
    this.currentY += this.lineHeight
    
    // Statistics for this question
    const stats = this.calculateQuestionStatistics(question, data.responses)
    this.addQuestionStatistics(stats)
    
    // Top responses for choice questions
    if (['single_choice', 'multiple_choice'].includes(question.type) && stats.distribution) {
      this.addTopResponses(stats.distribution.slice(0, 5))
    }
    
    this.currentY += 10 // Space between questions
  }

  /**
   * Ajoute les graphiques
   * @param {Object} data - Données du rapport
   */
  async addCharts(data) {
    this.addNewPage()
    this.addSectionTitle('Graphiques et Visualisations')
    
    // Note: In a real implementation, you would capture chart canvases
    // from the DOM and convert them to images for inclusion in the PDF
    this.addParagraph('Les graphiques seraient inclus ici dans une implémentation complète.')
    
    // Placeholder for chart implementation
    this.addChartPlaceholder('Graphiques en barres')
    this.addChartPlaceholder('Graphiques circulaires')
    this.addChartPlaceholder('Nuages de mots')
  }

  /**
   * Ajoute les données brutes
   * @param {Object} data - Données du rapport
   */
  addRawData(data) {
    this.addNewPage()
    this.addSectionTitle('Données Brutes')
    
    // Add data table
    this.addDataTable(data)
  }

  /**
   * Utilitaires de mise en page
   */
  
  addNewPage() {
    this.doc.addPage()
    this.currentY = this.margin
  }

  addSectionTitle(title) {
    this.checkPageBreak(20)
    
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    
    // Underline
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2)
    
    this.currentY += 15
  }

  addSubsectionTitle(title) {
    this.checkPageBreak(15)
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 10
  }

  addParagraph(text) {
    this.checkPageBreak(20)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin)
    lines.forEach(line => {
      this.checkPageBreak(this.lineHeight)
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += this.lineHeight
    })
    
    this.currentY += 5 // Paragraph spacing
  }

  addBulletPoint(text) {
    this.checkPageBreak(this.lineHeight + 2)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    this.doc.text('•', this.margin + 5, this.currentY)
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin - 10)
    lines.forEach((line, index) => {
      if (index > 0) this.checkPageBreak(this.lineHeight)
      this.doc.text(line, this.margin + 15, this.currentY)
      this.currentY += this.lineHeight
    })
    
    this.currentY += 2
  }

  addStatisticsTable(stats) {
    const tableData = Object.entries(stats).map(([key, value]) => [key, value])
    this.addSimpleTable(['Métrique', 'Valeur'], tableData)
  }

  addQuestionTypeTable(types) {
    const tableData = Object.entries(types).map(([type, count]) => [type, count.toString()])
    this.addSimpleTable(['Type de Question', 'Nombre'], tableData)
  }

  addSimpleTable(headers, data) {
    const colWidth = (this.pageWidth - 2 * this.margin) / headers.length
    const rowHeight = 8
    
    this.checkPageBreak((data.length + 1) * rowHeight + 10)
    
    // Headers
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFillColor(240, 240, 240)
    
    headers.forEach((header, index) => {
      const x = this.margin + index * colWidth
      this.doc.rect(x, this.currentY, colWidth, rowHeight, 'F')
      this.doc.text(header, x + 2, this.currentY + 5)
    })
    
    this.currentY += rowHeight
    
    // Data rows
    this.doc.setFont('helvetica', 'normal')
    data.forEach(row => {
      row.forEach((cell, index) => {
        const x = this.margin + index * colWidth
        this.doc.rect(x, this.currentY, colWidth, rowHeight)
        this.doc.text(cell.toString(), x + 2, this.currentY + 5)
      })
      this.currentY += rowHeight
    })
    
    this.currentY += 10
  }

  addChartPlaceholder(title) {
    this.checkPageBreak(60)
    
    // Placeholder rectangle
    this.doc.setDrawColor(200, 200, 200)
    this.doc.setFillColor(248, 249, 250)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 50, 'FD')
    
    // Placeholder text
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(title, this.pageWidth / 2, this.currentY + 30, { align: 'center' })
    
    this.currentY += 60
  }

  checkPageBreak(neededSpace) {
    if (this.currentY + neededSpace > this.pageHeight - this.margin) {
      this.addNewPage()
    }
  }

  addFooters(data) {
    const pageCount = this.doc.internal.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      
      // Footer line
      this.doc.setLineWidth(0.1)
      this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15)
      
      // Footer text
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(data.settings.title, this.margin, this.pageHeight - 10)
      this.doc.text(`Page ${i} / ${pageCount}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' })
    }
  }

  /**
   * Utilitaires de calcul
   */
  
  calculateCompletionRate(responses) {
    if (!responses || responses.length === 0) return 0
    
    const totalRate = responses.reduce((sum, response) => {
      return sum + (response._metadata?.completion_rate || 0)
    }, 0)
    
    return totalRate / responses.length
  }

  calculateResponseStatistics(data) {
    const total = data.responses.length
    const complete = data.responses.filter(r => r._metadata?.completion_rate === 100).length
    const partial = data.responses.filter(r => 
      r._metadata?.completion_rate > 0 && r._metadata?.completion_rate < 100
    ).length
    
    return {
      'Total réponses': total,
      'Réponses complètes': complete,
      'Réponses partielles': partial,
      'Taux completion moyen': `${this.calculateCompletionRate(data.responses).toFixed(1)}%`
    }
  }

  calculateQuestionTypeDistribution(data) {
    const distribution = {}
    
    data.selectedQuestions.forEach(questionId => {
      const question = data.questionnaire.questions[questionId]
      if (question) {
        distribution[question.type] = (distribution[question.type] || 0) + 1
      }
    })
    
    return distribution
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
        code,
        label: question.options[code] || `Option ${code}`,
        count,
        percentage: (count / relevantResponses.length) * 100
      })).sort((a, b) => b.count - a.count)
    }
    
    return stats
  }

  generateExecutiveSummary(data) {
    const totalResponses = data.responses.length
    const questionsCount = data.selectedQuestions.length
    const completionRate = this.calculateCompletionRate(data.responses)
    
    return `Ce rapport présente l'analyse de ${totalResponses} réponses collectées pour ${questionsCount} questions. ` +
           `Le taux de completion moyen est de ${completionRate.toFixed(1)}%, indiquant un bon niveau d'engagement des répondants. ` +
           `L'analyse révèle des insights significatifs sur les tendances et comportements observés dans les données.`
  }

  generateKeyFindings(data) {
    const findings = []
    
    // Completion rate finding
    const completionRate = this.calculateCompletionRate(data.responses)
    if (completionRate > 80) {
      findings.push('Excellent taux de participation avec plus de 80% de completion moyenne')
    } else if (completionRate > 60) {
      findings.push('Bon taux de participation avec plus de 60% de completion moyenne')
    } else {
      findings.push('Taux de participation modéré, des améliorations sont possibles')
    }
    
    // Sample size finding
    if (data.responses.length > 100) {
      findings.push('Échantillon statistiquement significatif avec plus de 100 réponses')
    }
    
    // Question diversity
    const questionTypes = this.calculateQuestionTypeDistribution(data)
    const typeCount = Object.keys(questionTypes).length
    if (typeCount > 3) {
      findings.push(`Questionnaire diversifié avec ${typeCount} types de questions différents`)
    }
    
    return findings
  }

  generateFilename(title) {
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${cleanTitle}_${timestamp}.pdf`
  }
}
