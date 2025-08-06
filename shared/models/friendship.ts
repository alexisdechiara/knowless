/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from "./user"

export class Friendship {
	id: number
	player?: User | undefined
	playerId: string
	friend: User | undefined
	friendId: string
	status: "accepted" | "refused" | "pending" | string | undefined
	createdAt: Date

	constructor(data: Record<string, any>, playerData?: User, friendData?: User) {
		this.id = data.id
		this.player = playerData
		this.playerId = data.user_id
		this.friend = friendData
		this.friendId = data.friend_id
		this.status = data.status
		this.createdAt = new Date(data.created_at)
	}
}
