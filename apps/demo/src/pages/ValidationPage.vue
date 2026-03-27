<template>
  <div class="page">
    <h2 class="page-title">Validation</h2>
    <p class="page-desc">Form validation with built-in rules and custom validators</p>

    <div class="form-card">
      <DForm :schema="schema" :initial-values="initialValues" @submit="handleSubmit">
        <div class="field-group">
          <div class="field-row">
            <label class="field-label">Username (required, min 3 chars)</label>
            <DField name="username" :schema="schema.properties.username" />
            <span v-if="errors.username" class="field-error">{{ errors.username }}</span>
          </div>
          <div class="field-row">
            <label class="field-label">Email (required, pattern)</label>
            <DField name="email" :schema="schema.properties.email" />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>
          <div class="field-row">
            <label class="field-label">Password (required, min 8 chars)</label>
            <DField name="password" :schema="schema.properties.password" />
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>
          <div class="field-row">
            <label class="field-label">Age (min 18, max 120)</label>
            <DField name="age" :schema="schema.properties.age" />
            <span v-if="errors.age" class="field-error">{{ errors.age }}</span>
          </div>
          <div class="field-row">
            <label class="field-label">Website (pattern)</label>
            <DField name="website" :schema="schema.properties.website" />
            <span v-if="errors.website" class="field-error">{{ errors.website }}</span>
          </div>
        </div>
        <div class="button-group">
          <el-button type="primary" native-type="submit">Submit</el-button>
          <el-button @click="handleReset">Reset</el-button>
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
import { DForm, DField, useForm } from '@d-form/vue'
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
          { type: 'required', message: 'Username is required' },
          { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
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
          { type: 'required', message: 'Email is required' },
          { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
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

const errors = ref<Record<string, string>>({})
const submittedValues = ref<Record<string, any> | null>(null)

const handleSubmit = (values: any) => {
  submittedValues.value = values
  errors.value = {}
}

const handleReset = () => {
  errors.value = {}
  submittedValues.value = null
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
.field-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 20px;
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}
.field-error {
  font-size: 12px;
  color: #f56c6c;
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
