/**
 * Parseur de questionnaires - Analyse et extrait la structure complète
 * des questionnaires en format JSON/JS
 */

export class QuestionnaireParser {
  constructor() {
    this.questionnaire = null
    this.structure = {
      questions: {},
      routing: {},
      conventions: {},
      metadata: {}
    }
  }

  /**
   * Parse un fichier de questionnaire
   * @param {string|Object} input - Contenu du fichier ou objet déjà parsé
   * @returns {Object} Structure du questionnaire
   */
  async parse(input) {
    try {
      // Si c'est une string, essayer de la parser comme JSON ou JS
      if (typeof input === 'string') {
        // D'abord essayer JSON direct
        try {
          this.questionnaire = JSON.parse(input)
        } catch (jsonError) {
          // Si JSON échoue, traiter comme JavaScript avec évaluation sécurisée
          console.log('Tentative de parsing JavaScript...')
          this.questionnaire = this.parseJavaScriptSafely(input)
        }
      } else {
        this.questionnaire = input
      }

      // Extraire la structure
      await this.extractStructure()
      
      return this.structure
    } catch (error) {
      console.error('Erreur lors du parsing du questionnaire:', error)
      throw new Error(`Impossible de parser le questionnaire: ${error.message}`)
    }
  }



  /**
   * Parse un fichier JavaScript de manière sécurisée
   * @param {string} input - Contenu JavaScript
   * @returns {Object} Objet parsé
   */
  parseJavaScriptSafely(input) {
    try {
      // Nouvelle approche : évaluation sécurisée du JavaScript
      return this.evaluateJavaScriptSafely(input)
    } catch (error) {
      console.error('Erreur parsing JavaScript sécurisé:', error)
      throw new Error(`Erreur lors du parsing JavaScript: ${error.message}`)
    }
  }

