<template>
	<div class="flex h-screen w-screen items-center justify-center">
		<Card class="grid size-2/3 grid-cols-5 gap-6 p-6 shadow-md">
			<CardHeader class="col-span-3 p-0">
				<div class="size-full overflow-hidden rounded-md bg-gradient-to-b from-indigo-500 via-purple-500 via-40% to-pink-500" />
			</CardHeader>
			<CardContent class="col-span-2 flex flex-col items-center justify-center gap-3 px-3 py-0">
				<CardTitle class="pb-6">
					<h2 class="text-6xl">Bienvenue</h2>
				</CardTitle>
				<Button class="flex h-fit w-full flex-col items-start gap-1 p-4" variant="secondary">
					<h3 class="text-xl">Solo</h3>
					<p class="text-pretty text-start font-normal leading-tight opacity-75">Jouez seul sur une durée limité ou bien en mode infini</p>
				</Button>
				<Button class="flex h-fit w-full flex-col items-start gap-1 p-4" variant="secondary">
					<h3 class="text-xl">Multijoueurs</h3>
					<p class="text-pretty text-start font-normal leading-tight opacity-75">Jouez entre amis dans une partie personnalisée</p>
				</Button>
				<div class="mt-auto flex w-full justify-between gap-2">
					<Button class="flex h-fit w-full justify-center p-4" variant="secondary" size="icon">
						<Icon name="lucide:settings-2" class="text-lg" />
					</Button>
					<Button class="size-fit p-4" variant="secondary" size="icon">
						<Icon name="lucide:users" class="text-lg" />
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
</template>

<script lang="ts" setup>

</script>

<style scoped>

</style>
