<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Comparaison des questions</h3>
      <div class="flex space-x-2">
        <select 
          v-model="chartType" 
          @change="updateChart"
          class="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="grouped">Barres groupées</option>
          <option value="stacked">Barres empilées</option>
          <option value="percentage">Pourcentages</option>
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
        <div class="font-medium">{{ tooltip.question }}</div>
        <div class="text-gray-300">{{ tooltip.option }}: {{ tooltip.value }}</div>
      </div>
    </div>
    
    <!-- Legend -->
    <div class="flex flex-wrap gap-4 justify-center">
      <div 
        v-for="(question, index) in questions" 
        :key="question.id"
        class="flex items-center space-x-2"
      >
        <div 
          class="w-4 h-4 rounded"
          :style="{ backgroundColor: colors[index % colors.length] }"
        ></div>
        <span class="text-sm text-gray-700">{{ question.label }}</span>
      </div>
    </div>
    
    <!-- Statistics Table -->
    <div class="mt-6">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Tableau comparatif</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Option</th>
              <th 
                v-for="question in questions" 
                :key="question.id"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                {{ question.label.substring(0, 20) }}...
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="option in allOptions" :key="option">
              <td class="px-4 py-4 text-sm font-medium text-gray-900">{{ option }}</td>
              <td 
                v-for="question in questions" 
                :key="`${question.id}-${option}`"
                class="px-4 py-4 text-sm text-gray-500"
              >
                {{ getOptionCount(question, option) }}
                <span class="text-xs text-gray-400 ml-1">
                  ({{ getOptionPercentage(question, option) }}%)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

