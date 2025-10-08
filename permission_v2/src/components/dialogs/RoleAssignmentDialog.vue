<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Assign Role"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="Role" prop="roleId">
        <el-select v-model="form.roleId" placeholder="Select role">
          <el-option
            v-for="role in availableRoles"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="Enter assignment remark"
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  availableRoles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'role-assigned'])

const formRef = ref()

const form = reactive({
  roleId: '',
  remark: ''
})

const rules = {
  roleId: [
    { required: true, message: 'Please select a role', trigger: 'change' }
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
    
    const role = props.availableRoles.find(r => r.id === form.roleId)
    if (role) {
      const userRole = {
        id: Date.now(),
        roleName: role.name,
        description: role.description,
        assignTime: new Date().toLocaleString(),
        status: 'active'
      }
      
      emit('role-assigned', userRole)
      handleClose()
    }
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const resetForm = () => {
  Object.assign(form, {
    roleId: '',
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