<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getOrderStats } from '@/api/order'
import { getShop } from '@/api/shop'
import { getUserList } from '@/api/user'
import { User, ShoppingCart, Document, Picture, Bell, Ticket } from '@element-plus/icons-vue'

// 顶部统计卡片
const topStats = ref([])
const quickLinks = ref([
    { name: '用户', iconComponent: User, path: '/Users/user' },
    { name: '商品', iconComponent: ShoppingCart, path: '/Goods/shop' },
    { name: '订单', iconComponent: Document, path: '/Order/permissions' },
    { name: '图库', iconComponent: Picture, path: '/Notice/gallery' },
    { name: '公告', iconComponent: Bell, path: '/Notice/public' },
    { name: '优惠券', iconComponent: Ticket, path: '/Goods/coupon' }
])

const timeRange = ref('month')
const shopStats = ref([])
const tradeStats = ref([])
const chartRef = ref(null)
const router = useRouter()

const goToPage = (path) => { router.push(path) }

const fetchData = async () => {
    try {
        const [orderRes, shopRes, userRes] = await Promise.all([
            getOrderStats(),
            getShop(),
            getUserList()
        ])
        const { topStats: ts, orderStats, chart } = orderRes.data.data
        topStats.value = ts

        const goodsList = shopRes.data.data || []
        const userCount = userRes.data.data?.length || 0

        shopStats.value = [
            { value: goodsList.filter(g => g.status === '审核中').length, label: '审核中', path: '/Goods/shop' },
            { value: goodsList.filter(g => g.status === '销售中').length, label: '销售中', path: '/Goods/shop' },
            { value: goodsList.filter(g => g.status === '已下架').length, label: '已下架', path: '/Goods/shop' },
            { value: goodsList.filter(g => g.stock < 10).length, label: '库存预警', path: '/Goods/shop' },
        ]

        tradeStats.value = (orderStats || []).filter(o =>
            ['待付款', '待发货', '已发货', '已完成'].includes(o.label)
        ).map(o => ({ value: o.value, label: o.label }))

        // 更新顶部统计的用户数
        topStats.value[3].value = userCount
        topStats.value[3].subValue = userCount + '人'

        return chart
    } catch {
        return null
    }
}

const updateChart = (chartData) => {
    if (!chartRef.value) return
    const chart = echarts.init(chartRef.value)
    chart.setOption({
        xAxis: {
            type: 'category',
            data: chartData?.days || []
        },
        yAxis: { type: 'value' },
        series: [{
            data: chartData?.orderData || [],
            type: 'bar',
            itemStyle: { color: '#409EFF' }
        }]
    })
}

onMounted(async () => {
    const chart = await fetchData()
    await nextTick()
    if (chart) updateChart(chart)
})

const handleTimeChange = () => {
    fetchData().then(chart => { if (chart) updateChart(chart) })
}
</script>

<template>
    <div class="home-view">
        <!-- 顶部统计卡片 -->
        <el-row :gutter="20" class="top-stats">
            <el-col :span="6" v-for="stat in topStats" :key="stat.title">
                <el-card shadow="never" class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">{{ stat.title }}</span>
                        <el-tag size="small" effect="plain">{{ stat.tag }}</el-tag>
                    </div>
                    <div class="stat-value-large">{{ stat.value }}</div>
                    <div class="stat-footer">
                        <span class="stat-sub-title">{{ stat.subTitle }}</span>
                        <span class="stat-sub-value">{{ stat.subValue }}</span>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 快捷入口 -->
        <el-row :gutter="20" class="quick-links">
            <el-col :span="3" v-for="link in quickLinks" :key="link.name">
                <el-card shadow="hover" class="link-card" @click="router.push(link.path)">
                    <component :is="link.iconComponent" class="link-icon" :size="24" />
                    <span class="link-name">{{ link.name }}</span>
                </el-card>
            </el-col>
        </el-row>

        <!-- 中间区域：订单统计 + 右侧卡片 -->
        <el-row :gutter="20" class="main-content">
            <!-- 左侧：订单统计 -->
            <el-col :span="16">
                <el-card class="chart-card">
                    <template #header>
                        <div class="card-header">
                            <span>订单统计</span>
                            <el-radio-group v-model="timeRange" size="small" @change="handleTimeChange">
                                <el-radio-button label="month">近1个月</el-radio-button>
                                <el-radio-button label="week">近1周</el-radio-button>
                                <el-radio-button label="day">近24小时</el-radio-button>
                            </el-radio-group>
                        </div>
                    </template>
                    <!-- 图表容器 -->
                    <div ref="chartRef" class="chart"></div>
                </el-card>
            </el-col>

            <!-- 右侧：店铺及商品提示 -->
            <el-col :span="8">
                <el-card class="info-card">
                    <template #header>
                        <span>店铺及商品提示</span>
                    </template>
                    <el-row :gutter="10">
                        <el-col :span="6" v-for="item in shopStats" :key="item.label">
                            <div class="stat-box" @click="goToPage(item.path)">
                                <div class="stat-num">{{ item.value }}</div>
                                <div class="stat-label">{{ item.label }}</div>
                            </div>
                        </el-col>
                    </el-row>
                </el-card>

                <el-card class="info-card">
                    <template #header>
                        <span>交易提示</span>
                    </template>
                    <el-row :gutter="10">
                        <el-col :span="6" v-for="item in tradeStats" :key="item.label">
                            <div class="stat-box">
                                <div class="stat-num">{{ item.value }}</div>
                                <div class="stat-label">{{ item.label }}</div>
                            </div>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
.home-view {
    padding: 20px;
    min-height: calc(100vh - 140px);
    /* 减去 header 和 footer 的高度 */
}

/* 顶部统计卡片 */
.top-stats {
    margin-bottom: 20px;
}

.stat-card {
    transition: all 0.3s;
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.stat-title {
    font-size: 14px;
    color: #606266;
}

.stat-value-large {
    font-size: 32px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 15px;
}

.stat-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
}

.stat-sub-title {
    font-size: 12px;
    color: #909399;
}

.stat-sub-value {
    font-size: 12px;
    color: #606266;
}

/* 快捷入口 */
.quick-links {
    margin-bottom: 20px;
}

.link-card {
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    padding: 10px 0;
}

.link-card:hover {
    transform: translateY(-2px);
}

.link-icon {
    display: block;
    margin-bottom: 8px;
    color: #409EFF;
}

.link-name {
    font-size: 14px;
    color: #606266;
}

.main-content {
    margin-top: 20px;
}

.main-content>.el-col {
    display: flex;
    flex-direction: column;
}

.chart-card {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.chart-card :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart {
    flex: 1;
    min-height: 400px;
}

.info-card {
    margin-bottom: 20px;
    flex: 1;
}

.info-card:last-child {
    margin-bottom: 0;
}

.stat-box {
    text-align: center;
    padding: 20px 0;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
}

.stat-box:hover {
    background-color: #f5f7fa;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-num {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 12px;
    color: #909399;
}
</style>