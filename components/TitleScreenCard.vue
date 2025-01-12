<template>
	<component :is="breakpoints.greater('sm').value ? Card : 'div'" class="flex size-full grid-cols-5 flex-col gap-6 p-6 sm:grid sm:size-2/3 sm:shadow-md">
		<CardHeader class="col-span-3 p-0">
			<div class="size-full overflow-hidden rounded-md bg-gradient-to-b from-indigo-500 via-purple-500 via-40% to-pink-500" />
		</CardHeader>
		<CardContent class="col-span-2 flex flex-col items-center justify-center gap-3 px-3 py-0">
			<CardTitle class="pb-6">
				<h2 class="select-none text-6xl">{{ title }}</h2>
			</CardTitle>
			<NuxtLink v-for="(link, index) in links" :key="`${link.title}-${index}`" :to="link.to" class="group flex h-fit w-full flex-col items-start gap-1 rounded-lg bg-slate-50 p-4 transition-colors duration-300 ease-out hover:bg-slate-100 dark:bg-slate-800 hover:dark:bg-slate-700">
				<h3 class="text-xl font-medium text-secondary-foreground">{{ link.title }}</h3>
				<p class="text-pretty text-start font-normal leading-tight text-secondary-foreground/75"> {{ link.description }} </p>
			</NuxtLink>
			<div class="mt-auto flex w-full justify-between gap-2">
				<NuxtLink v-if="showSettings" to="/settings" class="flex h-fit w-full justify-center rounded-lg bg-slate-50 p-4 transition-colors duration-300 ease-out hover:bg-slate-100 dark:bg-slate-800 hover:dark:bg-slate-700">
					<Icon name="lucide:settings-2" class="text-2xl text-secondary-foreground" />
				</NuxtLink>
				<FriendListPopover>
					<Button v-if="showFriends" variant="ghost" class="aspect-square h-full w-fit rounded-lg bg-slate-50 p-4 transition-colors duration-300 ease-out hover:bg-slate-100 dark:bg-slate-800 hover:dark:bg-slate-700">
						<Icon name="lucide:users" class="text-2xl text-secondary-foreground" />
					</Button>
				</FriendListPopover>
			</div>
		</CardContent>
	</component>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

const breakpoints = useScreenSize()

withDefaults(defineProps<{
	title?: string
	links?: Array<{
		title?: string
		description?: string
		to?: RouteLocationRaw
		icon?: string
	}>
	showSettings?: boolean
	showFriends?: boolean
}>(), {
	showSettings: true,
	showFriends: true,
})
</script>
