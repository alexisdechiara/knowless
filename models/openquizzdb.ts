export class OpenQuizzDB {
	api_version: string
	api_server: string
	api_runtime: string
	api_key: string
	api_premium: string
	response_code: number
	results: Array<OpenQuizzDBResult>

	constructor(data: OpenQuizzDB) {
		this.api_version = data.api_version
		this.api_server = data.api_server
		this.api_runtime = data.api_runtime
		this.api_key = data.api_key
		this.api_premium = data.api_premium
		this.response_code = data.response_code
		this.results = data.results.map((result: OpenQuizzDBResult) => new OpenQuizzDBResult(result))
	}
}

export class OpenQuizzDBResult {
	categorie?: string
	theme?: string
	difficulte?: string
	question: string
	reponse_correcte: string
	autres_choix: string[]
	wikipedia?: string

	constructor(data: OpenQuizzDBResult) {
		this.categorie = data?.categorie
		this.theme = data?.theme
		this.difficulte = data?.difficulte
		this.question = data.question
		this.reponse_correcte = data.reponse_correcte
		this.autres_choix = data.autres_choix
		this.wikipedia = data?.wikipedia
	}
}
