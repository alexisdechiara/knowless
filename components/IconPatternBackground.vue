<template>
	<div class="select-none" v-bind="$attrs">
		<div v-for="(row, rowIndex) in iconPatternRows" :key="`row-${rowIndex}`" class="flex gap-2">
			<Icon v-for="(icon, iconIndex) in row" :key="`icon-${rowIndex}-${iconIndex}`" :name="icon" class="shrink-0 text-6xl text-zinc-700 opacity-30 blur-[1px] saturate-0 transition-all delay-0 duration-75 ease-in-out hover:scale-110 hover:opacity-100 hover:blur-none hover:saturate-100" />
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	nbRows?: number
	iconsPerRow?: number
}

const props = withDefaults(defineProps<Props>(), {
	nbRows: 20,
	iconsPerRow: 15,
})

// Liste des icônes disponibles pour le pattern
const categoryIcons = [
	"lucide:paw-print", "lucide:landmark", "lucide:palette", "lucide:book-open", "lucide:star",
	"lucide:film", "lucide:layers", "lucide:book-open-text", "lucide:utensils-crossed", "lucide:map",
	"lucide:castle", "lucide:monitor", "lucide:feather", "lucide:gamepad", "lucide:music",
	"lucide:leaf", "lucide:user-x", "lucide:home", "lucide:microscope", "lucide:dumbbell",
	"lucide:tv", "lucide:luggage", "lucide:globe",
]

const iconPatternRows = ref<string[][]>([])

// Fonction pour obtenir une icône aléatoire de la liste
const getRandomIconName = (excludeIcons: string[] = []): string => {
	let availableIcons = categoryIcons
	if (excludeIcons.length > 0 && categoryIcons.length > excludeIcons.length) {
		availableIcons = categoryIcons.filter(icon => !excludeIcons.includes(icon))
	}
	if (availableIcons.length === 0) return categoryIcons[0] // Fallback

	const randomIndex = Math.floor(Math.random() * availableIcons.length)
	return availableIcons[randomIndex]
}

// Générer le pattern d'icônes au montage du composant
onMounted(() => {
	const newPattern: string[][] = []
	for (let i = 0; i < props.nbRows; i++) {
		const row: string[] = []
		let previousIcon: string | undefined
		for (let j = 0; j < props.iconsPerRow; j++) {
			const excluded: string[] = []
			if (previousIcon) excluded.push(previousIcon)
			if (i > 0 && newPattern[i - 1] && newPattern[i - 1][j]) excluded.push(newPattern[i - 1][j])
			const currentIcon = getRandomIconName(excluded)
			row.push(currentIcon)
			previousIcon = currentIcon
		}
		newPattern.push(row)
	}
	iconPatternRows.value = newPattern
})
</script>