  /**
   * Évalue le JavaScript de manière sécurisée en créant un environnement contrôlé
   * @param {string} input - Code JavaScript
   * @returns {Object} Résultat de l'évaluation
   */
  evaluateJavaScriptSafely(input) {
    console.log('🔍 Début du parsing JavaScript...')
    
    // Nettoyer le code JavaScript
    let jsCode = input.trim()
    
    // Supprimer les commentaires multi-lignes d'abord
    jsCode = jsCode.replace(/\/\*[\s\S]*?\*\//g, '')
    
    // Supprimer les commentaires de ligne
    jsCode = jsCode.replace(/\/\/.*$/gm, '')
    
    // Supprimer les imports/exports
    jsCode = jsCode.replace(/^import\s+.*$/gm, '')
    jsCode = jsCode.replace(/^export\s+(const|let|var|default\s+)/gm, '$1')
    jsCode = jsCode.replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
    
    console.log('📝 Code nettoyé:', jsCode.substring(0, 200) + '...')
    
    // Essayer plusieurs patterns pour extraire le tableau
    let arrayString = null
    let variableName = null
    
    // Pattern 1: Chercher spécifiquement templateSurveyQuestions ou similaire (PRIORITÉ)
    // Utiliser une approche robuste pour extraire le tableau complet
    const variableMatch = jsCode.match(/(?:const|let|var)\s+(.*Survey.*|.*Questions.*|.*Template.*)\s*=\s*\[/im)
    if (variableMatch) {
      variableName = variableMatch[1].trim()
      const startIndex = jsCode.indexOf('[', variableMatch.index)
      
      // Compter les crochets pour trouver la fin du tableau
      let bracketCount = 0
      let arrayEnd = -1
      
      for (let i = startIndex; i < jsCode.length; i++) {
        if (jsCode[i] === '[') bracketCount++
        if (jsCode[i] === ']') {
          bracketCount--
          if (bracketCount === 0) {
            arrayEnd = i
            break
          }
        }
      }
      
      if (arrayEnd !== -1) {
        arrayString = jsCode.substring(startIndex, arrayEnd + 1)
      }
    }
    
    // Pattern 2: export const variable = [...] (fallback)
    let arrayMatch = null
    if (!arrayString) {
      arrayMatch = jsCode.match(/(?:const|let|var)\s+(\w+)\s*=\s*(\[[\s\S]*?\]);?\s*(?=\n|$)/m)
    }
    
    if (!arrayMatch && !arrayString) {
      // Pattern 3: Chercher un tableau qui s'étend sur plusieurs lignes
      arrayMatch = jsCode.match(/(?:const|let|var)\s+(\w+)\s*=\s*(\[[\s\S]*?\n\s*\];?)/m)
    }
    
    if (!arrayMatch && !arrayString) {
      // Pattern 4: Chercher le plus grand tableau dans le fichier
      const allArrays = jsCode.match(/\[[\s\S]*?\]/g)
      if (allArrays && allArrays.length > 0) {
        // Prendre le plus grand tableau (probablement celui des questions)
        arrayString = allArrays.reduce((longest, current) => 
          current.length > longest.length ? current : longest
        )
        variableName = 'questions'
      }
    }
    
    if (!arrayMatch && !arrayString) {
      // Pattern 5: Chercher n'importe quel tableau avec au moins un objet
      const anyArrayMatch = jsCode.match(/(\[[^[\]]*\{[\s\S]*?\}[\s\S]*?\])/m)
      if (anyArrayMatch) {
        arrayString = anyArrayMatch[1]
        variableName = 'questions'
      }
    }
    
    if (arrayMatch) {
      arrayString = arrayMatch[2]
      variableName = arrayMatch[1]
    }
    
    if (!arrayString) {
      console.error('❌ Aucun tableau trouvé dans le code JavaScript')
      throw new Error('Impossible de trouver un tableau de questions dans le fichier JavaScript')
    }
    
    console.log(`✅ Tableau trouvé: ${variableName || 'anonymous'} (${arrayString.length} caractères)`)
    
    // Nettoyer le tableau extrait
    arrayString = arrayString.trim()
    if (arrayString.endsWith(';')) {
      arrayString = arrayString.slice(0, -1)
    }
    
    // Créer une fonction qui retourne le tableau
    const functionCode = `
      try {
        const result = ${arrayString};
        return Array.isArray(result) ? result : null;
      } catch (e) {
        console.error('Erreur parsing:', e);
        return null;
      }
    `
    
    try {
      console.log('🚀 Évaluation du code JavaScript...')
      // Utiliser Function constructor pour évaluer de manière sécurisée
      const func = new Function(functionCode)
      const questionsArray = func()
      
      if (Array.isArray(questionsArray) && questionsArray.length > 0) {
        console.log(`✅ Tableau parsé avec succès: ${questionsArray.length} questions`)
        return this.convertArrayToQuestionnaire(questionsArray)
      } else {
        console.log('⚠️ Le résultat n\'est pas un tableau valide, essai de parsing manuel...')
        throw new Error('Le résultat n\'est pas un tableau valide')
      }
    } catch (evalError) {
      console.error('❌ Erreur lors de l\'évaluation:', evalError)
      console.log('🔄 Tentative de parsing manuel...')
      // Fallback : essayer le parsing manuel
      return this.parseArrayManually(arrayString)
    }
  }

  /**
   * Parse un tableau de questions manuellement en cas d'échec de l'évaluation
   * @param {string} arrayString - String représentant le tableau
   * @returns {Object} Questionnaire parsé
   */
  parseArrayManually(arrayString) {
    console.log('🔧 Début du parsing manuel...')
    const questions = []
    
    try {
      // Nettoyer d'abord la chaîne
      let cleanArray = arrayString.trim()
      
      // Supprimer les crochets externes
      if (cleanArray.startsWith('[')) cleanArray = cleanArray.substring(1)
      if (cleanArray.endsWith(']')) cleanArray = cleanArray.substring(0, cleanArray.length - 1)
      
      // Extraire les objets de manière plus robuste
      const objects = this.extractObjectsFromString(cleanArray)
      
      if (objects.length === 0) {
        throw new Error('Aucun objet trouvé dans le tableau')
      }
      
      console.log(`🔍 ${objects.length} objets trouvés`)
      
      objects.forEach((objStr, index) => {
        try {
          const questionObj = this.parseQuestionObject(objStr, index)
          if (questionObj) {
            questions.push(questionObj)
          }
        } catch (objError) {
          console.warn(`⚠️ Impossible de parser l'objet ${index + 1}:`, objError.message)
          // Continuer avec les autres objets
        }
      })
    } catch (error) {
      console.error('❌ Erreur parsing manuel:', error)
      throw new Error(`Parsing manuel échoué: ${error.message}`)
    }
    
    if (questions.length === 0) {
      throw new Error('Aucune question valide trouvée dans le fichier')
    }
    
    console.log(`✅ Parsing manuel réussi: ${questions.length} questions extraites`)
    return this.convertArrayToQuestionnaire(questions)
  }

  /**
   * Extrait les objets d'une chaîne de manière robuste
   * @param {string} str - Chaîne contenant les objets
   * @returns {Array} Tableau des chaînes d'objets
   */
  extractObjectsFromString(str) {
    const objects = []
    let braceCount = 0
    let currentObject = ''
    let inString = false
    let stringChar = null
    let escaped = false
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      const prevChar = i > 0 ? str[i - 1] : null
      
      // Gérer les chaînes de caractères
      if (!escaped && (char === '"' || char === "'")) {
        if (!inString) {
          inString = true
          stringChar = char
        } else if (char === stringChar) {
          inString = false
          stringChar = null
        }
      }
      
      escaped = !escaped && char === '\\'
      
      if (!inString) {
        if (char === '{') {
          if (braceCount === 0) {
            currentObject = ''
          }
          braceCount++
        }
        
        if (braceCount > 0) {
          currentObject += char
        }
        
        if (char === '}') {
          braceCount--
          if (braceCount === 0 && currentObject.trim()) {
            objects.push(currentObject.trim())
            currentObject = ''
          }
        }
      } else if (braceCount > 0) {
        currentObject += char
      }
    }
    
    return objects
  }

  /**
   * Parse un objet question individuel
   * @param {string} objStr - Chaîne de l'objet
   * @param {number} index - Index de l'objet
   * @returns {Object} Objet question parsé
   */
  parseQuestionObject(objStr, index) {
    // Essayer d'abord avec eval (plus robuste pour les objets JS complexes)
    try {
      const func = new Function(`return (${objStr})`)
      const obj = func()
      
      // Ajouter un ID par défaut si manquant
      if (!obj.id) {
        obj.id = `Q${index + 1}`
      }
      
      return obj
    } catch (evalError) {
      console.log(`⚠️ Eval échoué pour l'objet ${index + 1}, essai JSON...`)
      
      // Fallback: essayer de convertir en JSON valide
      try {
        let jsonStr = objStr
        
        // Convertir les guillemets simples en doubles
        jsonStr = jsonStr.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
        
        // Ajouter des guillemets aux clés non quotées
        jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
        
        // Gérer les valeurs non quotées (sauf true, false, null, numbers)
        jsonStr = jsonStr.replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, (match, value, end) => {
          if (['true', 'false', 'null'].includes(value) || /^\d+$/.test(value)) {
            return `: ${value}${end}`
          }
          return `: "${value}"${end}`
        })
        
        const obj = JSON.parse(jsonStr)
        
        if (!obj.id) {
          obj.id = `Q${index + 1}`
        }
        
        return obj
      } catch (jsonError) {
        console.error(`❌ JSON parsing échoué pour l'objet ${index + 1}:`, jsonError.message)
        throw new Error(`Impossible de parser l'objet: ${evalError.message} / ${jsonError.message}`)
      }
    }
  }

