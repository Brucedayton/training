<template>
  <div class="authorize-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="user-groups-card">
          <template #header>
            <div class="card-header">
              <span>File Tree</span>
            </div>
          </template>
          
          <FileTree :multiple="true" @selection-change="onTreeSelectionChange" />
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="user-list-card">
          <template #header>
            <div class="card-header">
              <span>Share Recipients</span>
            </div>
          </template>

          <div class="recipient-toolbar">
            <div class="toolbar-row first-row">
              <el-select
                v-model="newRecipient"
                filterable
                clearable
                placeholder="search for and select the new share recipient"
                class="full-width"
                @change="onAddRecipient"
              >
                <el-option
                  v-for="u in users"
                  :key="u.id"
                  :label="u.name"
                  :value="u.id"
                />
              </el-select>
            </div>
            <div class="toolbar-row second-row">
              <div class="toolbar-actions">
                <el-select v-model="groupFilter" clearable placeholder="All Groups" style="width: 180px">
                  <el-option v-for="g in userGroups" :key="g.id" :label="g.name" :value="g.id" />
                </el-select>
                <el-select v-model="roleFilter" clearable placeholder="All Roles" style="width: 160px">
                  <el-option label="Viewer" value="viewer" />
                  <el-option label="Editor" value="editor" />
                  <el-option label="Duplicator" value="duplicator" />
                </el-select>
                <el-input v-model="recipientSearch" placeholder="search" clearable style="width: 220px" />
              </div>
              <el-button type="primary" @click="openBatchChange">Batch Change</el-button>
            </div>
          </div>

          <el-table
            :data="filteredRecipients"
            style="width: 100%"
            size="small"
            stripe
            border
            @selection-change="onRecipientSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="Target" min-width="220" show-overflow-tooltip>
              <template #default="scope">
                <div class="target-cell">
                  <div class="avatar"><el-icon><User /></el-icon></div>
                  <span class="target-name">{{ scope.row.target }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Role" width="180">
              <template #default="scope">
                <el-select v-model="scope.row.role" style="width: 160px">
                  <el-option label="Owner" value="owner" />
                  <el-option label="Editor" value="editor" />
                  <el-option label="Viewer" value="viewer" />
                  <el-option label="Duplicator" value="duplicator" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Expiration Date" width="200">
              <template #default="scope">
                <el-date-picker
                  v-model="scope.row.expire"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="Select date"
                  style="width: 180px"
                />
              </template>
            </el-table-column>
            <el-table-column label="" width="70" align="center">
              <template #default="scope">
                <el-button type="danger" text circle @click="removeRecipient(scope.$index)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
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
    
    <!-- Sub-dialogs -->
    <AddGroupDialog
      :visible="addGroupDialogVisible"
      @update:visible="addGroupDialogVisible = $event"
      :users="users"
      @group-added="handleGroupAdded"
    />
    
    <AddUserDialog
      :visible="addUserDialogVisible"
      @update:visible="addUserDialogVisible = $event"
      @user-added="handleUserAdded"
    />
    
    <FileTreeDialog
      :visible="fileTreeDialogVisible"
      @update:visible="fileTreeDialogVisible = $event"
      @file-selected="handleFileSelected"
    />
    
    <PermissionGrantDialog
      :visible="permissionDialogVisible"
      @update:visible="permissionDialogVisible = $event"
      :permission-form="permissionForm"
      @permission-granted="handlePermissionGranted"
    />
    
    <BatchPermissionDialog
      :visible="batchPermissionDialogVisible"
      @update:visible="batchPermissionDialogVisible = $event"
      :selected-group="selectedGroup"
      :batch-form="batchPermissionForm"
      @batch-permission-granted="handleBatchPermissionGranted"
    />
    
    <RoleAssignmentDialog
      :visible="roleDialogVisible"
      @update:visible="roleDialogVisible = $event"
      :available-roles="availableRoles"
      @role-assigned="handleRoleAssigned"
    />

    <!-- Edit Group Dialog -->
    <el-dialog v-model="editGroupDialogVisible" title="Edit Group" width="500px">
      <el-form :model="editGroupForm" label-width="80px">
        <el-form-item label="Group Name">
          <el-input v-model="editGroupForm.name" readonly />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="editGroupForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="Members">
          <el-select v-model="editGroupForm.members" multiple style="width: 100%">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
          <div style="margin-top: 8px">
            <el-tag
              v-for="userId in editGroupForm.members"
              :key="userId"
              closable
              @close="removeUserFromGroup(userId)"
              type="info"
              style="margin-right: 4px"
            >{{ findUserName(userId) }}</el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editGroupDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="applyEditGroup">Save</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AddGroupDialog from '../dialogs/AddGroupDialog.vue'
import AddUserDialog from '../dialogs/AddUserDialog.vue'
import FileTree from '../FileTree.vue'
import FileTreeDialog from '../dialogs/FileTreeDialog.vue'
import PermissionGrantDialog from '../dialogs/PermissionGrantDialog.vue'
import BatchPermissionDialog from '../dialogs/BatchPermissionDialog.vue'
import RoleAssignmentDialog from '../dialogs/RoleAssignmentDialog.vue'

export default {
  components: {
    AddGroupDialog,
    AddUserDialog,
    FileTree,
    FileTreeDialog,
    PermissionGrantDialog,
    BatchPermissionDialog,
    RoleAssignmentDialog,
  },
  setup() {
    const groupSearchKeyword = ref('')
    const userSearchKeyword = ref('')
    const targetTab = ref('users')
    const selectedUser = ref(null)
    const selectedGroup = ref(null)
    const selectedFile = ref(null)
    const selectedFiles = ref([])
    const selectedPermission = ref(null)
    const activeTab = ref('files')
    // Right-side recipient table (for share recipients)
    const recipientSearch = ref('')
    const newRecipient = ref(null)
    const groupFilter = ref(null)
    const roleFilter = ref(null)
    const recipients = ref([
      { target: 'User_A', role: 'owner', expire: '', userId: 1, groupId: 1 },
      { target: 'User_B', role: 'viewer', expire: '', userId: 2, groupId: 1 },
      { target: 'User_B', role: 'editor', expire: '', userId: 2, groupId: 2 },
      { target: 'User_C', role: 'editor', expire: '', userId: 3, groupId: 2 }
    ])
    const selectedRecipients = ref([])
    // Dialog visibility
    const addGroupDialogVisible = ref(false)
    const addUserDialogVisible = ref(false)
    const fileTreeDialogVisible = ref(false)
    const permissionDialogVisible = ref(false)
    const batchPermissionDialogVisible = ref(false)
    const roleDialogVisible = ref(false)
    // Forms
    const permissionForm = reactive({
      itemName: '', itemPath: '', itemType: '', permissionRole: '', expirationDate: '', inheritToSubItems: false, remark: ''
    })
    const batchPermissionForm = reactive({
      itemName: '', itemPath: '', itemType: '', permissionRole: '', expirationDate: '', inheritToSubItems: false, remark: ''
    })
    const userGroups = ref([
      {id: 1, name: 'Development Team', description: 'Software development team members', memberCount: 5, members: [1, 2, 3]},
      {id: 2, name: 'QA Team', description: 'Quality assurance team members', memberCount: 3, members: [4, 5, 6]},
      {id: 3, name: 'Management', description: 'Management and leadership team', memberCount: 2, members: [7, 8]}
    ])
    const users = ref([
      {id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'Regular User', status: 'active'},
      {id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'Administrator', status: 'active'},
      {id: 3, name: 'Mike Wilson', email: 'mike.wilson@example.com', role: 'Approver', status: 'active'},
      {id: 4, name: 'Lisa Brown', email: 'lisa.brown@example.com', role: 'Regular User', status: 'active'},
      {id: 5, name: 'David Lee', email: 'david.lee@example.com', role: 'Regular User', status: 'active'},
      {id: 6, name: 'Emma Davis', email: 'emma.davis@example.com', role: 'Regular User', status: 'active'},
      {id: 7, name: 'Robert Taylor', email: 'robert.taylor@example.com', role: 'Administrator', status: 'active'},
      {id: 8, name: 'Jennifer White', email: 'jennifer.white@example.com', role: 'Administrator', status: 'active'}
    ])
    const userPermissions = ref([
      {id: 1, fileName: 'Product Requirements.pdf', filePath: '/Project Documents/Requirements/Product Requirements.pdf', itemType: 'file', permissionRole: 'viewer', grantTime: '2024-01-15 14:30', expireTime: '2024-01-22 14:30', status: 'active'},
      {id: 2, fileName: 'UI Design Files', filePath: '/Project Documents/Design/UI Design Files', itemType: 'folder', permissionRole: 'editor', grantTime: '2024-01-14 10:20', expireTime: '2024-02-14 10:20', status: 'active'}
    ])
    const userRoles = ref([
      {id: 1, roleName: 'Regular User', description: 'Basic file access permissions', assignTime: '2024-01-15 14:30', status: 'active'}
    ])
    const availableRoles = ref([
      {id: 1, name: 'Regular User', description: 'Basic file access permissions'},
      {id: 2, name: 'Administrator', description: 'Full system access'},
      {id: 3, name: 'Approver', description: 'Approval permissions'}
    ])
    const filteredGroups = computed(() => {
      if (!groupSearchKeyword.value) return userGroups.value
      return userGroups.value.filter(group =>
        group.name.toLowerCase().includes(groupSearchKeyword.value.toLowerCase()) ||
        group.description.toLowerCase().includes(groupSearchKeyword.value.toLowerCase())
      )
    })
    const filteredUsers = computed(() => {
      if (!userSearchKeyword.value) return users.value
      return users.value.filter(user =>
        user.name.toLowerCase().includes(userSearchKeyword.value.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchKeyword.value.toLowerCase())
      )
    })
    const filteredRecipients = computed(() => {
      let list = recipients.value
      if (groupFilter.value) list = list.filter(r => r.groupId === groupFilter.value)
      if (roleFilter.value) list = list.filter(r => r.role === roleFilter.value)
      if (recipientSearch.value) list = list.filter(r => r.target.toLowerCase().includes(recipientSearch.value.toLowerCase()))
      return list
    })
    const currentPermissions = computed(() => {
      if (selectedUser.value) return userPermissions.value
      else if (selectedGroup.value) return userPermissions.value
      return []
    })
    const currentRoles = computed(() => {
      if (selectedUser.value) return userRoles.value
      else if (selectedGroup.value) return userRoles.value
      return []
    })
    // Methods（与原先的一致）
    const selectGroup = (group) => { selectedGroup.value = group; selectedUser.value = null }
    const selectUser = (user) => { selectedUser.value = user; selectedGroup.value = null }
    const showAddGroupDialog = () => { addGroupDialogVisible.value = true }
    const editGroupDialogVisible = ref(false)
    const editGroupForm = reactive({ id: '', name: '', description: '', members: [] })
    const editingGroupIdx = ref(-1)

    const editGroup = (group) => {
      Object.assign(editGroupForm, group)
      editingGroupIdx.value = userGroups.value.findIndex(g => g.id === group.id)
      editGroupDialogVisible.value = true
    }
    const removeUserFromGroup = (userId) => {
      const idx = editGroupForm.members.findIndex(id => id === userId)
      if (idx > -1) editGroupForm.members.splice(idx, 1)
    }
    const applyEditGroup = () => {
      if (editingGroupIdx.value > -1) {
        const updated = {
          ...userGroups.value[editingGroupIdx.value],
          description: editGroupForm.description,
          members: [...editGroupForm.members],
          memberCount: editGroupForm.members.length
        }
        userGroups.value.splice(editingGroupIdx.value, 1, updated)
        ElMessage.success('Group updated successfully')
        editGroupDialogVisible.value = false
      }
    }
    const findUserName = (id) => {
      const user = users.value.find(u => u.id === id)
      return user ? user.name : id
    }
    const showAddUserDialog = () => { addUserDialogVisible.value = true }
    const showFileTreeDialog = () => { fileTreeDialogVisible.value = true }
    const onTreeSelectionChange = (items) => { selectedFiles.value = items }
    const grantPermission = () => {
      const hasSelection = selectedFile.value || (selectedFiles.value && selectedFiles.value.length > 0)
      if (!hasSelection) { ElMessage.warning('Please select at least one file or folder first'); return }
      if (selectedGroup.value) { batchPermissionDialogVisible.value = true } else { permissionDialogVisible.value = true }
    }
    // Right-side recipient actions
    const onRecipientSelectionChange = (rows) => { selectedRecipients.value = rows }
    const openBatchChange = () => { /* hook to existing batch dialog if needed */ }
    const applyRecipientSearch = () => { /* computed already reacts */ }
    const onAddRecipient = (userId) => {
      const user = users.value.find(u => u.id === userId)
      if (!user) return
      recipients.value.push({ target: user.name, role: 'viewer', expire: '', userId: user.id, groupId: null })
      newRecipient.value = null
    }
    const removeRecipient = (index) => { recipients.value.splice(index, 1) }
    const batchGrantPermission = () => {
      const hasSelection = selectedFile.value || (selectedFiles.value && selectedFiles.value.length > 0)
      if (!hasSelection) { ElMessage.warning('Please select at least one file or folder first'); return }
      batchPermissionDialogVisible.value = true
    }
    const showRoleDialog = () => { roleDialogVisible.value = true }
    const revokeUserPermission = async (permission) => { try { await ElMessageBox.confirm('Are you sure you want to revoke this permission?', 'Confirm Revoke', { type: 'warning' }); const index = userPermissions.value.findIndex(p => p.id === permission.id); if (index > -1) { userPermissions.value.splice(index, 1) } ElMessage.success('Permission revoked') } catch {} }
    const removeUserRole = async (role) => { try { await ElMessageBox.confirm('Are you sure you want to remove this role?', 'Confirm Remove', { type: 'warning' }); const index = userRoles.value.findIndex(r => r.id === role.id); if (index > -1) { userRoles.value.splice(index, 1) } ElMessage.success('Role removed') } catch {} }
    const revokePermission = () => { ElMessage.info('Please select a permission to revoke') }
    const handleGroupAdded = (group) => { userGroups.value.push(group); ElMessage.success('Group added successfully') }
    const handleUserAdded = (user) => { users.value.push(user); ElMessage.success('User added successfully') }
    const handleFileSelected = (fileData) => {
      selectedFile.value = fileData
      Object.assign(permissionForm, { itemName: fileData.label, itemPath: fileData.path, itemType: fileData.type })
      Object.assign(batchPermissionForm, { itemName: fileData.label, itemPath: fileData.path, itemType: fileData.type })
    }
    const handlePermissionGranted = (permission) => { userPermissions.value.push(permission); ElMessage.success('Permission granted successfully') }
    const handleBatchPermissionGranted = (permissions) => { userPermissions.value.push(...permissions); ElMessage.success(`Permission granted to ${permissions.length} group members successfully`) }
    const handleRoleAssigned = (role) => { userRoles.value.push(role); ElMessage.success('Role assigned successfully') }
    // Helper functions
    const getPermissionRoleTag = (role) => {
      const tagMap = { owner: 'danger', editor: 'warning', viewer: 'info' }
      return tagMap[role] || 'info'
    }
    const getPermissionRoleText = (role) => {
      const textMap = { owner: 'Owner', editor: 'Editor', viewer: 'Viewer' }
      return textMap[role] || role
    }
    return {
      groupSearchKeyword, userSearchKeyword, selectedUser, selectedGroup, selectedFile, selectedPermission, activeTab,
      addGroupDialogVisible, addUserDialogVisible, fileTreeDialogVisible, permissionDialogVisible, batchPermissionDialogVisible, roleDialogVisible,
      permissionForm, batchPermissionForm, userGroups, users, userPermissions, userRoles, availableRoles,
      filteredGroups, filteredUsers, currentPermissions, currentRoles,
      filteredRecipients,
      selectGroup, selectUser, showAddGroupDialog, editGroup, showAddUserDialog, showFileTreeDialog, grantPermission, batchGrantPermission, showRoleDialog,
      onTreeSelectionChange, targetTab,
      revokeUserPermission, removeUserRole, revokePermission,
      handleGroupAdded, handleUserAdded, handleFileSelected, handlePermissionGranted, handleBatchPermissionGranted, handleRoleAssigned,
      getPermissionRoleTag, getPermissionRoleText,
      editGroupDialogVisible, editGroupForm, editingGroupIdx, removeUserFromGroup, applyEditGroup, findUserName
      ,recipientSearch, newRecipient, groupFilter, roleFilter, recipients, selectedRecipients,
      onRecipientSelectionChange, openBatchChange, applyRecipientSearch, onAddRecipient, removeRecipient
    }
  }
}
</script>

<style scoped>
.authorize-container {
  height: 100%;
}

.user-groups-card,
.user-list-card,
.permission-card {
  height: 600px;
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

:deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow-y: auto;
}

/* Share recipients toolbar and table beautify */
.recipient-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.recipient-toolbar .toolbar-actions {
  display: flex;
  gap: 10px;
}

.toolbar-row.first-row .full-width {
  width: 100%;
}

.toolbar-row.second-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.target-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.target-cell .avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #409EFF;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.target-cell .target-name {
  color: #333;
}
</style>
