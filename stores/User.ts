import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"

export const useUserStore = defineStore("User", () => {
	const username = ref<string>("Mackenzie")
	const id = ref<string>(uuidv4())

	const getId = computed(() => id.value)

	function updateUser(data?: string) {
		if (data) {
			username.value = data
		}
	}

	return { username, getId, updateUser }
}, {
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
})
