<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Add User"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="Username" prop="name">
        <el-input v-model="form.name" placeholder="Enter username" />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" placeholder="Enter email" />
      </el-form-item>
      <el-form-item label="Role" prop="role">
        <el-select v-model="form.role" placeholder="Select role">
          <el-option label="Regular User" value="user" />
          <el-option label="Administrator" value="admin" />
          <el-option label="Approver" value="approver" />
        </el-select>
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="active">Active</el-radio>
          <el-radio label="disabled">Disabled</el-radio>
        </el-radio-group>
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'user-added'])

const formRef = ref()

const form = reactive({
  name: '',
  email: '',
  role: '',
  status: 'active'
})

const rules = {
  name: [
    { required: true, message: 'Please enter username', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email format', trigger: 'blur' }
  ],
  role: [
    { required: true, message: 'Please select role', trigger: 'change' }
  ]
}

const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const user = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      role: getRoleText(form.role),
      status: form.status
    }
    
    emit('user-added', user)
    handleClose()
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    email: '',
    role: '',
    status: 'active'
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const getRoleText = (role) => {
  const roleMap = {
    user: 'Regular User',
    admin: 'Administrator',
    approver: 'Approver'
  }
  return roleMap[role] || role
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>