export default {
  name: 'ComparisonChart',
  props: {
    questions: {
      type: Array,
      required: true
    },
    data: {
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
    const chartType = ref('grouped')
    
    let chart = null
    let animationFrame = null
    
    const tooltip = ref({
      show: false,
      x: 0,
      y: 0,
      question: '',
      option: '',
      value: ''
    })
    
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ]
    
    // Get all unique options across all questions
    const allOptions = computed(() => {
      const optionsSet = new Set()
      
      props.data.forEach(questionData => {
        if (questionData?.distribution) {
          questionData.distribution.forEach(item => {
            optionsSet.add(item.label)
          })
        }
      })
      
      return Array.from(optionsSet).sort()
    })
    
    const getOptionCount = (question, optionLabel) => {
      const questionData = props.data.find((_, index) => props.questions[index].id === question.id)
      if (!questionData?.distribution) return 0
      
      const option = questionData.distribution.find(item => item.label === optionLabel)
      return option ? option.count : 0
    }
    
    const getOptionPercentage = (question, optionLabel) => {
      const questionData = props.data.find((_, index) => props.questions[index].id === question.id)
      if (!questionData?.distribution) return 0
      
      const option = questionData.distribution.find(item => item.label === optionLabel)
      return option ? option.percentage.toFixed(1) : '0.0'
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
      
      // Chart dimensions
      const margin = { top: 20, right: 20, bottom: 100, left: 80 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom
      
      if (chartType.value === 'grouped') {
        drawGroupedBars(ctx, chartWidth, chartHeight, margin)
      } else if (chartType.value === 'stacked') {
        drawStackedBars(ctx, chartWidth, chartHeight, margin)
      } else {
        drawPercentageBars(ctx, chartWidth, chartHeight, margin)
      }
    }
    
    const drawGroupedBars = (ctx, chartWidth, chartHeight, margin) => {
      const options = allOptions.value
      const questions = props.questions
      
      if (options.length === 0) return
      
      const groupWidth = chartWidth / options.length
      const barWidth = groupWidth / questions.length * 0.8
      const barSpacing = groupWidth / questions.length * 0.2
      
      // Find max value for scaling
      let maxValue = 0
      options.forEach(option => {
        questions.forEach(question => {
          const count = getOptionCount(question, option)
          maxValue = Math.max(maxValue, count)
        })
      })
      
      if (maxValue === 0) return
      
      chart = { bars: [] }
      
      // Draw bars
      options.forEach((option, optionIndex) => {
        questions.forEach((question, questionIndex) => {
          const count = getOptionCount(question, option)
          const barHeight = (count / maxValue) * chartHeight
          
          const x = margin.left + optionIndex * groupWidth + questionIndex * (barWidth + barSpacing / questions.length) + barSpacing / 2
          const y = margin.top + chartHeight - barHeight
          
          // Bar
          ctx.fillStyle = colors[questionIndex % colors.length]
          ctx.fillRect(x, y, barWidth, barHeight)
          
          // Bar border
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, barWidth, barHeight)
          
          // Value label
          if (count > 0) {
            ctx.fillStyle = '#374151'
            ctx.font = '10px Inter, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(count, x + barWidth / 2, y - 5)
          }
          
          // Store for interaction
          chart.bars.push({
            x, y, width: barWidth, height: barHeight,
            question: question.label,
            option: option,
            value: count
          })
        })
      })
      
      // Draw axes and labels
      drawAxes(ctx, chartWidth, chartHeight, margin, maxValue)
      drawGroupedLabels(ctx, chartWidth, chartHeight, margin, options)
    }
    
    const drawStackedBars = (ctx, chartWidth, chartHeight, margin) => {
      const options = allOptions.value
      const questions = props.questions
      
      if (options.length === 0) return
      
      const barWidth = chartWidth / options.length * 0.8
      const barSpacing = chartWidth / options.length * 0.2
      
      // Find max total for each option
      let maxTotal = 0
      options.forEach(option => {
        let total = 0
        questions.forEach(question => {
          total += getOptionCount(question, option)
        })
        maxTotal = Math.max(maxTotal, total)
      })
      
      if (maxTotal === 0) return
      
      chart = { bars: [] }
      
      // Draw stacked bars
      options.forEach((option, optionIndex) => {
        let stackY = margin.top + chartHeight
        
        questions.forEach((question, questionIndex) => {
          const count = getOptionCount(question, option)
          const barHeight = (count / maxTotal) * chartHeight
          
          const x = margin.left + optionIndex * (barWidth + barSpacing) + barSpacing / 2
          const y = stackY - barHeight
          
          if (count > 0) {
            // Bar
            ctx.fillStyle = colors[questionIndex % colors.length]
            ctx.fillRect(x, y, barWidth, barHeight)
            
            // Bar border
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, barWidth, barHeight)
            
            // Value label
            if (barHeight > 20) {
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 10px Inter, sans-serif'
              ctx.textAlign = 'center'
              ctx.fillText(count, x + barWidth / 2, y + barHeight / 2 + 3)
            }
            
            // Store for interaction
            chart.bars.push({
              x, y, width: barWidth, height: barHeight,
              question: question.label,
              option: option,
              value: count
            })
          }
          
          stackY = y
        })
      })
      
      // Draw axes and labels
      drawAxes(ctx, chartWidth, chartHeight, margin, maxTotal)
      drawStackedLabels(ctx, chartWidth, chartHeight, margin, options)
    }
    
    const drawPercentageBars = (ctx, chartWidth, chartHeight, margin) => {
      const options = allOptions.value
      const questions = props.questions
      
      if (options.length === 0) return
      
      const barWidth = chartWidth / options.length * 0.8
      const barSpacing = chartWidth / options.length * 0.2
      
      chart = { bars: [] }
      
      // Draw percentage bars
      options.forEach((option, optionIndex) => {
        let stackY = margin.top + chartHeight
        
        // Calculate total for this option
        let total = 0
        questions.forEach(question => {
          total += getOptionCount(question, option)
        })
        
        if (total > 0) {
          questions.forEach((question, questionIndex) => {
            const count = getOptionCount(question, option)
            const percentage = (count / total) * 100
            const barHeight = (percentage / 100) * chartHeight
            
            const x = margin.left + optionIndex * (barWidth + barSpacing) + barSpacing / 2
            const y = stackY - barHeight
            
            if (count > 0) {
              // Bar
              ctx.fillStyle = colors[questionIndex % colors.length]
              ctx.fillRect(x, y, barWidth, barHeight)
              
              // Bar border
              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 1
              ctx.strokeRect(x, y, barWidth, barHeight)
              
              // Percentage label
              if (barHeight > 20) {
                ctx.fillStyle = '#ffffff'
                ctx.font = 'bold 10px Inter, sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText(`${percentage.toFixed(1)}%`, x + barWidth / 2, y + barHeight / 2 + 3)
              }
              
              // Store for interaction
              chart.bars.push({
                x, y, width: barWidth, height: barHeight,
                question: question.label,
                option: option,
                value: `${count} (${percentage.toFixed(1)}%)`
              })
            }
            
            stackY = y
          })
        }
      })
      
      // Draw axes and labels
      drawAxes(ctx, chartWidth, chartHeight, margin, 100, '%')
      drawStackedLabels(ctx, chartWidth, chartHeight, margin, options)
    }
    
    const drawAxes = (ctx, chartWidth, chartHeight, margin, maxValue, suffix = '') => {
      // Y-axis
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, margin.top + chartHeight)
      ctx.stroke()
      
      // X-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top + chartHeight)
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
      ctx.stroke()
      
      // Y-axis labels
      ctx.fillStyle = '#6B7280'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'right'
      
      const ySteps = 5
      for (let i = 0; i <= ySteps; i++) {
        const value = (maxValue / ySteps) * i
        const y = margin.top + chartHeight - (value / maxValue) * chartHeight
        
        ctx.fillText(`${Math.round(value)}${suffix}`, margin.left - 10, y + 4)
        
        // Grid lines
        if (i > 0) {
          ctx.strokeStyle = '#F3F4F6'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(margin.left, y)
          ctx.lineTo(margin.left + chartWidth, y)
          ctx.stroke()
        }
      }
    }
    
    const drawGroupedLabels = (ctx, chartWidth, chartHeight, margin, options) => {
      ctx.fillStyle = '#6B7280'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      
      const groupWidth = chartWidth / options.length
      
      options.forEach((option, index) => {
        const x = margin.left + index * groupWidth + groupWidth / 2
        const y = margin.top + chartHeight + 20
        
        // Truncate long labels
        let label = option
        if (label.length > 15) {
          label = label.substring(0, 12) + '...'
        }
        
        ctx.fillText(label, x, y)
      })
    }
    
    const drawStackedLabels = (ctx, chartWidth, chartHeight, margin, options) => {
      ctx.fillStyle = '#6B7280'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      
      const barWidth = chartWidth / options.length * 0.8
      const barSpacing = chartWidth / options.length * 0.2
      
      options.forEach((option, index) => {
        const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2
        const y = margin.top + chartHeight + 20
        
        // Truncate long labels
        let label = option
        if (label.length > 15) {
          label = label.substring(0, 12) + '...'
        }
        
        ctx.fillText(label, x, y)
      })
    }
    
    const handleMouseMove = (event) => {
      if (!chart?.bars) return
      
      const rect = chartCanvas.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Check if mouse is over a bar
      const hoveredBar = chart.bars.find(bar => 
        x >= bar.x && x <= bar.x + bar.width &&
        y >= bar.y && y <= bar.y + bar.height
      )
      
      if (hoveredBar) {
        tooltip.value = {
          show: true,
          x: event.clientX - rect.left + 10,
          y: event.clientY - rect.top - 10,
          question: hoveredBar.question,
          option: hoveredBar.option,
          value: hoveredBar.value
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
    
    const updateChart = () => {
      nextTick(() => {
        drawChart()
      })
    }
    
    const exportChart = () => {
      if (!chartCanvas.value) return
      
      const link = document.createElement('a')
      link.download = `comparison_chart.png`
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
    watch(() => [props.questions, props.data], () => {
      nextTick(() => {
        drawChart()
      })
    }, { deep: true })
    
    watch(chartType, () => {
      updateChart()
    })
    
    return {
      chartCanvas,
      chartType,
      tooltip,
      colors,
      allOptions,
      getOptionCount,
      getOptionPercentage,
      handleMouseMove,
      hideTooltip,
      updateChart,
      exportChart
    }
  }
}
</script>
