<template>
	<li v-bind="$attrs" :class="size === 'lg' ? 'text-4xl sm:text-5xl md:text-6xl' : 'text-2xl my-1'" class="z-50 w-fit cursor-pointer transition-all hover:-translate-y-1 hover:translate-x-4 hover:scale-110 hover:font-bold">
		<slot />
		<NuxtLink v-if="link" v-bind="link">
			<slot name="leading" />
			{{ label }}
			<slot name="trailing" />
		</NuxtLink>
		<span v-else>
			<slot name="leading" />
			{{ label }}
			<slot name="trailing" />
		</span>
	</li>
</template>

<script lang="ts" setup>
import type { NuxtLinkProps } from "#app"

defineProps<{
	label?: string
	link?: NuxtLinkProps
	size: "lg" | "sm"
}>()
</script>