  /**
   * Convertit un tableau de questions en format questionnaire standard
   * @param {Array} questionsArray - Tableau de questions
   * @returns {Object} Questionnaire formaté
   */
  convertArrayToQuestionnaire(questionsArray) {
    const questionnaire = {
      title: "Questionnaire importé",
      description: "Questionnaire importé depuis un fichier JavaScript",
      version: "1.0",
      language: "fr",
      questions: {},
      routing: {
        branching: {},
        global_conditions: [],
        skip_logic: {},
        end_conditions: []
      }
    }
    
    questionsArray.forEach(question => {
      if (question.id) {
        // Convertir la question au format standard
        const standardQuestion = {
          id: question.id,
          label: question.text || question.label || `Question ${question.id}`,
          type: this.convertQuestionType(question.type),
          required: question.required || false,
          options: {},
          conditions: [],
          metadata: {
            order: questionsArray.indexOf(question),
            section: this.getQuestionSection(question.id),
            tags: []
          }
        }
        
        // Convertir les options si elles existent
        if (question.options && Array.isArray(question.options)) {
          question.options.forEach(option => {
            standardQuestion.options[option.id] = option.text
            
            // Gérer le routage avec 'next'
            if (option.next && option.next !== 'end') {
              if (!questionnaire.routing.branching[question.id]) {
                questionnaire.routing.branching[question.id] = []
              }
              questionnaire.routing.branching[question.id].push({
                type: 'show_if',
                question: question.id,
                operator: '==',
                value: option.id,
                action: 'goto',
                target: option.next
              })
            }
          })
        }
        
        // Gérer les types spéciaux
        if (question.type === 'freeText') {
          standardQuestion.type = 'text'
          standardQuestion.format = 'open_text'
        } else if (question.type === 'commune') {
          standardQuestion.type = 'text'
          standardQuestion.format = 'location'
        } else if (question.type === 'street') {
          standardQuestion.type = 'text'
          standardQuestion.format = 'location'
        } else if (question.type === 'gare') {
          standardQuestion.type = 'text'
          standardQuestion.format = 'transport'
        }
        
        questionnaire.questions[question.id] = standardQuestion
      }
    })
    
    return questionnaire
  }

