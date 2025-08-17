/**
 * Exporteur Excel pour les données de questionnaires
 * Génère des fichiers Excel avec données, statistiques et tableaux croisés
 */

import * as XLSX from 'xlsx'

export class ExcelExporter {
  constructor() {
    this.workbook = null
  }

  /**
   * Exporte les données en Excel
   * @param {Object} data - Données à exporter
   */
  async export(data) {
    try {
      this.workbook = XLSX.utils.book_new()
      
      // Generate worksheets
      if (data.options.includeProcessedData) {
        this.addProcessedDataSheet(data)
      }
      
      if (data.options.includeStatistics) {
        this.addStatisticsSheet(data)
      }
      
      if (data.options.includePivotTables) {
        this.addPivotTablesSheet(data)
      }
      
      // Add metadata sheet
      this.addMetadataSheet(data)
      
      // Save the workbook
      const filename = this.generateFilename(data.settings.title)
      XLSX.writeFile(this.workbook, filename)
      
    } catch (error) {
      console.error('Erreur génération Excel:', error)
      throw new Error(`Impossible de générer le fichier Excel: ${error.message}`)
    }
  }

  /**
   * Ajoute la feuille des données traitées
   * @param {Object} data - Données du rapport
   */
  addProcessedDataSheet(data) {
    const processedData = this.prepareProcessedData(data)
    const worksheet = XLSX.utils.json_to_sheet(processedData)
    
    // Apply formatting
    this.formatDataSheet(worksheet, processedData)
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Données Traitées')
  }

  /**
   * Ajoute la feuille des statistiques
   * @param {Object} data - Données du rapport
   */
  addStatisticsSheet(data) {
    const statisticsData = this.prepareStatisticsData(data)
    
    // Create multiple tables in the statistics sheet
    const worksheet = XLSX.utils.aoa_to_sheet([])
    
    let currentRow = 0
    
    // Overall statistics
    currentRow = this.addStatisticsTable(
      worksheet, 
      'Statistiques Générales', 
      statisticsData.overall, 
      currentRow
    )
    
    currentRow += 2
    
    // Question statistics
    currentRow = this.addStatisticsTable(
      worksheet, 
      'Statistiques par Question', 
      statisticsData.questions, 
      currentRow
    )
    
    currentRow += 2
    
    // Response quality
    currentRow = this.addStatisticsTable(
      worksheet, 
      'Qualité des Réponses', 
      statisticsData.quality, 
      currentRow
    )
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Statistiques')
  }

  /**
   * Ajoute la feuille des tableaux croisés
   * @param {Object} data - Données du rapport
   */
  addPivotTablesSheet(data) {
    const pivotData = this.preparePivotData(data)
    const worksheet = XLSX.utils.aoa_to_sheet([])
    
    let currentRow = 0
    
    // Create pivot tables for choice questions
    data.selectedQuestions.forEach(questionId => {
      const question = data.questionnaire.questions[questionId]
      if (['single_choice', 'multiple_choice'].includes(question.type)) {
        currentRow = this.addPivotTable(
          worksheet,
          question,
          pivotData[questionId],
          currentRow
        )
        currentRow += 2
      }
    })
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Tableaux Croisés')
  }

  /**
   * Ajoute la feuille de métadonnées
   * @param {Object} data - Données du rapport
   */
  addMetadataSheet(data) {
    const metadata = this.prepareMetadata(data)
    const worksheet = XLSX.utils.json_to_sheet(metadata)
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Métadonnées')
  }

