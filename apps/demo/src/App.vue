<template>
  <div class="app-layout">
    <header class="app-header">
      <h1 class="app-title">D-Form Demo</h1>
    </header>
    <div class="app-body">
      <aside class="app-sidebar">
        <nav class="sidebar-nav">
          <router-link to="/basic-fields" class="nav-link">Basic Fields</router-link>
          <router-link to="/validation" class="nav-link">Validation</router-link>
          <router-link to="/linkage" class="nav-link">Linkage</router-link>
          <router-link to="/schema-editor" class="nav-link">Schema Editor</router-link>
          <router-link to="/form-layout" class="nav-link">Form Layout</router-link>
          <router-link to="/layout" class="nav-link">Layout</router-link>
          <router-link to="/custom-registry" class="nav-link">Custom Registry</router-link>
          <router-link to="/ai2form" class="nav-link">AI → Form</router-link>
        </nav>
      </aside>
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f0f2f5;
  color: #303133;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #1a1a2e;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #e0e0e0;
  letter-spacing: 0.5px;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #e4e7ed;
  padding: 16px 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: block;
  padding: 10px 24px;
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: #f5f7fa;
  color: #409eff;
}

.nav-link.router-link-active {
  background: #ecf5ff;
  color: #409eff;
  border-left-color: #409eff;
  font-weight: 500;
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
