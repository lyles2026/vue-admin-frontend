<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getOrderStats } from '@/api/order'

const chartRef = ref(null)
const timeRange = ref('week')

const orderStats = ref([])
const topStats = ref([])
const chartData = ref({ days: [], orderData: [], amountData: [] })
let chartInstance = null

const fetchStats = async () => {
    try {
        const res = await getOrderStats()
        topStats.value = res.data.data.topStats
        orderStats.value = res.data.data.orderStats
        chartData.value = res.data.data.chart
        updateChart()
    } catch (err) {
        console.error('获取统计数据失败:', err)
    }
}

onMounted(async () => {
    await fetchStats()
    await nextTick()
    initChart()
})

const initChart = () => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    updateChart()
}

const updateChart = () => {
    if (!chartInstance) return
    chartInstance.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['订单量', '销售额'] },
        xAxis: {
            type: 'category',
            data: chartData.value.days
        },
        yAxis: [
            { type: 'value', name: '订单量' },
            { type: 'value', name: '销售额', splitLine: { show: false } }
        ],
        series: [
            {
                name: '订单量',
                type: 'bar',
                data: chartData.value.orderData,
                itemStyle: { color: '#409eff' }
            },
            {
                name: '销售额',
                type: 'line',
                data: chartData.value.amountData,
                itemStyle: { color: '#67c23a' }
            }
        ]
    }, true)
}

const handleTimeChange = (val) => {
    timeRange.value = val
    fetchStats()
}
</script>


<template>
    <div class="page-container">
        <!-- 顶部统计卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :span="6" v-for="item in topStats" :key="item.title">
                <el-card class="stat-card" shadow="hover">
                    <div class="stat-content">
                        <div class="stat-title">{{ item.title }}</div>
                        <div class="stat-value">{{ item.value }}{{ item.unit }}</div>
                        <div class="stat-sub">
                            <span>{{ item.subTitle }}</span>
                            <span :style="{ color: item.subValue.startsWith('+') ? '#67c23a' : '#f56c6c' }">
                                {{ item.subValue }}
                            </span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 订单状态卡片 -->
        <el-card class="status-card" shadow="never">
            <template #header>
                <span>订单状态分布</span>
            </template>
            <el-row :gutter="20">
                <el-col :span="4" v-for="item in orderStats" :key="item.label">
                    <div class="status-box">
                        <div class="status-num">{{ item.value }}</div>
                        <div class="status-label">{{ item.label }}</div>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 图表 -->
        <el-card class="chart-card" shadow="never">
            <template #header>
                <div class="chart-header">
                    <span>订单数据统计</span>
                    <el-radio-group v-model="timeRange" @change="handleTimeChange">
                        <el-radio-button label="year">近一年</el-radio-button>
                        <el-radio-button label="month">近一月</el-radio-button>
                        <el-radio-button label="week">近一周</el-radio-button>
                        <el-radio-button label="day">近24小时</el-radio-button>
                    </el-radio-group>
                </div>
            </template>
            <div ref="chartRef" class="chart"></div>
        </el-card>
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
}

.stats-row {
    margin-bottom: 20px;
}

.stat-card {
    text-align: center;
}

.stat-content {
    padding: 10px 0;
}

.stat-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
}

.stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 8px;
}

.stat-sub {
    font-size: 12px;
    color: #909399;
}

.status-card {
    margin-bottom: 20px;
}

.status-box {
    text-align: center;
    padding: 15px 0;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
}

.status-box:hover {
    background-color: #f5f7fa;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-num {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 5px;
}

.status-label {
    font-size: 14px;
    color: #909399;
}

.chart-card {
    margin-bottom: 20px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart {
    height: 350px;
}
</style>