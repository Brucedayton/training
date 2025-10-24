<template>
  <el-dialog
    :model-value="visible"
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

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import FileTree from '../FileTree.vue'

export default {
  name: 'FileTreeDialog',
  components: { FileTree },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'file-selected'],
  setup(props, { emit }) {
    const selectedFile = ref(null)

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
      emit('update:visible', false)
      selectedFile.value = null
    }

    return { selectedFile, handleFileSelected, handleConfirm, handleClose }
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>