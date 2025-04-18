export const defaultCategories = [
	"adults",
	"animals",
	"archaeology",
	"arts",
	"comics",
	"celebrities",
	"cinema",
	"bulk_culture",
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

export function getRandomCategory(categories: Array<string> = defaultCategories) {
	if (categories.length === 0) categories = defaultCategories
	const index: number = Math.floor(Math.random() * categories.length)
	return categories[index]
}
