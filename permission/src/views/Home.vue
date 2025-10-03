<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="file-tree-card">
          <template #header>
            <div class="card-header">
              <span>File Tree</span>
            </div>
          </template>
          <FileTree @apply-permission="handleApplyPermission" />
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>System Overview</span>
            </div>
          </template>
          
          <el-row :gutter="20" class="stats-row">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-number">{{ stats.pendingApprovals }}</div>
                <div class="stat-label">Pending</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-number">{{ stats.totalApplications }}</div>
                <div class="stat-label">Total Applications</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-number">{{ stats.approvedCount }}</div>
                <div class="stat-label">Approved</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-number">{{ stats.rejectedCount }}</div>
                <div class="stat-label">Rejected</div>
              </div>
            </el-col>
          </el-row>
          
          <el-divider />
          
          <div class="recent-activities">
            <h4>Recent Activities</h4>
            <el-timeline>
              <el-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :timestamp="activity.timestamp"
                :type="activity.type"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
          
          <el-divider />
          
          <div class="permission-center-section">
            <h4>Permission Management</h4>
            <p>Manage user permissions, roles, and access control for your organization.</p>
            <el-button type="primary" size="large" @click="openPermissionCenter">
              <el-icon><Key /></el-icon>
              Permission Center
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  
  <!-- Permission Center Dialog -->
  <PermissionCenterDialog v-model:visible="permissionCenterVisible" />
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import FileTree from '../components/FileTree.vue'
import PermissionCenterDialog from '../components/PermissionCenterDialog.vue'

const stats = reactive({
  pendingApprovals: 5,
  totalApplications: 128,
  approvedCount: 95,
  rejectedCount: 28
})

const recentActivities = ref([
  {
    id: 1,
    content: 'John requested read permission for file "Product Requirements.pdf"',
    timestamp: '2024-01-15 14:30',
    type: 'primary'
  },
  {
    id: 2,
    content: 'Sarah\'s permission request has been approved',
    timestamp: '2024-01-15 13:45',
    type: 'success'
  },
  {
    id: 3,
    content: 'Mike requested write permission for folder "Code Repository"',
    timestamp: '2024-01-15 12:20',
    type: 'primary'
  },
  {
    id: 4,
    content: 'Lisa\'s permission request has been rejected',
    timestamp: '2024-01-15 11:15',
    type: 'danger'
  }
])

const permissionCenterVisible = ref(false)

const handleApplyPermission = (fileData) => {
  console.log('Request permission:', fileData)
  // Navigate to application page or show application dialog
}

const openPermissionCenter = () => {
  permissionCenterVisible.value = true
}
</script>

<style scoped>
.home-container {
  height: 100%;
}

.file-tree-card,
.content-card {
  height: 600px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.recent-activities h4 {
  margin-bottom: 16px;
  color: #333;
}

.permission-center-section {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.permission-center-section h4 {
  margin-bottom: 10px;
  color: #333;
}

.permission-center-section p {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}
</style>
