import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // État réactif
  const questionnaire = ref(null)
  const responses = ref(null)
  const processedData = ref(null)
  const isProcessing = ref(false)
  const currentStep = ref('upload') // upload, analysis, visualization, export
  const filters = ref({})
  const selectedQuestions = ref([])
  
  // Getters computés
  const hasData = computed(() => {
    return questionnaire.value && responses.value
  })
  
  const hasProcessedData = computed(() => {
    return processedData.value !== null
  })
  
  const totalResponses = computed(() => {
    return responses.value ? responses.value.length : 0
  })
  
  const questionsList = computed(() => {
    if (!questionnaire.value || !questionnaire.value.questions) return []
    return Object.keys(questionnaire.value.questions).map(id => ({
      id,
      ...questionnaire.value.questions[id]
    }))
  })
  
  const filteredResponses = computed(() => {
    if (!responses.value || !filters.value) return responses.value || []
    
    let filtered = [...responses.value]
    
    // Appliquer les filtres
    Object.entries(filters.value).forEach(([questionId, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        filtered = filtered.filter(response => {
          const responseValue = response[questionId]
          if (Array.isArray(filterValue)) {
            return filterValue.includes(responseValue)
          }
          return responseValue === filterValue
        })
      }
    })
    
    return filtered
  })
  
  // Actions
  const setQuestionnaire = (data) => {
    questionnaire.value = data
  }
  
  const setResponses = (data) => {
    responses.value = data
  }
  
  const setProcessedData = (data) => {
    processedData.value = data
  }
  
  const setProcessing = (status) => {
    isProcessing.value = status
  }
  
  const setCurrentStep = (step) => {
    currentStep.value = step
  }
  
  const addFilter = (questionId, value) => {
    filters.value[questionId] = value
  }
  
  const removeFilter = (questionId) => {
    delete filters.value[questionId]
  }
  
  const clearFilters = () => {
    filters.value = {}
  }
  
  const toggleQuestionSelection = (questionId) => {
    const index = selectedQuestions.value.indexOf(questionId)
    if (index > -1) {
      selectedQuestions.value.splice(index, 1)
    } else {
      selectedQuestions.value.push(questionId)
    }
  }
  
  const selectAllQuestions = () => {
    selectedQuestions.value = questionsList.value.map(q => q.id)
  }
  
  const clearQuestionSelection = () => {
    selectedQuestions.value = []
  }
  
  const resetStore = () => {
    questionnaire.value = null
    responses.value = null
    processedData.value = null
    isProcessing.value = false
    currentStep.value = 'upload'
    filters.value = {}
    selectedQuestions.value = []
  }
  
  const showNotification = (type, message) => {
    // Cette fonction sera interceptée par App.vue pour afficher les notifications
    return { type, message }
  }
  
  // Fonction pour calculer les statistiques d'une question
  const getQuestionStats = (questionId) => {
    if (!responses.value || !questionnaire.value) return null
    
    const question = questionnaire.value.questions[questionId]
    if (!question) return null
    
    const relevantResponses = filteredResponses.value
      .map(response => response[questionId])
      .filter(value => value !== undefined && value !== null && value !== '')
    
    const stats = {
      total: relevantResponses.length,
      missing: totalResponses.value - relevantResponses.length,
      completion_rate: totalResponses.value > 0 ? (relevantResponses.length / totalResponses.value) * 100 : 0
    }
    
    if (question.type === 'multiple_choice' || question.type === 'single_choice') {
      const counts = {}
      relevantResponses.forEach(value => {
        // Gérer les objets de réponses {code, label, raw}
        let key, label
        if (typeof value === 'object' && value.code !== undefined) {
          key = value.code
          label = value.label
        } else {
          key = value
          label = question.options[key] || `Option ${key}`
        }
        
        counts[key] = (counts[key] || 0) + 1
        if (!counts[`${key}_label`]) {
          counts[`${key}_label`] = label
        }
      })
      
      stats.distribution = Object.entries(counts)
        .filter(([key]) => !key.endsWith('_label'))
        .map(([value, count]) => ({
          value: parseInt(value),
          label: counts[`${value}_label`] || question.options[value] || `Option ${value}`,
          count,
          percentage: (count / relevantResponses.length) * 100
        }))
        .sort((a, b) => b.count - a.count)
    } else if (question.type === 'text' || question.type === 'open') {
      // Extraire le texte des objets de réponse si nécessaire
      const textResponses = relevantResponses.map(value => {
        if (typeof value === 'object') {
          return value.label || value.text || value.raw || String(value)
        }
        return String(value)
      })
      
      stats.responses = textResponses
      stats.unique_responses = [...new Set(textResponses)].length
      stats.avg_length = textResponses.reduce((sum, text) => sum + (text?.length || 0), 0) / textResponses.length
    } else if (question.type === 'numeric') {
      // Extraire les valeurs numériques des objets de réponse
      const numericValues = relevantResponses.map(value => {
        if (typeof value === 'object') {
          return parseFloat(value.value || value.code || value.raw)
        }
        return parseFloat(value)
      }).filter(v => !isNaN(v))
      
      if (numericValues.length > 0) {
        stats.min = Math.min(...numericValues)
        stats.max = Math.max(...numericValues)
        stats.mean = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length
        stats.median = numericValues.sort((a, b) => a - b)[Math.floor(numericValues.length / 2)]
      }
    }
    
    return stats
  }
  
  return {
    // État
    questionnaire,
    responses,
    processedData,
    isProcessing,
    currentStep,
    filters,
    selectedQuestions,
    
    // Getters
    hasData,
    hasProcessedData,
    totalResponses,
    questionsList,
    filteredResponses,
    
    // Actions
    setQuestionnaire,
    setResponses,
    setProcessedData,
    setProcessing,
    setCurrentStep,
    addFilter,
    removeFilter,
    clearFilters,
    toggleQuestionSelection,
    selectAllQuestions,
    clearQuestionSelection,
    resetStore,
    showNotification,
    getQuestionStats
  }
})
