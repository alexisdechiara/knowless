export default function localCategoryToOpenQuizzCategory(category: string) {
	switch (category) {
		case "animals":
			return "animaux"
		case "archaeology":
			return "archeologie"
		case "arts":
			return "arts"
		case "comics":
			return "bd"
		case "celebrities":
			return "celebrities"
		case "cinema":
			return "cinema"
		case "random_culture":
		case "general_culture":
			return "culture"
		case "gastronomy":
			return "gastronomie"
		case "geography":
			return "geographie"
		case "history":
			return "histoire"
		case "computing":
			return "informatique"
		case "literature":
			return "litterature"
		case "hobbies":
			return "loisirs"
		case "music":
			return "musique"
		case "nature":
			return "nature"
		case "countries":
			return "monde"
		case "daily_life":
			return "quotidien"
		case "sciences":
			return "sciences"
		case "sports":
			return "sports"
		case "television":
			return "television"
		case "tourism":
			return "tourisme"
		case "web":
			return "internet"
		default:
			return null
	}
}
