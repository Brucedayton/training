<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Add Group"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="Group Name" prop="name">
        <el-input v-model="form.name" placeholder="Enter group name" />
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="Enter group description"
        />
      </el-form-item>
      <el-form-item label="Members" prop="members">
        <el-select
          v-model="form.members"
          multiple
          placeholder="Select group members"
          style="width: 100%"
        >
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
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

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AddGroupDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    users: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'group-added'],
  setup(props, { emit }) {
    const formRef = ref()
    const form = reactive({ name: '', description: '', members: [] })
    const rules = {
      name: [{ required: true, message: 'Please enter group name', trigger: 'blur' }],
      description: [{ required: true, message: 'Please enter group description', trigger: 'blur' }],
      members: [{ required: true, message: 'Please select group members', trigger: 'change' }]
    }

    const handleClose = () => {
      emit('update:visible', false)
      resetForm()
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      try {
        await formRef.value.validate()
        const group = {
          id: Date.now(),
          name: form.name,
          description: form.description,
          memberCount: form.members.length,
          members: form.members
        }
        emit('group-added', group)
        handleClose()
      } catch (error) {
        console.error('Form validation failed:', error)
      }
    }

    const resetForm = () => {
      Object.assign(form, { name: '', description: '', members: [] })
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }

    return { formRef, form, rules, handleClose, handleSubmit }
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