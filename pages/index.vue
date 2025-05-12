<template>
	<div class="relative flex h-screen w-screen items-center justify-start ps-16">
		<h1 class="pointer-events-none absolute left-1/2 top-16 z-50 -translate-x-1/2 -translate-y-1/2 whitespace-pre-wrap text-center text-8xl font-bold leading-none tracking-wider">Knowless</h1>
		<ClientOnly>
			<Tetris
				class="absolute inset-0 size-full [mask-image:radial-gradient(650px_circle_at_center,#00C16A,transparent)]"
				:base="25"
			/>
		</ClientOnly>
		<ul class="mt-32 flex flex-col gap-y-2 text-7xl font-semibold italic text-foreground">
			<li>
				<NuxtLink to="/solo"> Solo</NuxtLink>
			</li>
			<li>
				<NuxtLink to="/multi"> Multijoueur</NuxtLink>
			</li>
			<li class="!my-0 text-3xl">
				<NuxtLink to="/settings"> Options</NuxtLink>
			</li>
			<li class="!my-0 text-3xl">
				<NuxtLink to="/social"> Social</NuxtLink>
			</li>
			<li class="!my-0 text-3xl">
				<NuxtLink to="/legal-notice"> Mentions légales</NuxtLink>
			</li>
		</ul>
		<Button size="icon" class="absolute bottom-8 right-8 size-12 rounded-full p-3" @click="showGame = showGame === 'snake' ? null : 'snake'">
			<Icon name="lucide:gamepad-2" class="size-full" />
		</Button>
		<div v-if="showGame != null" class="absolute bottom-20 right-32 h-[480px] w-[720px]">
			<SnakeGame v-if="showGame === 'snake'" />
		</div>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	middleware: "auth",
})

const showGame = ref<string | null>("")
</script>

<style scoped>
li {
	@apply z-50 my-1 w-fit transition-all hover:-translate-y-1 hover:translate-x-4 hover:scale-110 hover:font-bold;
}
</style>
