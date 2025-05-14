import { ref, onMounted } from "vue"

export function useGeolocation() {
	const latitude = ref<number | null>(null)
	const longitude = ref<number | null>(null)
	const error = ref<string | null>(null)

	onMounted(() => {
		if (!navigator.geolocation) {
			error.value = "La géolocalisation n’est pas supportée par ce navigateur."
			return
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				latitude.value = position.coords.latitude
				longitude.value = position.coords.longitude
			},
			(err) => {
				error.value = `Erreur de géolocalisation : ${err.message}`
			},
		)
	})

	return { latitude, longitude, error }
}