  /**
   * Convertit le type de question vers le format standard
   * @param {string} type - Type original
   * @returns {string} Type standard
   */
  convertQuestionType(type) {
    const typeMap = {
      'singleChoice': 'single_choice',
      'multipleChoice': 'multiple_choice',
      'freeText': 'text',
      'commune': 'text',
      'street': 'text',
      'gare': 'text',
      'numeric': 'numeric',
      'date': 'date',
      'email': 'email'
    }
    
    return typeMap[type] || type
  }

  /**
   * Détermine la section d'une question basée sur son ID
   * @param {string} questionId - ID de la question
   * @returns {string} Section
   */
  getQuestionSection(questionId) {
    if (questionId.includes('MONTANTS')) return 'montants'
    if (questionId.includes('ACCOMPAGNATEURS')) return 'accompagnateurs'
    if (questionId.startsWith('Q1')) return 'initial'
    return 'default'
  }

  /**
   * Extrait la structure complète du questionnaire
   */
  async extractStructure() {
    // Si this.questionnaire est déjà un questionnaire converti (par convertArrayToQuestionnaire)
    if (this.questionnaire && this.questionnaire.questions && this.questionnaire.title) {
      console.log('📋 Questionnaire déjà converti, copie directe de la structure')
      this.structure = {
        questions: this.questionnaire.questions,
        routing: this.questionnaire.routing || {},
        conventions: this.questionnaire.conventions || {},
        metadata: {
          title: this.questionnaire.title,
          description: this.questionnaire.description || '',
          version: this.questionnaire.version || '1.0',
          created_at: new Date().toISOString(),
          language: this.questionnaire.language || 'fr',
          total_questions: Object.keys(this.questionnaire.questions).length,
          estimated_duration: null
        }
      }
    } else {
      // Extraction classique pour les autres formats
      this.extractMetadata()
      this.extractQuestions()
      this.extractRouting()
      this.extractConventions()
    }
    
    this.validateStructure()
  }

