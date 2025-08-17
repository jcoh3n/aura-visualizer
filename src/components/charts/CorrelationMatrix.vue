<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Matrice de corrélation</h3>
      <div class="flex space-x-2">
        <select 
          v-model="correlationType" 
          @change="updateChart"
          class="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="pearson">Pearson</option>
          <option value="spearman">Spearman</option>
        </select>
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
    
    <div class="relative">
      <canvas 
        ref="chartCanvas"
        class="w-full h-96"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      ></canvas>
      
      <!-- Tooltip -->
      <div 
        v-if="tooltip.show"
        class="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none z-10"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="font-medium">{{ tooltip.question1 }} × {{ tooltip.question2 }}</div>
        <div class="text-gray-300">Corrélation: {{ tooltip.correlation }}</div>
        <div class="text-xs text-gray-400">{{ getCorrelationStrength(parseFloat(tooltip.correlation)) }}</div>
      </div>
    </div>
    
    <!-- Color Scale Legend -->
    <div class="flex items-center justify-center space-x-4">
      <span class="text-sm text-gray-600">Corrélation négative</span>
      <div class="flex h-6 w-64 rounded overflow-hidden">
        <div 
          v-for="(color, index) in colorScale" 
          :key="index"
          class="flex-1 h-full"
          :style="{ backgroundColor: color }"
        ></div>
      </div>
      <span class="text-sm text-gray-600">Corrélation positive</span>
    </div>
    
    <div class="flex justify-center space-x-8 text-sm text-gray-600">
      <span>-1.0</span>
      <span>-0.5</span>
      <span>0.0</span>
      <span>0.5</span>
      <span>1.0</span>
    </div>
    
    <!-- Correlation Table -->
    <div class="mt-6">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Valeurs de corrélation</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
              <th 
                v-for="question in questions" 
                :key="question.id"
                class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase"
              >
                Q{{ questions.indexOf(question) + 1 }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(question1, i) in questions" :key="question1.id">
              <td class="px-4 py-4 text-sm font-medium text-gray-900">
                Q{{ i + 1 }}: {{ question1.label.substring(0, 30) }}...
              </td>
              <td 
                v-for="(question2, j) in questions" 
                :key="`${question1.id}-${question2.id}`"
                class="px-4 py-4 text-sm text-center"
                :class="getCorrelationClass(correlationMatrix[i] ? correlationMatrix[i][j] : 0)"
              >
                {{ correlationMatrix[i] && correlationMatrix[i][j] !== undefined 
                     ? correlationMatrix[i][j].toFixed(3) 
                     : 'N/A' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Insights -->
    <div class="mt-6 p-4 bg-blue-50 rounded-lg">
      <h4 class="text-lg font-medium text-blue-900 mb-2">Insights</h4>
      <div class="space-y-2 text-sm text-blue-800">
        <div v-if="strongCorrelations.length > 0">
          <strong>Corrélations fortes détectées:</strong>
          <ul class="mt-1 ml-4 space-y-1">
            <li v-for="corr in strongCorrelations" :key="`${corr.q1}-${corr.q2}`">
              {{ corr.q1 }} ↔ {{ corr.q2 }}: {{ corr.value.toFixed(3) }}
            </li>
          </ul>
        </div>
        <div v-if="weakCorrelations.length > 0">
          <strong>Variables indépendantes:</strong>
          <span>{{ weakCorrelations.length }} paires de questions montrent peu de corrélation.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

export default {
  name: 'CorrelationMatrix',
  props: {
    questions: {
      type: Array,
      required: true
    },
    responses: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    const correlationType = ref('pearson')
    
    let chart = null
    let animationFrame = null
    
    const tooltip = ref({
      show: false,
      x: 0,
      y: 0,
      question1: '',
      question2: '',
      correlation: ''
    })
    
    const colorScale = [
      '#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
      '#FED7D7', '#F3F4F6', '#DBEAFE', '#93C5FD', '#60A5FA',
      '#3B82F6', '#2563EB', '#1D4ED8'
    ]
    
    const correlationMatrix = computed(() => {
      if (props.questions.length === 0 || props.responses.length === 0) return []
      
      const matrix = []
      
      for (let i = 0; i < props.questions.length; i++) {
        matrix[i] = []
        for (let j = 0; j < props.questions.length; j++) {
          if (i === j) {
            matrix[i][j] = 1
          } else {
            matrix[i][j] = calculateCorrelation(props.questions[i], props.questions[j])
          }
        }
      }
      
      return matrix
    })
    
    const strongCorrelations = computed(() => {
      const correlations = []
      
      for (let i = 0; i < props.questions.length; i++) {
        for (let j = i + 1; j < props.questions.length; j++) {
          const value = correlationMatrix.value[i] ? correlationMatrix.value[i][j] : 0
          if (Math.abs(value) > 0.7) {
            correlations.push({
              q1: props.questions[i].label.substring(0, 20) + '...',
              q2: props.questions[j].label.substring(0, 20) + '...',
              value
            })
          }
        }
      }
      
      return correlations.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    })
    
    const weakCorrelations = computed(() => {
      let count = 0
      
      for (let i = 0; i < props.questions.length; i++) {
        for (let j = i + 1; j < props.questions.length; j++) {
          const value = correlationMatrix.value[i] ? correlationMatrix.value[i][j] : 0
          if (Math.abs(value) < 0.3) {
            count++
          }
        }
      }
      
      return Array(count).fill(null)
    })
    
    const calculateCorrelation = (question1, question2) => {
      const values1 = []
      const values2 = []
      
      // Extract numeric values for both questions
      props.responses.forEach(response => {
        const val1 = getNumericValue(response[question1.id])
        const val2 = getNumericValue(response[question2.id])
        
        if (val1 !== null && val2 !== null && !isNaN(val1) && !isNaN(val2)) {
          values1.push(val1)
          values2.push(val2)
        }
      })
      
      if (values1.length < 2) return 0
      
      if (correlationType.value === 'pearson') {
        return calculatePearsonCorrelation(values1, values2)
      } else {
        return calculateSpearmanCorrelation(values1, values2)
      }
    }
    
    const getNumericValue = (value) => {
      if (value === null || value === undefined) return null
      
      if (typeof value === 'object') {
        // Handle processed values
        if (value.value !== undefined) return parseFloat(value.value)
        if (value.code !== undefined) return parseFloat(value.code)
        return null
      }
      
      const parsed = parseFloat(value)
      return isNaN(parsed) ? null : parsed
    }
    
    const calculatePearsonCorrelation = (x, y) => {
      if (x.length !== y.length || x.length === 0) return 0
      
      const n = x.length
      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = y.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
      
      const numerator = n * sumXY - sumX * sumY
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
      
      return denominator === 0 ? 0 : numerator / denominator
    }
    
    const calculateSpearmanCorrelation = (x, y) => {
      if (x.length !== y.length || x.length === 0) return 0
      
      // Create ranks
      const rankX = getRanks(x)
      const rankY = getRanks(y)
      
      return calculatePearsonCorrelation(rankX, rankY)
    }
    
    const getRanks = (values) => {
      const sorted = values.map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value)
      
      const ranks = new Array(values.length)
      
      for (let i = 0; i < sorted.length; i++) {
        let rank = i + 1
        
        // Handle ties by averaging ranks
        let j = i
        while (j < sorted.length - 1 && sorted[j].value === sorted[j + 1].value) {
          j++
        }
        
        if (j > i) {
          rank = (i + 1 + j + 1) / 2
          for (let k = i; k <= j; k++) {
            ranks[sorted[k].index] = rank
          }
          i = j
        } else {
          ranks[sorted[i].index] = rank
        }
      }
      
      return ranks
    }
    
    const drawChart = () => {
      if (!chartCanvas.value || props.questions.length === 0) return
      
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
      
      const margin = { top: 60, right: 60, bottom: 60, left: 60 }
      const cellSize = Math.min(
        (width - margin.left - margin.right) / props.questions.length,
        (height - margin.top - margin.bottom) / props.questions.length
      )
      
      chart = { cells: [] }
      
      // Draw correlation matrix
      for (let i = 0; i < props.questions.length; i++) {
        chart.cells[i] = []
        for (let j = 0; j < props.questions.length; j++) {
          const correlation = correlationMatrix.value[i] ? correlationMatrix.value[i][j] : 0
          const x = margin.left + j * cellSize
          const y = margin.top + i * cellSize
          
          // Get color based on correlation value
          const colorIndex = Math.round(((correlation + 1) / 2) * (colorScale.length - 1))
          const color = colorScale[Math.max(0, Math.min(colorScale.length - 1, colorIndex))]
          
          // Draw cell
          ctx.fillStyle = color
          ctx.fillRect(x, y, cellSize, cellSize)
          
          // Cell border
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, cellSize, cellSize)
          
          // Correlation value text
          ctx.fillStyle = Math.abs(correlation) > 0.5 ? '#ffffff' : '#000000'
          ctx.font = `${Math.min(12, cellSize / 4)}px Inter, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            correlation.toFixed(2), 
            x + cellSize / 2, 
            y + cellSize / 2
          )
          
          // Store cell for interaction
          chart.cells[i][j] = {
            x, y, size: cellSize,
            correlation,
            question1: props.questions[i].label,
            question2: props.questions[j].label
          }
        }
      }
      
      // Draw labels
      ctx.fillStyle = '#374151'
      ctx.font = '11px Inter, sans-serif'
      
      // Top labels
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      for (let j = 0; j < props.questions.length; j++) {
        const x = margin.left + j * cellSize + cellSize / 2
        const y = margin.top - 10
        
        let label = `Q${j + 1}`
        ctx.fillText(label, x, y)
      }
      
      // Left labels
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < props.questions.length; i++) {
        const x = margin.left - 10
        const y = margin.top + i * cellSize + cellSize / 2
        
        let label = `Q${i + 1}`
        ctx.fillText(label, x, y)
      }
    }
    
    const handleMouseMove = (event) => {
      if (!chart?.cells) return
      
      const rect = chartCanvas.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Find hovered cell
      let hoveredCell = null
      for (let i = 0; i < chart.cells.length; i++) {
        for (let j = 0; j < chart.cells[i].length; j++) {
          const cell = chart.cells[i][j]
          if (x >= cell.x && x <= cell.x + cell.size &&
              y >= cell.y && y <= cell.y + cell.size) {
            hoveredCell = cell
            break
          }
        }
        if (hoveredCell) break
      }
      
      if (hoveredCell) {
        tooltip.value = {
          show: true,
          x: event.clientX - rect.left + 10,
          y: event.clientY - rect.top - 10,
          question1: hoveredCell.question1.substring(0, 20) + '...',
          question2: hoveredCell.question2.substring(0, 20) + '...',
          correlation: hoveredCell.correlation.toFixed(3)
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
    
    const getCorrelationStrength = (value) => {
      const abs = Math.abs(value)
      if (abs >= 0.8) return 'Très forte'
      if (abs >= 0.6) return 'Forte'
      if (abs >= 0.4) return 'Modérée'
      if (abs >= 0.2) return 'Faible'
      return 'Très faible'
    }
    
    const getCorrelationClass = (value) => {
      const abs = Math.abs(value)
      if (abs >= 0.8) return 'text-red-800 font-bold'
      if (abs >= 0.6) return 'text-red-600 font-semibold'
      if (abs >= 0.4) return 'text-yellow-600'
      if (abs >= 0.2) return 'text-gray-600'
      return 'text-gray-400'
    }
    
    const updateChart = () => {
      nextTick(() => {
        drawChart()
      })
    }
    
    const exportChart = () => {
      if (!chartCanvas.value) return
      
      const link = document.createElement('a')
      link.download = `correlation_matrix.png`
      link.href = chartCanvas.value.toDataURL()
      link.click()
    }
    
    const resizeObserver = new ResizeObserver(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      animationFrame = requestAnimationFrame(() => {
        nextTick(() => {
          drawChart()
        })
      })
    })
    
    onMounted(() => {
      nextTick(() => {
        drawChart()
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
    watch(() => [props.questions, props.responses], () => {
      nextTick(() => {
        drawChart()
      })
    }, { deep: true })
    
    watch(correlationType, () => {
      updateChart()
    })
    
    return {
      chartCanvas,
      correlationType,
      tooltip,
      colorScale,
      correlationMatrix,
      strongCorrelations,
      weakCorrelations,
      handleMouseMove,
      hideTooltip,
      getCorrelationStrength,
      getCorrelationClass,
      updateChart,
      exportChart
    }
  }
}
</script>
