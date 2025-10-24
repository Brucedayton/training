<template>
  <div class="group-mgmt-container">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="Search groups" prefix-icon="Search" style="max-width: 280px" />
      <el-button type="primary" size="small" @click="openAddDialog">Add Group</el-button>
    </div>
    <el-table :data="filteredGroups" style="width: 100%">
      <el-table-column prop="name" label="Group Name" width="220" />
      <el-table-column prop="description" label="Description" />
      <el-table-column prop="memberCount" label="Members" width="120" />
      <el-table-column prop="department" label="Department" width="150" />
      <el-table-column prop="createdTime" label="Created" width="120" />
      <el-table-column label="Actions" width="220">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="onDelete(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Enhanced Group Dialog -->
    <GroupUserDialog
      :visible="groupDialogVisible"
      @update:visible="groupDialogVisible = $event"
      :group-data="currentGroup"
      :is-edit="isEditMode"
      @group-saved="handleGroupSaved"
    />
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import GroupUserDialog from '../dialogs/GroupUserDialog.vue'

export default {
  name: 'GroupManagementTab',
  components: {
    GroupUserDialog
  },
  setup() {
    const keyword = ref('')
    const groupDialogVisible = ref(false)
    const isEditMode = ref(false)
    const currentGroup = ref({})
    
    const groups = ref([
      {
        id: 1, 
        name: 'Development Team', 
        description: 'Software development team members', 
        department: 'engineering',
        members: [
          { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'Developer', department: 'engineering' },
          { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'Senior Developer', department: 'engineering' },
          { id: 3, name: 'Mike Wilson', email: 'mike.wilson@example.com', role: 'Team Lead', department: 'engineering' }
        ], 
        memberCount: 3,
        createdTime: '2024-01-15'
      },
      {
        id: 2, 
        name: 'QA Team', 
        description: 'Quality assurance team members', 
        department: 'qa',
        members: [
          { id: 4, name: 'Lisa Brown', email: 'lisa.brown@example.com', role: 'QA Engineer', department: 'qa' },
          { id: 5, name: 'David Lee', email: 'david.lee@example.com', role: 'QA Engineer', department: 'qa' },
          { id: 6, name: 'Emma Davis', email: 'emma.davis@example.com', role: 'QA Lead', department: 'qa' }
        ], 
        memberCount: 3,
        createdTime: '2024-01-20'
      }
    ])
    
    const filteredGroups = computed(() => {
      const k = keyword.value.trim().toLowerCase()
      if (!k) return groups.value
      return groups.value.filter(g => 
        g.name.toLowerCase().includes(k) || 
        g.description.toLowerCase().includes(k) ||
        g.department.toLowerCase().includes(k)
      )
    })

    const openAddDialog = () => {
      isEditMode.value = false
      currentGroup.value = {}
      groupDialogVisible.value = true
    }

    const openEditDialog = (group) => {
      isEditMode.value = true
      currentGroup.value = { ...group }
      groupDialogVisible.value = true
    }

    const handleGroupSaved = (groupData) => {
      if (isEditMode.value) {
        // Update existing group
        const index = groups.value.findIndex(g => g.id === currentGroup.value.id)
        if (index > -1) {
          groups.value[index] = { ...groups.value[index], ...groupData }
        }
      } else {
        // Add new group
        const newGroup = {
          id: Date.now(),
          ...groupData,
          createdTime: new Date().toISOString().split('T')[0]
        }
        groups.value.push(newGroup)
      }
    }

    const onDelete = (group) => {
      ElMessageBox.confirm('Are you sure you want to delete this group?', 'Confirm Delete', { 
        type: 'warning',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      })
        .then(() => {
          const idx = groups.value.findIndex(g => g.id === group.id)
          if (idx > -1) {
            groups.value.splice(idx, 1)
            ElMessage.success('Group deleted successfully')
          }
        }).catch(() => {})
    }

    return { 
      keyword, 
      groups, 
      filteredGroups, 
      groupDialogVisible,
      isEditMode,
      currentGroup,
      openAddDialog,
      openEditDialog,
      handleGroupSaved,
      onDelete
    }
  }
}
</script>

<style scoped>
.group-mgmt-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.el-table) {
  border: 1px solid #ebeef5;
}
</style>