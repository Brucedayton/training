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
          ref="schemaTreeRef"
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

<script>
import { ref, defineComponent, watch } from 'vue'
import { ElMessage } from 'element-plus'
import SchemaTree from './SchemaTree.vue'
import SchemaForm from './SchemaForm.vue'

export default defineComponent({
  name: 'SchemaDialog',
  components: {
    SchemaTree,
    SchemaForm
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    initialData: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const dialogVisible = ref(props.modelValue)
    const treeData = ref(props.initialData)
    const currentNode = ref(null)
    const schemaTreeRef = ref(null)

    watch(() => props.modelValue, (newVal) => {
      dialogVisible.value = newVal
    })

    watch(() => dialogVisible.value, (newVal) => {
      emit('update:modelValue', newVal)
    })

    watch(() => props.initialData, (newVal) => {
      treeData.value = [...newVal]
    }, { deep: true })

    const generateId = () => {
      return Date.now().toString()
    }

    const handleClose = () => {
      dialogVisible.value = false
      emit('update:modelValue', false)
    }

    const handleSave = () => {
      emit('save', treeData.value)
      handleClose()
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
      treeData.value = [...treeData.value, newNode]
      currentNode.value = newNode
    }

    const handleNodeClick = (node) => {
      currentNode.value = node
    }

    const handleNodeAdd = (newNode, parentNode) => {
      if (parentNode) {
        const addNodeToTree = (items) => {
          return items.map(item => {
            if (item.id === parentNode.id) {
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
        treeData.value = addNodeToTree([...treeData.value])
      } else {
        treeData.value = [...treeData.value, newNode]
      }
      currentNode.value = newNode
    }

    const handleNodeDelete = (node) => {
      const deleteNodeFromTree = (items) => {
        return items.filter(item => {
          if (item.id === node.id) {
            return false
          }
          if (item.children) {
            item.children = deleteNodeFromTree(item.children)
          }
          return true
        })
      }

      treeData.value = deleteNodeFromTree([...treeData.value])
      if (currentNode.value && currentNode.value.id === node.id) {
        currentNode.value = null
      }
    }

    const handleNodeCopy = (copiedNode, sourceNode) => {
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

      if (!hasParentNode(sourceNode)) {
        treeData.value = [...treeData.value, copiedNode]
      } else {
        treeData.value = addCopyToParent([...treeData.value])
      }
      currentNode.value = copiedNode
    }

    const handleNodeSetGroup = (node, groupNode) => {
      console.log('Moving node to group:', { node, groupNode })
      
      const nodeToMove = JSON.parse(JSON.stringify(node))
      
      const filteredTree = treeData.value.filter(item => item.id !== node.id)
      
      const addToGroup = (items) => {
        return items.map(item => {
          if (item.id === groupNode.id) {
            console.log('Found target group:', item.id)
            if (!item.children) {
              item.children = []
            }
            item.children.push(nodeToMove)
            return item
          }
          if (item.children) {
            item.children = addToGroup(item.children)
          }
          return item
        })
      }

      treeData.value = addToGroup(filteredTree)
      console.log('Final tree:', treeData.value)
      
      currentNode.value = nodeToMove
    }

    const handleNodeDrop = (draggingNode, dropNode, dropType) => {
      if (draggingNode.type !== dropNode.type) {
        ElMessage.error('Can only move between nodes of the same type')
        return false
      }
      return true
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
      treeData.value = updateNode([...treeData.value])
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

    return {
      dialogVisible,
      treeData,
      currentNode,
      schemaTreeRef,
      handleClose,
      handleSave,
      handleAddRoot,
      handleNodeClick,
      handleNodeAdd,
      handleNodeDelete,
      handleNodeCopy,
      handleNodeSetGroup,
      handleNodeDrop,
      handleNodeUpdate
    }
  }
})
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