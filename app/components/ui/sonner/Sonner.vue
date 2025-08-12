<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { Toaster } from "vue-sonner"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Toaster
    class="toaster group"
    v-bind="props"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',

    }"
  />
</template>
