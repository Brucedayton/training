<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Add Users"
    width="60%"
    :before-close="handleClose"
    class="add-user-dialog"
  >
    <el-tabs v-model="activeTab" class="add-user-tabs">
      <!-- First Tab: Project Users -->
      <el-tab-pane label="Project Users" name="project">
        <div class="tab-content">
          <!-- Upper Section: Project Tree + User List -->
          <div class="upper-section">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="project-tree-card">
                  <template #header>
                    <div class="card-header">
                      <span>Projects</span>
                    </div>
                  </template>
                  <el-tree
                    :data="projectTree"
                    :props="treeProps"
                    node-key="id"
                    :default-expand-all="false"
                    :expand-on-click-node="false"
                    @node-click="onProjectSelect"
                    class="project-tree"
                  />
                </el-card>
              </el-col>
              <el-col :span="16">
                <el-card class="user-list-card">
                  <template #header>
                    <div class="card-header">
                      <span>Users</span>
                      <span v-if="selectedProject" class="project-name">{{ selectedProject.name }}</span>
                    </div>
                  </template>
                  
                  <el-table
                    :data="projectUsers"
                    style="width: 100%"
                    @selection-change="onUserSelectionChange"
                    v-loading="loadingUsers"
                  >
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="name" label="Name" min-width="150" />
                    <el-table-column prop="email" label="Email" min-width="200" />
                    <el-table-column prop="role" label="Role" width="120" />
                    <el-table-column prop="department" label="Department" width="120" />
                  </el-table>
                  
                  <div class="pagination-container">
                    <el-pagination
                      v-model:current-page="currentPage"
                      v-model:page-size="pageSize"
                      :page-sizes="[10, 20, 50, 100]"
                      :total="totalUsers"
                      layout="total, sizes, prev, pager, next, jumper"
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                    />
                  </div>
                  
                  <div class="add-button-container">
                    <el-button 
                      type="primary" 
                      @click="addSelectedUsers"
                      :disabled="selectedUsers.length === 0"
                    >
                      Add ({{ selectedUsers.length }})
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          
          <!-- Lower Section: Added Users -->
          <div class="lower-section">
            <el-card class="added-users-card">
              <template #header>
                <div class="card-header">
                  <span>Added Users</span>
                  <el-button type="danger" size="small" @click="clearAddedUsers" :disabled="addedUsers.length === 0">
                    Clear All
                  </el-button>
                </div>
              </template>
              
              <el-table :data="addedUsers" style="width: 100%">
                <el-table-column prop="name" label="Name" min-width="150" />
                <el-table-column prop="email" label="Email" min-width="200" />
                <el-table-column prop="role" label="Role" width="120" />
                <el-table-column prop="department" label="Department" width="120" />
                <el-table-column prop="project" label="Project" width="150" />
                <el-table-column label="Actions" width="100">
                  <template #default="scope">
                    <el-button type="danger" text @click="removeAddedUser(scope.$index)">
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- Second Tab: Custom Groups -->
      <el-tab-pane label="Custom Groups" name="groups">
        <div class="tab-content">
          <!-- Upper Section: Custom Group List -->
          <div class="upper-section">
            <el-card class="group-list-card">
              <template #header>
                <div class="card-header">
                  <span>Custom Groups</span>
                </div>
              </template>
              
              <el-table
                :data="customGroups"
                style="width: 100%"
                @selection-change="onGroupSelectionChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="name" label="Group Name" min-width="200" />
                <el-table-column prop="description" label="Description" min-width="250" />
                <el-table-column prop="memberCount" label="Members" width="100" />
                <el-table-column prop="createdTime" label="Created" width="150" />
              </el-table>
              
              <div class="add-button-container">
                <el-button 
                  type="primary" 
                  @click="addSelectedGroups"
                  :disabled="selectedGroups.length === 0"
                >
                  Add ({{ selectedGroups.length }})
                </el-button>
              </div>
            </el-card>
          </div>
          
          <!-- Lower Section: Added Groups -->
          <div class="lower-section">
            <el-card class="added-groups-card">
              <template #header>
                <div class="card-header">
                  <span>Added Groups</span>
                  <el-button type="danger" size="small" @click="clearAddedGroups" :disabled="addedGroups.length === 0">
                    Clear All
                  </el-button>
                </div>
              </template>
              
              <el-table :data="addedGroups" style="width: 100%">
                <el-table-column prop="name" label="Group Name" min-width="200" />
                <el-table-column prop="description" label="Description" min-width="250" />
                <el-table-column prop="memberCount" label="Members" width="100" />
                <el-table-column prop="createdTime" label="Created" width="150" />
                <el-table-column label="Actions" width="100">
                  <template #default="scope">
                    <el-button type="danger" text @click="removeAddedGroup(scope.$index)">
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="confirmAdd" :disabled="addedUsers.length === 0 && addedGroups.length === 0">
          Confirm Add ({{ addedUsers.length + addedGroups.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AddUserDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'users-added'],
  setup(props, { emit }) {
    const activeTab = ref('project')
    const selectedProject = ref(null)
    const selectedUsers = ref([])
    const selectedGroups = ref([])
    const addedUsers = ref([])
    const addedGroups = ref([])
    const loadingUsers = ref(false)
    
    // Pagination
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalUsers = ref(0)
    
    // Tree props
    const treeProps = {
      children: 'children',
      label: 'name'
    }
    
    // Project tree data
    const projectTree = ref([
      {
        id: 1,
        name: 'Project Alpha',
        children: [
          { id: 11, name: 'Frontend Team' },
          { id: 12, name: 'Backend Team' }
        ]
      },
      {
        id: 2,
        name: 'Project Beta',
        children: [
          { id: 21, name: 'DevOps Team' },
          { id: 22, name: 'QA Team' }
        ]
      },
      {
        id: 3,
        name: 'Project Gamma',
        children: [
          { id: 31, name: 'Design Team' },
          { id: 32, name: 'Marketing Team' }
        ]
      }
    ])
    
    // Project users data (mock)
    const projectUsers = ref([])
    
    // Custom groups data
    const customGroups = ref([
      {
        id: 1,
        name: 'Development Team',
        description: 'Software development team members',
        memberCount: 15,
        createdTime: '2024-01-15'
      },
      {
        id: 2,
        name: 'QA Team',
        description: 'Quality assurance team members',
        memberCount: 8,
        createdTime: '2024-01-20'
      },
      {
        id: 3,
        name: 'Management',
        description: 'Management and leadership team',
        memberCount: 5,
        createdTime: '2024-01-10'
      },
      {
        id: 4,
        name: 'Design Team',
        description: 'UI/UX design team',
        memberCount: 6,
        createdTime: '2024-01-25'
      }
    ])
    
    // Methods
    const onProjectSelect = (data) => {
      selectedProject.value = data
      loadProjectUsers(data.id)
    }
    
    const loadProjectUsers = async (projectId) => {
      loadingUsers.value = true
      // Mock API call
      setTimeout(() => {
        const mockUsers = [
          { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'Developer', department: 'Engineering' },
          { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'Senior Developer', department: 'Engineering' },
          { id: 3, name: 'Mike Wilson', email: 'mike.wilson@example.com', role: 'Team Lead', department: 'Engineering' },
          { id: 4, name: 'Lisa Brown', email: 'lisa.brown@example.com', role: 'Developer', department: 'Engineering' },
          { id: 5, name: 'David Lee', email: 'david.lee@example.com', role: 'Developer', department: 'Engineering' },
          { id: 6, name: 'Emma Davis', email: 'emma.davis@example.com', role: 'QA Engineer', department: 'Quality' },
          { id: 7, name: 'Robert Taylor', email: 'robert.taylor@example.com', role: 'QA Lead', department: 'Quality' },
          { id: 8, name: 'Jennifer White', email: 'jennifer.white@example.com', role: 'Designer', department: 'Design' }
        ]
        projectUsers.value = mockUsers
        totalUsers.value = mockUsers.length
        loadingUsers.value = false
      }, 500)
    }
    
    const onUserSelectionChange = (selection) => {
      selectedUsers.value = selection
    }
    
    const onGroupSelectionChange = (selection) => {
      selectedGroups.value = selection
    }
    
    const addSelectedUsers = () => {
      const usersToAdd = selectedUsers.value.map(user => ({
        ...user,
        project: selectedProject.value?.name || 'Unknown'
      }))
      addedUsers.value.push(...usersToAdd)
      selectedUsers.value = []
      ElMessage.success(`Added ${usersToAdd.length} users`)
    }
    
    const addSelectedGroups = () => {
      addedGroups.value.push(...selectedGroups.value)
      selectedGroups.value = []
      ElMessage.success(`Added ${selectedGroups.value.length} groups`)
    }
    
    const removeAddedUser = (index) => {
      addedUsers.value.splice(index, 1)
    }
    
    const removeAddedGroup = (index) => {
      addedGroups.value.splice(index, 1)
    }
    
    const clearAddedUsers = () => {
      addedUsers.value = []
      ElMessage.success('Cleared all added users')
    }
    
    const clearAddedGroups = () => {
      addedGroups.value = []
      ElMessage.success('Cleared all added groups')
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      loadProjectUsers(selectedProject.value?.id)
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadProjectUsers(selectedProject.value?.id)
    }
    
    const confirmAdd = () => {
      const allItems = [...addedUsers.value, ...addedGroups.value]
      emit('users-added', allItems)
      handleClose()
    }
    
    const handleClose = () => {
      emit('update:visible', false)
      // Reset state
      selectedProject.value = null
      selectedUsers.value = []
      selectedGroups.value = []
      addedUsers.value = []
      addedGroups.value = []
      projectUsers.value = []
      activeTab.value = 'project'
    }
    
    return {
      activeTab,
      selectedProject,
      selectedUsers,
      selectedGroups,
      addedUsers,
      addedGroups,
      loadingUsers,
      currentPage,
      pageSize,
      totalUsers,
      treeProps,
      projectTree,
      projectUsers,
      customGroups,
      onProjectSelect,
      onUserSelectionChange,
      onGroupSelectionChange,
      addSelectedUsers,
      addSelectedGroups,
      removeAddedUser,
      removeAddedGroup,
      clearAddedUsers,
      clearAddedGroups,
      handleSizeChange,
      handleCurrentChange,
      confirmAdd,
      handleClose
    }
  }
}
</script>

<style scoped>
.add-user-dialog {
  max-height: 90vh;
}

.add-user-tabs {
  height: 50vh;
}

.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.upper-section {
  flex: 1;
  margin-bottom: 20px;
}

.lower-section {
  flex: 0 0 200px;
}

.project-tree-card,
.user-list-card,
.group-list-card,
.added-users-card,
.added-groups-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.project-name {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

.project-tree {
  height: 250px;
  overflow-y: auto;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.add-button-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

:deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow-y: auto;
}

:deep(.el-table) {
  height: 100%;
}

:deep(.el-table__body-wrapper) {
  max-height: 200px;
  overflow-y: auto;
}
</style>