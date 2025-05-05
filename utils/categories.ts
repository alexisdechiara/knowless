export const defaultCategories = [
	"adults",
	"animals",
	"archaeology",
	"arts",
	"celebrities",
	"cinema",
	"bulk_culture",
	"general_culture",
	"gastronomy",
	"geography",
	"graphic_and_animated",
	"history",
	"computing",
	"literature",
	"games",
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
