<template>
	<div class="flex h-screen w-screen flex-col items-center justify-center">
		<SoloStartCard v-if="!isPlaying" @start="start" />
		<template v-else-if="isPlaying && loading">
			<Icon v-if="loading" name="line-md:loading-loop" class="text-9xl" />
		</template>
		<div v-else class="flex size-full flex-col gap-4 p-4">
			<ProgressBar :value="50" tickness="xl" />
			<div class="relative h-9 w-full">
				<Badge :class="dificulty.value === 'easy' ? 'bg-emerald-500' : dificulty.value === 'medium' ? 'bg-amber-500' : 'bg-red-500'" class="pointer-events-none absolute start-0 top-0">{{ dificulty.label }}</Badge>
				<span class="absolute start-1/2 top-0 -translate-x-1/2 text-3xl font-semibold">Question 1</span>
				<span class="absolute right-0 top-0 text-xl font-semibold">Meilleur score : 15</span>
			</div>
			<div class="flex size-full flex-col items-center justify-center" />
		</div>
	</div>
</template>

<script lang="ts" setup>
const isPlaying = ref(false)
const dificulty = ref<Dificulty>({ label: "Facile", value: "easy" })
const loading = ref(false)

export type Dificulty = {
	label: string
	value: string
}

function start(selectedDificulty: any) {
	isPlaying.value = true
	dificulty.value = {
		label: selectedDificulty["title"],
		value: selectedDificulty["value"],
	}
}
</script>

<style scoped>

</style>