  /**
   * Extrait les métadonnées du questionnaire
   */
  extractMetadata() {
    this.structure.metadata = {
      title: this.questionnaire.title || 'Questionnaire sans titre',
      description: this.questionnaire.description || '',
      version: this.questionnaire.version || '1.0',
      created_at: this.questionnaire.created_at || new Date().toISOString(),
      language: this.questionnaire.language || 'fr',
      total_questions: 0,
      estimated_duration: this.questionnaire.estimated_duration || null
    }
  }

  /**
   * Extrait et analyse toutes les questions
   */
  extractQuestions() {
    const questions = this.questionnaire.questions || this.questionnaire.items || {}
    
    Object.entries(questions).forEach(([id, questionData]) => {
      this.structure.questions[id] = this.parseQuestion(id, questionData)
    })
    
    this.structure.metadata.total_questions = Object.keys(this.structure.questions).length
  }

  /**
   * Parse une question individuelle
   * @param {string} id - ID de la question
   * @param {Object} data - Données de la question
   * @returns {Object} Question parsée
   */
  parseQuestion(id, data) {
    const question = {
      id,
      label: data.label || data.text || data.question || `Question ${id}`,
      type: this.determineQuestionType(data),
      required: data.required || false,
      options: {},
      conditions: [],
      metadata: {
        order: data.order || 0,
        section: data.section || 'default',
        tags: data.tags || []
      }
    }

    // Extraire les options si c'est une question à choix
    if (data.options || data.choices || data.answers) {
      question.options = this.parseOptions(data.options || data.choices || data.answers)
    }

    // Extraire les conditions et la logique de routage
    if (data.conditions || data.logic || data.routing) {
      question.conditions = this.parseConditions(data.conditions || data.logic || data.routing)
    }

    // Extraire les validations
    if (data.validation || data.rules) {
      question.validation = this.parseValidation(data.validation || data.rules)
    }

    // Gestion des champs spéciaux (montants, accompagnateurs, etc.)
    if (id.includes('_MONTANTS') || id.includes('_MONTANT')) {
      question.type = 'numeric'
      question.format = 'currency'
    } else if (id.includes('_ACCOMPAGNATEURS') || id.includes('_ACCOMPAGNATEUR')) {
      question.type = 'numeric'
      question.format = 'count'
    } else if (id.includes('_AUTRE') || id.includes('_OTHER')) {
      question.type = 'text'
      question.format = 'open_text'
    } else if (id.includes('_COMMUNE') || id.includes('_VILLE')) {
      question.type = 'text'
      question.format = 'location'
    } else if (id.includes('_GARE') || id.includes('_STATION')) {
      question.type = 'text'
      question.format = 'transport'
    }

    return question
  }

  /**
   * Détermine le type d'une question
   * @param {Object} data - Données de la question
   * @returns {string} Type de la question
   */
  determineQuestionType(data) {
    // Types explicites
    if (data.type) {
      const typeMap = {
        'radio': 'single_choice',
        'checkbox': 'multiple_choice',
        'select': 'single_choice',
        'multiselect': 'multiple_choice',
        'text': 'text',
        'textarea': 'text',
        'number': 'numeric',
        'date': 'date',
        'time': 'time',
        'email': 'email',
        'url': 'url'
      }
      return typeMap[data.type] || data.type
    }

    // Déduction basée sur les propriétés
    if (data.options || data.choices || data.answers) {
      if (data.multiple || data.multiselect) {
        return 'multiple_choice'
      }
      return 'single_choice'
    }

    if (data.min !== undefined || data.max !== undefined || data.step !== undefined) {
      return 'numeric'
    }

    if (data.maxLength && data.maxLength > 100) {
      return 'text'
    }

    // Par défaut
    return 'text'
  }

