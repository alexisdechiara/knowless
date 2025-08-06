<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<ProgressRoot class="relative w-full min-w-16 overflow-hidden rounded-full bg-primary-foreground" :class="ticknessClass" :model-value="value">
		<ProgressIndicator class="size-full rounded-full bg-primary transition-transform delay-0" :class="{ 'progress-animation': !value }" :style="[value ? `transform: translateX(-${100 - value}%);` : '', ` transition-duration: ${duration}ms; animation-duration: ${duration}ms`]" />
	</ProgressRoot>
</template>

<script lang="ts" setup>
import { ProgressIndicator, ProgressRoot } from "radix-vue"

const props = withDefaults(defineProps<{
	value?: number
	tickness?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl"
	duration?: number
}>(), {
	value: 0,
	tickness: "md",
	duration: 300,
})

const ticknessClass = computed(() => {
	switch (props.tickness) {
		case "xxs":
			return "h-0.5"
		case "xs":
			return "h-1"
		case "sm":
			return "h-2"
		case "md":
			return "h-3"
		case "lg":
			return "h-4"
		case "xl":
			return "h-5"
		default:
			return "h-4"
	}
})
</script>

<style scoped>
@keyframes progressAnimation {
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(0%);
	}
}

.progress-animation {
	animation-name: progressAnimation;
	animation-timing-function: linear;
	animation-fill-mode: forwards;
}
</style>
