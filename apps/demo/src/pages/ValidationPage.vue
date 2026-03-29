<template>
  <div class="page">
    <h2 class="page-title">Validation</h2>
    <p class="page-desc">Form validation with built-in rules and custom validators</p>

    <div class="form-card">
      <DForm ref="formRef" :schema="schema" :initial-values="initialValues" @submit="handleSubmit">
        <div class="button-group">
          <el-button type="primary" native-type="submit">Submit</el-button>
          <el-button @click="() => formRef?.reset()">Reset</el-button>
        </div>
      </DForm>
    </div>

    <div v-if="submittedValues" class="result-card">
      <h3>Submitted Values</h3>
      <pre>{{ JSON.stringify(submittedValues, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DForm } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'
import { ElButton } from 'element-plus'

const schema: FormSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      component: 'input',
      title: 'Username',
      placeholder: 'Enter username',
      validation: {
        rules: [
          { type: 'required', message: 'Username is required', trigger: 'blur' },
          {
            type: 'minLength',
            value: 3,
            message: 'Username must be at least 3 characters',
            trigger: 'blur',
          },
        ],
      },
    },
    email: {
      type: 'string',
      component: 'input',
      title: 'Email',
      placeholder: 'Enter email',
      validation: {
        rules: [
          { type: 'required', message: 'Email is required', trigger: 'change' },
          {
            type: 'pattern',
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format',
            trigger: 'change',
          },
        ],
      },
    },
    password: {
      type: 'string',
      component: 'input',
      title: 'Password',
      placeholder: 'Enter password',
      validation: {
        rules: [
          { type: 'required', message: 'Password is required' },
          { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
        ],
      },
    },
    age: {
      type: 'number',
      component: 'input-number',
      title: 'Age',
      validation: {
        rules: [
          { type: 'required', message: 'Age is required' },
          { type: 'min', value: 18, message: 'Must be at least 18' },
          { type: 'max', value: 120, message: 'Must be at most 120' },
        ],
      },
    },
    website: {
      type: 'string',
      component: 'input',
      title: 'Website',
      placeholder: 'https://...',
      validation: {
        rules: [
          {
            type: 'pattern',
            value: /^https?:\/\/.+/,
            message: 'Must be a valid URL starting with http(s)://',
          },
        ],
      },
    },
  },
}

const initialValues = {
  username: '',
  email: '',
  password: '',
  age: undefined as number | undefined,
  website: '',
}

const formRef = ref()
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
.button-group {
  display: flex;
  gap: 12px;
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
</style>