  /**
   * Parse les options d'une question à choix
   * @param {Object|Array} options - Options de la question
   * @returns {Object} Options parsées
   */
  parseOptions(options) {
    const parsed = {}

    if (Array.isArray(options)) {
      options.forEach((option, index) => {
        if (typeof option === 'string') {
          parsed[index + 1] = option
        } else if (typeof option === 'object') {
          const value = option.value || option.id || (index + 1)
          const label = option.label || option.text || option.title || option.value
          parsed[value] = label
        }
      })
    } else if (typeof options === 'object') {
      Object.entries(options).forEach(([key, value]) => {
        parsed[key] = typeof value === 'object' ? value.label || value.text || value : value
      })
    }

    return parsed
  }

  /**
   * Parse les conditions et la logique de routage
   * @param {Object|Array} conditions - Conditions de la question
   * @returns {Array} Conditions parsées
   */
  parseConditions(conditions) {
    if (!conditions) return []

    const parsed = []

    if (Array.isArray(conditions)) {
      conditions.forEach(condition => {
        parsed.push(this.parseCondition(condition))
      })
    } else if (typeof conditions === 'object') {
      Object.entries(conditions).forEach(([key, value]) => {
        parsed.push(this.parseCondition({ [key]: value }))
      })
    }

    return parsed
  }

  /**
   * Parse une condition individuelle
   * @param {Object} condition - Condition à parser
   * @returns {Object} Condition parsée
   */
  parseCondition(condition) {
    return {
      type: condition.type || 'show_if',
      question: condition.question || condition.if || condition.when,
      operator: condition.operator || condition.op || '==',
      value: condition.value || condition.equals || condition.is,
      action: condition.action || condition.then || 'show',
      target: condition.target || condition.goto || condition.next
    }
  }

  /**
   * Parse les règles de validation
   * @param {Object} validation - Règles de validation
   * @returns {Object} Validation parsée
   */
  parseValidation(validation) {
    return {
      required: validation.required || false,
      min: validation.min || validation.minValue || validation.minimum,
      max: validation.max || validation.maxValue || validation.maximum,
      minLength: validation.minLength || validation.min_length,
      maxLength: validation.maxLength || validation.max_length,
      pattern: validation.pattern || validation.regex,
      custom: validation.custom || validation.validator
    }
  }

  /**
   * Extrait la logique de routage globale
   */
  extractRouting() {
    const routing = this.questionnaire.routing || this.questionnaire.logic || {}
    
    this.structure.routing = {
      global_conditions: routing.global_conditions || [],
      branching: routing.branching || {},
      skip_logic: routing.skip_logic || {},
      end_conditions: routing.end_conditions || []
    }

    // Analyser les conditions dans les questions pour construire le routage
    Object.values(this.structure.questions).forEach(question => {
      if (question.conditions && question.conditions.length > 0) {
        question.conditions.forEach(condition => {
          if (condition.action === 'goto' || condition.action === 'skip') {
            if (!this.structure.routing.branching[question.id]) {
              this.structure.routing.branching[question.id] = []
            }
            this.structure.routing.branching[question.id].push(condition)
          }
        })
      }
    })
  }

  /**
   * Extrait les conventions de nommage
   */
  extractConventions() {
    const conventions = {
      prefixes: new Set(),
      suffixes: new Set(),
      patterns: {},
      special_fields: {}
    }

    Object.keys(this.structure.questions).forEach(id => {
      // Extraire les préfixes (avant le premier _)
      const parts = id.split('_')
      if (parts.length > 1) {
        conventions.prefixes.add(parts[0])
        
        // Extraire les suffixes spéciaux
        const suffix = parts[parts.length - 1]
        if (['MONTANTS', 'ACCOMPAGNATEURS', 'AUTRE', 'COMMUNE', 'GARE'].includes(suffix)) {
          conventions.suffixes.add(suffix)
          if (!conventions.special_fields[suffix]) {
            conventions.special_fields[suffix] = []
          }
          conventions.special_fields[suffix].push(id)
        }
      }

      // Identifier les patterns courants
      if (id.match(/^Q\d+/)) {
        conventions.patterns.question_numbering = 'Q{number}'
      }
      if (id.match(/\d+[A-Z]$/)) {
        conventions.patterns.sub_questions = '{base}{letter}'
      }
    })

    this.structure.conventions = {
      prefixes: Array.from(conventions.prefixes),
      suffixes: Array.from(conventions.suffixes),
      patterns: conventions.patterns,
      special_fields: conventions.special_fields
    }
  }

