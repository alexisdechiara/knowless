import { z } from "zod"
import { serverSupabaseClient } from "#supabase/server"

const userSchema = z.object({
	id: z.string(),
	username: z.string(),
	usertag: z.string(),
})

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(event, body => userSchema.parse(body))
	const supabase = await serverSupabaseClient(event)

	if (!result?.id) {
		throw createError({
			statusMessage: "id manquant",
			message: "l'id est obligatoire",
		})
	}

	if (!result?.username) {
		throw createError({
			statusMessage: "Nom d'utilisateur manquant",
			message: "Le nom d'utilisateur est obligatoire",
		})
	}

	if (!result?.usertag) {
		throw createError({
			statusMessage: "Tag manquant",
			message: "Le tag est obligatoire",
		})
	}

	const { id, username, usertag } = result

	const { data, error } = await supabase.from("players").select("*").eq("username", username).eq("usertag", usertag).single()

	if (error) {
		if (error.code === "PGRST116") {
			throw createError({
				statusMessage: "Cet utilisateur n'existe pas",
				message: "Veuillez vérifier le nom d'utilisateur et le tag",
			})
		}
		else {
			throw createError({
				statusMessage: `Erreur ${error.code}`,
				message: error.details,
			})
		}
	}
	else {
		const { error } = await supabase.from("friendship").insert({
			user_id: id,
			friend_id: data.id,
			status: "pending",
		})

		if (error) {
			if (error.code === "23505") {
				throw createError({
					statusCode: 23505,
					statusMessage: "Demande d'ami deja envoyee",
					message: `Vous avez deja envoye une demande d'ami a ${username}#${usertag}`,
				})
			}
			else {
				throw createError({
					statusMessage: `Erreur ${error.code}`,
					message: error.details,
				})
			}
		}
		else {
			return {
				title: "Demande envoyée",
				description: `Votre demande d'ami a été envoyée à ${username}#${usertag}`,
			}
		}
	}
})
