export class Friendship {
	user_id: string
	friend_id: string
	status: string

	constructor(user_id: string, friend_id: string, status: string) {
		this.user_id = user_id
		this.friend_id = friend_id
		this.status = status
	}
}
