import { defineStore } from "pinia"

export const useUserStore = defineStore("userStore", () => {
	const user = ref({
		username: "Alexis De Chiara",
		id: useId(),
	})

	function updateUser(username?: string) {
		if (username) {
			user.value.username = username
		}
	}

	return { user, updateUser }
}, {
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
})
