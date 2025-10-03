<template>
  <el-dialog
    :model-value="dialogVisible"
    @update:model-value="$emit('update:visible', $event)"
    title="Select File/Folder"
    width="600px"
    @close="handleClose"
  >
    <FileTree @apply-permission="handleFileSelected" />
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="!selectedFile">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import FileTree from '../FileTree.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'file-selected'])

const selectedFile = ref(null)

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const handleFileSelected = (fileData) => {
  selectedFile.value = fileData
}

const handleConfirm = () => {
  if (selectedFile.value) {
    emit('file-selected', selectedFile.value)
    handleClose()
  } else {
    ElMessage.warning('Please select a file or folder')
  }
}

const handleClose = () => {
  dialogVisible.value = false
  selectedFile.value = null
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
