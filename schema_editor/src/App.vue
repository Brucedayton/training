<template>
  <div class="app">
    <el-button type="primary" @click="showDialog">Open Schema Editor</el-button>
    <schema-dialog
      v-model="dialogVisible"
      :initial-data="schemaData"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SchemaDialog from './components/SchemaDialog.vue'

const dialogVisible = ref(false)
const schemaData = ref([])

const showDialog = () => {
  dialogVisible.value = true
}

const handleSave = (data) => {
  console.log('Saved data:', data)
  schemaData.value = data
}
</script>

<style>
.app {
  padding: 20px;
}
</style> 