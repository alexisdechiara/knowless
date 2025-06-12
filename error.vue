<script setup lang="ts">
import type { NuxtError } from "#app"

const props = defineProps({
	error: Object as () => NuxtError,
})
</script>

<template>
	<div class="flex min-h-screen items-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
		<div class="w-full space-y-6 text-center">
			<div class="space-y-3">
				<h1 class="text-5xl font-bold tracking-tighter sm:text-6xl">
					{{ error?.statusCode || "Oups" }}
				</h1>
				<p class="text-gray-500 dark:text-gray-400 sm:text-lg">
					{{ error?.statusMessage || 'Une erreur est survenue' }}
				</p>
			</div>
			<div class="flex justify-center space-x-4">
				<Button as-child variant="default">
					<NuxtLink to="/">
						Page d'accueil
					</NuxtLink>
				</Button>
				<Button as-child variant="outline">
					<NuxtLink to="https://github.com/alexisdechiara/knowless/issues" target="_blank">
						Signaler un bug
					</NuxtLink>
				</Button>
			</div>
		</div>
	</div>
</template>
