<template>
	<div class="cursor-pointer items-center rounded-md border-2 border-muted p-1 hover:border-accent">
		<!-- System Theme (Diagonally Split from bottom-left to top-right) -->
		<div v-if="props.colorMode === 'system'" class="relative overflow-hidden rounded-sm">
			<!-- Light theme part (bottom-left triangle) -->
			<div
				class="absolute inset-0"
				style="clip-path: polygon(0% 0%, 100% 0%, 0% 100%);"
			>
				<div class="h-full space-y-2 p-2" :class="classes.light.background">
					<div class="space-y-2 rounded-md p-2 shadow-sm" :class="classes.light.cardBackground">
						<div class="h-2 w-20 rounded-lg" :class="classes.light.foreground" />
						<div class="h-2 w-full rounded-lg" :class="classes.light.foreground" />
					</div>
					<div class="flex items-center space-x-2 rounded-md p-2 shadow-sm" :class="classes.light.cardBackground">
						<div class="size-4 rounded-full" :class="classes.light.foreground" />
						<div class="h-2 w-full rounded-lg" :class="classes.light.foreground" />
					</div>
					<div class="flex items-center space-x-2 rounded-md p-2 shadow-sm" :class="classes.light.cardBackground">
						<div class="size-4 rounded-full" :class="classes.light.foreground" />
						<div class="h-2 w-full rounded-lg" :class="classes.light.foreground" />
					</div>
				</div>
			</div>
			<!-- Dark theme part (top-right triangle) -->
			<div
				class="absolute inset-0"
				style="clip-path: polygon(100% 0%, 100% 100%, 0% 100%);"
			>
				<div class="h-full space-y-2 p-2" :class="classes.dark.background">
					<div class="space-y-2 rounded-md p-2 shadow-sm" :class="classes.dark.cardBackground">
						<div class="h-2 w-20 rounded-lg" :class="classes.dark.foreground" />
						<div class="h-2 w-full rounded-lg" :class="classes.dark.foreground" />
					</div>
					<div class="flex items-center space-x-2 rounded-md p-2 shadow-sm" :class="classes.dark.cardBackground">
						<div class="size-4 rounded-full" :class="classes.dark.foreground" />
						<div class="h-2 w-full rounded-lg" :class="classes.dark.foreground" />
					</div>
					<div class="flex items-center space-x-2 rounded-md p-2 shadow-sm" :class="classes.dark.cardBackground">
						<div class="size-4 rounded-full" :class="classes.dark.foreground" />
						<div class="h-2 w-full rounded-lg" :class="classes.dark.foreground" />
					</div>
				</div>
			</div>
			<!-- Sizer div to ensure the relative parent has the correct dimensions -->
			<div class="invisible space-y-2 rounded-sm p-2">
				<div class="space-y-2 rounded-md p-2 shadow-sm">
					<div class="h-2 w-20 rounded-lg" />
					<div class="h-2 w-full rounded-lg" />
				</div>
				<div class="flex items-center space-x-2 rounded-md p-2 shadow-sm">
					<div class="size-4 rounded-full" />
					<div class="h-2 w-full rounded-lg" />
				</div>
				<div class="flex items-center space-x-2 rounded-md p-2 shadow-sm">
					<div class="size-4 rounded-full" />
					<div class="h-2 w-full rounded-lg" />
				</div>
			</div>
		</div>

		<!-- Single Theme (Light or Dark) -->
		<div v-else class="space-y-2 rounded-sm p-2" :class="colorClass.background">
			<div class="space-y-2 rounded-md p-2 shadow-sm" :class="colorClass.cardBackground">
				<div class="h-2 w-20 rounded-lg" :class="colorClass.foreground" />
				<div class="h-2 w-full rounded-lg" :class="colorClass.foreground" />
			</div>
			<div class="flex items-center space-x-2 rounded-md p-2 shadow-sm" :class="colorClass.cardBackground">
				<div class="size-4 rounded-full" :class="colorClass.foreground" />
				<div class="h-2 w-full rounded-lg" :class="colorClass.foreground" />
			</div>
			<div class="flex items-center space-x-2 rounded-md p-2 shadow-sm" :class="colorClass.cardBackground">
				<div class="size-4 rounded-full" :class="colorClass.foreground" />
				<div class="h-2 w-full rounded-lg" :class="colorClass.foreground" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps<{
	colorMode: "light" | "dark" | "system"
}>()

const colorClass = computed(() => {
	// This computed is only used for the 'light' or 'dark' colorMode display
	if (props.colorMode === "light" || props.colorMode === "dark") {
		return classes[props.colorMode]
	}
	return classes.light // Fallback, though not strictly used when colorMode is 'system'
})

const classes = {
	light: {
		foreground: "bg-[#ecedef]",
		cardBackground: "bg-white",
		background: "bg-[#ecedef]",
	},
	dark: {
		foreground: "bg-gray-400",
		cardBackground: "bg-gray-800",
		background: "bg-gray-950",
	},
} as const
</script>
