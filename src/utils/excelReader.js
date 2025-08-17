/**
 * Lecteur et processeur de fichiers Excel pour les réponses de questionnaires
 * Fait le mapping entre les réponses brutes et les libellés humains
 */

import * as XLSX from 'xlsx'

export class ExcelReader {
  constructor(questionnaireStructure = null) {
    this.structure = questionnaireStructure
    this.rawData = null
    this.processedData = null
    this.mapping = {}
    this.errors = []
    this.warnings = []
  }

  /**
   * Lit un fichier Excel et extrait les données
   * @param {File|ArrayBuffer} file - Fichier Excel
   * @returns {Promise<Array>} Données brutes
   */
  async readFile(file) {
    try {
      let data

      if (file instanceof File) {
        data = await this.fileToArrayBuffer(file)
      } else {
        data = file
      }

      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      // Convertir en JSON avec les en-têtes comme clés
      this.rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Utiliser les numéros de ligne comme clés temporairement
        raw: false, // Convertir les dates et nombres en strings
        dateNF: 'dd/mm/yyyy' // Format de date français
      })

      // Traiter les en-têtes et les données
      if (this.rawData.length > 0) {
        const headers = this.rawData[0]
        const rows = this.rawData.slice(1)
        
        // Convertir en objets avec les en-têtes comme clés
        this.rawData = rows.map(row => {
          const obj = {}
          headers.forEach((header, index) => {
            if (header && header.trim()) {
              obj[header.trim()] = row[index] || null
            }
          })
          return obj
        }).filter(row => Object.values(row).some(value => value !== null && value !== ''))

        console.log(`Excel lu: ${this.rawData.length} réponses trouvées`)
        return this.rawData
      }

