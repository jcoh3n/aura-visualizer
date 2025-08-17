<template>
  <div v-if="!hasData" class="text-center py-12">
    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune donnée disponible</h3>
    <p class="mt-1 text-sm text-gray-500">Commencez par importer vos fichiers.</p>
    <div class="mt-6">
      <router-link to="/upload" class="btn-primary">
        Importer des fichiers
      </router-link>
    </div>
  </div>

  <div v-else class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Visualisations interactives</h1>
        <p class="mt-2 text-lg text-gray-600">
          Explorez vos données avec des graphiques dynamiques
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button @click="refreshCharts" class="btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
        <button @click="toggleFullscreen" class="btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Plein écran
        </button>
        <router-link to="/export" class="btn-primary">
          Exporter les graphiques
        </router-link>
      </div>
    </div>

    <!-- Dashboard Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total réponses</dt>
              <dd class="text-lg font-medium text-gray-900">{{ totalResponses }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Questions visualisées</dt>
              <dd class="text-lg font-medium text-gray-900">{{ selectedQuestions.length }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Filtres actifs</dt>
              <dd class="text-lg font-medium text-gray-900">{{ activeFiltersCount }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Taux completion</dt>
              <dd class="text-lg font-medium text-gray-900">{{ averageCompletionRate.toFixed(1) }}%</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Type Selector -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold text-gray-900">Sélection des graphiques</h2>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <button 
          v-for="chartType in availableChartTypes" 
          :key="chartType.id"
          @click="toggleChartType(chartType.id)"
          class="flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200"
          :class="selectedChartTypes.includes(chartType.id) 
            ? 'border-primary-500 bg-primary-50 text-primary-700' 
            : 'border-gray-200 hover:border-gray-300 text-gray-600'"
        >
          <component :is="chartType.icon" class="w-8 h-8 mb-2" />
          <span class="text-sm font-medium">{{ chartType.name }}</span>
          <span class="text-xs text-gray-500 mt-1">{{ chartType.description }}</span>
        </button>
      </div>
    </div>

    <!-- Question Selector -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold text-gray-900">Questions à visualiser</h2>
        <div class="flex space-x-2 mt-2">
          <button @click="selectAllQuestions" class="text-sm text-primary-600 hover:text-primary-800">
            Tout sélectionner
          </button>
          <button @click="clearQuestionSelection" class="text-sm text-gray-600 hover:text-gray-800">
            Tout désélectionner
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="question in questionsList" 
          :key="question.id"
          class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
        >
          <input 
            :id="`question-${question.id}`"
            type="checkbox"
            :checked="selectedQuestions.includes(question.id)"
            @change="toggleQuestionSelection(question.id)"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label 
            :for="`question-${question.id}`"
            class="flex-1 cursor-pointer"
          >
            <div class="text-sm font-medium text-gray-900">{{ question.label }}</div>
            <div class="text-xs text-gray-500">
              {{ question.type }} • {{ getQuestionStats(question.id)?.total || 0 }} réponses
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div v-if="selectedQuestions.length > 0" class="space-y-8">
      <!-- Bar Charts -->
      <div v-if="selectedChartTypes.includes('bar')" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Graphiques en barres</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="questionId in choiceQuestions" 
            :key="`bar-${questionId}`"
            class="chart-container"
          >
            <BarChart 
              :question="getQuestion(questionId)"
              :data="getQuestionStats(questionId)"
              :responses="filteredResponses"
            />
          </div>
        </div>
      </div>

      <!-- Pie Charts -->
      <div v-if="selectedChartTypes.includes('pie')" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Graphiques circulaires</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="questionId in choiceQuestions" 
            :key="`pie-${questionId}`"
            class="chart-container"
          >
            <PieChart 
              :question="getQuestion(questionId)"
              :data="getQuestionStats(questionId)"
              :responses="filteredResponses"
            />
          </div>
        </div>
      </div>

      <!-- Histograms -->
      <div v-if="selectedChartTypes.includes('histogram')" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Histogrammes</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="questionId in numericQuestions" 
            :key="`histogram-${questionId}`"
            class="chart-container"
          >
            <HistogramChart 
              :question="getQuestion(questionId)"
              :data="getQuestionStats(questionId)"
              :responses="filteredResponses"
            />
          </div>
        </div>
      </div>

      <!-- Word Clouds -->
      <div v-if="selectedChartTypes.includes('wordcloud')" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Nuages de mots</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="questionId in textQuestions" 
            :key="`wordcloud-${questionId}`"
            class="chart-container"
          >
            <WordCloudChart 
              :question="getQuestion(questionId)"
              :data="getQuestionStats(questionId)"
              :responses="filteredResponses"
            />
          </div>
        </div>
      </div>

      <!-- Comparison Charts -->
      <div v-if="selectedChartTypes.includes('comparison') && selectedQuestions.length > 1" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Comparaisons</h2>
        <div class="grid grid-cols-1 gap-6">
          <div class="chart-container">
            <ComparisonChart 
              :questions="selectedQuestions.map(id => getQuestion(id))"
              :data="selectedQuestions.map(id => getQuestionStats(id))"
              :responses="filteredResponses"
            />
          </div>
        </div>
      </div>

      <!-- Correlation Matrix -->
      <div v-if="selectedChartTypes.includes('correlation')" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Matrice de corrélation</h2>
        <div class="chart-container">
          <CorrelationMatrix 
            :questions="numericQuestions.map(id => getQuestion(id))"
            :responses="filteredResponses"
          />
        </div>
      </div>
    </div>

    <!-- No Selection State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune question sélectionnée</h3>
      <p class="mt-1 text-sm text-gray-500">
        Sélectionnez des questions et des types de graphiques pour commencer la visualisation.
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

// Import chart components (we'll create these)
import BarChart from '../components/charts/BarChart.vue'
import PieChart from '../components/charts/PieChart.vue'
import HistogramChart from '../components/charts/HistogramChart.vue'
import WordCloudChart from '../components/charts/WordCloudChart.vue'
import ComparisonChart from '../components/charts/ComparisonChart.vue'
import CorrelationMatrix from '../components/charts/CorrelationMatrix.vue'

export default {
  name: 'Visualization',
  components: {
    BarChart,
    PieChart,
    HistogramChart,
    WordCloudChart,
    ComparisonChart,
    CorrelationMatrix
  },
  setup() {
    const appStore = useAppStore()
    const selectedChartTypes = ref(['bar', 'pie'])
    
    // Computed properties
    const hasData = computed(() => appStore.hasData)
    const questionnaire = computed(() => appStore.questionnaire)
    const responses = computed(() => appStore.responses)
    const filteredResponses = computed(() => appStore.filteredResponses)
    const totalResponses = computed(() => appStore.totalResponses)
    const questionsList = computed(() => appStore.questionsList)
    const selectedQuestions = computed(() => appStore.selectedQuestions)
    const filters = computed(() => appStore.filters)
    
    const activeFiltersCount = computed(() => {
      return Object.keys(filters.value).length
    })
    
    const averageCompletionRate = computed(() => {
      if (!responses.value || responses.value.length === 0) return 0
      
      const total = responses.value.reduce((sum, response) => {
        return sum + (response._metadata?.completion_rate || 0)
      }, 0)
      
      return total / responses.value.length
    })
    
    const choiceQuestions = computed(() => {
      return selectedQuestions.value.filter(id => {
        const question = getQuestion(id)
        return question && ['single_choice', 'multiple_choice'].includes(question.type)
      })
    })
    
    const numericQuestions = computed(() => {
      return selectedQuestions.value.filter(id => {
        const question = getQuestion(id)
        return question && question.type === 'numeric'
      })
    })
    
    const textQuestions = computed(() => {
      return selectedQuestions.value.filter(id => {
        const question = getQuestion(id)
        return question && ['text', 'open'].includes(question.type)
      })
    })
    
    // Available chart types
    const availableChartTypes = ref([
      {
        id: 'bar',
        name: 'Barres',
        description: 'Questions à choix',
        icon: 'BarChartIcon'
      },
      {
        id: 'pie',
        name: 'Circulaire',
        description: 'Répartitions',
        icon: 'PieChartIcon'
      },
      {
        id: 'histogram',
        name: 'Histogramme',
        description: 'Valeurs numériques',
        icon: 'HistogramIcon'
      },
      {
        id: 'wordcloud',
        name: 'Nuage de mots',
        description: 'Texte libre',
        icon: 'CloudIcon'
      },
      {
        id: 'comparison',
        name: 'Comparaison',
        description: 'Multi-questions',
        icon: 'CompareIcon'
      },
      {
        id: 'correlation',
        name: 'Corrélation',
        description: 'Relations',
        icon: 'CorrelationIcon'
      }
    ])
    
    // Methods
    const getQuestion = (questionId) => {
      return questionsList.value.find(q => q.id === questionId)
    }
    
    const getQuestionStats = (questionId) => {
      return appStore.getQuestionStats(questionId)
    }
    
    const toggleChartType = (chartType) => {
      const index = selectedChartTypes.value.indexOf(chartType)
      if (index > -1) {
        selectedChartTypes.value.splice(index, 1)
      } else {
        selectedChartTypes.value.push(chartType)
      }
    }
    
    const toggleQuestionSelection = (questionId) => {
      appStore.toggleQuestionSelection(questionId)
    }
    
    const selectAllQuestions = () => {
      appStore.selectAllQuestions()
    }
    
    const clearQuestionSelection = () => {
      appStore.clearQuestionSelection()
    }
    
    const refreshCharts = () => {
      // Force refresh of all charts
      console.log('Refreshing charts...')
    }
    
    const toggleFullscreen = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen()
      }
    }
    
    onMounted(() => {
      appStore.setCurrentStep('visualization')
      
      // Auto-select some questions if none are selected
      if (selectedQuestions.value.length === 0 && questionsList.value.length > 0) {
        // Select first 3 questions by default
        questionsList.value.slice(0, 3).forEach(question => {
          appStore.toggleQuestionSelection(question.id)
        })
      }
    })
    
    return {
      hasData,
      questionnaire,
      responses,
      filteredResponses,
      totalResponses,
      questionsList,
      selectedQuestions,
      selectedChartTypes,
      activeFiltersCount,
      averageCompletionRate,
      choiceQuestions,
      numericQuestions,
      textQuestions,
      availableChartTypes,
      getQuestion,
      getQuestionStats,
      toggleChartType,
      toggleQuestionSelection,
      selectAllQuestions,
      clearQuestionSelection,
      refreshCharts,
      toggleFullscreen
    }
  }
}
</script>
