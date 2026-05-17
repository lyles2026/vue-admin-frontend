<template>
    <div class="not-found">
      <el-empty description="404 页面不存在" :image-size="200">
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </el-empty>
    </div>
</template>

<style scoped>
.not-found {
    padding-top: 100px;
    text-align: center;
}
</style>
