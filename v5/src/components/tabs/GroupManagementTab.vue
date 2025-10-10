<template>
  <div class="group-mgmt-container">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="Search groups" prefix-icon="Search" style="max-width: 280px" />
      <el-button type="primary" size="small" @click="showAddGroupDialog = true">Add Group</el-button>
    </div>
    <el-table :data="filteredGroups" style="width: 100%">
      <el-table-column prop="name" label="Group Name" width="220" />
      <el-table-column prop="description" label="Description" />
      <el-table-column prop="memberCount" label="Members" width="120" />
      <el-table-column label="Actions" width="220">
        <template #default="scope">
          <el-button size="small" @click="onEdit(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="onDelete(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="editDialog" title="Edit Group" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="Name"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="Description"><el-input v-model="editForm.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="Members">
          <el-select v-model="editForm.members" multiple filterable placeholder="Search users by name" style="width: 100%">
            <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialog = false">Cancel</el-button>
          <el-button type="primary" @click="applyEdit">Save</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddGroupDialog" title="Add Group" width="500px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="Name"><el-input v-model="addForm.name" /></el-form-item>
        <el-form-item label="Description"><el-input v-model="addForm.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="Members">
          <el-select v-model="addForm.members" multiple filterable placeholder="Search users by name" style="width: 100%">
            <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddGroupDialog = false">Cancel</el-button>
          <el-button type="primary" @click="applyAdd">Create</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'GroupManagementTab',
  setup() {
    const keyword = ref('')
    const users = ref([
      {id: 1, name: 'John Smith'},
      {id: 2, name: 'Sarah Johnson'},
      {id: 3, name: 'Mike Wilson'},
      {id: 4, name: 'Lisa Brown'},
      {id: 5, name: 'David Lee'},
      {id: 6, name: 'Emma Davis'},
      {id: 7, name: 'Robert Taylor'},
      {id: 8, name: 'Jennifer White'}
    ])
    const groups = ref([
      {id: 1, name: 'Development Team', description: 'Software development team members', members: [1,2,3], memberCount: 3},
      {id: 2, name: 'QA Team', description: 'Quality assurance team members', members: [4,5,6], memberCount: 3}
    ])
    const filteredGroups = computed(() => {
      const k = keyword.value.trim().toLowerCase()
      if (!k) return groups.value
      return groups.value.filter(g => g.name.toLowerCase().includes(k) || g.description.toLowerCase().includes(k))
    })
    const editDialog = ref(false)
    const editIndex = ref(-1)
    const editForm = reactive({ id: '', name: '', description: '', members: [] })
    const showAddGroupDialog = ref(false)
    const addForm = reactive({ name: '', description: '', members: [] })

    const onEdit = (group) => {
      editIndex.value = groups.value.findIndex(g => g.id === group.id)
      Object.assign(editForm, group)
      editDialog.value = true
    }
    const applyEdit = () => {
      if (editIndex.value > -1) {
        const updated = { ...groups.value[editIndex.value], ...editForm, memberCount: editForm.members.length }
        groups.value.splice(editIndex.value, 1, updated)
        ElMessage.success('Group updated')
        editDialog.value = false
      }
    }
    const onDelete = (group) => {
      ElMessageBox.confirm('Delete this group?', 'Confirm', { type: 'warning' })
        .then(() => {
          const idx = groups.value.findIndex(g => g.id === group.id)
          if (idx > -1) {
            groups.value.splice(idx, 1)
            ElMessage.success('Group deleted')
          }
        }).catch(() => {})
    }
    const applyAdd = () => {
      if (!addForm.name) { ElMessage.warning('Please enter group name'); return }
      groups.value.push({ id: Date.now(), name: addForm.name, description: addForm.description, members: [...addForm.members], memberCount: addForm.members.length })
      Object.assign(addForm, { name: '', description: '', members: [] })
      showAddGroupDialog.value = false
      ElMessage.success('Group created')
    }

    return { keyword, users, groups, filteredGroups, editDialog, editForm, onEdit, onDelete, applyEdit, showAddGroupDialog, addForm, applyAdd }
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