  /**
   * Valide la structure extraite
   */
  validateStructure() {
    const errors = []
    const warnings = []

    // Vérifier que nous avons au moins une question
    if (Object.keys(this.structure.questions).length === 0) {
      errors.push('Aucune question trouvée dans le questionnaire')
    }

    // Vérifier la cohérence des références de routage
    Object.values(this.structure.questions).forEach(question => {
      question.conditions.forEach(condition => {
        if (condition.question && !this.structure.questions[condition.question]) {
          warnings.push(`Question référencée introuvable: ${condition.question} dans ${question.id}`)
        }
        if (condition.target && !this.structure.questions[condition.target]) {
          warnings.push(`Cible de routage introuvable: ${condition.target} dans ${question.id}`)
        }
      })
    })

    // Vérifier les options des questions à choix
    Object.values(this.structure.questions).forEach(question => {
      if (['single_choice', 'multiple_choice'].includes(question.type)) {
        if (Object.keys(question.options).length === 0) {
          warnings.push(`Question à choix sans options: ${question.id}`)
        }
      }
    })

    this.structure.validation = {
      valid: errors.length === 0,
      errors,
      warnings
    }

    if (errors.length > 0) {
      console.error('Erreurs de validation:', errors)
    }
    if (warnings.length > 0) {
      console.warn('Avertissements de validation:', warnings)
    }
  }

  /**
   * Retourne un résumé de la structure
   * @returns {Object} Résumé
   */
  getSummary() {
    const questionTypes = {}
    
    // Vérification de sécurité
    if (!this.structure || !this.structure.questions) {
      return {
        metadata: { title: 'Questionnaire vide', total_questions: 0 },
        statistics: {
          total_questions: 0,
          question_types: {},
          has_routing: false,
          special_fields: 0,
          validation_status: null
        }
      }
    }
    
    Object.values(this.structure.questions).forEach(question => {
      if (question && question.type) {
        questionTypes[question.type] = (questionTypes[question.type] || 0) + 1
      }
    })

    return {
      metadata: this.structure.metadata || { title: 'Questionnaire importé', total_questions: 0 },
      statistics: {
        total_questions: Object.keys(this.structure.questions).length,
        question_types: questionTypes,
        has_routing: this.structure.routing && this.structure.routing.branching 
          ? Object.keys(this.structure.routing.branching).length > 0 
          : false,
        special_fields: this.structure.conventions && this.structure.conventions.special_fields
          ? Object.keys(this.structure.conventions.special_fields).length
          : 0,
        validation_status: this.structure.validation || null
      }
    }
  }

  /**
   * Exporte la structure dans différents formats
   * @param {string} format - Format d'export ('json', 'summary', 'mapping')
   * @returns {Object|string} Structure exportée
   */
  export(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.structure, null, 2)
      case 'summary':
        return this.getSummary()
      case 'mapping':
        return this.generateMapping()
      default:
        return this.structure
    }
  }

  /**
   * Génère un mapping pour les réponses Excel
   * @returns {Object} Mapping des colonnes
   */
  generateMapping() {
    const mapping = {}
    
    Object.entries(this.structure.questions).forEach(([id, question]) => {
      mapping[id] = {
        column: id,
        label: question.label,
        type: question.type,
        options: question.options,
        format: question.format || null
      }
    })
    
    return mapping
  }
}
