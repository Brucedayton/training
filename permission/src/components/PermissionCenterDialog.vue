<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Permission Management Center"
    width="90%"
    :before-close="handleClose"
    class="permission-center-dialog"
  >
    <div class="permission-center-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="user-groups-card">
            <template #header>
              <div class="card-header">
                <span>User Groups</span>
                <el-button type="primary" size="small" @click="showAddGroupDialog">
                  Add Group
                </el-button>
              </div>
            </template>
            
            <el-input
              v-model="groupSearchKeyword"
              placeholder="Search groups"
              prefix-icon="Search"
              style="margin-bottom: 15px"
            />
            
            <div class="group-list">
              <div
                v-for="group in filteredGroups"
                :key="group.id"
                class="group-item"
                :class="{ active: selectedGroup && selectedGroup.id === group.id }"
                @click="selectGroup(group)"
              >
                <div class="group-info">
                  <div class="group-avatar">
                    <el-icon><UserFilled /></el-icon>
                  </div>
                  <div class="group-details">
                    <div class="group-name">{{ group.name }}</div>
                    <div class="group-members">{{ group.memberCount }} members</div>
                  </div>
                </div>
                <div class="group-actions">
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="editGroup(group)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="user-list-card">
            <template #header>
              <div class="card-header">
                <span>Users</span>
                <el-button type="primary" size="small" @click="showAddUserDialog">
                  Add User
                </el-button>
              </div>
            </template>
            
            <el-input
              v-model="userSearchKeyword"
              placeholder="Search users"
              prefix-icon="Search"
              style="margin-bottom: 15px"
            />
            
            <div class="user-list">
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="user-item"
                :class="{ active: selectedUser && selectedUser.id === user.id }"
                @click="selectUser(user)"
              >
                <div class="user-info">
                  <div class="user-avatar">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-role">{{ user.role }}</div>
                  </div>
                </div>
                <div class="user-status">
                  <el-tag :type="user.status === 'active' ? 'success' : 'danger'" size="small">
                    {{ user.status === 'active' ? 'Active' : 'Disabled' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="permission-card">
            <template #header>
              <div class="card-header">
                <span>Permission Management</span>
                <div v-if="selectedUser || selectedGroup" class="header-actions">
                  <el-button type="success" @click="grantPermission" :disabled="!selectedFile">
                    Grant Permission
                  </el-button>
                  <el-button type="danger" @click="revokePermission" :disabled="!selectedPermission">
                    Revoke
                  </el-button>
                  <el-button type="primary" @click="batchGrantPermission" v-if="selectedGroup">
                    Batch Grant
                  </el-button>
                </div>
              </div>
            </template>
            
            <div v-if="!selectedUser && !selectedGroup" class="no-selection">
              <el-empty description="Please select a user or group to manage permissions" />
            </div>
            
            <div v-else>
              <div class="selection-info-header">
                <h3 v-if="selectedUser">{{ selectedUser.name }}</h3>
                <h3 v-if="selectedGroup">{{ selectedGroup.name }}</h3>
                <p v-if="selectedUser">{{ selectedUser.email }} | {{ selectedUser.role }}</p>
                <p v-if="selectedGroup">{{ selectedGroup.description }}</p>
              </div>
              
              <el-tabs v-model="activeTab" class="permission-tabs">
                <el-tab-pane label="File Permissions" name="files">
                  <div class="file-permission-section">
                    <div class="section-header">
                      <h4>File Permission List</h4>
                      <el-button type="primary" size="small" @click="showFileTreeDialog">
                        Add File Permission
                      </el-button>
                    </div>
                    
                    <el-table :data="currentPermissions" style="width: 100%">
                      <el-table-column prop="fileName" label="File Name" width="200" />
                      <el-table-column prop="filePath" label="File Path" width="300" show-overflow-tooltip />
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
                      <el-table-column prop="grantTime" label="Grant Time" width="150" />
                      <el-table-column prop="expireTime" label="Expire Time" width="150" />
                      <el-table-column prop="status" label="Status" width="100">
                        <template #default="scope">
                          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                            {{ scope.row.status === 'active' ? 'Active' : 'Expired' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="Actions" width="120">
                        <template #default="scope">
                          <el-button
                            type="danger"
                            size="small"
                            @click="revokeUserPermission(scope.row)"
                          >
                            Revoke
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="Role Permissions" name="roles">
                  <div class="role-permission-section">
                    <div class="section-header">
                      <h4>Role Permissions</h4>
                      <el-button type="primary" size="small" @click="showRoleDialog">
                        Assign Role
                      </el-button>
                    </div>
                    
                    <el-table :data="currentRoles" style="width: 100%">
                      <el-table-column prop="roleName" label="Role Name" width="150" />
                      <el-table-column prop="description" label="Description" width="300" />
                      <el-table-column prop="assignTime" label="Assign Time" width="150" />
                      <el-table-column prop="status" label="Status" width="100">
                        <template #default="scope">
                          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                            {{ scope.row.status === 'active' ? 'Active' : 'Disabled' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="Actions" width="120">
                        <template #default="scope">
                          <el-button
                            type="danger"
                            size="small"
                            @click="removeUserRole(scope.row)"
                          >
                            Remove
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- Sub-dialogs -->
    <AddGroupDialog
      v-model:visible="addGroupDialogVisible"
      :users="users"
      @group-added="handleGroupAdded"
    />
    
    <AddUserDialog
      v-model:visible="addUserDialogVisible"
      @user-added="handleUserAdded"
    />
    
    <FileTreeDialog
      v-model:visible="fileTreeDialogVisible"
      @file-selected="handleFileSelected"
    />
    
    <PermissionGrantDialog
      v-model:visible="permissionDialogVisible"
      :permission-form="permissionForm"
      @permission-granted="handlePermissionGranted"
    />
    
    <BatchPermissionDialog
      v-model:visible="batchPermissionDialogVisible"
      :selected-group="selectedGroup"
      :batch-form="batchPermissionForm"
      @batch-permission-granted="handleBatchPermissionGranted"
    />
    
    <RoleAssignmentDialog
      v-model:visible="roleDialogVisible"
      :available-roles="availableRoles"
      @role-assigned="handleRoleAssigned"
    />
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AddGroupDialog from './dialogs/AddGroupDialog.vue'
import AddUserDialog from './dialogs/AddUserDialog.vue'
import FileTreeDialog from './dialogs/FileTreeDialog.vue'
import PermissionGrantDialog from './dialogs/PermissionGrantDialog.vue'
import BatchPermissionDialog from './dialogs/BatchPermissionDialog.vue'
import RoleAssignmentDialog from './dialogs/RoleAssignmentDialog.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const groupSearchKeyword = ref('')
const userSearchKeyword = ref('')
const selectedUser = ref(null)
const selectedGroup = ref(null)
const selectedFile = ref(null)
const selectedPermission = ref(null)
const activeTab = ref('files')

// Sub-dialog visibility
const addGroupDialogVisible = ref(false)
const addUserDialogVisible = ref(false)
const fileTreeDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const batchPermissionDialogVisible = ref(false)
const roleDialogVisible = ref(false)

const permissionForm = reactive({
  itemName: '',
  itemPath: '',
  itemType: '',
  permissionRole: '',
  expirationDate: '',
  inheritToSubItems: false,
  remark: ''
})

const batchPermissionForm = reactive({
  itemName: '',
  itemPath: '',
  itemType: '',
  permissionRole: '',
  expirationDate: '',
  inheritToSubItems: false,
  remark: ''
})

const userGroups = ref([
  {
    id: 1,
    name: 'Development Team',
    description: 'Software development team members',
    memberCount: 5,
    members: [1, 2, 3]
  },
  {
    id: 2,
    name: 'QA Team',
    description: 'Quality assurance team members',
    memberCount: 3,
    members: [4, 5, 6]
  },
  {
    id: 3,
    name: 'Management',
    description: 'Management and leadership team',
    memberCount: 2,
    members: [7, 8]
  }
])

const users = ref([
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Regular User',
    status: 'active'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Administrator',
    status: 'active'
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike.wilson@example.com',
    role: 'Approver',
    status: 'active'
  },
  {
    id: 4,
    name: 'Lisa Brown',
    email: 'lisa.brown@example.com',
    role: 'Regular User',
    status: 'active'
  },
  {
    id: 5,
    name: 'David Lee',
    email: 'david.lee@example.com',
    role: 'Regular User',
    status: 'active'
  },
  {
    id: 6,
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    role: 'Regular User',
    status: 'active'
  },
  {
    id: 7,
    name: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    role: 'Administrator',
    status: 'active'
  },
  {
    id: 8,
    name: 'Jennifer White',
    email: 'jennifer.white@example.com',
    role: 'Administrator',
    status: 'active'
  }
])

const userPermissions = ref([
  {
    id: 1,
    fileName: 'Product Requirements.pdf',
    filePath: '/Project Documents/Requirements/Product Requirements.pdf',
    itemType: 'file',
    permissionRole: 'viewer',
    grantTime: '2024-01-15 14:30',
    expireTime: '2024-01-22 14:30',
    status: 'active'
  },
  {
    id: 2,
    fileName: 'UI Design Files',
    filePath: '/Project Documents/Design/UI Design Files',
    itemType: 'folder',
    permissionRole: 'editor',
    grantTime: '2024-01-14 10:20',
    expireTime: '2024-02-14 10:20',
    status: 'active'
  }
])

const userRoles = ref([
  {
    id: 1,
    roleName: 'Regular User',
    description: 'Basic file access permissions',
    assignTime: '2024-01-15 14:30',
    status: 'active'
  }
])

const availableRoles = ref([
  {
    id: 1,
    name: 'Regular User',
    description: 'Basic file access permissions'
  },
  {
    id: 2,
    name: 'Administrator',
    description: 'Full system access'
  },
  {
    id: 3,
    name: 'Approver',
    description: 'Approval permissions'
  }
])

const filteredGroups = computed(() => {
  if (!groupSearchKeyword.value) {
    return userGroups.value
  }
  return userGroups.value.filter(group =>
    group.name.toLowerCase().includes(groupSearchKeyword.value.toLowerCase()) ||
    group.description.toLowerCase().includes(groupSearchKeyword.value.toLowerCase())
  )
})

const filteredUsers = computed(() => {
  if (!userSearchKeyword.value) {
    return users.value
  }
  return users.value.filter(user =>
    user.name.toLowerCase().includes(userSearchKeyword.value.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchKeyword.value.toLowerCase())
  )
})

const currentPermissions = computed(() => {
  if (selectedUser.value) {
    return userPermissions.value
  } else if (selectedGroup.value) {
    return userPermissions.value
  }
  return []
})

const currentRoles = computed(() => {
  if (selectedUser.value) {
    return userRoles.value
  } else if (selectedGroup.value) {
    return userRoles.value
  }
  return []
})

const selectGroup = (group) => {
  selectedGroup.value = group
  selectedUser.value = null
}

const selectUser = (user) => {
  selectedUser.value = user
  selectedGroup.value = null
}

const showAddGroupDialog = () => {
  addGroupDialogVisible.value = true
}

const editGroup = (group) => {
  ElMessage.info('Edit group functionality coming soon')
}

const showAddUserDialog = () => {
  addUserDialogVisible.value = true
}

const showFileTreeDialog = () => {
  fileTreeDialogVisible.value = true
}

const grantPermission = () => {
  if (!selectedFile.value) {
    ElMessage.warning('Please select a file or folder first')
    return
  }
  permissionDialogVisible.value = true
}

const batchGrantPermission = () => {
  if (!selectedFile.value) {
    ElMessage.warning('Please select a file or folder first')
    return
  }
  batchPermissionDialogVisible.value = true
}

const showRoleDialog = () => {
  roleDialogVisible.value = true
}

const revokeUserPermission = async (permission) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to revoke this permission?', 'Confirm Revoke', {
      type: 'warning'
    })
    
    const index = userPermissions.value.findIndex(p => p.id === permission.id)
    if (index > -1) {
      userPermissions.value.splice(index, 1)
    }
    
    ElMessage.success('Permission revoked')
  } catch {
    // User cancelled
  }
}

const removeUserRole = async (role) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to remove this role?', 'Confirm Remove', {
      type: 'warning'
    })
    
    const index = userRoles.value.findIndex(r => r.id === role.id)
    if (index > -1) {
      userRoles.value.splice(index, 1)
    }
    
    ElMessage.success('Role removed')
  } catch {
    // User cancelled
  }
}

