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
          :current-node="currentNode"
          @node-click="handleNodeClick"
          @node-drop="handleNodeDrop"
          @node-add="handleNodeAdd"
          @node-delete="handleNodeDelete"
          @node-copy="handleNodeCopy"
          @node-set-group="handleNodeSetGroup"
          @node-unlink="handleUnlink"
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
import { ElMessage, ElMessageBox } from 'element-plus'
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
      // 弹出确认框，询问是否需要链接到源节点
      ElMessageBox.confirm(
        'Do you want to link this copy to the source node? Linked nodes will be updated together when source node changes.',
        'Copy Mode',
        {
          confirmButtonText: 'Link to Source',
          cancelButtonText: 'Independent Copy',
          distinguishCancelAndClose: true,
          type: 'info'
        }
      ).then(() => {
        // 用户选择链接模式
        const newNode = {
          ...copiedNode,
          sourceId: sourceNode.id,  // 记录源节点ID
          isLinked: true           // 标记为链接模式
        }
        addCopyNodeToTree(newNode, sourceNode)
      }).catch((action) => {
        if (action === 'cancel') {
          // 用户选择独立复制
          const newNode = {
            ...copiedNode,
            sourceId: null,
            isLinked: false
          }
          addCopyNodeToTree(newNode, sourceNode)
        }
      })
    }

    // 添加复制节点到树中的辅助函数
    const addCopyNodeToTree = (copiedNode, sourceNode) => {
      if (!hasParentNode(sourceNode)) {
        treeData.value = [...treeData.value, copiedNode]
      } else {
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
      // 找到要移动的节点和目标节点所在的数组
      const findNodesArray = (items, targetId) => {
        // 检查根级别
        if (items.some(item => item.id === targetId)) {
          return items
        }

        // 递归检查子级
        for (const item of items) {
          if (item.children) {
            if (item.children.some(child => child.id === targetId)) {
              return item.children
            }
            const result = findNodesArray(item.children, targetId)
            if (result) {
              return result
            }
          }
        }
        return null
      }

      // 获取节点所在的数组
      const nodesArray = findNodesArray(treeData.value, dropNode.id)
      if (!nodesArray) {
        return
      }

      // 找到源节点和目标节点的索引
      const dragIndex = nodesArray.findIndex(item => item.id === draggingNode.id)
      const dropIndex = nodesArray.findIndex(item => item.id === dropNode.id)

      if (dragIndex === -1 || dropIndex === -1) {
        return
      }

      // 从原位置移除节点
      const [movedNode] = nodesArray.splice(dragIndex, 1)

      // 计算新的插入位置
      let newIndex = dropIndex
      if (dropType === 'next') {
        newIndex++
      }
      // 如果拖动位置在目标位置之前，需要调整目标位置
      if (dragIndex < dropIndex) {
        newIndex--
      }

      // 在新位置插入节点
      nodesArray.splice(newIndex, 0, movedNode)

      // 触发更新
      treeData.value = [...treeData.value]
    }

    const handleNodeUpdate = (updatedNode) => {
      const updateNode = (items) => {
        return items.map(item => {
          if (item.id === updatedNode.id) {
            const newNode = { ...item, ...updatedNode }
            // 如果当前节点是源节点，更新所有链接到它的节点
            if (isSourceNode(item)) {
              updateLinkedNodes(items, newNode)
            }
            return newNode
          }
          if (item.children) {
            item.children = updateNode(item.children)
          }
          return item
        })
      }
      treeData.value = updateNode([...treeData.value])
    }

    // 检查节点是否是其他节点的源节点
    const isSourceNode = (node) => {
      const hasLinkedNodes = (items) => {
        for (const item of items) {
          if (item.sourceId === node.id && item.isLinked) {
            return true
          }
          if (item.children && hasLinkedNodes(item.children)) {
            return true
          }
        }
        return false
      }
      return hasLinkedNodes(treeData.value)
    }

    // 更新所有链接的节点
    const updateLinkedNodes = (items, sourceNode) => {
      for (const item of items) {
        if (item.sourceId === sourceNode.id && item.isLinked) {
          // 更新链接节点，但保留其ID和链接状态
          Object.assign(item, {
            ...sourceNode,
            id: item.id,
            sourceId: item.sourceId,
            isLinked: item.isLinked
          })
        }
        if (item.children) {
          updateLinkedNodes(item.children, sourceNode)
        }
      }
    }

    // 添加取消链接的功能
    const handleUnlink = (node) => {
      ElMessageBox.confirm(
        'Are you sure to unlink this node from its source? It will become an independent node.',
        'Unlink Node',
        {
          confirmButtonText: 'Unlink',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).then(() => {
        const unlinkNode = (items) => {
          return items.map(item => {
            if (item.id === node.id) {
              return {
                ...item,
                sourceId: null,
                isLinked: false
              }
            }
            if (item.children) {
              item.children = unlinkNode(item.children)
            }
            return item
          })
        }
        treeData.value = unlinkNode([...treeData.value])
      }).catch(() => {})
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
      handleNodeUpdate,
      handleUnlink
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