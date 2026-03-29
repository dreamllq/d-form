<template>
  <div class="page">
    <h2 class="page-title">Layout System</h2>
    <p class="page-desc">Grid layout, layout modes, gutter spacing, and gridSpan demonstrations</p>

    <!-- Section 1: Layout Modes -->
    <h3 class="section-title">Layout Modes</h3>
    <p class="section-desc">
      <code>&lt;DForm&gt;</code> supports <code>layout</code> prop: <code>vertical</code>,
      <code>horizontal</code>, and <code>inline</code>.
    </p>
    <div class="forms-row">
      <div class="form-card flex-card">
        <h4>layout="vertical"</h4>
        <DForm :schema="simpleSchema" layout="vertical" @submit="(v: any) => (result1a = v)">
          <DFormItems />
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result1a" class="result-card">
          <pre>{{ JSON.stringify(result1a, null, 2) }}</pre>
        </div>
      </div>

      <div class="form-card flex-card">
        <h4>layout="horizontal"</h4>
        <DForm :schema="simpleSchema" layout="horizontal" @submit="(v: any) => (result1b = v)">
          <DFormItems />
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result1b" class="result-card">
          <pre>{{ JSON.stringify(result1b, null, 2) }}</pre>
        </div>
      </div>

      <div class="form-card flex-card">
        <h4>layout="inline"</h4>
        <DForm :schema="simpleSchema" layout="inline" @submit="(v: any) => (result1c = v)">
          <DFormItems />
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result1c" class="result-card">
          <pre>{{ JSON.stringify(result1c, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Section 2: Grid Layout -->
    <h3 class="section-title">Grid Layout (DFormGrid)</h3>
    <p class="section-desc">
      <code>&lt;DFormGrid&gt;</code> provides responsive CSS grid. Use <code>maxColumns</code> to
      control column count.
    </p>
    <div class="forms-row">
      <div class="form-card flex-card">
        <h4>maxColumns: 2</h4>
        <DForm :schema="gridSchema">
          <DFormGrid :max-columns="2" :min-column-width="120">
            <DFormItem
              v-for="(field, key) in gridSchema.properties"
              :key="key"
              :name="String(key)"
              :schema="field"
            />
          </DFormGrid>
        </DForm>
      </div>

      <div class="form-card flex-card">
        <h4>maxColumns: 3</h4>
        <DForm :schema="gridSchema">
          <DFormGrid :max-columns="3" :min-column-width="120">
            <DFormItem
              v-for="(field, key) in gridSchema.properties"
              :key="key"
              :name="String(key)"
              :schema="field"
            />
          </DFormGrid>
        </DForm>
      </div>

      <div class="form-card flex-card">
        <h4>maxColumns: 4</h4>
        <DForm :schema="gridSchema">
          <DFormGrid :max-columns="4" :min-column-width="100">
            <DFormItem
              v-for="(field, key) in gridSchema.properties"
              :key="key"
              :name="String(key)"
              :schema="field"
            />
          </DFormGrid>
        </DForm>
      </div>
    </div>

    <!-- Section 3: Grid + Span -->
    <h3 class="section-title">Grid + Span (gridSpan)</h3>
    <p class="section-desc">
      <code>&lt;DFormItem&gt;</code> accepts <code>gridSpan</code> prop: <code>1</code> (default),
      <code>2+</code> (multi-column), <code>-1</code> (full width).
    </p>
    <div class="form-card">
      <DForm :schema="spanSchema">
        <DFormGrid :max-columns="3" :min-column-width="120" :column-gap="16">
          <DFormItem name="firstName" :schema="spanSchema.properties.firstName" />
          <DFormItem name="lastName" :schema="spanSchema.properties.lastName" />
          <DFormItem name="email" :schema="spanSchema.properties.email" :grid-span="2" />
          <DFormItem name="phone" :schema="spanSchema.properties.phone" />
          <DFormItem name="address" :schema="spanSchema.properties.address" :grid-span="-1" />
          <DFormItem name="city" :schema="spanSchema.properties.city" />
          <DFormItem name="state" :schema="spanSchema.properties.state" />
          <DFormItem name="zip" :schema="spanSchema.properties.zip" />
        </DFormGrid>
      </DForm>
      <p class="span-legend">
        firstName=1 | lastName=1 | email=<strong>2</strong> | phone=1 | address=<strong>-1</strong>
        (full) | city=1 | state=1 | zip=1
      </p>
    </div>

    <!-- Section 4: Gutter -->
    <h3 class="section-title">Gutter Spacing</h3>
    <p class="section-desc">
      <code>&lt;DForm&gt;</code> accepts <code>gutter</code> prop to control field spacing (CSS gap
      in px).
    </p>
    <div class="forms-row">
      <div class="form-card flex-card">
        <h4>gutter: 8</h4>
        <DForm :schema="simpleSchema" :gutter="8" @submit="(v: any) => (result4a = v)">
          <DFormItems />
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result4a" class="result-card">
          <pre>{{ JSON.stringify(result4a, null, 2) }}</pre>
        </div>
      </div>

      <div class="form-card flex-card">
        <h4>gutter: 24</h4>
        <DForm :schema="simpleSchema" :gutter="24" @submit="(v: any) => (result4b = v)">
          <DFormItems />
          <el-button type="primary" native-type="submit">Submit</el-button>
        </DForm>
        <div v-if="result4b" class="result-card">
          <pre>{{ JSON.stringify(result4b, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Section 5: Combined — Schema-driven grid -->
    <h3 class="section-title">Combined: Schema-driven Grid</h3>
    <p class="section-desc">
      <code>DFormItems</code> auto-wraps in <code>DFormGrid</code> when
      <code>uiSchema.grid</code> is set. Full integration with layout + grid + gutter.
    </p>
    <div class="form-card">
      <DForm
        :schema="combinedSchema"
        layout="horizontal"
        :gutter="12"
        @submit="(v: any) => (result5 = v)"
      >
        <DFormItems />
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
import { DForm, DFormItem, DFormItems, DFormGrid } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'
import { ElButton } from 'element-plus'

const simpleSchema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name' },
    email: { type: 'string', component: 'input', title: 'Email' },
  },
}

const gridSchema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name' },
    email: { type: 'string', component: 'input', title: 'Email' },
    phone: { type: 'string', component: 'input', title: 'Phone' },
    city: { type: 'string', component: 'input', title: 'City' },
  },
}

const spanSchema: FormSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string', component: 'input', title: 'First Name' },
    lastName: { type: 'string', component: 'input', title: 'Last Name' },
    email: { type: 'string', component: 'input', title: 'Email' },
    phone: { type: 'string', component: 'input', title: 'Phone' },
    address: { type: 'string', component: 'input', title: 'Address' },
    city: { type: 'string', component: 'input', title: 'City' },
    state: { type: 'string', component: 'input', title: 'State' },
    zip: { type: 'string', component: 'input', title: 'Zip' },
  },
}

const combinedSchema: FormSchema = {
  type: 'object',
  properties: {
    username: { type: 'string', component: 'input', title: 'Username' },
    email: { type: 'string', component: 'input', title: 'Email' },
    phone: { type: 'string', component: 'input', title: 'Phone' },
    city: { type: 'string', component: 'input', title: 'City' },
    state: { type: 'string', component: 'input', title: 'State' },
    zip: { type: 'string', component: 'input', title: 'Zip' },
  },
  uiSchema: {
    grid: { maxColumns: 3, columnGap: 16 },
  },
}

const result1a = ref<Record<string, any> | null>(null)
const result1b = ref<Record<string, any> | null>(null)
const result1c = ref<Record<string, any> | null>(null)
const result4a = ref<Record<string, any> | null>(null)
const result4b = ref<Record<string, any> | null>(null)
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
.span-legend {
  margin-top: 16px;
  font-size: 12px;
  color: #909399;
}
</style>
