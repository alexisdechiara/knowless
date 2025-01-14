export const defaultCategories = [
	"animals",
	"archaeology",
	"arts",
	"comics",
	"celebrities",
	"cinema",
	"random_culture",
	"general_culture",
	"gastronomy",
	"geography",
	"history",
	"computing",
	"literature",
	"hobbies",
	"music",
	"nature",
	"countries",
	"daily_life",
	"sciences",
	"sports",
	"television",
	"tourism",
	"web",
]

export function localCategoryToOpenQuizzCategory(category: string) {
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

export function getRandomCategory(categories: Array<string> = defaultCategories) {
	if (categories.length === 0) categories = defaultCategories
	const index: number = Math.floor(Math.random() * categories.length)
	return categories[index]
}
