<script setup>

defineEmits(['selection-change'])

defineProps({
    goodsList: Array
})
</script>

<template>
    <el-table :data="goodsList" stripe v-loading="false" @selection-change="$emit('selection-change', $event)">
        <el-table-column type="selection" width="55" />
        <slot name="columns"></slot>
    </el-table>

</template>