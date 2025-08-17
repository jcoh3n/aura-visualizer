<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">{{ question.label }}</h3>
      <div class="flex space-x-2">
        <button 
          @click="regenerateCloud"
          class="text-sm text-gray-600 hover:text-gray-800"
          title="Régénérer le nuage"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button 
          @click="exportChart"
          class="text-sm text-gray-600 hover:text-gray-800"
          title="Exporter le graphique"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
      <canvas 
        ref="chartCanvas"
        class="w-full h-80 rounded-lg"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      ></canvas>
      
      <!-- Tooltip -->
      <div 
        v-if="tooltip.show"
        class="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none z-10"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="font-medium">{{ tooltip.word }}</div>
        <div class="text-gray-300">{{ tooltip.count }} occurrences</div>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="flex justify-between items-center">
      <div class="flex space-x-4">
        <div>
          <label class="text-sm text-gray-600">Mots minimum:</label>
          <select 
            v-model="minWordLength" 
            @change="generateWordCloud"
            class="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option :value="2">2 lettres</option>
            <option :value="3">3 lettres</option>
            <option :value="4">4 lettres</option>
            <option :value="5">5 lettres</option>
          </select>
        </div>
        
        <div>
          <label class="text-sm text-gray-600">Mots max:</label>
          <select 
            v-model="maxWords" 
            @change="generateWordCloud"
            class="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option :value="30">30</option>
            <option :value="50">50</option>
            <option :value="75">75</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
      
      <div class="text-sm text-gray-600">
        {{ processedWords.length }} mots uniques
      </div>
    </div>
    
    <!-- Top Words List -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div 
        v-for="word in topWords.slice(0, 12)" 
        :key="word.text"
        class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
      >
        <span class="font-medium text-gray-900">{{ word.text }}</span>
        <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {{ word.count }}
        </span>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-200">
      <div>
        Réponses textuelles: {{ data?.total || 0 }}
      </div>
      <div>
        Mots totaux: {{ totalWords }}
      </div>
      <div>
        Longueur moyenne: {{ averageLength.toFixed(1) }} caractères
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

