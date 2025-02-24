import { serverSupabaseClient } from "#supabase/server"

export default defineEventHandler(async (event) => {
	const body = JSON.parse(await readBody(event) as string)
	const supabase = await serverSupabaseClient(event)

	if (!body?.id) {
		console.error("Missing ID")
		return { error: "Missing ID" }
	}
	if (!body?.status) {
		console.log("Missing status")
		return { error: "Missing status" }
	}

	const { error } = await supabase
		.from("players")
		.update({ last_active_at: new Date().toISOString(), status: "offline" })
		.eq("id", body.id)
		.neq("status", "playing")

	if (error) {
		console.error(error)
		return { error }
	}
})