const revokePermission = () => {
  ElMessage.info('Please select a permission to revoke')
}

const handleClose = () => {
  emit('update:visible', false)
}

// Event handlers
const handleGroupAdded = (group) => {
  userGroups.value.push(group)
  ElMessage.success('Group added successfully')
}

const handleUserAdded = (user) => {
  users.value.push(user)
  ElMessage.success('User added successfully')
}

const handleFileSelected = (fileData) => {
  selectedFile.value = fileData
  Object.assign(permissionForm, {
    itemName: fileData.label,
    itemPath: fileData.path,
    itemType: fileData.type
  })
  Object.assign(batchPermissionForm, {
    itemName: fileData.label,
    itemPath: fileData.path,
    itemType: fileData.type
  })
}

const handlePermissionGranted = (permission) => {
  userPermissions.value.push(permission)
  ElMessage.success('Permission granted successfully')
}

const handleBatchPermissionGranted = (permissions) => {
  userPermissions.value.push(...permissions)
  ElMessage.success(`Permission granted to ${permissions.length} group members successfully`)
}

const handleRoleAssigned = (role) => {
  userRoles.value.push(role)
  ElMessage.success('Role assigned successfully')
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
</script>

<style scoped>
.permission-center-dialog {
  max-height: 90vh;
}

.permission-center-container {
  height: 70vh;
  overflow-y: auto;
}

.user-groups-card,
.user-list-card,
.permission-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.group-list,
.user-list {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.group-item,
.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.group-item:hover,
.user-item:hover {
  background-color: #f5f7fa;
  border-color: #409EFF;
}

.group-item.active,
.user-item.active {
  background-color: #ecf5ff;
  border-color: #409EFF;
}

.group-info,
.user-info {
  display: flex;
  align-items: center;
}

.group-avatar,
.user-avatar {
  width: 40px;
  height: 40px;
  background-color: #409EFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 12px;
}

.group-details,
.user-details {
  flex: 1;
}

.group-name,
.user-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.group-members,
.user-role {
  font-size: 12px;
  color: #666;
}

.group-actions {
  display: flex;
  gap: 5px;
}

.user-status {
  display: flex;
  align-items: center;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.selection-info-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6e6e6;
}

.selection-info-header h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.selection-info-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.permission-tabs {
  height: calc(100% - 100px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #333;
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
