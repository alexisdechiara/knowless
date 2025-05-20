<script lang="ts" setup>
const props = defineProps<{
	title?: string
}>()

const title = computed(() => props.title?.split("-")[0].trim())

const description = computed(() => {
	if (!props.title) {
		return undefined
	}
	const separator = " - "
	const indexOfSeparator = props.title.indexOf(separator)
	if (indexOfSeparator === -1) {
		return undefined
	}
	const descPart = props.title.substring(indexOfSeparator + separator.length).trim()
	return descPart || undefined // Retourne undefined si la description est vide après trim
})
</script>

<template>
	<div class="relative flex size-full flex-col bg-zinc-900 p-10 text-white">
		<!-- Static Icon Pattern for Satori -->
		<div class="absolute inset-0 flex h-[600px] w-[1200px] select-none flex-col gap-2 overflow-hidden bg-zinc-900">
			<div class="flex w-[1200px] gap-2 overflow-hidden">
				<!-- Row 1 -->
				<Icon mode="svg" name="lucide:paw-print" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:landmark" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:palette" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:book-open" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:star" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:film" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:user-x" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:home" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:feather" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:gamepad" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:music" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:leaf" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:user-x" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:home" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
			</div>
			<div class="flex w-[1200px] gap-2 overflow-hidden">
				<!-- Row 2 -->
				<Icon mode="svg" name="lucide:layers" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:book-open-text" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:utensils-crossed" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:map" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:castle" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:monitor" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:microscope" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:music" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:leaf" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:dumbbell" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:tv" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:luggage" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:globe" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:paw-print" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
			</div>
			<div class="flex w-[1200px] gap-2 overflow-hidden">
				<!-- Row 3 -->
				<Icon mode="svg" name="lucide:feather" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:gamepad" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:music" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:leaf" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:user-x" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:home" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:paw-print" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:landmark" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:palette" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:book-open" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:star" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:layers" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:book-open-text" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:utensils-crossed" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:film" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
			</div>
			<div class="flex w-[1200px] gap-2 overflow-hidden">
				<!-- Row 4 -->
				<Icon mode="svg" name="lucide:microscope" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:dumbbell" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:tv" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:luggage" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:globe" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:paw-print" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:layers" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:book-open-text" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:utensils-crossed" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:map" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:castle" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:paw-print" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:landmark" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:palette" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:monitor" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
			</div>
			<div class="flex w-[1200px] gap-2 overflow-hidden">
				<!-- Row 5 -->
				<Icon mode="svg" name="lucide:feather" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:gamepad" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:music" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:leaf" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:user-x" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:home" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:microscope" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:dumbbell" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:tv" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:luggage" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:globe" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:star" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:film" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:layers" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
			</div>
			<div class="flex w-[1200px] gap-2 overflow-hidden">
				<!-- Row 6 -->
				<Icon mode="svg" name="lucide:book-open-text" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:utensils-crossed" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:map" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:castle" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:monitor" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:paw-print" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:landmark" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:palette" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:book-open" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:feather" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:gamepad" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:music" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:leaf" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:user-x" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
			</div>
			<div class="flex w-[1200px] gap-2 overflow-hidden">
				<!-- Row 7 -->
				<Icon mode="svg" name="lucide:home" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:microscope" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:dumbbell" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:tv" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:luggage" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:globe" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:star" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:film" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:layers" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:book-open-text" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:utensils-crossed" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:map" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:castle" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
				<Icon mode="svg" name="lucide:monitor" class="size-20 shrink-0 text-zinc-600 opacity-30 blur-[1px] saturate-0" />
			</div>
		</div>

		<!-- Logo and App Name -->
		<h1 class="absolute left-16 top-16 flex cursor-default items-center text-4xl font-bold text-zinc-50">
			<Icon mode="svg" name="custom:knowless-logo" class="mr-3 text-4xl" />
			Knowless
		</h1>

		<!-- Main title -->
		<div class="absolute inset-0 flex h-full w-[1100px] flex-col justify-center pl-16 pt-32">
			<h2 v-if="title" class="m-0 mb-4 text-[90px] font-bold text-zinc-50">
				{{ title }}
			</h2>
			<p v-if="description" class="text-[45px] font-semibold leading-tight text-zinc-200 ">
				{{ description }}
			</p>
		</div>
	</div>
</template>
