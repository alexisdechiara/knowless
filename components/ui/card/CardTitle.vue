<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <span
    :class="
      cn('text-2xl font-semibold leading-none tracking-tight', props.class)
    "
  >
    <slot />
  </span>
</template>
