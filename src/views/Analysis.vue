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
        <h1 class="text-3xl font-bold text-gray-900">Analyse des données</h1>
        <p class="mt-2 text-lg text-gray-600">
          {{ questionnaire.metadata.title }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button @click="refreshAnalysis" class="btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
        <router-link to="/visualization" class="btn-primary">
          Voir les visualisations
        </router-link>
      </div>
    </div>

    <!-- Overview Stats -->
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
              <dt class="text-sm font-medium text-gray-500 truncate">Réponses totales</dt>
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
              <dt class="text-sm font-medium text-gray-500 truncate">Questions</dt>
              <dd class="text-lg font-medium text-gray-900">{{ questionsList.length }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    </div>

    <!-- Filters Panel -->
    <div class="filter-panel">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Filtres d'analyse</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="question in filterableQuestions" :key="question.id" class="space-y-2">
          <label class="label">{{ question.label }}</label>
          
          <!-- Single/Multiple Choice Filter -->
          <select 
            v-if="['single_choice', 'multiple_choice'].includes(question.type)"
            :value="filters[question.id] || 'all'"
            @change="updateFilter(question.id, $event.target.value)"
            class="input-field"
          >
            <option value="all">Toutes les réponses</option>
            <option 
              v-for="(label, value) in question.options" 
              :key="value" 
              :value="value"
            >
              {{ label }}
            </option>
          </select>
          
          <!-- Numeric Filter -->
          <div v-else-if="question.type === 'numeric'" class="flex space-x-2">
            <input 
              type="number" 
              placeholder="Min"
              :value="filters[question.id]?.min || ''"
              @input="updateNumericFilter(question.id, 'min', $event.target.value)"
              class="input-field"
            />
            <input 
              type="number" 
              placeholder="Max"
              :value="filters[question.id]?.max || ''"
              @input="updateNumericFilter(question.id, 'max', $event.target.value)"
              class="input-field"
            />
          </div>
          
          <!-- Text Filter -->
          <input 
            v-else-if="question.type === 'text'"
            type="text"
            placeholder="Rechercher dans les réponses..."
            :value="filters[question.id] || ''"
            @input="updateFilter(question.id, $event.target.value)"
            class="input-field"
          />
        </div>
      </div>
      
      <!-- Clear Filters -->
      <div class="mt-4 flex justify-between items-center">
        <p class="text-sm text-gray-600">
          {{ filteredResponses.length }} réponse(s) correspondent aux filtres
        </p>
        <button 
          v-if="activeFiltersCount > 0"
          @click="clearAllFilters"
          class="text-sm text-red-600 hover:text-red-800"
        >
          Effacer tous les filtres
        </button>
      </div>
    </div>

    <!-- Questions Analysis -->
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">Analyse par question</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          v-for="question in questionsList.slice(0, displayedQuestionsCount)" 
          :key="question.id"
          class="card"
        >
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">{{ question.label }}</h3>
            <div class="flex items-center space-x-2 mt-2">
              <span class="tag">{{ question.type }}</span>
              <span class="text-sm text-gray-500">
                {{ getQuestionStats(question.id)?.total || 0 }} réponses
              </span>
            </div>
          </div>
          
          <QuestionAnalysis 
            :question="question"
            :stats="getQuestionStats(question.id)"
            :responses="filteredResponses"
          />
        </div>
      </div>
      
      <!-- Load More Button -->
      <div v-if="displayedQuestionsCount < questionsList.length" class="text-center">
        <button 
          @click="loadMoreQuestions"
          class="btn-secondary"
        >
          Voir plus de questions ({{ questionsList.length - displayedQuestionsCount }} restantes)
        </button>
      </div>
    </div>

    <!-- Data Quality Panel -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold text-gray-900">Qualité des données</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Completion Rates -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Taux de completion</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Réponses complètes</span>
              <span class="font-medium">{{ completeResponsesCount }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Réponses partielles</span>
              <span class="font-medium">{{ partialResponsesCount }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Réponses vides</span>
              <span class="font-medium">{{ emptyResponsesCount }}</span>
            </div>
          </div>
        </div>
        
        <!-- Response Distribution -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Distribution</h3>
          <div class="space-y-2">
            <div 
              v-for="(count, type) in questionTypeDistribution" 
              :key="type"
              class="flex justify-between items-center"
            >
              <span class="text-sm text-gray-600 capitalize">{{ type.replace('_', ' ') }}</span>
              <span class="font-medium">{{ count }}</span>
            </div>
          </div>
        </div>
        
        <!-- Missing Data -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Données manquantes</h3>
          <div class="space-y-2">
            <div 
              v-for="question in questionsWithMostMissingData.slice(0, 5)" 
              :key="question.id"
              class="flex justify-between items-center"
            >
              <span class="text-sm text-gray-600 truncate">{{ question.label.substring(0, 20) }}...</span>
              <span class="font-medium text-red-600">{{ question.missingCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import QuestionAnalysis from '../components/QuestionAnalysis.vue'

export default {
  name: 'Analysis',
  components: {
    QuestionAnalysis
  },
  setup() {
    const appStore = useAppStore()
    const displayedQuestionsCount = ref(6)
    
    // Computed properties
    const hasData = computed(() => appStore.hasData)
    const questionnaire = computed(() => appStore.questionnaire)
    const responses = computed(() => appStore.responses)
    const filteredResponses = computed(() => appStore.filteredResponses)
    const totalResponses = computed(() => appStore.totalResponses)
    const questionsList = computed(() => appStore.questionsList)
    const filters = computed(() => appStore.filters)
    
    const activeFiltersCount = computed(() => {
      return Object.keys(filters.value).length
    })
    
    const filterableQuestions = computed(() => {
      return questionsList.value.filter(q => 
        ['single_choice', 'multiple_choice', 'numeric', 'text'].includes(q.type)
      )
    })
    
    const averageCompletionRate = computed(() => {
      if (!responses.value || responses.value.length === 0) return 0
      
      const total = responses.value.reduce((sum, response) => {
        return sum + (response._metadata?.completion_rate || 0)
      }, 0)
      
      return total / responses.value.length
    })
    
    const completeResponsesCount = computed(() => {
      return responses.value?.filter(r => r._metadata?.completion_rate === 100).length || 0
    })
    
    const partialResponsesCount = computed(() => {
      return responses.value?.filter(r => 
        r._metadata?.completion_rate > 0 && r._metadata?.completion_rate < 100
      ).length || 0
    })
    
    const emptyResponsesCount = computed(() => {
      return responses.value?.filter(r => r._metadata?.completion_rate === 0).length || 0
    })
    
    const questionTypeDistribution = computed(() => {
      const distribution = {}
      questionsList.value.forEach(question => {
        distribution[question.type] = (distribution[question.type] || 0) + 1
      })
      return distribution
    })
    
    const questionsWithMostMissingData = computed(() => {
      return questionsList.value.map(question => {
        const stats = appStore.getQuestionStats(question.id)
        return {
          ...question,
          missingCount: stats?.missing || 0
        }
      }).sort((a, b) => b.missingCount - a.missingCount)
    })
    
    // Methods
    const getQuestionStats = (questionId) => {
      return appStore.getQuestionStats(questionId)
    }
    
    const updateFilter = (questionId, value) => {
      if (value === 'all' || value === '') {
        appStore.removeFilter(questionId)
      } else {
        appStore.addFilter(questionId, value)
      }
    }
    
    const updateNumericFilter = (questionId, type, value) => {
      const currentFilter = filters.value[questionId] || {}
      const newFilter = { ...currentFilter }
      
      if (value === '') {
        delete newFilter[type]
      } else {
        newFilter[type] = parseFloat(value)
      }
      
      if (Object.keys(newFilter).length === 0) {
        appStore.removeFilter(questionId)
      } else {
        appStore.addFilter(questionId, newFilter)
      }
    }
    
    const clearAllFilters = () => {
      appStore.clearFilters()
    }
    
    const loadMoreQuestions = () => {
      displayedQuestionsCount.value = Math.min(
        displayedQuestionsCount.value + 6,
        questionsList.value.length
      )
    }
    
    const refreshAnalysis = () => {
      // Force refresh of computed properties
      appStore.setCurrentStep('analysis')
      displayedQuestionsCount.value = 6
    }
    
    onMounted(() => {
      appStore.setCurrentStep('analysis')
    })
    
    return {
      hasData,
      questionnaire,
      responses,
      filteredResponses,
      totalResponses,
      questionsList,
      filters,
      activeFiltersCount,
      filterableQuestions,
      averageCompletionRate,
      completeResponsesCount,
      partialResponsesCount,
      emptyResponsesCount,
      questionTypeDistribution,
      questionsWithMostMissingData,
      displayedQuestionsCount,
      getQuestionStats,
      updateFilter,
      updateNumericFilter,
      clearAllFilters,
      loadMoreQuestions,
      refreshAnalysis
    }
  }
}
</script>
