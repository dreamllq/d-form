<template>
  <div class="page">
    <h2 class="page-title">Custom Registry & defineFormSchema</h2>
    <p class="page-desc">Using defineFormSchema for typed component props with a merged registry</p>

    <div class="form-card">
        <el-button type="default" @click="handlePrintZodSchema" style="margin-left: 12px">
          Print Zod Schema
        </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponentRegistry, assembleFormSchema } from '@d-form/shared'
import { elementPlusRegistry } from '@d-form/element-plus'
import { customRegistry } from '../schemas'
import { ElButton } from 'element-plus'

const demoRegistry = defineComponentRegistry({
  ...elementPlusRegistry,
  'rating-input': customRegistry['rating-input'],
})


function handlePrintZodSchema() {
  const assembled = assembleFormSchema(demoRegistry)
  console.log('assembleFormSchema result:', assembled)
  console.log('assembleFormSchema toJSONSchema result:', assembled.toJSONSchema())
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
