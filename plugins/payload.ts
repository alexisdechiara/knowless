import { OpenQuizzDBResult } from "./../models/openquizzdb"
import { OpenQuizzDB } from "~/models/openquizzdb"

export default definePayloadPlugin(() => {
	definePayloadReducer("OpenQuizzDB", (data) => {
		if (data instanceof OpenQuizzDB) {
			return new OpenQuizzDB(data)
		}
	})

	definePayloadReviver("OpenQuizzDB", (data) => {
		return new OpenQuizzDB(data)
	})

	definePayloadReducer("OpenQuizzDBResult", (data) => {
		if (data instanceof OpenQuizzDBResult) {
			return new OpenQuizzDBResult(data)
		}
	})

	definePayloadReviver("OpenQuizzDBResult", (data) => {
		return new OpenQuizzDBResult(data)
	})
})
