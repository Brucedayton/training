<template>
  <el-dialog
    v-model="dialogVisible"
    title="Schema Editor"
    width="80%"
    :before-close="handleClose"
  >
    <div class="schema-editor">
      <div class="left-panel">
        <div v-if="treeData.length === 0" class="empty-tree">
          <el-empty description="No schemas yet">
            <el-button type="primary" @click="handleAddRoot">Create Schema</el-button>
          </el-empty>
        </div>
        <schema-tree
          v-else
          :data="treeData"
          @node-click="handleNodeClick"
          @node-drop="handleNodeDrop"
          @node-add="handleNodeAdd"
          @node-delete="handleNodeDelete"
          @node-copy="handleNodeCopy"
          @node-set-group="handleNodeSetGroup"
        />
      </div>
      <div class="right-panel">
        <schema-form
          v-if="currentNode"
          :node="currentNode"
          @update="handleNodeUpdate"
        />
        <div v-else class="empty-state">
          Select a node to edit its properties
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleSave">
          Save
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import SchemaTree from './SchemaTree.vue'
import SchemaForm from './SchemaForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const dialogVisible = ref(props.modelValue)
const treeData = ref(props.initialData)
const currentNode = ref(null)

// 监听 modelValue 的变化
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
})

// 监听 dialogVisible 的变化
watch(() => dialogVisible.value, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听 initialData 的变化
watch(() => props.initialData, (newVal) => {
  treeData.value = newVal
}, { deep: true })

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSave = () => {
  emit('save', treeData.value)
  handleClose()
}

const handleNodeClick = (node) => {
  currentNode.value = node
}

const generateId = () => {
  return Date.now().toString()
}

const handleAddRoot = () => {
  const newNode = {
    id: generateId(),
    name: 'New Schema',
    type: 'schema',
    color: '#67C23A',
    description: '',
    database: '',
    tableName: '',
    children: []
  }
  treeData.value.push(newNode)
  currentNode.value = newNode
}

const handleNodeAdd = (newNode, parentNode) => {
  const addNodeToTree = (items) => {
    return items.map(item => {
      if (!parentNode || item.id === parentNode.id) {
        if (!item.children) {
          item.children = []
        }
        item.children.push(newNode)
        return item
      }
      if (item.children) {
        item.children = addNodeToTree(item.children)
      }
      return item
    })
  }

  if (!parentNode) {
    treeData.value.push(newNode)
  } else {
    treeData.value = addNodeToTree(treeData.value)
  }
  currentNode.value = newNode
}

const handleNodeUpdate = (updatedNode) => {
  const updateNode = (items) => {
    return items.map(item => {
      if (item.id === updatedNode.id) {
        return { ...item, ...updatedNode }
      }
      if (item.children) {
        item.children = updateNode(item.children)
      }
      return item
    })
  }
  treeData.value = updateNode(treeData.value)
}

const handleNodeDelete = (nodeToDelete) => {
  const deleteNodeFromTree = (items) => {
    return items.filter(item => {
      if (item.id === nodeToDelete.id) {
        return false
      }
      if (item.children) {
        item.children = deleteNodeFromTree(item.children)
      }
      return true
    })
  }

  treeData.value = deleteNodeFromTree(treeData.value)
  if (currentNode.value && currentNode.value.id === nodeToDelete.id) {
    currentNode.value = null
  }
}

const handleNodeDrop = (draggingNode, dropNode, dropType) => {
  if (draggingNode.type !== dropNode.type) {
    ElMessage.error('Can only move between nodes of the same type')
    return false
  }
  return true
}

const handleNodeCopy = (copiedNode, sourceNode) => {
  // 如果源节点有父节点，复制到同一父节点下
  const addCopyToParent = (items) => {
    return items.map(item => {
      if (item.children && item.children.some(child => child.id === sourceNode.id)) {
        item.children.push(copiedNode)
        return item
      }
      if (item.children) {
        item.children = addCopyToParent(item.children)
      }
      return item
    })
  }

  // 如果源节点是顶层节点，直接添加到顶层
  if (!hasParentNode(sourceNode)) {
    treeData.value.push(copiedNode)
  } else {
    treeData.value = addCopyToParent(treeData.value)
  }
  currentNode.value = copiedNode
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
  return findParent(treeData.value, node.id)
}

const handleNodeSetGroup = (node, groupNode) => {
  // 从原位置移除节点
  const removeNode = (items) => {
    return items.filter(item => {
      if (item.id === node.id) {
        return false
      }
      if (item.children) {
        item.children = removeNode(item.children)
      }
      return true
    })
  }

  // 添加到新分组
  const addToGroup = (items) => {
    return items.map(item => {
      if (item.id === groupNode.id) {
        if (!item.children) {
          item.children = []
        }
        item.children.push(node)
        return item
      }
      if (item.children) {
        item.children = addToGroup(item.children)
      }
      return item
    })
  }

  treeData.value = removeNode(treeData.value)
  treeData.value = addToGroup(treeData.value)
}
</script>

<style scoped>
.schema-editor {
  display: flex;
  gap: 20px;
  height: 600px;
}

.left-panel {
  width: 300px;
  border-right: 1px solid #dcdfe6;
  overflow: auto;
}

.right-panel {
  flex: 1;
  overflow: auto;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.empty-tree {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.dialog-footer {
  margin-top: 20px;
}
</style> 