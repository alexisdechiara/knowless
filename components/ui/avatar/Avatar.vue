<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { AvatarRoot } from "reka-ui"
import { cn } from "@/lib/utils"
import { avatarVariant, type AvatarVariants } from '.'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  size?: AvatarVariants['size']
  shape?: AvatarVariants['shape']
}>(), {
  size: 'sm',
  shape: 'circle',
})
</script>

<template>
  <AvatarRoot
    data-slot="avatar"
    :class="cn('relative flex shrink-0 overflow-hidden', avatarVariant({ size, shape }), props.class)"
  >
    <slot />
  </AvatarRoot>
</template>
