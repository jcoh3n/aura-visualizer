<template>
  <div class="space-y-4">
    <!-- Question Stats Summary -->
    <div v-if="stats" class="grid grid-cols-3 gap-4 text-center">
      <div>
        <div class="text-lg font-semibold text-primary-600">{{ stats.total }}</div>
        <div class="text-xs text-gray-500">Réponses</div>
      </div>
      <div>
        <div class="text-lg font-semibold text-green-600">{{ stats.completion_rate.toFixed(1) }}%</div>
        <div class="text-xs text-gray-500">Taux</div>
      </div>
      <div>
        <div class="text-lg font-semibold text-red-600">{{ stats.missing }}</div>
        <div class="text-xs text-gray-500">Manquantes</div>
      </div>
    </div>

    <!-- Choice Questions Visualization -->
    <div v-if="['single_choice', 'multiple_choice'].includes(question.type) && stats?.distribution">
      <!-- Bar Chart -->
      <div class="space-y-2">
        <div 
          v-for="item in stats.distribution.slice(0, 5)" 
          :key="item.value"
          class="flex items-center space-x-3"
        >
          <div class="w-24 text-sm text-gray-700 truncate">
            {{ item.label }}
          </div>
          <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div 
              class="bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
              :style="{ width: `${item.percentage}%` }"
            >
              <span class="text-xs text-white font-medium">
                {{ item.count }}
              </span>
            </div>
          </div>
          <div class="w-12 text-sm text-gray-500 text-right">
            {{ item.percentage.toFixed(1) }}%
          </div>
        </div>
        
        <div v-if="stats.distribution.length > 5" class="text-xs text-gray-500 text-center">
          ... et {{ stats.distribution.length - 5 }} autres options
        </div>
      </div>
    </div>

    <!-- Numeric Questions Visualization -->
    <div v-else-if="question.type === 'numeric' && stats?.mean !== undefined">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Minimum:</span>
          <span class="font-medium">{{ formatNumeric(stats.min) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Maximum:</span>
          <span class="font-medium">{{ formatNumeric(stats.max) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Moyenne:</span>
          <span class="font-medium">{{ formatNumeric(stats.mean) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Médiane:</span>
          <span class="font-medium">{{ formatNumeric(stats.median) }}</span>
        </div>
      </div>
      
      <!-- Simple histogram representation -->
      <div class="mt-4">
        <div class="h-8 bg-gray-200 rounded-lg relative overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg"
            :style="{ width: '100%' }"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xs text-white font-medium">
              {{ formatNumeric(stats.min) }} - {{ formatNumeric(stats.max) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Questions Visualization -->
    <div v-else-if="['text', 'open'].includes(question.type) && stats?.responses">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Réponses uniques:</span>
          <span class="font-medium">{{ stats.unique_responses }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Longueur moyenne:</span>
          <span class="font-medium">{{ Math.round(stats.avg_length) }} chars</span>
        </div>
      </div>
      
      <!-- Sample responses -->
      <div class="mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Exemples de réponses:</h4>
        <div class="space-y-1">
          <div 
            v-for="(response, index) in stats.responses.slice(0, 3)" 
            :key="index"
            class="text-xs text-gray-600 bg-gray-50 p-2 rounded truncate"
          >
            "{{ response.text || response }}"
          </div>
          <div v-if="stats.responses.length > 3" class="text-xs text-gray-500 text-center">
            ... et {{ stats.responses.length - 3 }} autres réponses
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!stats || stats.total === 0" class="text-center py-4">
      <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-sm text-gray-500 mt-2">Aucune donnée disponible</p>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between items-center pt-4 border-t border-gray-200">
      <button 
        @click="toggleDetails"
        class="text-sm text-primary-600 hover:text-primary-800"
      >
        {{ showDetails ? 'Masquer' : 'Voir' }} les détails
      </button>
      
      <div class="flex space-x-2">
        <button 
          @click="exportData"
          class="text-sm text-gray-600 hover:text-gray-800"
          title="Exporter les données"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        
        <button 
          @click="addToComparison"
          class="text-sm text-accent-600 hover:text-accent-800"
          title="Ajouter à la comparaison"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Detailed View -->
    <div v-if="showDetails" class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Détails avancés</h4>
      
      <!-- Choice Questions Details -->
      <div v-if="['single_choice', 'multiple_choice'].includes(question.type) && stats?.distribution">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Option</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Réponses</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pourcentage</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in stats.distribution" :key="item.value">
                <td class="px-3 py-2 text-sm text-gray-900">{{ item.label }}</td>
                <td class="px-3 py-2 text-sm text-gray-500">{{ item.count }}</td>
                <td class="px-3 py-2 text-sm text-gray-500">{{ item.percentage.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Text Questions Word Cloud Preview -->
      <div v-else-if="['text', 'open'].includes(question.type) && stats?.responses">
        <div class="mb-4">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Mots les plus fréquents:</h5>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="word in getTopWords(stats.responses).slice(0, 10)" 
              :key="word.text"
              class="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
              :style="{ fontSize: `${Math.min(14, 8 + word.count)}px` }"
            >
              {{ word.text }} ({{ word.count }})
            </span>
          </div>
        </div>
        
        <div>
          <h5 class="text-sm font-medium text-gray-700 mb-2">Toutes les réponses:</h5>
          <div class="max-h-40 overflow-y-auto space-y-1">
            <div 
              v-for="(response, index) in stats.responses" 
              :key="index"
              class="text-xs text-gray-600 bg-gray-50 p-2 rounded"
            >
              "{{ response.text || response }}"
            </div>
          </div>
        </div>
      </div>
      
      <!-- Numeric Questions Distribution -->
      <div v-else-if="question.type === 'numeric'" class="space-y-2">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Écart-type:</span>
            <span class="font-medium">{{ calculateStandardDeviation().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Quartile 1:</span>
            <span class="font-medium">{{ calculateQuartile(1).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Quartile 3:</span>
            <span class="font-medium">{{ calculateQuartile(3).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Valeurs uniques:</span>
            <span class="font-medium">{{ getUniqueNumericValues().length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'QuestionAnalysis',
  props: {
    question: {
      type: Object,
      required: true
    },
    stats: {
      type: Object,
      default: null
    },
    responses: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const showDetails = ref(false)
    
    // Methods
    const toggleDetails = () => {
      showDetails.value = !showDetails.value
    }
    
    const formatNumeric = (value) => {
      if (value === null || value === undefined) return 'N/A'
      
      if (props.question.format === 'currency') {
        return `${value.toFixed(2)} €`
      } else if (props.question.format === 'count') {
        return Math.round(value).toString()
      } else {
        return value.toFixed(2)
      }
    }
    
    const getTopWords = (responses) => {
      const wordCount = {}
      const stopWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'à', 'dans', 'pour', 'avec', 'sur', 'par', 'ce', 'qui', 'que', 'se', 'ne', 'pas', 'tout', 'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 'falloir', 'vouloir', 'venir', 'devoir', 'prendre', 'donner', 'mettre', 'partir', 'sortir', 'arriver', 'rester', 'entrer', 'monter', 'descendre', 'passer', 'porter', 'regarder', 'trouver', 'rendre', 'tenir', 'sentir', 'vivre', 'connaître', 'paraître', 'croire', 'laisser', 'porter', 'suivre', 'tourner', 'demander', 'garder', 'sembler', 'montrer', 'ouvrir', 'commencer', 'finir', 'continuer', 'arrêter', 'changer', 'devenir', 'revenir', 'retourner', 'comprendre', 'apprendre', 'expliquer', 'raconter', 'parler', 'répondre', 'appeler', 'jouer', 'gagner', 'perdre', 'aimer', 'préférer', 'choisir', 'décider', 'essayer', 'réussir', 'échouer', 'attendre', 'espérer', 'penser', 'oublier', 'rappeler', 'reconnaître']
      
      responses.forEach(response => {
        // Gérer les objets de réponse et les chaînes simples
        let text = ''
        if (typeof response === 'object') {
          text = (response.text || response.label || response.raw || String(response)).toLowerCase()
        } else {
          text = (response || '').toLowerCase()
        }
        const words = text.match(/\b\w{3,}\b/g) || []
        
        words.forEach(word => {
          if (!stopWords.includes(word)) {
            wordCount[word] = (wordCount[word] || 0) + 1
          }
        })
      })
      
      return Object.entries(wordCount)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
    }
    
    const calculateStandardDeviation = () => {
      if (!props.stats || props.stats.mean === undefined) return 0
      
      const values = getNumericValues()
      if (values.length === 0) return 0
      
      const mean = props.stats.mean
      const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
      const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
      
      return Math.sqrt(avgSquaredDiff)
    }
    
    const calculateQuartile = (quartile) => {
      const values = getNumericValues().sort((a, b) => a - b)
      if (values.length === 0) return 0
      
      const index = (quartile / 4) * (values.length - 1)
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      
      if (lower === upper) {
        return values[lower]
      } else {
        return values[lower] * (upper - index) + values[upper] * (index - lower)
      }
    }
    
    const getNumericValues = () => {
      return props.responses
        .map(response => response[props.question.id])
        .filter(value => value !== null && value !== undefined)
        .map(value => {
          if (typeof value === 'object') {
            // Gérer les objets de réponse {code, label, raw}
            return parseFloat(value.value || value.code || value.raw)
          }
          return parseFloat(value)
        })
        .filter(value => !isNaN(value))
    }
    
    const getUniqueNumericValues = () => {
      const values = getNumericValues()
      return [...new Set(values)]
    }
    
    const exportData = () => {
      const data = {
        question: props.question,
        stats: props.stats,
        responses: props.responses.map(r => r[props.question.id]).filter(r => r !== null && r !== undefined)
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `question_${props.question.id}_data.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    const addToComparison = () => {
      // This would emit an event to add the question to a comparison view
      console.log('Add to comparison:', props.question.id)
      // TODO: Implement comparison functionality
    }
    
    return {
      showDetails,
      toggleDetails,
      formatNumeric,
      getTopWords,
      calculateStandardDeviation,
      calculateQuartile,
      getUniqueNumericValues,
      exportData,
      addToComparison
    }
  }
}
</script>
