import { createRouter, createWebHistory } from 'vue-router'
import BasicFieldsPage from './pages/BasicFieldsPage.vue'
import ValidationPage from './pages/ValidationPage.vue'
import LinkagePage from './pages/LinkagePage.vue'
import SchemaEditorPage from './pages/SchemaEditorPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/basic-fields' },
    { path: '/basic-fields', component: BasicFieldsPage },
    { path: '/validation', component: ValidationPage },
    { path: '/linkage', component: LinkagePage },
    { path: '/schema-editor', component: SchemaEditorPage },
  ],
})

export default router