export default {
  name: 'WordCloudChart',
  props: {
    question: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      default: null
    },
    responses: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    const minWordLength = ref(3)
    const maxWords = ref(50)
    const placedWords = ref([])
    
    let animationFrame = null
    
    const tooltip = ref({
      show: false,
      x: 0,
      y: 0,
      word: '',
      count: 0
    })
    
    const stopWords = new Set([
      'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'à', 'dans', 
      'pour', 'avec', 'sur', 'par', 'ce', 'qui', 'que', 'se', 'ne', 'pas', 'tout', 
      'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 
      'falloir', 'vouloir', 'venir', 'devoir', 'prendre', 'donner', 'mettre', 
      'partir', 'sortir', 'arriver', 'rester', 'entrer', 'monter', 'descendre',
      'très', 'bien', 'plus', 'aussi', 'comme', 'donc', 'mais', 'car', 'sans',
      'cette', 'ces', 'son', 'sa', 'ses', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
      'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'il', 'elle', 'ils', 'elles',
      'nous', 'vous', 'je', 'tu', 'me', 'te', 'lui', 'leur', 'y', 'en'
    ])
    
    const processedWords = computed(() => {
      if (!props.data?.responses) return []
      
      const wordCount = {}
      
      props.data.responses.forEach(response => {
        const text = (response.text || response || '').toLowerCase()
        // Extract words (letters, numbers, accented characters)
        const words = text.match(/[a-zA-ZÀ-ÿ0-9]+/g) || []
        
        words.forEach(word => {
          if (word.length >= minWordLength.value && !stopWords.has(word)) {
            wordCount[word] = (wordCount[word] || 0) + 1
          }
        })
      })
      
      return Object.entries(wordCount)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, maxWords.value)
    })
    
    const topWords = computed(() => {
      return processedWords.value.slice(0, 20)
    })
    
    const totalWords = computed(() => {
      return processedWords.value.reduce((sum, word) => sum + word.count, 0)
    })
    
    const averageLength = computed(() => {
      if (!props.data?.responses) return 0
      
      const lengths = props.data.responses.map(r => (r.text || r || '').length)
      return lengths.reduce((sum, len) => sum + len, 0) / lengths.length
    })
    
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280',
      '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#7C3AED'
    ]
    
    const generateWordCloud = () => {
      if (!chartCanvas.value || processedWords.value.length === 0) return
      
      const canvas = chartCanvas.value
      const ctx = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()
      
      // Set canvas size
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      const width = rect.width
      const height = rect.height
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Reset placed words
      placedWords.value = []
      
      const centerX = width / 2
      const centerY = height / 2
      
      // Calculate font sizes
      const maxCount = Math.max(...processedWords.value.map(w => w.count))
      const minFontSize = 12
      const maxFontSize = 48
      
      // Place words using spiral algorithm
      processedWords.value.forEach((word, index) => {
        const fontSize = Math.max(
          minFontSize,
          (word.count / maxCount) * maxFontSize
        )
        
        ctx.font = `bold ${fontSize}px Inter, sans-serif`
        const metrics = ctx.measureText(word.text)
        const wordWidth = metrics.width
        const wordHeight = fontSize
        
        // Try to place the word
        const position = findWordPosition(
          centerX, centerY, wordWidth, wordHeight, 
          placedWords.value, index === 0
        )
        
        if (position) {
          // Draw the word
          const color = colors[index % colors.length]
          ctx.fillStyle = color
          ctx.font = `bold ${fontSize}px Inter, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          
          // Add subtle shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
          ctx.shadowBlur = 2
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1
          
          ctx.fillText(word.text, position.x, position.y)
          
          // Reset shadow
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
          
          // Store word position for interaction
          placedWords.value.push({
            text: word.text,
            count: word.count,
            x: position.x - wordWidth / 2,
            y: position.y - wordHeight / 2,
            width: wordWidth,
            height: wordHeight
          })
        }
      })
    }
    
    const findWordPosition = (centerX, centerY, width, height, placedWords, isFirst = false) => {
      // First word goes in center
      if (isFirst) {
        return { x: centerX, y: centerY }
      }
      
      const maxAttempts = 1000
      let attempts = 0
      
      // Spiral search
      for (let radius = 20; radius < 300 && attempts < maxAttempts; radius += 10) {
        for (let angle = 0; angle < 2 * Math.PI; angle += 0.2) {
          attempts++
          
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          
          // Check bounds
          if (x - width / 2 < 10 || x + width / 2 > chartCanvas.value.getBoundingClientRect().width - 10 ||
              y - height / 2 < 10 || y + height / 2 > chartCanvas.value.getBoundingClientRect().height - 10) {
            continue
          }
          
          // Check collision with placed words
          let collision = false
          for (const placed of placedWords) {
            if (x - width / 2 < placed.x + placed.width + 5 &&
                x + width / 2 > placed.x - 5 &&
                y - height / 2 < placed.y + placed.height + 5 &&
                y + height / 2 > placed.y - 5) {
              collision = true
              break
            }
          }
          
          if (!collision) {
            return { x, y }
          }
        }
      }
      
      return null // Could not place word
    }
    
    const handleMouseMove = (event) => {
      const rect = chartCanvas.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Check if mouse is over a word
      const hoveredWord = placedWords.value.find(word => 
        x >= word.x && x <= word.x + word.width &&
        y >= word.y && y <= word.y + word.height
      )
      
      if (hoveredWord) {
        tooltip.value = {
          show: true,
          x: event.clientX - rect.left + 10,
          y: event.clientY - rect.top - 10,
          word: hoveredWord.text,
          count: hoveredWord.count
        }
        
        chartCanvas.value.style.cursor = 'pointer'
      } else {
        hideTooltip()
      }
    }
    
    const hideTooltip = () => {
      tooltip.value.show = false
      if (chartCanvas.value) {
        chartCanvas.value.style.cursor = 'default'
      }
    }
    
    const regenerateCloud = () => {
      generateWordCloud()
    }
    
    const exportChart = () => {
      if (!chartCanvas.value) return
      
      const link = document.createElement('a')
      link.download = `wordcloud_${props.question.id}.png`
      link.href = chartCanvas.value.toDataURL()
      link.click()
    }
    
    const resizeObserver = new ResizeObserver(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      animationFrame = requestAnimationFrame(() => {
        nextTick(() => {
          generateWordCloud()
        })
      })
    })
    
    onMounted(() => {
      nextTick(() => {
        generateWordCloud()
        if (chartCanvas.value) {
          resizeObserver.observe(chartCanvas.value)
        }
      })
    })
    
    onUnmounted(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      resizeObserver.disconnect()
    })
    
    // Watch for data changes
    watch(() => props.data, () => {
      nextTick(() => {
        generateWordCloud()
      })
    }, { deep: true })
    
    watch(processedWords, () => {
      nextTick(() => {
        generateWordCloud()
      })
    })
    
    return {
      chartCanvas,
      tooltip,
      minWordLength,
      maxWords,
      processedWords,
      topWords,
      totalWords,
      averageLength,
      handleMouseMove,
      hideTooltip,
      regenerateCloud,
      generateWordCloud,
      exportChart
    }
  }
}
</script>
