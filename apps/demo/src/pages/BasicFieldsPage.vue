<template>
  <div class="page">
    <h2 class="page-title">Basic Fields</h2>
    <p class="page-desc">All 8 Element Plus field types rendered via DForm</p>

    <div class="form-card">
      <DForm :schema="schema" :initial-values="initialValues" @submit="handleSubmit">
        <DFormItem name="name" :schema="schema.properties.name" />
        <DFormItem name="category" :schema="schema.properties.category" />
        <DFormItem name="birthday" :schema="schema.properties.birthday" />
        <DFormItem name="notes" :schema="schema.properties.notes" />
        <DFormItem name="quantity" :schema="schema.properties.quantity" />
        <DFormItem name="gender" :schema="schema.properties.gender" />
        <DFormItem name="active" :schema="schema.properties.active" />
        <DFormItem name="agree" :schema="schema.properties.agree" />
        <el-button type="primary" native-type="submit">Submit</el-button>
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
import { DForm, DFormItem } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'
import { ElButton } from 'element-plus'

const schema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name', placeholder: 'Enter your name' },
    category: {
      type: 'string',
      component: 'select',
      title: 'Category',
      placeholder: 'Select category',
      componentProps: {
        options: [
          { label: 'Technology', value: 'tech' },
          { label: 'Science', value: 'science' },
          { label: 'Art', value: 'art' },
        ],
      },
    },
    birthday: {
      type: 'string',
      component: 'date-picker',
      title: 'Birthday',
      placeholder: 'Pick a date',
    },
    notes: { type: 'string', component: 'textarea', title: 'Notes', placeholder: 'Enter notes...' },
    quantity: { type: 'number', component: 'input-number', title: 'Quantity' },
    gender: {
      type: 'string',
      component: 'radio',
      title: 'Gender',
      componentProps: {
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
        ],
      },
    },
    active: { type: 'boolean', component: 'switch', title: 'Active' },
    agree: { type: 'boolean', component: 'checkbox', title: 'Agree' },
  },
}

const initialValues = {
  name: '',
  category: '',
  birthday: '',
  notes: '',
  quantity: 1,
  gender: '',
  active: false,
  agree: false,
}

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
</style>
