<template>
  <div class="page">
    <h2 class="page-title">Form Layout</h2>
    <p class="page-desc">
      Label position and width configuration at form-level, per-field, and via uiSchema
    </p>

    <!-- Section 1: Form-level labelPosition -->
    <h3 class="section-title">Form-level labelPosition</h3>
    <p class="section-desc">
      Set <code>labelPosition</code> on <code>&lt;DForm&gt;</code> to control label alignment for
      all fields.
    </p>
    <div class="forms-row">
      <div class="form-card flex-card">
        <h4>labelPosition="left"</h4>
        <DForm :schema="simpleSchema" label-position="left" @submit="(v: any) => (result1a = v)">
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result1a" class="result-card">
          <pre>{{ JSON.stringify(result1a, null, 2) }}</pre>
        </div>
      </div>

      <div class="form-card flex-card">
        <h4>labelPosition="right"</h4>
        <DForm :schema="simpleSchema" label-position="right" @submit="(v: any) => (result1b = v)">
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result1b" class="result-card">
          <pre>{{ JSON.stringify(result1b, null, 2) }}</pre>
        </div>
      </div>

      <div class="form-card flex-card">
        <h4>labelPosition="top"</h4>
        <DForm :schema="simpleSchema" label-position="top" @submit="(v: any) => (result1c = v)">
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result1c" class="result-card">
          <pre>{{ JSON.stringify(result1c, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Section 2: Form-level labelWidth -->
    <h3 class="section-title">Form-level labelWidth</h3>
    <p class="section-desc">
      Set <code>labelWidth</code> on <code>&lt;DForm&gt;</code> to control label width for all
      fields.
    </p>
    <div class="forms-row">
      <div class="form-card flex-card">
        <h4>labelWidth="80px"</h4>
        <DForm :schema="simpleSchema" label-width="80px" @submit="(v: any) => (result2a = v)">
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result2a" class="result-card">
          <pre>{{ JSON.stringify(result2a, null, 2) }}</pre>
        </div>
      </div>

      <div class="form-card flex-card">
        <h4>labelWidth="200px"</h4>
        <DForm :schema="simpleSchema" label-width="200px" @submit="(v: any) => (result2b = v)">
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result2b" class="result-card">
          <pre>{{ JSON.stringify(result2b, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Section 3: Per-field override via FieldSchema -->
    <h3 class="section-title">Per-field Override (FieldSchema)</h3>
    <p class="section-desc">
      Individual fields can override <code>labelPosition</code> and <code>labelWidth</code> via
      their FieldSchema entry. The form defaults to <code>right</code> / <code>100px</code>, but
      each field overrides independently.
    </p>
    <div class="form-card">
      <DForm
        :schema="perFieldSchema"
        label-position="right"
        label-width="100px"
        @submit="(v: any) => (result3 = v)"
      >
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
    </div>
    <div v-if="result3" class="result-card">
      <h3>Submitted Values</h3>
      <pre>{{ JSON.stringify(result3, null, 2) }}</pre>
    </div>

    <!-- Section 4: uiSchema Per-field Override -->
    <h3 class="section-title">uiSchema Per-field Override</h3>
    <p class="section-desc">
      Use <code>schema.uiSchema</code> per-field overrides to control <code>labelPosition</code> and
      <code>labelWidth</code> for individual fields. Per-field uiSchema has higher priority than
      form-level settings.
    </p>
    <div class="form-card">
      <DForm :schema="overrideSchema" @submit="(v: any) => (result4 = v)">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
    </div>
    <div v-if="result4" class="result-card">
      <h3>Submitted Values</h3>
      <pre>{{ JSON.stringify(result4, null, 2) }}</pre>
    </div>

    <!-- Section 5: uiSchema -->
    <h3 class="section-title">Schema with uiSchema</h3>
    <p class="section-desc">
      Use <code>schema.uiSchema</code> to set <code>labelPosition</code> and
      <code>labelWidth</code> — backward-compatible approach for schema-driven forms.
    </p>
    <div class="form-card">
      <DForm :schema="uiSchemaSchema" @submit="(v: any) => (result5 = v)">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
    </div>
    <div v-if="result5" class="result-card">
      <h3>Submitted Values</h3>
      <pre>{{ JSON.stringify(result5, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DForm } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'
import { ElButton } from 'element-plus'

const simpleSchema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name' },
    email: { type: 'string', component: 'input', title: 'Email' },
  },
}

const perFieldSchema: FormSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      component: 'input',
      title: 'Name',
      labelWidth: '200px',
    },
    email: {
      type: 'string',
      component: 'input',
      title: 'Email',
      labelPosition: 'top',
    },
    phone: {
      type: 'string',
      component: 'input',
      title: 'Phone',
    },
    city: {
      type: 'string',
      component: 'input',
      title: 'City',
      labelWidth: '150px',
      labelPosition: 'left',
    },
  },
}

const uiSchemaSchema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name' },
    email: { type: 'string', component: 'input', title: 'Email' },
  },
  uiSchema: { labelPosition: 'top', labelWidth: '120px' },
}

const overrideSchema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name' },
    email: { type: 'string', component: 'input', title: 'Email' },
  },
  uiSchema: {
    labelPosition: 'top',
    name: { labelPosition: 'top' },
    email: { labelWidth: '200px' },
  },
}

const result1a = ref<Record<string, any> | null>(null)
const result1b = ref<Record<string, any> | null>(null)
const result1c = ref<Record<string, any> | null>(null)
const result2a = ref<Record<string, any> | null>(null)
const result2b = ref<Record<string, any> | null>(null)
const result3 = ref<Record<string, any> | null>(null)
const result4 = ref<Record<string, any> | null>(null)
const result5 = ref<Record<string, any> | null>(null)
</script>

<style scoped>
.page {
  max-width: 1100px;
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
.section-title {
  font-size: 17px;
  font-weight: 600;
  margin-top: 28px;
  margin-bottom: 6px;
  color: #303133;
}
.section-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 14px;
}
.section-desc code {
  background: #f5f7fa;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
  color: #606266;
}
.forms-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.flex-card {
  flex: 1;
  min-width: 260px;
}
.flex-card h4 {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 500;
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
