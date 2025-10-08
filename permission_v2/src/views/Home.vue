<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>Permission Management System</h1>
      <p>Manage user permissions, roles, and access control for your organization.</p>
      <el-button type="primary" size="large" @click="openPermissionCenter">
        <el-icon><Key /></el-icon>
        Permission Center
      </el-button>
    </div>
    
    <!-- Permission Center Dialog with all features -->
    <PermissionCenterDialog v-model:visible="permissionCenterVisible" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PermissionCenterDialog from '../components/PermissionCenterDialog.vue'

const permissionCenterVisible = ref(false)

const openPermissionCenter = () => {
  permissionCenterVisible.value = true
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-section {
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.welcome-section h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: 300;
}

.welcome-section p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.welcome-section .el-button {
  font-size: 1.1rem;
  padding: 15px 30px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
</style>