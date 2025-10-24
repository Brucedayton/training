<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? 'Edit Group' : 'Add Group'"
    width="60%"
    :before-close="handleClose"
    class="group-user-dialog"
  >
    <div class="dialog-content">
      <!-- Group Info Section -->
      <el-card class="group-info-card">
        <template #header>
          <div class="card-header">
            <span>Group Information</span>
          </div>
        </template>
        
        <el-form :model="groupForm" label-width="100px" :rules="groupRules" ref="groupFormRef">
          <el-form-item label="Group Name" prop="name">
            <el-input v-model="groupForm.name" placeholder="Enter group name" />
          </el-form-item>
          <el-form-item label="Description" prop="description">
            <el-input 
              v-model="groupForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="Enter group description"
            />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- User Management Section -->
      <el-card class="user-mgmt-card">
        <template #header>
          <div class="card-header">
            <span>User Management</span>
          </div>
        </template>

        <div class="user-mgmt-content">
          <!-- Search and Add -->
          <div class="search-section">
            <el-select
              v-model="selectedUserToAdd"
              filterable
              clearable
              placeholder="Search and select users to add"
              style="width: 100%"
              @change="addUser"
            >
              <el-option
                v-for="user in availableUsers"
                :key="user.id"
                :label="`${user.name} (${user.email})`"
                :value="user.id"
              />
            </el-select>
          </div>

          <!-- Group Members -->
          <div class="members-section">
            <h4>Group Members ({{ groupForm.members.length }})</h4>
            <el-table
              :data="paginatedMembers"
              style="width: 100%"
              max-height="300"
            >
              <el-table-column prop="name" label="Name" min-width="150" />
              <el-table-column prop="email" label="Email" min-width="200" />
              <el-table-column prop="role" label="Role" width="120" />
              <el-table-column label="Actions" width="100">
                <template #default="scope">
                  <el-button type="danger" text @click="removeMember(scope.$index)">
                    Remove
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 20]"
                :total="groupForm.members.length"
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="confirmSave" :loading="saving">
          {{ isEdit ? 'Update Group' : 'Create Group' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'GroupUserDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    groupData: {
      type: Object,
      default: () => ({})
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'group-saved'],
  setup(props, { emit }) {
    const groupFormRef = ref()
    const saving = ref(false)
    
    // Form data
    const groupForm = reactive({
      name: '',
      description: '',
      members: []
    })
    
    // Form validation rules
    const groupRules = {
      name: [
        { required: true, message: 'Please enter group name', trigger: 'blur' },
        { min: 2, max: 50, message: 'Length should be 2 to 50', trigger: 'blur' }
      ],
      description: [
        { max: 200, message: 'Description should not exceed 200 characters', trigger: 'blur' }
      ]
    }
    
    // User management
    const selectedUserToAdd = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // Mock user data
    const allUsers = ref([
      { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'Developer', department: 'engineering' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'Senior Developer', department: 'engineering' },
      { id: 3, name: 'Mike Wilson', email: 'mike.wilson@example.com', role: 'Team Lead', department: 'engineering' },
      { id: 4, name: 'Lisa Brown', email: 'lisa.brown@example.com', role: 'QA Engineer', department: 'qa' },
      { id: 5, name: 'David Lee', email: 'david.lee@example.com', role: 'Developer', department: 'engineering' },
      { id: 6, name: 'Emma Davis', email: 'emma.davis@example.com', role: 'Designer', department: 'design' },
      { id: 7, name: 'Robert Taylor', email: 'robert.taylor@example.com', role: 'Manager', department: 'management' },
      { id: 8, name: 'Jennifer White', email: 'jennifer.white@example.com', role: 'QA Lead', department: 'qa' },
      { id: 9, name: 'Alex Chen', email: 'alex.chen@example.com', role: 'Developer', department: 'engineering' },
      { id: 10, name: 'Maria Garcia', email: 'maria.garcia@example.com', role: 'Designer', department: 'design' }
    ])
    
    // Computed properties
    const availableUsers = computed(() => {
      return allUsers.value.filter(user => 
        !groupForm.members.some(member => member.id === user.id)
      )
    })
    
    const paginatedMembers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return groupForm.members.slice(start, end)
    })
    
    // Methods
    const addUser = (userId) => {
      if (!userId) return
      
      const user = allUsers.value.find(u => u.id === userId)
      if (user) {
        groupForm.members.push(user)
        selectedUserToAdd.value = null
        ElMessage.success(`Added ${user.name} to group`)
      }
    }
    
    const removeMember = (index) => {
      const actualIndex = (currentPage.value - 1) * pageSize.value + index
      groupForm.members.splice(actualIndex, 1)
      ElMessage.success('Member removed from group')
      
      // Adjust page if needed
      const totalPages = Math.ceil(groupForm.members.length / pageSize.value)
      if (currentPage.value > totalPages && totalPages > 0) {
        currentPage.value = totalPages
      }
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
    }
    
    const confirmSave = async () => {
      try {
        await groupFormRef.value.validate()
        saving.value = true
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const groupData = {
          ...groupForm,
          memberCount: groupForm.members.length,
          createdTime: props.isEdit ? props.groupData.createdTime : new Date().toISOString().split('T')[0]
        }
        
        emit('group-saved', groupData)
        ElMessage.success(props.isEdit ? 'Group updated successfully' : 'Group created successfully')
        handleClose()
      } catch (error) {
        console.error('Validation failed:', error)
      } finally {
        saving.value = false
      }
    }
    
    const handleClose = () => {
      emit('update:visible', false)
      // Reset form
      Object.assign(groupForm, {
        name: '',
        description: '',
        members: []
      })
      selectedUserToAdd.value = null
      currentPage.value = 1
    }
    
    // Watch for group data changes
    watch(() => props.groupData, (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        Object.assign(groupForm, {
          name: newData.name || '',
          description: newData.description || '',
          members: newData.members || []
        })
      }
    }, { immediate: true })
    
    return {
      groupFormRef,
      saving,
      groupForm,
      groupRules,
      selectedUserToAdd,
      currentPage,
      pageSize,
      availableUsers,
      paginatedMembers,
      addUser,
      removeMember,
      handleSizeChange,
      handleCurrentChange,
      confirmSave,
      handleClose
    }
  }
}
</script>

<style scoped>
.group-user-dialog {
  max-height: 90vh;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group-info-card {
  flex: 0 0 auto;
}

.user-mgmt-card {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.user-mgmt-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.members-section {
  flex: 1;
}

.members-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  border: 1px solid #ebeef5;
}

:deep(.el-table__body-wrapper) {
  max-height: 250px;
  overflow-y: auto;
}
</style>
