import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseClient } from "~/utils/supabaseClient"

export class User {
	id: string
	email?: string
	username: string
	usertag: string
	language?: string
	avatar?: string
	created_at?: string
	categories?: string[]
	status?: string
	stats: Record<string, any> = {}
	lobbyId?: string
	score?: number
	theme?: "light" | "dark" | "system"

	constructor(data?: Record<string, any>) {
		this.id = data?.id
		this.username = data?.username
		this.usertag = data?.usertag
		this.language = data?.language
		this.avatar = data?.avatar
		this.created_at = data?.created_at
		this.categories = data?.categories
		this.status = data?.status
		this.stats = data?.stats
		this.lobbyId = data?.lobby_id
		this.score = data?.score
		this.theme = data?.theme || "system"
	}

	static async fetchById(id: string, client?: SupabaseClient): Promise<User | null> {
		const supabase = client || getSupabaseClient()

		const { data, error } = await supabase
			.from("players")
			.select("*")
			.eq("id", id)
			.single()

		if (error) {
			console.error(error)
			throw new Error("Erreur lors de la récupération de l'utilisateur", error)
		}

		if (!data) {
			return null
		}

		return new User(data)
	}

	static async updateById(id: string, updates: Partial<User>, client?: SupabaseClient): Promise<User | null> {
		const supabase = client || getSupabaseClient()

		const { data, error } = await supabase
			.from("players")
			.update(updates)
			.eq("id", id)
			.single()

		if (error) {
			console.error(error)
			throw new Error("Erreur lors de la mise à jour de l'utilisateur", error)
		}

		if (!data) {
			return null
		}

		return new User(data)
	}
}
