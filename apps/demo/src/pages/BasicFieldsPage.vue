<template>
  <div class="page">
    <h2 class="page-title">Basic Fields</h2>
    <p class="page-desc">All 18 Element Plus field types rendered via DForm</p>

    <div class="form-card">
      <DForm :schema="schema" :initial-values="initialValues" @submit="handleSubmit">
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
import { DForm } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'
import { ElButton } from 'element-plus'

const fetchSuggestions = (queryString: string, cb: any) => {
  const results = [
    { value: 'Vue' },
    { value: 'React' },
    { value: 'Angular' },
    { value: 'Svelte' },
    { value: 'Solid' },
  ].filter((item) => item.value.toLowerCase().includes(queryString.toLowerCase()))
  cb(results)
}

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
    appointmentTime: {
      type: 'string',
      component: 'time-picker',
      title: 'Appointment Time',
      componentProps: { placeholder: 'Pick a time' },
    },
    deliveryTime: {
      type: 'string',
      component: 'time-select',
      title: 'Delivery Time',
      componentProps: { start: '08:00', step: '00:30', end: '20:00', placeholder: 'Select time' },
    },
    satisfaction: {
      type: 'number',
      component: 'slider',
      title: 'Satisfaction',
      componentProps: { min: 0, max: 100, step: 5 },
    },
    rating: {
      type: 'number',
      component: 'rate',
      title: 'Rating',
    },
    favoriteColor: {
      type: 'string',
      component: 'color-picker',
      title: 'Favorite Color',
    },
    region: {
      type: 'array',
      component: 'cascader',
      title: 'Region',
      componentProps: {
        options: [
          {
            value: 'china',
            label: 'China',
            children: [
              {
                value: 'beijing',
                label: 'Beijing',
                children: [
                  { value: 'haidian', label: 'Haidian' },
                  { value: 'chaoyang', label: 'Chaoyang' },
                ],
              },
              {
                value: 'shanghai',
                label: 'Shanghai',
                children: [
                  { value: 'pudong', label: 'Pudong' },
                  { value: "jing'an", label: "Jing'an" },
                ],
              },
            ],
          },
        ],
      },
    },
    department: {
      type: 'string',
      component: 'tree-select',
      title: 'Department',
      componentProps: {
        data: [
          {
            value: 'engineering',
            label: 'Engineering',
            children: [
              { value: 'frontend', label: 'Frontend' },
              { value: 'backend', label: 'Backend' },
            ],
          },
          {
            value: 'design',
            label: 'Design',
            children: [
              { value: 'ux', label: 'UX' },
              { value: 'visual', label: 'Visual' },
            ],
          },
        ],
      },
    },
    search: {
      type: 'string',
      component: 'autocomplete',
      title: 'Search',
      componentProps: {
        fetchSuggestions,
        placeholder: 'Search frameworks...',
        triggerOnFocus: true,
      },
    },
    hobbies: {
      type: 'array',
      component: 'checkbox-group',
      title: 'Hobbies',
      componentProps: {
        options: [
          { label: 'Reading', value: 'reading' },
          { label: 'Gaming', value: 'gaming' },
          { label: 'Music', value: 'music' },
          { label: 'Sports', value: 'sports' },
        ],
      },
    },
    attachments: {
      type: 'array',
      component: 'upload',
      title: 'Attachments',
      componentProps: {
        action: 'https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15',
        listType: 'text',
      },
    },
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
  appointmentTime: '',
  deliveryTime: '',
  satisfaction: 50,
  rating: 0,
  favoriteColor: '#409EFF',
  region: [],
  department: '',
  search: '',
  hobbies: [],
  attachments: [],
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
