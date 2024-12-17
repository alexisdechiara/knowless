import { defineStore } from "pinia"

export const useSettingsStore = defineStore("settingsStore", () => {
	const categories = ref([
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
		"science",
		"sports",
		"television",
		"tourism",
		"web",
	],
	)

	const language = ref("fr")

	return { categories, language }
}, {
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
})
