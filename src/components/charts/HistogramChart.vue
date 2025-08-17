<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">{{ question.label }}</h3>
      <div class="flex space-x-2">
        <select 
          v-model="binCount" 
          @change="updateChart"
          class="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option :value="5">5 barres</option>
          <option :value="10">10 barres</option>
          <option :value="15">15 barres</option>
          <option :value="20">20 barres</option>
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
        class="w-full h-80"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      ></canvas>
      
      <!-- Tooltip -->
      <div 
        v-if="tooltip.show"
        class="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none z-10"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="font-medium">{{ tooltip.range }}</div>
        <div class="text-gray-300">{{ tooltip.count }} valeurs</div>
      </div>
    </div>
    
    <!-- Statistics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="font-semibold text-primary-600">{{ formatValue(data?.min) }}</div>
        <div class="text-gray-600">Minimum</div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="font-semibold text-accent-600">{{ formatValue(data?.max) }}</div>
        <div class="text-gray-600">Maximum</div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="font-semibold text-green-600">{{ formatValue(data?.mean) }}</div>
        <div class="text-gray-600">Moyenne</div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="font-semibold text-yellow-600">{{ formatValue(data?.median) }}</div>
        <div class="text-gray-600">Médiane</div>
      </div>
    </div>
    
    <!-- Additional Stats -->
    <div class="flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-200">
      <div>
        Valeurs: {{ data?.total || 0 }}
      </div>
      <div>
        Écart-type: {{ standardDeviation.toFixed(2) }}
      </div>
      <div>
        Plage: {{ formatValue(data?.max - data?.min) }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

export default {
  name: 'HistogramChart',
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
    const binCount = ref(10)
    
    let chart = null
    let animationFrame = null
    
    const tooltip = ref({
      show: false,
      x: 0,
      y: 0,
      range: '',
      count: 0
    })
    
    const numericValues = computed(() => {
      return props.responses
        .map(response => response[props.question.id])
        .filter(value => value !== null && value !== undefined)
        .map(value => typeof value === 'object' ? value.value : parseFloat(value))
        .filter(value => !isNaN(value))
    })
    
    const standardDeviation = computed(() => {
      if (!props.data || props.data.mean === undefined || numericValues.value.length === 0) return 0
      
      const mean = props.data.mean
      const squaredDiffs = numericValues.value.map(value => Math.pow(value - mean, 2))
      const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numericValues.value.length
      
      return Math.sqrt(avgSquaredDiff)
    })
    
    const histogram = computed(() => {
      if (!props.data || numericValues.value.length === 0) return []
      
      const min = props.data.min
      const max = props.data.max
      const binWidth = (max - min) / binCount.value
      
      const bins = Array(binCount.value).fill(0).map((_, i) => ({
        min: min + i * binWidth,
        max: min + (i + 1) * binWidth,
        count: 0
      }))
      
      // Count values in each bin
      numericValues.value.forEach(value => {
        let binIndex = Math.floor((value - min) / binWidth)
        if (binIndex >= binCount.value) binIndex = binCount.value - 1
        if (binIndex < 0) binIndex = 0
        bins[binIndex].count++
      })
      
      return bins
    })
    
    const drawChart = () => {
      if (!chartCanvas.value || histogram.value.length === 0) return
      
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
      const margin = { top: 20, right: 20, bottom: 60, left: 60 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom
      
      const data = histogram.value
      const maxCount = Math.max(...data.map(d => d.count))
      
      if (maxCount === 0) return
      
      const barWidth = chartWidth / data.length
      
      // Store chart data for interaction
      chart = { bars: [] }
      
      // Draw bars
      data.forEach((bin, index) => {
        const barHeight = (bin.count / maxCount) * chartHeight
        const x = margin.left + index * barWidth
        const y = margin.top + chartHeight - barHeight
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, '#3B82F6')
        gradient.addColorStop(1, '#1E40AF')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight)
        
        // Bar border
        ctx.strokeStyle = '#1E40AF'
        ctx.lineWidth = 1
        ctx.strokeRect(x + 2, y, barWidth - 4, barHeight)
        
        // Value label on top of bar
        if (bin.count > 0) {
          ctx.fillStyle = '#374151'
          ctx.font = '11px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(bin.count, x + barWidth / 2, y - 5)
        }
        
        // Store bar bounds for interaction
        chart.bars[index] = {
          x: x + 2,
          y,
          width: barWidth - 4,
          height: barHeight,
          data: bin
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
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      
      data.forEach((bin, index) => {
        const x = margin.left + index * barWidth + barWidth / 2
        const y = margin.top + chartHeight + 15
        
        const label = formatValue(bin.min)
        ctx.fillText(label, x, y)
      })
      
      // Add final tick
      const lastX = margin.left + data.length * barWidth
      const lastY = margin.top + chartHeight + 15
      ctx.fillText(formatValue(data[data.length - 1].max), lastX, lastY)
      
      // Chart title and axis labels
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 12px Inter, sans-serif'
      ctx.textAlign = 'center'
      
      // Y-axis label
      ctx.save()
      ctx.translate(15, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Fréquence', 0, 0)
      ctx.restore()
      
      // X-axis label
      ctx.fillText('Valeurs', width / 2, height - 10)
      
      // Mean and median lines
      if (props.data?.mean !== undefined) {
        const meanX = margin.left + ((props.data.mean - props.data.min) / (props.data.max - props.data.min)) * chartWidth
        
        // Mean line
        ctx.strokeStyle = '#EF4444'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(meanX, margin.top)
        ctx.lineTo(meanX, margin.top + chartHeight)
        ctx.stroke()
        
        // Mean label
        ctx.fillStyle = '#EF4444'
        ctx.font = '10px Inter, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`Moyenne: ${formatValue(props.data.mean)}`, meanX + 5, margin.top + 15)
      }
      
      if (props.data?.median !== undefined) {
        const medianX = margin.left + ((props.data.median - props.data.min) / (props.data.max - props.data.min)) * chartWidth
        
        // Median line
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 2
        ctx.setLineDash([10, 5])
        ctx.beginPath()
        ctx.moveTo(medianX, margin.top)
        ctx.lineTo(medianX, margin.top + chartHeight)
        ctx.stroke()
        
        // Median label
        ctx.fillStyle = '#10B981'
        ctx.font = '10px Inter, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`Médiane: ${formatValue(props.data.median)}`, medianX + 5, margin.top + 35)
      }
      
      ctx.setLineDash([])
    }
    
    const formatValue = (value) => {
      if (value === null || value === undefined) return 'N/A'
      
      if (props.question.format === 'currency') {
        return `${value.toFixed(2)} €`
      } else if (props.question.format === 'count') {
        return Math.round(value).toString()
      } else {
        return value.toFixed(2)
      }
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
          range: `${formatValue(hoveredBar.data.min)} - ${formatValue(hoveredBar.data.max)}`,
          count: hoveredBar.data.count
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
      link.download = `histogram_${props.question.id}.png`
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
    
    watch(histogram, () => {
      nextTick(() => {
        drawChart()
      })
    })
    
    return {
      chartCanvas,
      binCount,
      tooltip,
      standardDeviation,
      formatValue,
      handleMouseMove,
      hideTooltip,
      updateChart,
      exportChart
    }
  }
}
</script>
