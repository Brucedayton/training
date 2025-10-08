<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Permission Management Center"
    width="95%"
    :before-close="handleClose"
    class="permission-center-dialog"
    top="2vh"
  >
    <div class="permission-center-container">
      <!-- Navigation Tabs -->
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="Dashboard" name="dashboard">
          <DashboardTab />
        </el-tab-pane>
        
        <el-tab-pane label="Permission Request" name="apply">
          <ApplyTab />
        </el-tab-pane>
        
        <el-tab-pane label="Approval Management" name="approve">
          <ApproveTab />
        </el-tab-pane>
        
        <el-tab-pane label="Authorization Management" name="authorize">
          <AuthorizeTab />
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import DashboardTab from './tabs/DashboardTab.vue'
import ApplyTab from './tabs/ApplyTab.vue'
import ApproveTab from './tabs/ApproveTab.vue'
import AuthorizeTab from './tabs/AuthorizeTab.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const activeTab = ref('dashboard')

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.permission-center-dialog {
  max-height: 95vh;
}

.permission-center-container {
  height: 80vh;
  overflow-y: auto;
}

.main-tabs {
  height: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-tabs__content) {
  height: calc(100% - 50px);
  overflow-y: auto;
}
</style>