  /**
   * Prépare les données traitées pour l'export
   * @param {Object} data - Données du rapport
   * @returns {Array} Données formatées
   */
  prepareProcessedData(data) {
    return data.responses.map((response, index) => {
      const processedResponse = {
        'ID_Réponse': index + 1,
        'Date_Traitement': response._metadata?.processed_at || '',
        'Taux_Completion': response._metadata?.completion_rate || 0,
        'A_Erreurs': response._metadata?.has_errors ? 'Oui' : 'Non'
      }
      
      // Add question responses
      data.selectedQuestions.forEach(questionId => {
        const question = data.questionnaire.questions[questionId]
        const value = response[questionId]
        
        if (question) {
          const columnName = this.sanitizeColumnName(question.label)
          
          if (value === null || value === undefined) {
            processedResponse[columnName] = ''
            processedResponse[`${columnName}_Code`] = ''
          } else if (typeof value === 'object') {
            // Processed value object
            if (value.label !== undefined) {
              processedResponse[columnName] = value.label
              processedResponse[`${columnName}_Code`] = value.code || ''
            } else if (value.text !== undefined) {
              processedResponse[columnName] = value.text
            } else if (value.value !== undefined) {
              processedResponse[columnName] = value.value
              processedResponse[`${columnName}_Formaté`] = value.formatted || ''
            } else {
              processedResponse[columnName] = JSON.stringify(value)
            }
          } else {
            processedResponse[columnName] = value
          }
        }
      })
      
      return processedResponse
    })
  }

  /**
   * Prépare les données statistiques
   * @param {Object} data - Données du rapport
   * @returns {Object} Statistiques formatées
   */
  prepareStatisticsData(data) {
    const overall = [
      { Métrique: 'Total Réponses', Valeur: data.responses.length },
      { Métrique: 'Questions Analysées', Valeur: data.selectedQuestions.length },
      { Métrique: 'Taux Completion Moyen', Valeur: `${this.calculateCompletionRate(data.responses).toFixed(1)}%` },
      { Métrique: 'Date Export', Valeur: new Date().toLocaleDateString('fr-FR') }
    ]
    
    const questions = data.selectedQuestions.map(questionId => {
      const question = data.questionnaire.questions[questionId]
      const stats = this.calculateQuestionStatistics(question, data.responses)
      
      return {
        'ID Question': questionId,
        'Libellé': question.label,
        'Type': question.type,
        'Total Réponses': stats.total,
        'Réponses Manquantes': stats.missing,
        'Taux Réponse': `${stats.completion_rate.toFixed(1)}%`
      }
    })
    
    const completeResponses = data.responses.filter(r => r._metadata?.completion_rate === 100).length
    const partialResponses = data.responses.filter(r => 
      r._metadata?.completion_rate > 0 && r._metadata?.completion_rate < 100
    ).length
    const emptyResponses = data.responses.filter(r => r._metadata?.completion_rate === 0).length
    
    const quality = [
      { Indicateur: 'Réponses Complètes', Nombre: completeResponses, Pourcentage: `${(completeResponses / data.responses.length * 100).toFixed(1)}%` },
      { Indicateur: 'Réponses Partielles', Nombre: partialResponses, Pourcentage: `${(partialResponses / data.responses.length * 100).toFixed(1)}%` },
      { Indicateur: 'Réponses Vides', Nombre: emptyResponses, Pourcentage: `${(emptyResponses / data.responses.length * 100).toFixed(1)}%` }
    ]
    
    return { overall, questions, quality }
  }

  /**
   * Prépare les données pour les tableaux croisés
   * @param {Object} data - Données du rapport
   * @returns {Object} Données pivot
   */
  preparePivotData(data) {
    const pivotData = {}
    
    data.selectedQuestions.forEach(questionId => {
      const question = data.questionnaire.questions[questionId]
      if (['single_choice', 'multiple_choice'].includes(question.type)) {
        const stats = this.calculateQuestionStatistics(question, data.responses)
        
        pivotData[questionId] = stats.distribution?.map(item => ({
          'Option': item.label,
          'Code': item.code,
          'Nombre': item.count,
          'Pourcentage': `${item.percentage.toFixed(1)}%`
        })) || []
      }
    })
    
    return pivotData
  }

