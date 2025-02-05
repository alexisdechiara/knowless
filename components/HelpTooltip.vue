<template>
	<TooltipProvider :delay-duration="100">
		<Tooltip>
			<TooltipTrigger as-child>
				<Icon name="lucide:circle-help" class="ms-0.5 inline-flex cursor-pointer items-center text-xs" />
			</TooltipTrigger>
			<TooltipContent side="right" class="max-w-xs">
				{{ content }}
				<slot />
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</template>

<script setup lang="ts">
defineProps<{
	content?: string
}>()
</script>
