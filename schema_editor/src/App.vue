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

<script>
import { ref, defineComponent } from 'vue'
import SchemaDialog from './components/SchemaDialog.vue'

export default defineComponent({
  name: 'App',
  components: {
    SchemaDialog
  },
  setup() {
    const dialogVisible = ref(false)
    const schemaData = ref([])

    const showDialog = () => {
      dialogVisible.value = true
    }

    const handleSave = (data) => {
      console.log('Saved data:', data)
      schemaData.value = data
    }

    return {
      dialogVisible,
      schemaData,
      showDialog,
      handleSave
    }
  }
})
</script>

<style>
.app {
  padding: 20px;
}
</style> 