<template>
	<div class="relative flex h-dvh w-screen items-center justify-center">
		<div class="flex flex-col items-center justify-center gap-8 sm:flex-row sm:items-stretch md:gap-16">
			<slot />
		</div>
		<Button v-if="previous" as="a" :href="previous.to" :variant="previous?.button?.variant || 'outline'" v-bind="previous.button" :size="previous.icon && !previous.label ? 'icon' : 'xl'" :class="previous.icon && !previous.label ? 'size-12': ''" class="fixed bottom-4 left-4 md:bottom-8 md:left-8">
			<Icon v-if="previous.icon" :name="previous.icon" class="text-xl" />
			{{ previous.label }}
		</Button>
		<Button v-if="next" as="a" :href="next.to" variant="default" :size="next.icon && !next.label ? 'icon' : 'xl'" v-bind="next.button" :class="next.icon && !next.label ? 'size-12': ''" class="fixed bottom-4 right-4 md:bottom-8 md:right-8">
			<Icon v-if="next.icon" :name="next.icon" class="text-xl" />
			{{ next.label }}
		</Button>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	previous?: {
		button: any
		label: string
		icon: string
		to: string
	}
	next?: {
		button: any
		label: string
		icon: string
		to: string
	}
}>()
</script>
