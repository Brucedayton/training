<template>
  <div class="schema-tree-container" @contextmenu.prevent="handleRootContextMenu">
    <div class="schema-tree">
      <el-tree
        ref="treeRef"
        :data="data"
        :props="defaultProps"
        node-key="id"
        :current-node-key="currentNodeKey"
        highlight-current
        draggable
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        @node-drag-end="handleDragEnd"
        @node-click="handleNodeClick"
        @node-contextmenu="handleNodeContextMenu"
        default-expand-all
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <el-icon :class="getIconClass(data.type)">
              <Folder v-if="data.type === 'group'" />
              <Document v-else-if="data.type === 'schema'" />
              <List v-else-if="data.type === 'column'" />
            </el-icon>
            <span>{{ data.name }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <el-dialog
      v-model="contextMenuVisible"
      :show-close="false"
      :modal="false"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      class="context-menu-dialog"
      :style="contextMenuStyle"
      @click.self="contextMenuVisible = false"
    >
      <div class="context-menu-content" @click.stop>
        <!-- 根节点或分组节点的菜单项 -->
        <template v-if="!currentNode || currentNode.type === 'group'">
          <div class="menu-item" @click="handleAddNode('group')">
            <el-icon><FolderAdd /></el-icon>
            Add Group
          </div>
          <div class="menu-item" @click="handleAddNode('schema')">
            <el-icon><DocumentAdd /></el-icon>
            Add Schema
          </div>
        </template>

        <!-- Schema 节点的菜单项 -->
        <template v-if="currentNode && currentNode.type === 'schema'">
          <div class="menu-item" @click="handleAddNode('column')">
            <el-icon><Plus /></el-icon>
            Add Column
          </div>
        </template>

        <!-- 复制选项对所有非根节点显示 -->
        <template v-if="currentNode">
          <div class="menu-item" @click="handleCopyNode">
            <el-icon><CopyDocument /></el-icon>
            Copy
          </div>
        </template>

        <!-- Schema节点且没有父节点时显示设置分组选项 -->
        <template v-if="currentNode && currentNode.type === 'schema' && !hasParentNode(currentNode)">
          <div class="menu-item" @click="handleSetGroup">
            <el-icon><FolderAdd /></el-icon>
            Set Group
          </div>
        </template>

        <!-- 删除选项对所有非根节点显示 -->
        <template v-if="currentNode">
          <div class="menu-item danger" @click="handleDeleteNode">
            <el-icon><Delete /></el-icon>
            Delete
          </div>
        </template>
      </div>
    </el-dialog>

    <!-- 选择分组的对话框 -->
    <el-dialog
      v-model="groupSelectVisible"
      title="Select Group"
      width="30%"
      :modal="true"
      destroy-on-close
    >
      <div v-if="getGroupNodes().length === 0" class="empty-group">
        <el-empty description="No groups available">
          <el-button type="primary" @click="handleCreateGroup">Create New Group</el-button>
        </el-empty>
      </div>
      <template v-else>
        <el-tree
          ref="groupSelectTree"
          :data="getGroupNodes()"
          :props="defaultProps"
          @node-click="handleGroupSelect"
          node-key="id"
          highlight-current
        >
          <template #default="{ node, data }">
            <span>{{ data.name }}</span>
          </template>
        </el-tree>
        <div class="dialog-footer">
          <el-button @click="handleCreateSubGroup">Create Subgroup</el-button>
          <el-button @click="groupSelectVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleGroupSelectConfirm" :disabled="!selectedGroupNode">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 创建分组的对话框 -->
    <el-dialog
      v-model="createGroupVisible"
      :title="selectedGroupNode ? 'Create Subgroup' : 'Create Group'"
      width="30%"
      :modal="true"
      destroy-on-close
    >
      <el-form :model="newGroupForm" label-width="100px">
        <el-form-item label="Name">
          <el-input v-model="newGroupForm.name" placeholder="Enter group name" />
        </el-form-item>
        <el-form-item label="Color">
          <el-color-picker v-model="newGroupForm.color" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="newGroupForm.description"
            type="textarea"
            placeholder="Enter group description"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createGroupVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleCreateGroupConfirm">
            Create
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, defineComponent, watch, computed } from 'vue'
import { Folder, Document, List, FolderAdd, DocumentAdd, Plus, Delete, CopyDocument } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'SchemaTree',
  components: {
    Folder,
    Document,
    List,
    FolderAdd,
    DocumentAdd,
    Plus,
    Delete,
    CopyDocument
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    currentNode: {
      type: Object,
      default: null
    }
  },
  emits: ['node-click', 'node-drop', 'node-add', 'node-delete', 'node-copy', 'node-set-group'],
  setup(props, { emit }) {
    const treeRef = ref(null)
    const groupSelectTree = ref(null)
    const contextMenuVisible = ref(false)
    const groupSelectVisible = ref(false)
    const createGroupVisible = ref(false)
    const contextMenuStyle = ref({
      position: 'fixed',
      top: '0px',
      left: '0px',
      margin: '0'
    })
    const currentNode = ref(null)
    const selectedGroupNode = ref(null)
    const newGroupForm = ref({
      name: '',
      color: '#409EFF',
      description: ''
    })
    const currentNodeKey = computed(() => props.currentNode?.id)

    const defaultProps = {
      children: 'children',
      label: 'name'
    }

    const generateId = () => {
      return Date.now().toString()
    }

    const getIconClass = (type) => {
      return {
        'tree-icon': true,
        'is-group': type === 'group',
        'is-schema': type === 'schema',
        'is-column': type === 'column'
      }
    }

    const handleNodeClick = (data) => {
      emit('node-click', data)
    }

    const handleRootContextMenu = (event) => {
      const isTreeContainer = event.target.classList.contains('schema-tree-container') ||
                            event.target.classList.contains('schema-tree')
      if (isTreeContainer) {
        event.preventDefault()
        event.stopPropagation()
        currentNode.value = null
        contextMenuStyle.value = {
          position: 'fixed',
          top: event.clientY + 'px',
          left: event.clientX + 'px',
          margin: '0'
        }
        contextMenuVisible.value = true
      }
    }

    const handleNodeContextMenu = (event, data, node) => {
      event.preventDefault()
      event.stopPropagation()
      currentNode.value = data
      contextMenuStyle.value = {
        position: 'fixed',
        top: event.clientY + 'px',
        left: event.clientX + 'px',
        margin: '0'
      }
      contextMenuVisible.value = true
    }

    const handleAddNode = (type) => {
      const newNode = {
        id: generateId(),
        name: type === 'group' ? 'New Group' : type === 'schema' ? 'New Schema' : 'New Column',
        type: type,
        color: '#409EFF',
        description: '',
        children: type !== 'column' ? [] : undefined
      }

      if (type === 'schema') {
        newNode.database = ''
        newNode.tableName = ''
      } else if (type === 'column') {
        newNode.dataType = 'string'
        newNode.required = false
        newNode.defaultValue = null
      }

      emit('node-add', newNode, currentNode.value)
      contextMenuVisible.value = false
    }

    const handleDeleteNode = () => {
      ElMessageBox.confirm(
        'Are you sure you want to delete this node? All child nodes will also be deleted.',
        'Confirm Delete',
        {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).then(() => {
        emit('node-delete', currentNode.value)
        contextMenuVisible.value = false
      }).catch(() => {})
    }

    const handleCopyNode = () => {
      const copyNode = (node) => {
        const newNode = { ...node }
        newNode.id = generateId()
        if (newNode.children) {
          newNode.children = newNode.children.map(child => copyNode(child))
        }
        return newNode
      }

      const copiedNode = copyNode(currentNode.value)
      copiedNode.name = `${copiedNode.name} (Copy)`
      emit('node-copy', copiedNode, currentNode.value)
      contextMenuVisible.value = false
    }

    const hasParentNode = (node) => {
      const findParent = (items, targetId) => {
        for (const item of items) {
          if (item.children) {
            if (item.children.some(child => child.id === targetId)) {
              return true
            }
            if (findParent(item.children, targetId)) {
              return true
            }
          }
        }
        return false
      }
      return findParent(props.data, node.id)
    }

    const getGroupNodes = () => {
      const filterGroups = (items) => {
        return items.filter(item => item.type === 'group').map(item => ({
          ...item,
          children: item.children ? filterGroups(item.children) : []
        }))
      }
      return filterGroups(props.data)
    }

    const handleSetGroup = () => {
      groupSelectVisible.value = true
      contextMenuVisible.value = false
    }

    const handleGroupSelect = (data) => {
      selectedGroupNode.value = data
    }

    const handleGroupSelectConfirm = () => {
      if (selectedGroupNode.value) {
        emit('node-set-group', currentNode.value, selectedGroupNode.value)
        groupSelectVisible.value = false
        selectedGroupNode.value = null
        contextMenuVisible.value = false
      }
    }

    const handleCreateGroup = () => {
      selectedGroupNode.value = null
      createGroupVisible.value = true
    }

    const handleCreateSubGroup = () => {
      createGroupVisible.value = true
    }

    const handleCreateGroupConfirm = () => {
      const newGroup = {
        id: generateId(),
        name: newGroupForm.value.name,
        type: 'group',
        color: newGroupForm.value.color,
        description: newGroupForm.value.description,
        children: []
      }

      emit('node-add', newGroup, selectedGroupNode.value)
      
      if (groupSelectVisible.value) {
        selectedGroupNode.value = newGroup
      }

      createGroupVisible.value = false
      newGroupForm.value = {
        name: '',
        color: '#409EFF',
        description: ''
      }
    }

    const allowDrop = (draggingNode, dropNode, type) => {
      if (type === 'inner') {
        return false
      }

      const draggingType = draggingNode.data.type
      const dropType = dropNode.data.type

      if (draggingType !== dropType) {
        return false
      }

      const isRoot = (node) => {
        return !node.parent || node.parent.data.id === undefined
      }

      if (isRoot(dropNode)) {
        return isRoot(draggingNode)
      }

      return draggingNode.parent && dropNode.parent && 
             draggingNode.parent.data.id === dropNode.parent.data.id
    }

    const allowDrag = (node) => {
      return true
    }

    const handleDragEnd = (draggingNode, dropNode, dropType) => {
      if (dropNode && dropType !== 'inner') {
        emit('node-drop', draggingNode.data, dropNode.data, dropType)
      }
    }

    return {
      treeRef,
      groupSelectTree,
      contextMenuVisible,
      groupSelectVisible,
      createGroupVisible,
      contextMenuStyle,
      currentNode,
      selectedGroupNode,
      newGroupForm,
      defaultProps,
      getIconClass,
      handleNodeClick,
      handleRootContextMenu,
      handleNodeContextMenu,
      handleAddNode,
      handleDeleteNode,
      handleCopyNode,
      hasParentNode,
      getGroupNodes,
      handleSetGroup,
      handleGroupSelect,
      handleGroupSelectConfirm,
      handleCreateGroup,
      handleCreateSubGroup,
      handleCreateGroupConfirm,
      allowDrop,
      allowDrag,
      handleDragEnd,
      currentNodeKey
    }
  }
})
</script>

<style scoped>
.schema-tree-container {
  height: 100%;
  position: relative;
  padding: 10px;
  min-height: 200px;
  background-color: #fff;
}

.schema-tree {
  height: 100%;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-icon {
  font-size: 16px;
}

.is-group {
  color: #409EFF;
}

.is-schema {
  color: #67C23A;
}

.is-column {
  color: #E6A23C;
}

:deep(.context-menu-dialog) {
  margin: 0;
  padding: 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.context-menu-dialog .el-dialog__header) {
  display: none;
}

:deep(.context-menu-dialog .el-dialog__body) {
  padding: 0;
}

.context-menu-content {
  background: white;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 160px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: #ecf5ff;
}

.menu-item.danger {
  color: #F56C6C;
}

.menu-item.danger:hover {
  background-color: #fef0f0;
}

.menu-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.empty-group {
  padding: 20px;
  text-align: center;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}
</style> 