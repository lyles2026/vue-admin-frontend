<script setup>

defineEmits(['selection-change'])

defineProps({
    goodsList: Array
})
</script>

<template>
    <el-table :data="goodsList" stripe v-loading="false" @selection-change="$emit('selection-change', $event)">
        <slot name="columns"></slot>
    </el-table>

</template>