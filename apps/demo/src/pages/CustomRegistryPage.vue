<template>
  <div class="page">
    <h2 class="page-title">Custom Registry & defineFormSchema</h2>
    <p class="page-desc">Using defineFormSchema for typed component props with a merged registry</p>

    <div class="form-card">
      <DForm :schema="schema" @submit="handleSubmit">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
    </div>

    <div v-if="submittedValues" class="result-card">
      <h3>Submitted Values</h3>
      <pre>{{ JSON.stringify(submittedValues, null, 2) }}</pre>
    </div>

    <div class="info-card">
      <h3>How it works</h3>
      <ul>
        <li>
          <strong>defineComponentRegistry</strong> — declares component props schemas as a typed
          registry (e.g. <code>'rating-input'</code> maps to its zod props schema).
        </li>
        <li>
          <strong>defineFormSchema</strong> — wraps a form schema and uses the registry to provide
          type-safe <code>componentProps</code> inference based on the <code>component</code> value.
        </li>
        <li>
          <strong>Merged registry</strong> — elementPlusRegistry is spread with custom entries so
          both built-in and custom components get full type checking.
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DForm } from '@d-form/vue'
import { defineFormSchema, defineComponentRegistry } from '@d-form/shared'
import { elementPlusRegistry } from '@d-form/element-plus'
import { customRegistry } from '../schemas'
import { ElButton } from 'element-plus'

const demoRegistry = defineComponentRegistry({
  ...elementPlusRegistry,
  'rating-input': customRegistry['rating-input'],
})

const schema = defineFormSchema(demoRegistry, {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      component: 'input',
      title: 'Username',
      componentProps: { placeholder: '输入用户名', clearable: true },
    },
    level: {
      type: 'number',
      component: 'rating-input',
      title: 'Level',
      componentProps: {
        max: 5,
        allowHalf: true,
        label: '评分',
        description: '请为我们的服务评分',
      },
    },
    category: {
      type: 'string',
      component: 'select',
      title: 'Category',
      componentProps: {
        placeholder: '选择分类',
        options: [
          { label: '技术', value: 'tech' },
          { label: '生活', value: 'life' },
        ],
      },
    },
  },
})

const submittedValues = ref<Record<string, any> | null>(null)

const handleSubmit = (values: any) => {
  submittedValues.value = values
}
</script>

<style scoped>
.page {
  max-width: 800px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}
.page-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}
.form-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.result-card {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.result-card h3 {
  font-size: 15px;
  margin-bottom: 12px;
  color: #303133;
}
.result-card pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  overflow-x: auto;
}
.info-card {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.info-card h3 {
  font-size: 15px;
  margin-bottom: 12px;
  color: #303133;
}
.info-card ul {
  list-style: none;
  padding: 0;
}
.info-card li {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.6;
}
.info-card code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  color: #409eff;
}
</style>
