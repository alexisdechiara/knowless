export default defineEventHandler(async (event) => {
	return {
		api_version: "3.1",
		api_server: "OpenQuizzDB SRV2",
		api_runtime: "0.087 sec",
		api_key: "4DH83PMR5A",
		api_premium: "Yes",
		response_code: 0,
		results:
		[
			{
				categorie: "musique",
				theme: "Depeche Mode",
				difficulte: "expert",
				question: "Quel morceau a été choisi pour figurer en face B du titre ‘NewLife’?",
				reponse_correcte: "’Shout’",
				autres_choix: ["’Ice Machine’", "’Any Second Now’", "’See You’"],
				wikipedia: "https://fr.wikipedia.org/wiki/New_Life",
				anecdote: "L’album est sorti en 1996, et le morceau est sorti en 1997.",
			}],
	}
})
