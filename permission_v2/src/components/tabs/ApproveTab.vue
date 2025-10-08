<template>
  <div class="approve-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Approval Management</span>
          <div class="header-actions">
            <el-button type="primary" @click="batchApprove" :disabled="selectedApplications.length === 0">
              Batch Approve
            </el-button>
            <el-button type="danger" @click="batchReject" :disabled="selectedApplications.length === 0">
              Batch Reject
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="applications"
        @selection-change="handleSelectionChange"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="applicant" label="Applicant" width="120" />
        <el-table-column prop="itemName" label="Item Name" width="200" />
        <el-table-column prop="itemPath" label="Item Path" width="300" show-overflow-tooltip />
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
        <el-table-column prop="roleName" label="Role" width="120" />
        <el-table-column prop="expirationDate" label="Expiration" width="150" />
        <el-table-column prop="createTime" label="Request Time" width="150" />
        <el-table-column prop="status" label="Status" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              type="success"
              size="small"
              @click="approveApplication(scope.row)"
            >
              Approve
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="danger"
              size="small"
              @click="rejectApplication(scope.row)"
            >
              Reject
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="viewDetails(scope.row)"
            >
              Details
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- Application Details Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="Application Details"
      width="600px"
    >
      <div v-if="currentApplication" class="application-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Applicant">{{ currentApplication.applicant }}</el-descriptions-item>
          <el-descriptions-item label="Item Name">{{ currentApplication.itemName }}</el-descriptions-item>
          <el-descriptions-item label="Item Path">{{ currentApplication.itemPath }}</el-descriptions-item>
          <el-descriptions-item label="Item Type">
            <el-tag :type="currentApplication.itemType === 'folder' ? 'warning' : 'info'">
              {{ currentApplication.itemType === 'folder' ? 'Folder' : 'File' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Permission Role">
            <el-tag :type="getPermissionRoleTag(currentApplication.permissionRole)">
              {{ getPermissionRoleText(currentApplication.permissionRole) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Role">{{ currentApplication.roleName }}</el-descriptions-item>
          <el-descriptions-item label="Expiration Date">{{ currentApplication.expirationDate }}</el-descriptions-item>
          <el-descriptions-item label="Request Time">{{ currentApplication.createTime }}</el-descriptions-item>
          <el-descriptions-item label="Current Status">
            <el-tag :type="getStatusType(currentApplication.status)">
              {{ getStatusText(currentApplication.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="reason-section">
          <h4>Request Reason:</h4>
          <p>{{ currentApplication.reason }}</p>
        </div>
        
        <div v-if="currentApplication.approvalComments" class="comments-section">
          <h4>Approval Comments:</h4>
          <p>{{ currentApplication.approvalComments }}</p>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">Close</el-button>
          <el-button
            v-if="currentApplication && currentApplication.status === 'pending'"
            type="success"
            @click="approveFromDialog"
          >
            Approve
          </el-button>
          <el-button
            v-if="currentApplication && currentApplication.status === 'pending'"
            type="danger"
            @click="rejectFromDialog"
          >
            Reject
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- Approval Comments Dialog -->
    <el-dialog
      v-model="commentDialogVisible"
      :title="commentDialogTitle"
      width="500px"
    >
      <el-form :model="commentForm" label-width="80px">
        <el-form-item label="Comments">
          <el-input
            v-model="commentForm.comments"
            type="textarea"
            :rows="4"
            placeholder="Please enter approval comments"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="commentDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmComment">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedApplications = ref([])
const detailDialogVisible = ref(false)
const commentDialogVisible = ref(false)
const commentDialogTitle = ref('')
const currentApplication = ref(null)

const commentForm = reactive({
  comments: ''
})

const applications = ref([
  {
    id: 1,
    applicant: 'John Smith',
    itemName: 'Product Requirements.pdf',
    itemPath: '/Project Documents/Requirements/Product Requirements.pdf',
    itemType: 'file',
    permissionRole: 'viewer',
    roleName: 'Developer',
    expirationDate: '2024-01-22 14:30',
    createTime: '2024-01-15 14:30',
    status: 'pending',
    reason: 'Need to access the latest product requirements for development work',
    approvalComments: ''
  },
  {
    id: 2,
    applicant: 'Sarah Johnson',
    itemName: 'UI Design Files',
    itemPath: '/Project Documents/Design/UI Design Files',
    itemType: 'folder',
    permissionRole: 'editor',
    roleName: 'Developer',
    expirationDate: '2024-02-14 10:20',
    createTime: '2024-01-15 13:45',
    status: 'pending',
    reason: 'Need to update UI design files to match new product requirements',
    approvalComments: ''
  },
  {
    id: 3,
    applicant: 'Mike Wilson',
    itemName: 'server.js',
    itemPath: '/Code Repository/Backend/server.js',
    itemType: 'file',
    permissionRole: 'owner',
    roleName: 'Developer',
    expirationDate: '2024-01-18 12:20',
    createTime: '2024-01-15 12:20',
    status: 'pending',
    reason: 'Need to execute server scripts for system maintenance',
    approvalComments: ''
  },
  {
    id: 4,
    applicant: 'Lisa Brown',
    itemName: 'database.sql',
    itemPath: '/Code Repository/Backend/database.sql',
    itemType: 'file',
    permissionRole: 'viewer',
    roleName: 'Tester',
    expirationDate: '2024-01-16 11:15',
    createTime: '2024-01-15 11:15',
    status: 'approved',
    reason: 'Need to access database structure for testing',
    approvalComments: 'Request is reasonable and approved'
  }
])

onMounted(() => {
  total.value = applications.value.length
})

const handleSelectionChange = (selection) => {
  selectedApplications.value = selection
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadApplications()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadApplications()
}

const loadApplications = () => {
  loading.value = true
  // Simulate loading
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const approveApplication = (application) => {
  currentApplication.value = application
  commentDialogTitle.value = 'Approve Application'
  commentForm.comments = ''
  commentDialogVisible.value = true
}

const rejectApplication = (application) => {
  currentApplication.value = application
  commentDialogTitle.value = 'Reject Application'
  commentForm.comments = ''
  commentDialogVisible.value = true
}

const approveFromDialog = () => {
  commentDialogTitle.value = 'Approve Application'
  commentForm.comments = ''
  commentDialogVisible.value = true
}

const rejectFromDialog = () => {
  commentDialogTitle.value = 'Reject Application'
  commentForm.comments = ''
  commentDialogVisible.value = true
}

const confirmComment = () => {
  if (!commentForm.comments.trim()) {
    ElMessage.warning('Please enter approval comments')
    return
  }
  
  if (currentApplication.value) {
    currentApplication.value.approvalComments = commentForm.comments
    currentApplication.value.status = commentDialogTitle.value === 'Approve Application' ? 'approved' : 'rejected'
    currentApplication.value.approver = 'Administrator'
    currentApplication.value.approveTime = new Date().toLocaleString()
  }
  
  commentDialogVisible.value = false
  detailDialogVisible.value = false
  
  ElMessage.success(commentDialogTitle.value === 'Approve Application' ? 'Application approved' : 'Application rejected')
}

const batchApprove = async () => {
  try {
    await ElMessageBox.confirm(`Are you sure you want to approve the selected ${selectedApplications.value.length} applications?`, 'Batch Approve', {
      type: 'warning'
    })
    
    selectedApplications.value.forEach(app => {
      app.status = 'approved'
      app.approver = 'Administrator'
      app.approveTime = new Date().toLocaleString()
      app.approvalComments = 'Batch approved'
    })
    
    ElMessage.success('Batch approval successful')
    selectedApplications.value = []
  } catch {
    // User cancelled
  }
}

const batchReject = async () => {
  try {
    await ElMessageBox.confirm(`Are you sure you want to reject the selected ${selectedApplications.value.length} applications?`, 'Batch Reject', {
      type: 'warning'
    })
    
    selectedApplications.value.forEach(app => {
      app.status = 'rejected'
      app.approver = 'Administrator'
      app.approveTime = new Date().toLocaleString()
      app.approvalComments = 'Batch rejected'
    })
    
    ElMessage.success('Batch rejection successful')
    selectedApplications.value = []
  } catch {
    // User cancelled
  }
}

const viewDetails = (application) => {
  currentApplication.value = application
  detailDialogVisible.value = true
}

// Helper functions
const getPermissionRoleTag = (role) => {
  const tagMap = {
    owner: 'danger',
    editor: 'warning',
    viewer: 'info'
  }
  return tagMap[role] || 'info'
}

const getPermissionRoleText = (role) => {
  const textMap = {
    owner: 'Owner',
    editor: 'Editor',
    viewer: 'Viewer'
  }
  return textMap[role] || role
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
  }
  return textMap[status] || status
}
</script>

<style scoped>
.approve-container {
  height: 100%;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.application-detail {
  padding: 20px 0;
}

.reason-section,
.comments-section {
  margin-top: 20px;
}

.reason-section h4,
.comments-section h4 {
  margin-bottom: 10px;
  color: #333;
}

.reason-section p,
.comments-section p {
  line-height: 1.6;
  color: #666;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
