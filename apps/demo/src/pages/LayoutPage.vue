<template>
  <div class="page">
    <h2 class="page-title">Layout System</h2>
    <p class="page-desc">Grid layout, layout modes, gutter spacing, and gridSpan demonstrations</p>

    <!-- Section 1: Layout Modes -->
    <h3 class="section-title">Layout Modes</h3>
    <p class="section-desc">
      <code>&lt;DForm&gt;</code> supports <code>layout</code> prop: <code>vertical</code> (fields
      stacked) and <code>inline</code> (fields in a row). Layout controls
      <strong>item arrangement only</strong> — it does not affect label position.
    </p>

    <div class="form-card">
      <h4>layout="vertical"</h4>
      <p class="mode-hint">
        Fields stacked vertically, labels beside (default labelPosition: right)
      </p>
      <DForm :schema="simpleSchema" layout="vertical" @submit="(v: any) => (result1a = v)">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
      <div v-if="result1a" class="result-card">
        <pre>{{ JSON.stringify(result1a, null, 2) }}</pre>
      </div>
    </div>

    <div class="form-card">
      <h4>layout="inline"</h4>
      <p class="mode-hint">Fields flow in a row, labels beside each field</p>
      <DForm :schema="simpleSchema" layout="inline" @submit="(v: any) => (result1b = v)">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
      <div v-if="result1b" class="result-card">
        <pre>{{ JSON.stringify(result1b, null, 2) }}</pre>
      </div>
    </div>

    <!-- Section 2: Label Position (independent of layout) -->
    <h3 class="section-title">labelPosition (independent of layout)</h3>
    <p class="section-desc">
      <code>labelPosition</code> controls where labels appear relative to their field. It works
      <strong>independently</strong> of <code>layout</code>.
    </p>

    <div class="form-card">
      <h4>labelPosition: top (no layout prop)</h4>
      <p class="mode-hint">Labels on top of fields, fields stacked vertically</p>
      <DForm :schema="simpleSchema" label-position="top" @submit="(v: any) => (result2a = v)">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
      <div v-if="result2a" class="result-card">
        <pre>{{ JSON.stringify(result2a, null, 2) }}</pre>
      </div>
    </div>

    <div class="form-card">
      <h4>labelPosition: top + layout="inline"</h4>
      <p class="mode-hint">
        Fields flow in a row but labels are on top — layout and labelPosition are independent
      </p>
      <DForm
        :schema="simpleSchema"
        layout="inline"
        label-position="top"
        @submit="(v: any) => (result2b = v)"
      >
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
      <div v-if="result2b" class="result-card">
        <pre>{{ JSON.stringify(result2b, null, 2) }}</pre>
      </div>
    </div>

    <!-- Section 3: Grid Layout -->
    <h3 class="section-title">Grid Layout (DFormGrid)</h3>
    <p class="section-desc">
      <code>&lt;DFormGrid&gt;</code> provides responsive CSS grid. Use <code>maxColumns</code> to
      control column count.
    </p>

    <div class="form-card">
      <h4>maxColumns: 2</h4>
      <DForm :schema="gridSchema2" />
    </div>

    <div class="form-card">
      <h4>maxColumns: 3</h4>
      <DForm :schema="gridSchema3" />
    </div>

    <div class="form-card">
      <h4>maxColumns: 4</h4>
      <DForm :schema="gridSchema4" />
    </div>

    <!-- Section 4: Grid + Span -->
    <h3 class="section-title">Grid + Span (gridSpan)</h3>
    <p class="section-desc">
      <code>&lt;DFormItem&gt;</code> accepts <code>gridSpan</code> prop: <code>1</code> (default),
      <code>2+</code> (multi-column), <code>-1</code> (full width).
    </p>
    <div class="form-card">
      <DForm :schema="spanSchemaWithGrid" />
      <p class="span-legend">
        firstName=1 | lastName=1 | email=<strong>2</strong> | phone=1 | address=<strong>-1</strong>
        (full) | city=1 | state=1 | zip=1
      </p>
    </div>

    <!-- Section 5: Gutter -->
    <h3 class="section-title">Gutter Spacing</h3>
    <p class="section-desc">
      <code>&lt;DForm&gt;</code> accepts <code>gutter</code> prop to control field spacing (CSS gap
      in px).
    </p>

    <div class="form-card">
      <h4>gutter: 8</h4>
      <DForm :schema="simpleSchema" :gutter="8" @submit="(v: any) => (result5a = v)">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
      <div v-if="result5a" class="result-card">
        <pre>{{ JSON.stringify(result5a, null, 2) }}</pre>
      </div>
    </div>

    <div class="form-card">
      <h4>gutter: 24</h4>
      <DForm :schema="simpleSchema" :gutter="24" @submit="(v: any) => (result5b = v)">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
      <div v-if="result5b" class="result-card">
        <pre>{{ JSON.stringify(result5b, null, 2) }}</pre>
      </div>
    </div>

    <!-- Section 6: Combined — Schema-driven grid -->
    <h3 class="section-title">Combined: Schema-driven Grid</h3>
    <p class="section-desc">
      <code>DFormItems</code> auto-wraps in <code>DFormGrid</code> when
      <code>uiSchema.grid</code> is set. Full integration with grid + gutter.
    </p>
    <div class="form-card">
      <DForm :schema="combinedSchema" :gutter="12" @submit="(v: any) => (result6 = v)">
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
    </div>
    <div v-if="result6" class="result-card">
      <h3>Submitted Values</h3>
      <pre>{{ JSON.stringify(result6, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DForm } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'
import { ElButton } from 'element-plus'

const simpleSchema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name' },
    email: { type: 'string', component: 'input', title: 'Email' },
    phone: { type: 'string', component: 'input', title: 'Phone' },
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

const gridSchema2 = computed(() => ({
  ...gridSchema,
  uiSchema: { grid: { maxColumns: 2, minColumnWidth: 120 } },
}))

const gridSchema3 = computed(() => ({
  ...gridSchema,
  uiSchema: { grid: { maxColumns: 3, minColumnWidth: 120 } },
}))

const gridSchema4 = computed(() => ({
  ...gridSchema,
  uiSchema: { grid: { maxColumns: 4, minColumnWidth: 100 } },
}))

const spanSchemaWithGrid: FormSchema = {
  ...spanSchema,
  uiSchema: {
    grid: { maxColumns: 3, minColumnWidth: 120, columnGap: 16 },
    email: { gridSpan: 2 },
    address: { gridSpan: -1 },
  },
}

const result1a = ref<Record<string, any> | null>(null)
const result1b = ref<Record<string, any> | null>(null)
const result2a = ref<Record<string, any> | null>(null)
const result2b = ref<Record<string, any> | null>(null)
const result5a = ref<Record<string, any> | null>(null)
const result5b = ref<Record<string, any> | null>(null)
const result6 = ref<Record<string, any> | null>(null)
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
.form-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}
.form-card h4 {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: 500;
}
.mode-hint {
  font-size: 12px;
  color: #b0b3b8;
  margin-bottom: 12px;
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
