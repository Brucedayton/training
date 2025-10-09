<template>
  <div class="authorize-container">
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
                <el-button type="text" size="small" @click.stop="editGroup(group)"><el-icon><Edit /></el-icon></el-button>
                <el-button type="danger" size="small" @click.stop="deleteGroup(group)"><el-icon><Delete /></el-icon></el-button>
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
    
    <!-- Add Group Dialog -->
    <el-dialog v-model="addGroupDialogVisible" title="Add Group" width="500px">
      <el-form :model="newGroup" :rules="groupRules" ref="groupFormRef" label-width="80px">
        <el-form-item label="Group Name" prop="name">
          <el-input v-model="newGroup.name" placeholder="Enter group name" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="newGroup.description"
            type="textarea"
            :rows="3"
            placeholder="Enter group description"
          />
        </el-form-item>
        <el-form-item label="Members" prop="members">
          <el-select
            v-model="newGroup.members"
            multiple
            placeholder="Select group members"
            style="width: 100%"
          >
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addGroupDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addGroup">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- Add User Dialog -->
    <el-dialog v-model="addUserDialogVisible" title="Add User" width="500px">
      <el-form :model="newUser" :rules="userRules" ref="userFormRef" label-width="80px">
        <el-form-item label="Username" prop="name">
          <el-input v-model="newUser.name" placeholder="Enter username" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="newUser.email" placeholder="Enter email" />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="newUser.role" placeholder="Select role">
            <el-option label="Regular User" value="user" />
            <el-option label="Administrator" value="admin" />
            <el-option label="Approver" value="approver" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-radio-group v-model="newUser.status">
            <el-radio label="active">Active</el-radio>
            <el-radio label="disabled">Disabled</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addUser">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- File Tree Dialog -->
    <el-dialog v-model="fileTreeDialogVisible" title="Select File/Folder" width="600px">
      <FileTree @apply-permission="selectFile" />
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="fileTreeDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmFileSelection">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- Permission Grant Dialog -->
    <el-dialog v-model="permissionDialogVisible" title="Grant Permission" width="500px">
      <el-form :model="permissionForm" label-width="100px">
        <el-form-item label="Item">
          <el-input v-model="permissionForm.itemName" readonly />
        </el-form-item>
        <el-form-item label="Item Type">
          <el-tag :type="permissionForm.itemType === 'folder' ? 'warning' : 'info'">
            {{ permissionForm.itemType === 'folder' ? 'Folder' : 'File' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="Permission Role">
          <el-select v-model="permissionForm.permissionRole" placeholder="Select permission role">
            <el-option label="Owner" value="owner" />
            <el-option label="Editor" value="editor" />
            <el-option label="Viewer" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="Expiration Date">
          <el-date-picker
            v-model="permissionForm.expirationDate"
            type="datetime"
            placeholder="Select expiration date and time"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="permissionForm.itemType === 'folder'" label="Inheritance">
          <el-checkbox v-model="permissionForm.inheritToSubItems">
            Apply permission to all files and subfolders within this folder
          </el-checkbox>
        </el-form-item>
        <el-form-item label="Remark">
          <el-input
            v-model="permissionForm.remark"
            type="textarea"
            :rows="3"
            placeholder="Enter permission remark"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmPermission">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- Batch Permission Grant Dialog -->
    <el-dialog v-model="batchPermissionDialogVisible" title="Batch Grant Permission" width="600px">
      <el-form :model="batchPermissionForm" label-width="120px">
        <el-form-item label="Target Group">
          <el-input v-model="selectedGroup.name" readonly />
        </el-form-item>
        <el-form-item label="Item">
          <el-input v-model="batchPermissionForm.itemName" readonly />
        </el-form-item>
        <el-form-item label="Item Type">
          <el-tag :type="batchPermissionForm.itemType === 'folder' ? 'warning' : 'info'">
            {{ batchPermissionForm.itemType === 'folder' ? 'Folder' : 'File' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="Permission Role">
          <el-select v-model="batchPermissionForm.permissionRole" placeholder="Select permission role">
            <el-option label="Owner" value="owner" />
            <el-option label="Editor" value="editor" />
            <el-option label="Viewer" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="Expiration Date">
          <el-date-picker
            v-model="batchPermissionForm.expirationDate"
            type="datetime"
            placeholder="Select expiration date and time"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="batchPermissionForm.itemType === 'folder'" label="Inheritance">
          <el-checkbox v-model="batchPermissionForm.inheritToSubItems">
            Apply permission to all files and subfolders within this folder
          </el-checkbox>
        </el-form-item>
        <el-form-item label="Remark">
          <el-input
            v-model="batchPermissionForm.remark"
            type="textarea"
            :rows="3"
            placeholder="Enter permission remark"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchPermissionDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmBatchPermission">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- Role Assignment Dialog -->
    <el-dialog v-model="roleDialogVisible" title="Assign Role" width="500px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="Role">
          <el-select v-model="roleForm.roleId" placeholder="Select role">
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
            v-model="roleForm.remark"
            type="textarea"
            :rows="3"
            placeholder="Enter assignment remark"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmRole">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

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
              v-for="user in availableUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
              :disabled="false"
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
import FileTree from '../components/FileTree.vue'

export default {
  components: {
    FileTree
  },
  setup() {
    // 所有响应式变量、方法照搬原内容
    const groupSearchKeyword = ref('')
    const userSearchKeyword = ref('')
    const selectedUser = ref(null)
    const selectedGroup = ref(null)
    const selectedFile = ref(null)
    const selectedPermission = ref(null)
    const activeTab = ref('files')
    const addGroupDialogVisible = ref(false)
    const addUserDialogVisible = ref(false)
    const fileTreeDialogVisible = ref(false)
    const permissionDialogVisible = ref(false)
    const batchPermissionDialogVisible = ref(false)
    const roleDialogVisible = ref(false)
    const editGroupDialogVisible = ref(false)

    const groupFormRef = ref()
    const userFormRef = ref()
    const newGroup = reactive({ name: '', description: '', members: [] })
    const newUser = reactive({ name: '', email: '', role: '', status: 'active' })
    const groupRules = {
      name: [{ required: true, message: 'Please enter group name', trigger: 'blur' }],
      description: [{ required: true, message: 'Please enter group description', trigger: 'blur' }],
      members: [{ required: true, message: 'Please select group members', trigger: 'change' }]
    }
    const userRules = {
      name: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
      email: [
        { required: true, message: 'Please enter email', trigger: 'blur' },
        { type: 'email', message: 'Please enter a valid email format', trigger: 'blur' }
      ],
      role: [{ required: true, message: 'Please select role', trigger: 'change' }]
    }
    const permissionForm = reactive({
      itemName: '', itemPath: '', itemType: '', permissionRole: '', expirationDate: '', inheritToSubItems: false, remark: ''
    })
    const batchPermissionForm = reactive({
      itemName: '', itemPath: '', itemType: '', permissionRole: '', expirationDate: '', inheritToSubItems: false, remark: ''
    })
    const roleForm = reactive({ roleId: '', remark: '' })
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
    const availableUsers = computed(() => users.value)
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
      let base = users.value
      if (selectedGroup.value) {
        const memberIds = selectedGroup.value.members || []
        base = base.filter(user => memberIds.includes(user.id))
      }
      if (!userSearchKeyword.value) return base
      const keyword = userSearchKeyword.value.toLowerCase()
      return base.filter(user =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      )
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
    const selectGroup = (group) => { selectedGroup.value = group; selectedUser.value = null }
    const selectUser = (user) => { selectedUser.value = user; selectedGroup.value = null }
    const showAddGroupDialog = () => { addGroupDialogVisible.value = true; Object.assign(newGroup, {name: '', description: '', members: [] }) }
    const addGroup = async () => {
      if (!groupFormRef.value) return
      try {
        await groupFormRef.value.validate()
        const group = {
          id: Date.now(),
          ...newGroup,
          memberCount: newGroup.members.length
        }
        userGroups.value.push(group)
        addGroupDialogVisible.value = false
        ElMessage.success('Group added successfully')
      } catch (error) {
        console.error('Form validation failed:', error)
      }
    }
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
          members: [...editGroupForm.members],
          memberCount: editGroupForm.members.length
        }
        userGroups.value.splice(editingGroupIdx.value, 1, updated)
        ElMessage.success('Group updated successfully')
        editGroupDialogVisible.value = false
      }
    }
    const deleteGroup = (group) => {
      ElMessageBox.confirm('Are you sure you want to delete this group?', 'Confirm Delete', { type: 'warning' })
        .then(() => {
          const idx = userGroups.value.findIndex(g => g.id === group.id)
          if (idx > -1) {
            userGroups.value.splice(idx, 1)
            if (selectedGroup.value && selectedGroup.value.id === group.id) selectedGroup.value = null
            ElMessage.success('Group deleted successfully')
          }
        }).catch(() => {})
    }
    const findUserName = (id) => {
      const user = users.value.find(u => u.id === id)
      return user ? user.name : id
    }
    const showAddUserDialog = () => { addUserDialogVisible.value = true; Object.assign(newUser, {name: '', email: '', role: '', status: 'active'}) }
    const addUser = async () => {
      if (!userFormRef.value) return
      try {
        await userFormRef.value.validate()
        const user = {
          id: Date.now(),
          ...newUser,
          role: getRoleText(newUser.role)
        }
        users.value.push(user)
        addUserDialogVisible.value = false
        ElMessage.success('User added successfully')
      } catch (error) {
        console.error('Form validation failed:', error)
      }
    }
    const showFileTreeDialog = () => { fileTreeDialogVisible.value = true }
    const selectFile = (fileData) => {
      selectedFile.value = fileData
      permissionForm.itemName = fileData.label
      permissionForm.itemPath = fileData.path
      permissionForm.itemType = fileData.type
      batchPermissionForm.itemName = fileData.label
      batchPermissionForm.itemPath = fileData.path
      batchPermissionForm.itemType = fileData.type
    }
    const confirmFileSelection = () => {
      if (selectedFile.value) {
        fileTreeDialogVisible.value = false
        if (selectedGroup.value) {
          batchPermissionDialogVisible.value = true
        } else {
          permissionDialogVisible.value = true
        }
      } else {
        ElMessage.warning('Please select a file or folder')
      }
    }
    const grantPermission = () => { if (!selectedFile.value) { ElMessage.warning('Please select a file or folder first'); return } permissionDialogVisible.value = true }
    const batchGrantPermission = () => { if (!selectedFile.value) { ElMessage.warning('Please select a file or folder first'); return } batchPermissionDialogVisible.value = true }
    const confirmPermission = () => {
      if (!permissionForm.permissionRole || !permissionForm.expirationDate) {
        ElMessage.warning('Please fill in complete permission information')
        return
      }
      const permission = {
        id: Date.now(),
        fileName: permissionForm.itemName,
        filePath: permissionForm.itemPath,
        itemType: permissionForm.itemType,
        permissionRole: permissionForm.permissionRole,
        grantTime: new Date().toLocaleString(),
        expireTime: permissionForm.expirationDate,
        status: 'active'
      }
      userPermissions.value.push(permission)
      permissionDialogVisible.value = false
      Object.assign(permissionForm, {itemName: '', itemPath: '', itemType: '', permissionRole: '', expirationDate: '', inheritToSubItems: false, remark: ''})
      selectedFile.value = null
      ElMessage.success('Permission granted successfully')
    }
    const confirmBatchPermission = () => {
      if (!batchPermissionForm.permissionRole || !batchPermissionForm.expirationDate) {
        ElMessage.warning('Please fill in complete permission information')
        return
      }
      const groupMembers = selectedGroup.value.members
      groupMembers.forEach(memberId => {
        const permission = {
          id: Date.now() + Math.random(),
          fileName: batchPermissionForm.itemName,
          filePath: batchPermissionForm.itemPath,
          itemType: batchPermissionForm.itemType,
          permissionRole: batchPermissionForm.permissionRole,
          grantTime: new Date().toLocaleString(),
          expireTime: batchPermissionForm.expirationDate,
          status: 'active'
        }
        userPermissions.value.push(permission)
      })
      batchPermissionDialogVisible.value = false
      Object.assign(batchPermissionForm, {itemName: '', itemPath: '', itemType: '', permissionRole: '', expirationDate: '', inheritToSubItems: false, remark: ''})
      selectedFile.value = null
      ElMessage.success(`Permission granted to ${groupMembers.length} group members successfully`)
    }
    const showRoleDialog = () => { roleDialogVisible.value = true }
    const confirmRole = () => {
      if (!roleForm.roleId) {
        ElMessage.warning('Please select a role')
        return
      }
      const role = availableRoles.value.find(r => r.id === roleForm.roleId)
      if (role) {
        const userRole = {
          id: Date.now(),
          roleName: role.name,
          description: role.description,
          assignTime: new Date().toLocaleString(),
          status: 'active'
        }
        userRoles.value.push(userRole)
        roleDialogVisible.value = false
        Object.assign(roleForm, {roleId: '', remark: ''})
        ElMessage.success('Role assigned successfully')
      }
    }
    const revokeUserPermission = async (permission) => {
      try {
        await ElMessageBox.confirm('Are you sure you want to revoke this permission?', 'Confirm Revoke', {type: 'warning'})
        const index = userPermissions.value.findIndex(p => p.id === permission.id)
        if (index > -1) {
          userPermissions.value.splice(index, 1)
        }
        ElMessage.success('Permission revoked')
      } catch {}
    }
    const removeUserRole = async (role) => {
      try {
        await ElMessageBox.confirm('Are you sure you want to remove this role?', 'Confirm Remove', {type: 'warning'})
        const index = userRoles.value.findIndex(r => r.id === role.id)
        if (index > -1) {
          userRoles.value.splice(index, 1)
        }
        ElMessage.success('Role removed')
      } catch {}
    }
    const revokePermission = () => { ElMessage.info('Please select a permission to revoke') }
    // Helper functions
    const getRoleText = (role) => {
      const roleMap = { user: 'Regular User', admin: 'Administrator', approver: 'Approver' }
      return roleMap[role] || role
    }
    const getPermissionRoleTag = (role) => {
      const tagMap = { owner: 'danger', editor: 'warning', viewer: 'info' }
      return tagMap[role] || 'info'
    }
    const getPermissionRoleText = (role) => {
      const textMap = { owner: 'Owner', editor: 'Editor', viewer: 'Viewer' }
      return textMap[role] || role
    }

    return {
      groupSearchKeyword,
      userSearchKeyword,
      selectedUser,
      selectedGroup,
      selectedFile,
      selectedPermission,
      activeTab,
      addGroupDialogVisible,
      addUserDialogVisible,
      fileTreeDialogVisible,
      permissionDialogVisible,
      batchPermissionDialogVisible,
      roleDialogVisible,
      editGroupDialogVisible,
      groupFormRef,
      userFormRef,
      newGroup,
      newUser,
      groupRules,
      userRules,
      permissionForm,
      batchPermissionForm,
      roleForm,
      userGroups,
      users,
      availableUsers,
      userPermissions,
      userRoles,
      availableRoles,
      filteredGroups,
      filteredUsers,
      currentPermissions,
      currentRoles,
      selectGroup,
      selectUser,
      showAddGroupDialog,
      addGroup,
      editGroup,
      removeUserFromGroup,
      applyEditGroup,
      editingGroupIdx,
      deleteGroup,
      findUserName,
      showAddUserDialog,
      addUser,
      showFileTreeDialog,
      selectFile,
      confirmFileSelection,
      grantPermission,
      batchGrantPermission,
      confirmPermission,
      confirmBatchPermission,
      showRoleDialog,
      confirmRole,
      revokeUserPermission,
      removeUserRole,
      revokePermission,
      getRoleText,
      getPermissionRoleTag,
      getPermissionRoleText
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