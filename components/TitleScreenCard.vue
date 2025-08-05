<template>
	<component :is="breakpoints.greater('sm').value ? Card : 'div'" class="flex size-full grid-cols-5 flex-col gap-6 p-6 sm:grid sm:h-3/4 sm:w-2/3 sm:shadow-md">
		<CardHeader class="col-span-3 p-0">
			<div class="size-full overflow-hidden rounded-md bg-linear-to-b from-indigo-500 via-purple-500 via-40% to-pink-500" />
		</CardHeader>
		<CardContent class="col-span-2 flex flex-col items-center justify-center gap-3 px-3 py-0">
			<CardTitle class="pb-6">
				<h2 class="select-none text-6xl">{{ title }}</h2>
			</CardTitle>
			<NuxtLink v-for="(link, index) in links" :key="`${link.title}-${index}`" :to="link.disabled ? '' : link.to" class="group flex h-fit w-full flex-col items-start gap-1 rounded-lg bg-gray-50 p-4 transition-colors duration-300 ease-out hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700" :class="{ 'pointer-events-auto cursor-not-allowed! opacity-50': link.disabled }">
				<h3 class="text-xl font-medium text-secondary-foreground">{{ link.title }}</h3>
				<p class="text-pretty text-start font-normal leading-tight text-secondary-foreground/75"> {{ link.description }} </p>
			</NuxtLink>
			<div class="mt-auto flex w-full justify-between gap-2">
				<NuxtLink v-if="showSettings" to="/settings/profile" class="flex h-fit w-full justify-center rounded-lg bg-gray-50 p-4 transition-colors duration-300 ease-out hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700">
					<Icon name="lucide:settings-2" class="text-2xl " />
				</NuxtLink>
				<FriendListPopover>
					<Button v-if="showFriends" variant="ghost" class="aspect-square h-full w-fit rounded-lg bg-gray-50 p-4 transition-colors duration-300 ease-out hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700">
						<Icon name="lucide:users" class="text-2xl" />
					</Button>
				</FriendListPopover>
				<Button v-if="user" variant="destructive" class="aspect-square h-full w-fit rounded-lg bg-gray-50 text-secondary-foreground transition-colors duration-300 ease-out hover:text-destructive-foreground dark:bg-gray-800" @click="logOut()">
					<Icon name="lucide:log-out" class="text-2xl" />
				</Button>
			</div>
		</CardContent>
	</component>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const breakpoints = useScreenSize()

withDefaults(defineProps<{
	title?: string
	links?: Array<{
		title?: string
		description?: string
		to?: RouteLocationRaw
		icon?: string
		disabled?: boolean
	}>
	showSettings?: boolean
	showFriends?: boolean
}>(), {
	showSettings: true,
	showFriends: true,
})

const logOut = async () => {
	await supabase.auth.signOut()
	navigateTo("/register")
}
</script>
