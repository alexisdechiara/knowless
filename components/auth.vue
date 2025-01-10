<template>
	<div class="container relative hidden h-screen w-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
		<Button :as="NuxtLink" variant="ghost" class="absolute right-4 top-4 z-10 cursor-pointer md:right-8 md:top-8" @click="login ? navigateTo('/register') : navigateTo('/login')">
			{{ login ? 'S\'inscrire' : register ? 'Se connecter' : '' }}
		</Button>
		<div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
			<div class="absolute inset-0 bg-zinc-900" />
			<div class="relative z-20 flex cursor-default items-center text-lg font-medium">
				<Icon name="lucide:home" class="mr-2 size-6" />
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

defineProps<
	| { register: true, login?: never } // Si "register" est défini, "login" ne peut pas être défini
	| { login: true, register?: never } // Si "login" est défini, "register" ne peut pas être défini
>()
</script>
