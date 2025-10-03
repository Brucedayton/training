<template>
  <div class="file-tree">
    <el-tree
      :data="treeData"
      :props="defaultProps"
      :expand-on-click-node="false"
      :default-expand-all="false"
      node-key="id"
      ref="treeRef"
      @node-click="handleNodeClick"
      class="custom-tree"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <el-icon v-if="data.type === 'folder'">
            <Folder v-if="!node.expanded" />
            <FolderOpened v-else />
          </el-icon>
          <el-icon v-else>
            <Document />
          </el-icon>
          <span class="node-label">{{ data.label }}</span>
          <div class="node-actions" v-if="data.type === 'file' || data.type === 'folder'">
            <el-button
              type="primary"
              size="small"
              @click.stop="applyPermission(data)"
            >
              Request Permission
            </el-button>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['apply-permission'])

const treeRef = ref()
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 模拟文件树数据
const treeData = reactive([
  {
    id: 1,
    label: '项目文档',
    type: 'folder',
    children: [
      {
        id: 11,
        label: '需求文档',
        type: 'folder',
        children: [
          {
            id: 111,
            label: '产品需求文档.pdf',
            type: 'file',
            path: '/项目文档/需求文档/产品需求文档.pdf'
          },
          {
            id: 112,
            label: '技术需求文档.pdf',
            type: 'file',
            path: '/项目文档/需求文档/技术需求文档.pdf'
          }
        ]
      },
      {
        id: 12,
        label: '设计文档',
        type: 'folder',
        children: [
          {
            id: 121,
            label: 'UI设计稿.psd',
            type: 'file',
            path: '/项目文档/设计文档/UI设计稿.psd'
          },
          {
            id: 122,
            label: '原型图.axure',
            type: 'file',
            path: '/项目文档/设计文档/原型图.axure'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    label: '代码仓库',
    type: 'folder',
    children: [
      {
        id: 21,
        label: '前端代码',
        type: 'folder',
        children: [
          {
            id: 211,
            label: 'main.js',
            type: 'file',
            path: '/代码仓库/前端代码/main.js'
          },
          {
            id: 212,
            label: 'App.vue',
            type: 'file',
            path: '/代码仓库/前端代码/App.vue'
          }
        ]
      },
      {
        id: 22,
        label: '后端代码',
        type: 'folder',
        children: [
          {
            id: 221,
            label: 'server.js',
            type: 'file',
            path: '/代码仓库/后端代码/server.js'
          },
          {
            id: 222,
            label: 'database.sql',
            type: 'file',
            path: '/代码仓库/后端代码/database.sql'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    label: '配置文件',
    type: 'folder',
    children: [
      {
        id: 31,
        label: 'config.json',
        type: 'file',
        path: '/配置文件/config.json'
      },
      {
        id: 32,
        label: 'package.json',
        type: 'file',
        path: '/配置文件/package.json'
      }
    ]
  }
])

const handleNodeClick = (data) => {
  if (data.type === 'file') {
    console.log('点击文件:', data)
  }
}

const applyPermission = (fileData) => {
  emit('apply-permission', fileData)
  const itemType = fileData.type === 'folder' ? 'folder' : 'file'
  ElMessage.success(`Permission requested for ${itemType} "${fileData.label}"`)
}
</script>

<style scoped>
.file-tree {
  background: white;
  border-radius: 4px;
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}

.custom-tree {
  height: 100%;
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.tree-node .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.node-label {
  flex: 1;
  font-size: 14px;
}

.node-actions {
  margin-left: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

:deep(.el-tree-node__content) {
  height: 32px;
  padding: 0 8px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}
</style>
