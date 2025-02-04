/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "./user"

export class Lobby {
	id: string
	title: string
	host: string
	created_at: Date
	isPublic: boolean
	password: string
	isFriendsOnly: boolean
	maxPlayers: number
	players: Array<User>
	invitedPlayersId: Array<string>
	bannedPlayersId: Array<string>

	constructor(data?: Record<string, any>, players?: any[] | any) {
		this.id = data?.id
		this.title = data?.title
		this.host = data?.host
		this.maxPlayers = data?.max_players
		this.created_at = data?.created_at
		this.isPublic = data?.isPublic
		this.password = data?.password
		this.isFriendsOnly = data?.is_friends_only
		if (players && players.length > 0) {
			this.players = players.map((player: any) => {
				return new User(player)
			})
		}
		else {
			this.players = []
		}
		this.invitedPlayersId = data?.invited_friends || []
		this.bannedPlayersId = data?.banned_players || []
	}
}
