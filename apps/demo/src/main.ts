import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { registerElementPlusComponents } from '@d-form/element-plus'
import { registerComponent } from '@d-form/vue'
import RatingInputAdapter from './components/RatingInputAdapter.vue'
import { loader } from '@guolao/vue-monaco-editor'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import App from './App.vue'
import router from './router'

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') return new jsonWorker()
    return new editorWorker()
  },
}

loader.config({ monaco })

const app = createApp(App)

app.use(ElementPlus)
registerElementPlusComponents()
registerComponent('rating-input', RatingInputAdapter)
app.use(router)

app.mount('#app')