      throw new Error('Fichier Excel vide ou invalide')
    } catch (error) {
      console.error('Erreur lecture Excel:', error)
      throw new Error(`Impossible de lire le fichier Excel: ${error.message}`)
    }
  }

  /**
   * Convertit un File en ArrayBuffer
   * @param {File} file - Fichier à convertir
   * @returns {Promise<ArrayBuffer>} ArrayBuffer
   */
  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Mappe les réponses brutes avec la structure du questionnaire
   * @param {Object} questionnaireStructure - Structure du questionnaire
   * @returns {Array} Réponses mappées
   */
  mapResponses(questionnaireStructure = null) {
    if (questionnaireStructure) {
      this.structure = questionnaireStructure
    }

    if (!this.structure || !this.rawData) {
      throw new Error('Structure du questionnaire et données brutes requises')
    }

    this.processedData = []
    this.errors = []
    this.warnings = []

    // Créer le mapping des colonnes
    this.createColumnMapping()

    // Traiter chaque réponse
    this.rawData.forEach((response, index) => {
      try {
        const processed = this.processResponse(response, index)
        if (processed) {
          this.processedData.push(processed)
        }
      } catch (error) {
        this.errors.push({
          row: index + 2, // +2 car index 0 = ligne 2 (après en-têtes)
          error: error.message,
          data: response
        })
      }
    })

    console.log(`Traitement terminé: ${this.processedData.length} réponses valides, ${this.errors.length} erreurs`)
    
    return {
      data: this.processedData,
      errors: this.errors,
      warnings: this.warnings,
      mapping: this.mapping,
      statistics: this.generateStatistics()
    }
  }

  /**
   * Crée le mapping entre les colonnes Excel et les questions
   */
  createColumnMapping() {
    if (!this.rawData || this.rawData.length === 0) return

    const excelColumns = Object.keys(this.rawData[0])
    const questionIds = Object.keys(this.structure.questions)

    this.mapping = {
      direct: {}, // Correspondances exactes
      fuzzy: {}, // Correspondances approximatives
      unmapped_columns: [], // Colonnes Excel non mappées
      unmapped_questions: [] // Questions sans colonne correspondante
    }

    // Mapping direct (correspondance exacte)
    excelColumns.forEach(column => {
      const cleanColumn = this.cleanColumnName(column)
      if (questionIds.includes(cleanColumn)) {
        this.mapping.direct[column] = cleanColumn
      } else {
        // Chercher une correspondance approximative
        const fuzzyMatch = this.findFuzzyMatch(cleanColumn, questionIds)
        if (fuzzyMatch) {
          this.mapping.fuzzy[column] = fuzzyMatch
          this.warnings.push(`Correspondance approximative: "${column}" -> "${fuzzyMatch}"`)
        } else {
          this.mapping.unmapped_columns.push(column)
        }
      }
    })

    // Identifier les questions sans colonne correspondante
    questionIds.forEach(questionId => {
      const hasDirectMatch = Object.values(this.mapping.direct).includes(questionId)
      const hasFuzzyMatch = Object.values(this.mapping.fuzzy).includes(questionId)
      
      if (!hasDirectMatch && !hasFuzzyMatch) {
        this.mapping.unmapped_questions.push(questionId)
      }
    })

    console.log('Mapping créé:', this.mapping)
  }

  /**
   * Nettoie le nom d'une colonne pour le matching
   * @param {string} column - Nom de la colonne
   * @returns {string} Nom nettoyé
   */
  cleanColumnName(column) {
    return column
      .trim()
      .replace(/[^\w]/g, '_') // Remplacer les caractères spéciaux par _
      .replace(/_{2,}/g, '_') // Remplacer les _ multiples par un seul
      .replace(/^_|_$/g, '') // Supprimer les _ en début/fin
      .toUpperCase()
  }

  /**
   * Trouve une correspondance approximative pour une colonne
   * @param {string} column - Nom de la colonne
   * @param {Array} questionIds - IDs des questions
   * @returns {string|null} ID de la question correspondante
   */
  findFuzzyMatch(column, questionIds) {
    // Recherche par similarité de chaîne
    const similarities = questionIds.map(id => ({
      id,
      similarity: this.calculateSimilarity(column, id)
    }))

    const bestMatch = similarities
      .filter(item => item.similarity > 0.7) // Seuil de similarité
      .sort((a, b) => b.similarity - a.similarity)[0]

    return bestMatch ? bestMatch.id : null
  }

  /**
   * Calcule la similarité entre deux chaînes (algorithme de Levenshtein normalisé)
   * @param {string} a - Première chaîne
   * @param {string} b - Deuxième chaîne
   * @returns {number} Score de similarité (0-1)
   */
  calculateSimilarity(a, b) {
    const matrix = []
    const aLen = a.length
    const bLen = b.length

    for (let i = 0; i <= bLen; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= aLen; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= bLen; i++) {
      for (let j = 1; j <= aLen; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    const distance = matrix[bLen][aLen]
    const maxLen = Math.max(aLen, bLen)
    return maxLen === 0 ? 1 : (maxLen - distance) / maxLen
  }

  /**
   * Traite une réponse individuelle
   * @param {Object} response - Réponse brute
   * @param {number} index - Index de la réponse
   * @returns {Object} Réponse traitée
   */
  processResponse(response, index) {
    const processed = {
      _id: index,
      _original: { ...response },
      _metadata: {
        processed_at: new Date().toISOString(),
        has_errors: false,
        completion_rate: 0
      }
    }

    let answeredQuestions = 0
    let totalQuestions = Object.keys(this.structure.questions).length

    // Traiter chaque colonne mappée
    Object.entries(this.mapping.direct).forEach(([column, questionId]) => {
      const rawValue = response[column]
      const processedValue = this.processQuestionResponse(questionId, rawValue)
      
      if (processedValue !== null && processedValue !== undefined && processedValue !== '') {
        processed[questionId] = processedValue
        answeredQuestions++
      } else {
        processed[questionId] = null
      }
    })

    // Traiter les correspondances approximatives
    Object.entries(this.mapping.fuzzy).forEach(([column, questionId]) => {
      const rawValue = response[column]
      const processedValue = this.processQuestionResponse(questionId, rawValue)
      
      if (processedValue !== null && processedValue !== undefined && processedValue !== '') {
        processed[questionId] = processedValue
        answeredQuestions++
      } else {
        processed[questionId] = null
      }
    })

    // Calculer le taux de completion
    processed._metadata.completion_rate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

    // Valider la réponse
    const validation = this.validateResponse(processed)
    processed._metadata.has_errors = validation.errors.length > 0
    processed._metadata.validation = validation

    return processed
  }

  /**
   * Traite la réponse à une question spécifique
   * @param {string} questionId - ID de la question
   * @param {*} rawValue - Valeur brute
   * @returns {*} Valeur traitée
   */
  processQuestionResponse(questionId, rawValue) {
    const question = this.structure.questions[questionId]
    if (!question) return rawValue

    // Valeur vide ou nulle
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return null
    }

    try {
      switch (question.type) {
        case 'single_choice':
        case 'multiple_choice':
          return this.processChoiceResponse(question, rawValue)
        
        case 'numeric':
          return this.processNumericResponse(question, rawValue)
        
        case 'text':
        case 'open':
          return this.processTextResponse(question, rawValue)
        
        case 'date':
          return this.processDateResponse(question, rawValue)
        
        case 'email':
          return this.processEmailResponse(question, rawValue)
        
        default:
          return String(rawValue).trim()
      }
    } catch (error) {
      this.warnings.push({
        question: questionId,
        value: rawValue,
        error: error.message
      })
      return rawValue
    }
  }

  /**
   * Traite une réponse à choix multiple/unique
   */
  processChoiceResponse(question, rawValue) {
    const value = String(rawValue).trim()
    
    // Si c'est déjà un code numérique valide
    if (/^\d+$/.test(value) && question.options[value]) {
      return {
        code: parseInt(value),
        label: question.options[value],
        raw: rawValue
      }
    }

    // Chercher par libellé
    const optionEntry = Object.entries(question.options).find(([code, label]) => 
      label.toLowerCase() === value.toLowerCase()
    )

    if (optionEntry) {
      return {
        code: parseInt(optionEntry[0]),
        label: optionEntry[1],
        raw: rawValue
      }
    }

    // Si aucune correspondance, retourner la valeur brute avec un avertissement
    this.warnings.push({
      question: question.id,
      value: rawValue,
      message: `Option non reconnue: "${rawValue}"`
    })

    return {
      code: null,
      label: value,
      raw: rawValue,
      unknown: true
    }
  }

  /**
   * Traite une réponse numérique
   */
  processNumericResponse(question, rawValue) {
    const value = String(rawValue).replace(/[^\d.,+-]/g, '').replace(',', '.')
    const parsed = parseFloat(value)
    
    if (isNaN(parsed)) {
      throw new Error(`Valeur numérique invalide: ${rawValue}`)
    }

    return {
      value: parsed,
      formatted: question.format === 'currency' ? `${parsed.toFixed(2)} €` : 
                 question.format === 'count' ? `${parsed}` : 
                 parsed.toString(),
      raw: rawValue
    }
  }

  /**
   * Traite une réponse textuelle
   */
  processTextResponse(question, rawValue) {
    const text = String(rawValue).trim()
    
    return {
      text,
      length: text.length,
      words: text.split(/\s+/).length,
      raw: rawValue
    }
  }

  /**
   * Traite une réponse de date
   */
  processDateResponse(question, rawValue) {
    try {
      const date = new Date(rawValue)
      if (isNaN(date.getTime())) {
        throw new Error(`Date invalide: ${rawValue}`)
      }
      
      return {
        date: date.toISOString(),
        formatted: date.toLocaleDateString('fr-FR'),
        timestamp: date.getTime(),
        raw: rawValue
      }
    } catch (error) {
      throw new Error(`Erreur de parsing de date: ${rawValue}`)
    }
  }

  /**
   * Traite une réponse email
   */
  processEmailResponse(question, rawValue) {
    const email = String(rawValue).trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    return {
      email,
      valid: emailRegex.test(email),
      domain: email.split('@')[1] || null,
      raw: rawValue
    }
  }

  /**
   * Valide une réponse traitée
   * @param {Object} response - Réponse traitée
   * @returns {Object} Résultat de validation
   */
  validateResponse(response) {
    const errors = []
    const warnings = []

    Object.entries(this.structure.questions).forEach(([questionId, question]) => {
      const value = response[questionId]

      // Vérifier les champs requis
      if (question.required && (value === null || value === undefined)) {
        errors.push(`Question obligatoire non renseignée: ${questionId}`)
      }

      // Vérifier les validations spécifiques
      if (question.validation && value !== null) {
        const validation = question.validation
        
        if (validation.min !== undefined && value.value < validation.min) {
          errors.push(`Valeur trop petite pour ${questionId}: ${value.value} < ${validation.min}`)
        }
        
        if (validation.max !== undefined && value.value > validation.max) {
          errors.push(`Valeur trop grande pour ${questionId}: ${value.value} > ${validation.max}`)
        }

        if (validation.pattern && value.text && !new RegExp(validation.pattern).test(value.text)) {
          errors.push(`Format invalide pour ${questionId}: ${value.text}`)
        }
      }
    })

    return { errors, warnings }
  }

  /**
   * Génère des statistiques sur le traitement
   * @returns {Object} Statistiques
   */
  generateStatistics() {
    if (!this.processedData) return null

    const stats = {
      total_responses: this.processedData.length,
      avg_completion_rate: 0,
      question_stats: {},
      data_quality: {
        complete_responses: 0,
        partial_responses: 0,
        error_responses: 0
      }
    }

    // Calculer les statistiques par question
    Object.keys(this.structure.questions).forEach(questionId => {
      const values = this.processedData
        .map(response => response[questionId])
        .filter(value => value !== null && value !== undefined)

      stats.question_stats[questionId] = {
        response_count: values.length,
        response_rate: (values.length / this.processedData.length) * 100,
        missing_count: this.processedData.length - values.length
      }
    })

    // Calculer les statistiques globales
    let totalCompletionRate = 0
    this.processedData.forEach(response => {
      totalCompletionRate += response._metadata.completion_rate
      
      if (response._metadata.completion_rate === 100) {
        stats.data_quality.complete_responses++
      } else if (response._metadata.completion_rate > 0) {
        stats.data_quality.partial_responses++
      }
      
      if (response._metadata.has_errors) {
        stats.data_quality.error_responses++
      }
    })

    stats.avg_completion_rate = totalCompletionRate / this.processedData.length

    return stats
  }

  /**
   * Exporte les données traitées
   * @param {string} format - Format d'export
   * @returns {*} Données exportées
   */
  export(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.processedData, null, 2)
      case 'csv':
        return this.toCsv()
      case 'summary':
        return {
          data: this.processedData,
          mapping: this.mapping,
          statistics: this.generateStatistics(),
          errors: this.errors,
          warnings: this.warnings
        }
      default:
        return this.processedData
    }
  }

  /**
   * Convertit les données en CSV
   * @returns {string} Données CSV
   */
  toCsv() {
    if (!this.processedData || this.processedData.length === 0) return ''

    const headers = Object.keys(this.structure.questions)
    const csvRows = []

    // En-têtes
    csvRows.push(headers.join(','))

    // Données
    this.processedData.forEach(response => {
      const row = headers.map(questionId => {
        const value = response[questionId]
        if (value === null || value === undefined) return ''
        
        if (typeof value === 'object') {
          return value.label || value.text || value.formatted || value.value || ''
        }
        
        return String(value).replace(/,/g, ';') // Échapper les virgules
      })
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }
}
