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
		this.lobbyId = data?.lobby_id
		this.score = data?.score
		this.theme = data?.theme || "system"
	}
}
