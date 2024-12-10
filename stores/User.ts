import { defineStore } from "pinia"

export const useUserStore = defineStore("userStore", () => {
	const user = ref({
		username: "Alexis De Chiara",
		id: useId(),
		tag1: "Dieu",
		tag2: "supprème",
	})

	function updateUser(username?: string, tag1?: string, tag2?: string) {
		if (username) {
			user.value.username = username
		}

		if (tag1) {
			user.value.tag1 = tag1
		}

		if (tag2) {
			user.value.tag2 = tag2
		}
	}

	return { user }
})
