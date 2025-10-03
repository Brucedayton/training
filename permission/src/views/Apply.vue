<template>
  <div class="apply-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="file-tree-card">
          <template #header>
            <div class="card-header">
              <span>File Tree</span>
            </div>
          </template>
          <FileTree @apply-permission="handleApplyPermission" />
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="application-card">
          <template #header>
            <div class="card-header">
              <span>Permission Request</span>
            </div>
          </template>
          
          <el-form
            :model="applicationForm"
            :rules="rules"
            ref="formRef"
            label-width="120px"
            class="application-form"
          >
            <el-form-item label="Target Item" prop="itemName">
              <el-input v-model="applicationForm.itemName" readonly />
            </el-form-item>
            
            <el-form-item label="Item Path" prop="itemPath">
              <el-input v-model="applicationForm.itemPath" readonly />
            </el-form-item>
            
            <el-form-item label="Item Type" prop="itemType">
              <el-tag :type="applicationForm.itemType === 'folder' ? 'warning' : 'info'">
                {{ applicationForm.itemType === 'folder' ? 'Folder' : 'File' }}
              </el-tag>
            </el-form-item>
            
            <el-form-item label="Permission Role" prop="permissionRole">
              <el-select v-model="applicationForm.permissionRole" placeholder="Select permission role">
                <el-option label="Owner" value="owner" />
                <el-option label="Editor" value="editor" />
                <el-option label="Viewer" value="viewer" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="Role Assignment" prop="roleId">
              <el-select v-model="applicationForm.roleId" placeholder="Select role" style="width: 200px;">
                <el-option
                  v-for="role in availableRoles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
              <el-tooltip content="Click to view role permissions" placement="top">
                <el-icon class="role-help-icon" @click="showRolePermissions(applicationForm.roleId)">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
            
            <el-form-item label="Request Reason" prop="reason">
              <el-input
                v-model="applicationForm.reason"
                type="textarea"
                :rows="4"
                placeholder="Please provide detailed reason for the permission request"
              />
            </el-form-item>
            
            
            <el-form-item label="Expiration Date" prop="expirationDate">
              <el-date-picker
                v-model="applicationForm.expirationDate"
                type="datetime"
                placeholder="Select expiration date and time"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item v-if="applicationForm.itemType === 'folder'" label="Inheritance">
              <el-checkbox v-model="applicationForm.inheritToSubItems">
                Apply permission to all files and subfolders within this folder
              </el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitApplication" :loading="submitting">
                Submit Request
              </el-button>
              <el-button @click="resetForm">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="my-applications-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>My Application Records</span>
            </div>
          </template>
          
          <el-table :data="myApplications" style="width: 100%">
            <el-table-column prop="itemName" label="Item Name" width="200" />
            <el-table-column prop="itemType" label="Type" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.itemType === 'folder' ? 'warning' : 'info'" size="small">
                  {{ scope.row.itemType === 'folder' ? 'Folder' : 'File' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="permissionRole" label="Permission Role" width="120">
              <template #default="scope">
                <el-tag :type="getPermissionRoleTag(scope.row.permissionRole)">
                  {{ getPermissionRoleText(scope.row.permissionRole) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="roleName" label="Role" width="120" />
            <el-table-column prop="status" label="Status" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="Request Time" width="150" />
            <el-table-column label="Actions" width="120">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === 'pending'"
                  type="danger"
                  size="small"
                  @click="cancelApplication(scope.row)"
                >
                  Cancel
                </el-button>
                <el-button
                  v-else
                  type="primary"
                  size="small"
                  @click="viewDetails(scope.row)"
                >
                  View
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- Role Permissions Dialog -->
    <el-dialog
      v-model="rolePermissionsDialogVisible"
      title="Role Permissions"
      width="600px"
    >
      <div v-if="selectedRole">
        <h4>{{ selectedRole.name }}</h4>
        <p>{{ selectedRole.description }}</p>
        
        <el-divider />
        
        <h5>Permissions:</h5>
        <el-table :data="selectedRole.permissions" style="width: 100%">
          <el-table-column prop="resource" label="Resource" width="200" />
          <el-table-column prop="action" label="Action" width="150" />
          <el-table-column prop="description" label="Description" />
        </el-table>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rolePermissionsDialogVisible = false">Close</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileTree from '../components/FileTree.vue'

const formRef = ref()
const submitting = ref(false)
const rolePermissionsDialogVisible = ref(false)
const selectedRole = ref(null)

const applicationForm = reactive({
  itemName: '',
  itemPath: '',
  itemType: '',
  permissionRole: '',
  roleId: '',
  reason: '',
  expirationDate: '',
  inheritToSubItems: false
})

const rules = {
  permissionRole: [
    { required: true, message: 'Please select permission role', trigger: 'change' }
  ],
  roleId: [
    { required: true, message: 'Please select a role', trigger: 'change' }
  ],
  reason: [
    { required: true, message: 'Please provide request reason', trigger: 'blur' },
    { min: 10, message: 'Reason must be at least 10 characters', trigger: 'blur' }
  ],
  expirationDate: [
    { required: true, message: 'Please select expiration date', trigger: 'change' }
  ]
}

const availableRoles = ref([
  {
    id: 1,
    name: 'Developer',
    description: 'Standard development role with read/write access to project files',
    permissions: [
      { resource: 'Project Files', action: 'Read/Write', description: 'Access to project documentation and code' },
      { resource: 'Configuration', action: 'Read', description: 'View configuration files' },
      { resource: 'Logs', action: 'Read', description: 'View system logs' }
    ]
  },
  {
    id: 2,
    name: 'Tester',
    description: 'Testing role with read access to test files and write access to test results',
    permissions: [
      { resource: 'Test Files', action: 'Read/Write', description: 'Access to test cases and results' },
      { resource: 'Test Data', action: 'Read', description: 'View test data files' },
      { resource: 'Reports', action: 'Write', description: 'Create test reports' }
    ]
  },
  {
    id: 3,
    name: 'Manager',
    description: 'Management role with broad access to project resources',
    permissions: [
      { resource: 'All Files', action: 'Read', description: 'View all project files' },
      { resource: 'Reports', action: 'Read/Write', description: 'Access to all reports' },
      { resource: 'Configuration', action: 'Read/Write', description: 'Modify system configuration' }
    ]
  }
])

const myApplications = ref([
  {
    id: 1,
    itemName: 'Product Requirements.pdf',
    itemType: 'file',
    permissionRole: 'viewer',
    roleName: 'Developer',
    status: 'pending',
    createTime: '2024-01-15 14:30',
    reason: 'Need to access the latest product requirements for development work'
  },
  {
    id: 2,
    itemName: 'UI Design Files',
    itemType: 'folder',
    permissionRole: 'editor',
    roleName: 'Developer',
    status: 'approved',
    createTime: '2024-01-14 10:20',
    reason: 'Need to update UI design files'
  },
  {
    id: 3,
    itemName: 'server.js',
    itemType: 'file',
    permissionRole: 'owner',
    roleName: 'Developer',
    status: 'rejected',
    createTime: '2024-01-13 16:45',
    reason: 'Need to execute server scripts'
  }
])

const handleApplyPermission = (itemData) => {
  applicationForm.itemName = itemData.label
  applicationForm.itemPath = itemData.path
  applicationForm.itemType = itemData.type
}

const showRolePermissions = (roleId) => {
  if (!roleId) {
    ElMessage.warning('Please select a role first')
    return
  }
  
  selectedRole.value = availableRoles.value.find(role => role.id === roleId)
  if (selectedRole.value) {
    rolePermissionsDialogVisible.value = true
  }
}

const submitApplication = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add to application records
    const selectedRoleData = availableRoles.value.find(role => role.id === applicationForm.roleId)
    const newApplication = {
      id: Date.now(),
      itemName: applicationForm.itemName,
      itemType: applicationForm.itemType,
      permissionRole: applicationForm.permissionRole,
      roleName: selectedRoleData ? selectedRoleData.name : '',
      status: 'pending',
      createTime: new Date().toLocaleString(),
      reason: applicationForm.reason
    }
    
    myApplications.value.unshift(newApplication)
    
    ElMessage.success('Application submitted successfully!')
    resetForm()
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  applicationForm.itemName = ''
  applicationForm.itemPath = ''
  applicationForm.itemType = ''
  applicationForm.inheritToSubItems = false
}

const cancelApplication = async (application) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to cancel this application?', 'Confirm Cancel', {
      type: 'warning'
    })
    
    const index = myApplications.value.findIndex(app => app.id === application.id)
    if (index > -1) {
      myApplications.value[index].status = 'cancelled'
    }
    
    ElMessage.success('Application cancelled')
  } catch {
    // User cancelled
  }
}

const viewDetails = (application) => {
  ElMessageBox.alert(application.reason, 'Application Details', {
    confirmButtonText: 'OK'
  })
}

// Helper functions
const getPermissionRoleTag = (role) => {
  const tagMap = {
    owner: 'danger',
    editor: 'warning',
    viewer: 'info'
  }
  return tagMap[role] || 'info'
}

const getPermissionRoleText = (role) => {
  const textMap = {
    owner: 'Owner',
    editor: 'Editor',
    viewer: 'Viewer'
  }
  return textMap[role] || role
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
  }
  return textMap[status] || status
}

</script>

<style scoped>
.apply-container {
  height: 100%;
}

.file-tree-card,
.application-card {
  height: 600px;
}

.my-applications-card {
  height: 400px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.application-form {
  padding: 20px;
}

.role-help-icon {
  margin-left: 8px;
  cursor: pointer;
  color: #409EFF;
  font-size: 16px;
}

.role-help-icon:hover {
  color: #66b1ff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow-y: auto;
}
</style>