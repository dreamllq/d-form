import { createRouter, createWebHistory } from 'vue-router'
import BasicFieldsPage from './pages/BasicFieldsPage.vue'
import ValidationPage from './pages/ValidationPage.vue'
import LinkagePage from './pages/LinkagePage.vue'
import SchemaEditorPage from './pages/SchemaEditorPage.vue'
import FormLayoutPage from './pages/FormLayoutPage.vue'
import LayoutPage from './pages/LayoutPage.vue'
import CustomRegistryPage from './pages/CustomRegistryPage.vue'
import Ai2FormPage from './pages/Ai2FormPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/basic-fields' },
    { path: '/basic-fields', component: BasicFieldsPage },
    { path: '/validation', component: ValidationPage },
    { path: '/linkage', component: LinkagePage },
    { path: '/schema-editor', component: SchemaEditorPage },
    { path: '/form-layout', component: FormLayoutPage },
    { path: '/layout', component: LayoutPage },
    { path: '/custom-registry', component: CustomRegistryPage },
    { path: '/ai2form', component: Ai2FormPage },
  ],
})

export default router
