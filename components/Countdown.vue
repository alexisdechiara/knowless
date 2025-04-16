<template>
	<div class="fixed left-1/2 top-1/2 flex w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-y-4">
		<h1 class="text-2xl font-semibold">La partie commence dans</h1>
		<NumberFlow :value="countdown" class="text-7xl font-semibold" />
	</div>
</template>

<script lang="ts" setup>
import NumberFlow from "@number-flow/vue"

const countdown = ref(3)
const emit = defineEmits(["finished", "remaining"])

const { remaining } = useCountdown(3, {
	immediate: true,
	onComplete() {
		emit("finished")
	},
	onTick() {
		if (remaining.value === 0) {
			countdown.value = 1
		}
		else {
			countdown.value = remaining.value
		}
		emit("remaining", countdown.value)
	},
})
</script>

<style scoped>

</style>