  /**
   * Prépare les métadonnées
   * @param {Object} data - Données du rapport
   * @returns {Array} Métadonnées
   */
  prepareMetadata(data) {
    return [
      { Propriété: 'Titre', Valeur: data.settings.title },
      { Propriété: 'Auteur', Valeur: data.settings.author || '' },
      { Propriété: 'Description', Valeur: data.settings.description || '' },
      { Propriété: 'Date Export', Valeur: new Date().toISOString() },
      { Propriété: 'Version Questionnaire', Valeur: data.questionnaire.metadata?.version || '' },
      { Propriété: 'Langue', Valeur: data.questionnaire.metadata?.language || 'fr' },
      { Propriété: 'Total Questions Questionnaire', Valeur: Object.keys(data.questionnaire.questions).length },
      { Propriété: 'Questions Exportées', Valeur: data.selectedQuestions.length },
      { Propriété: 'Total Réponses', Valeur: data.responses.length },
      { Propriété: 'Données Traitées', Valeur: data.options.includeProcessedData ? 'Oui' : 'Non' },
      { Propriété: 'Statistiques', Valeur: data.options.includeStatistics ? 'Oui' : 'Non' },
      { Propriété: 'Tableaux Croisés', Valeur: data.options.includePivotTables ? 'Oui' : 'Non' }
    ]
  }

  /**
   * Ajoute un tableau de statistiques à une feuille
   * @param {Object} worksheet - Feuille de calcul
   * @param {string} title - Titre du tableau
   * @param {Array} data - Données du tableau
   * @param {number} startRow - Ligne de début
   * @returns {number} Nouvelle ligne courante
   */
  addStatisticsTable(worksheet, title, data, startRow) {
    // Add title
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: `A${startRow + 1}` })
    
    // Add data
    if (data.length > 0) {
      const headers = Object.keys(data[0])
      const tableData = [headers, ...data.map(row => headers.map(header => row[header]))]
      
      XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: `A${startRow + 2}` })
      
      return startRow + tableData.length + 1
    }
    
    return startRow + 2
  }

  /**
   * Ajoute un tableau croisé dynamique
   * @param {Object} worksheet - Feuille de calcul
   * @param {Object} question - Question
   * @param {Array} data - Données pivot
   * @param {number} startRow - Ligne de début
   * @returns {number} Nouvelle ligne courante
   */
  addPivotTable(worksheet, question, data, startRow) {
    // Add question title
    const title = `${question.label} (${question.id})`
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: `A${startRow + 1}` })
    
    // Add pivot data
    if (data && data.length > 0) {
      const headers = Object.keys(data[0])
      const tableData = [headers, ...data.map(row => headers.map(header => row[header]))]
      
      XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: `A${startRow + 2}` })
      
      return startRow + tableData.length + 2
    }
    
    return startRow + 3
  }

  /**
   * Formate une feuille de données
   * @param {Object} worksheet - Feuille de calcul
   * @param {Array} data - Données
   */
  formatDataSheet(worksheet, data) {
    if (!data || data.length === 0) return
    
    // Auto-size columns
    const columnWidths = []
    const headers = Object.keys(data[0])
    
    headers.forEach((header, index) => {
      let maxWidth = header.length
      
      data.forEach(row => {
        const cellValue = row[header]?.toString() || ''
        maxWidth = Math.max(maxWidth, cellValue.length)
      })
      
      columnWidths[index] = { wch: Math.min(maxWidth + 2, 50) }
    })
    
    worksheet['!cols'] = columnWidths
    
    // Freeze first row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 }
  }

  /**
   * Utilitaires
   */
  
  sanitizeColumnName(name) {
    return name
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_')     // Replace spaces with underscores
      .substring(0, 30)         // Limit length
  }

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
    }
    
    return stats
  }

  generateFilename(title) {
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${cleanTitle}_${timestamp}.xlsx`
  }
}
