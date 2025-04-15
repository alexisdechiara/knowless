import { ref } from "vue"
import { Quizz } from "~/models/quizz"

export const useQuizz = (cat?: string, lang: string = "fr") => {
	const supabase = useSupabaseClient()
	const data = ref<Quizz | null>(null)
	const error = ref<Error | null>(null)
	const status = ref()

	const execute = async () => {
		status.value = "pending"
		error.value = null

		const { data: raw, error: err } = await supabase.rpc("get_random_quiz", {
			p_category: cat,
			p_language: lang,
		})
			.single()

		if (err) {
			error.value = err
			data.value = null
			status.value = "error"
		}
		else if (raw) {
			data.value = new Quizz(raw)
			status.value = "success"
		}
		else {
			data.value = null
			status.value = "error"
			error.value = new Error("Aucune question trouvée")
		}
	}

	// auto-fetch au mount
	execute()

	return {
		data,
		error,
		status,
		refresh: execute,
		execute, // alias
	}
}
