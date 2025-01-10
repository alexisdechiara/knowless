import { defineStore } from "pinia"

export const useSettingsStore = defineStore("Settings", () => {
	const user = useSupabaseUser()
	const categories = ref<Array<string>>(user.value?.user_metadata?.categories || [
		"animals",
		"archaeology",
		"arts",
		"comics",
		"celebrities",
		"cinema",
		"random_culture",
		"general_culture",
		"gastronomy",
		"geography",
		"history",
		"computing",
		"literature",
		"hobbies",
		"music",
		"nature",
		"countries",
		"daily_life",
		"sciences",
		"sports",
		"television",
		"tourism",
		"web",
	],
	)

	const language = ref("fr")

	function getRandomCategory() {
		const index: number = Math.floor(Math.random() * categories.value.length)
		return categories.value[index]
	}

	return { categories, language, getRandomCategory }
}, {
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
})
