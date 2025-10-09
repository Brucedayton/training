<template>
  <el-container class="layout-container">
    <el-aside width="300px" class="sidebar">
      <div class="logo">
        <h2>Permission Management System</h2>
      </div>
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>
        <el-menu-item index="/apply">
          <el-icon><DocumentAdd /></el-icon>
          <span>Permission Request</span>
        </el-menu-item>
        <el-menu-item index="/approve">
          <el-icon><Check /></el-icon>
          <span>Approval Management</span>
        </el-menu-item>
        <el-menu-item index="/authorize">
          <el-icon><Key /></el-icon>
          <span>Authorization Management</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h3>{{ getPageTitle() }}</h3>
          <div class="user-info">
            <el-dropdown>
              <span class="user-name">
                Administrator <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>Profile Settings</el-dropdown-item>
                  <el-dropdown-item>Logout</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()

    const getPageTitle = () => {
      const titleMap = {
        '/': 'Dashboard',
        '/apply': 'Permission Request',
        '/approve': 'Approval Management',
        '/authorize': 'Authorization Management'
      }
      return titleMap[route.path] || 'Permission Management System'
    }

    return {
      getPageTitle
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  color: white;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #434a50;
}

.logo h2 {
  color: #bfcbd9;
  font-size: 18px;
  margin: 0;
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 80px);
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  cursor: pointer;
  color: #333;
  font-size: 14px;
}

.main-content {
  background-color: #f5f5f5;
  padding: 20px;
}
</style>
