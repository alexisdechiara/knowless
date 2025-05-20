<template>
	<div class="container relative hidden h-screen w-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
		<Button :as="NuxtLink" variant="ghost" class="absolute right-4 top-4 z-10 cursor-pointer md:right-8 md:top-8" @click="route.path === '/login' ? navigateTo('/register') : navigateTo('/login')">
			{{ route.path === '/login' ? 'S\'inscrire' : 'Se connecter' }}
		</Button>
		<div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
			<div class="absolute inset-0 overflow-hidden bg-zinc-900">
				<IconPatternBackground :nb-rows="20" :icons-per-row="15" />
			</div>
			<div class="relative z-20 flex cursor-default items-center text-xl font-medium text-zinc-100">
				<Icon name="custom:knowless-logo" class="mr-3 text-3xl" />
				Knowless
			</div>
		</div>
		<div class="relative flex h-full items-center justify-center lg:p-8">
			<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<slot />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { NuxtLink } from "#components"

const route = useRoute()
</script>
