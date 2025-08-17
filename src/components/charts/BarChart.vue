<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">{{ question.label }}</h3>
      <div class="flex space-x-2">
        <button 
          @click="toggleSort"
          class="text-sm text-gray-600 hover:text-gray-800"
          title="Trier les données"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
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
    
    <div class="relative">
      <canvas 
        ref="chartCanvas"
        class="w-full h-80"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      ></canvas>
      
      <!-- Tooltip -->
      <div 
        v-if="tooltip.show"
        ref="tooltipEl"
        class="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none z-10"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="font-medium">{{ tooltip.label }}</div>
        <div class="text-gray-300">{{ tooltip.value }} réponses ({{ tooltip.percentage }}%)</div>
      </div>
    </div>
    
    <!-- Legend and Stats -->
    <div class="flex justify-between items-center text-sm text-gray-600">
      <div>
        Total: {{ data?.total || 0 }} réponses
      </div>
      <div>
        Taux de réponse: {{ data?.completion_rate?.toFixed(1) || 0 }}%
      </div>
    </div>
    
    <!-- Data Table -->
    <div v-if="showTable" class="mt-4">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Option</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Réponses</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pourcentage</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in sortedData" :key="item.value">
              <td class="px-4 py-2 text-sm text-gray-900">{{ item.label }}</td>
              <td class="px-4 py-2 text-sm text-gray-500">{{ item.count }}</td>
              <td class="px-4 py-2 text-sm text-gray-500">{{ item.percentage.toFixed(1) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Toggle Table Button -->
    <div class="text-center">
      <button 
        @click="showTable = !showTable"
        class="text-sm text-primary-600 hover:text-primary-800"
      >
        {{ showTable ? 'Masquer' : 'Afficher' }} les données détaillées
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

export default {
  name: 'BarChart',
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
    const tooltipEl = ref(null)
    const showTable = ref(false)
    const sortBy = ref('count') // 'count' or 'label'
    const sortOrder = ref('desc') // 'asc' or 'desc'
    
    let chart = null
    let animationFrame = null
    
    const tooltip = ref({
      show: false,
      x: 0,
      y: 0,
      label: '',
      value: 0,
      percentage: 0
    })
    
    const sortedData = computed(() => {
      if (!props.data?.distribution) return []
      
      const data = [...props.data.distribution]
      
      return data.sort((a, b) => {
        let aVal, bVal
        
        if (sortBy.value === 'count') {
          aVal = a.count
          bVal = b.count
        } else {
          aVal = a.label.toLowerCase()
          bVal = b.label.toLowerCase()
        }
        
        if (sortOrder.value === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        }
      })
    })
    
    const colors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#6B7280'  // gray-500
    ]
    
    const drawChart = () => {
      if (!chartCanvas.value || !props.data?.distribution) return
      
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
      const margin = { top: 20, right: 20, bottom: 80, left: 60 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom
      
      const data = sortedData.value.slice(0, 10) // Limit to top 10
      if (data.length === 0) return
      
      // Calculate scales
      const maxCount = Math.max(...data.map(d => d.count))
      const barWidth = chartWidth / data.length * 0.8
      const barSpacing = chartWidth / data.length * 0.2
      
      // Draw bars
      data.forEach((item, index) => {
        const barHeight = (item.count / maxCount) * chartHeight
        const x = margin.left + (index * (barWidth + barSpacing)) + barSpacing / 2
        const y = margin.top + chartHeight - barHeight
        
        // Bar
        ctx.fillStyle = colors[index % colors.length]
        ctx.fillRect(x, y, barWidth, barHeight)
        
        // Value label on top of bar
        ctx.fillStyle = '#374151'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.count, x + barWidth / 2, y - 5)
        
        // Store bar bounds for interaction
        if (!chart) chart = { bars: [] }
        if (!chart.bars) chart.bars = []
        chart.bars[index] = {
          x,
          y,
          width: barWidth,
          height: barHeight,
          data: item
        }
      })
      
      // Draw axes
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = 1
      
      // Y-axis
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
        const value = (maxCount / ySteps) * i
        const y = margin.top + chartHeight - (value / maxCount) * chartHeight
        
        ctx.fillText(Math.round(value), margin.left - 10, y + 4)
        
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
      
      // X-axis labels
      ctx.fillStyle = '#6B7280'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      
      data.forEach((item, index) => {
        const x = margin.left + (index * (barWidth + barSpacing)) + barSpacing / 2 + barWidth / 2
        const y = margin.top + chartHeight + 20
        
        // Truncate long labels
        let label = item.label
        if (label.length > 12) {
          label = label.substring(0, 10) + '...'
        }
        
        ctx.fillText(label, x, y)
        
        // Percentage below label
        ctx.fillStyle = '#9CA3AF'
        ctx.font = '10px Inter, sans-serif'
        ctx.fillText(`${item.percentage.toFixed(1)}%`, x, y + 15)
        ctx.fillStyle = '#6B7280'
        ctx.font = '11px Inter, sans-serif'
      })
      
      // Chart title
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Répartition des réponses`, margin.left, 15)
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
          label: hoveredBar.data.label,
          value: hoveredBar.data.count,
          percentage: hoveredBar.data.percentage.toFixed(1)
        }
        
        // Change cursor
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
    
    const toggleSort = () => {
      if (sortBy.value === 'count') {
        sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
      } else {
        sortBy.value = 'count'
        sortOrder.value = 'desc'
      }
    }
    
    const exportChart = () => {
      if (!chartCanvas.value) return
      
      const link = document.createElement('a')
      link.download = `bar_chart_${props.question.id}.png`
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
    watch(() => props.data, () => {
      nextTick(() => {
        drawChart()
      })
    }, { deep: true })
    
    watch(sortedData, () => {
      nextTick(() => {
        drawChart()
      })
    })
    
    return {
      chartCanvas,
      tooltipEl,
      showTable,
      tooltip,
      sortedData,
      handleMouseMove,
      hideTooltip,
      toggleSort,
      exportChart
    }
  }
}
</script>
