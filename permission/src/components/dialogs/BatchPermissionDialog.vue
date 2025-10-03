<template>
  <el-dialog
    :model-value="dialogVisible"
    @update:model-value="$emit('update:visible', $event)"
    title="Batch Grant Permission"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="Target Group">
        <el-input v-model="selectedGroup.name" readonly />
      </el-form-item>
      <el-form-item label="Item">
        <el-input v-model="form.itemName" readonly />
      </el-form-item>
      <el-form-item label="Item Type">
        <el-tag :type="form.itemType === 'folder' ? 'warning' : 'info'">
          {{ form.itemType === 'folder' ? 'Folder' : 'File' }}
        </el-tag>
      </el-form-item>
      <el-form-item label="Permission Role" prop="permissionRole">
        <el-select v-model="form.permissionRole" placeholder="Select permission role">
          <el-option label="Owner" value="owner" />
          <el-option label="Editor" value="editor" />
          <el-option label="Viewer" value="viewer" />
        </el-select>
      </el-form-item>
      <el-form-item label="Expiration Date" prop="expirationDate">
        <el-date-picker
          v-model="form.expirationDate"
          type="datetime"
          placeholder="Select expiration date and time"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item v-if="form.itemType === 'folder'" label="Inheritance">
        <el-checkbox v-model="form.inheritToSubItems">
          Apply permission to all files and subfolders within this folder
        </el-checkbox>
      </el-form-item>
      <el-form-item label="Remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="Enter permission remark"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedGroup: {
    type: Object,
    default: () => ({})
  },
  batchForm: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'batch-permission-granted'])

const formRef = ref()

const form = reactive({
  itemName: '',
  itemPath: '',
  itemType: '',
  permissionRole: '',
  expirationDate: '',
  inheritToSubItems: false,
  remark: ''
})

const rules = {
  permissionRole: [
    { required: true, message: 'Please select permission role', trigger: 'change' }
  ],
  expirationDate: [
    { required: true, message: 'Please select expiration date', trigger: 'change' }
  ]
}

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

watch(() => props.batchForm, (newForm) => {
  if (newForm) {
    Object.assign(form, newForm)
  }
}, { deep: true, immediate: true })

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const groupMembers = props.selectedGroup.members || []
    const permissions = groupMembers.map(memberId => ({
      id: Date.now() + Math.random(),
      fileName: form.itemName,
      filePath: form.itemPath,
      itemType: form.itemType,
      permissionRole: form.permissionRole,
      grantTime: new Date().toLocaleString(),
      expireTime: form.expirationDate,
      status: 'active'
    }))
    
    emit('batch-permission-granted', permissions)
    handleClose()
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const resetForm = () => {
  Object.assign(form, {
    itemName: '',
    itemPath: '',
    itemType: '',
    permissionRole: '',
    expirationDate: '',
    inheritToSubItems: false,
    remark: ''
  })
  if (formRef.value) {
    formRef.value.resetFields()
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
