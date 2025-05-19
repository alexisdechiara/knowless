<template>
	<div class="container relative hidden h-screen w-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
		<Button :as="NuxtLink" variant="ghost" class="absolute right-4 top-4 z-10 cursor-pointer md:right-8 md:top-8" @click="route.path === '/login' ? navigateTo('/register') : navigateTo('/login')">
			{{ route.path === '/login' ? 'S\'inscrire' : 'Se connecter' }}
		</Button>
		<div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
			<div class="absolute inset-0 overflow-hidden bg-zinc-900">
				<div v-for="(row, rowIndex) in iconPatternRows" :key="`row-${rowIndex}`" class="flex select-none gap-2">
					<Icon v-for="(icon, iconIndex) in row" :key="`icon-${rowIndex}-${iconIndex}`" :name="icon" class="shrink-0 text-6xl text-zinc-700 opacity-30 blur-[1px] saturate-0 transition-all delay-0 duration-75 ease-in-out hover:scale-110 hover:opacity-100 hover:blur-none hover:saturate-100" />
				</div>
			</div>
			<div class="relative z-20 flex cursor-default items-center text-xl font-medium text-zinc-100">
				<Icon name="custom:knowless-logo" class="mr-3 text-3xl" />
				Knowless
			</div>
		</div>
		<div class="relative flex h-full items-center justify-center lg:p-8">
			<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<slot />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { NuxtLink } from "#components"

const route = useRoute()
// Liste des icônes disponibles pour le pattern
const categoryIcons = [
	"lucide:paw-print",
	"lucide:landmark",
	"lucide:palette",
	"lucide:book-open",
	"lucide:star",
	"lucide:film",
	"lucide:layers",
	"lucide:book-open-text",
	"lucide:utensils-crossed",
	"lucide:map",
	"lucide:castle",
	"lucide:monitor",
	"lucide:feather",
	"lucide:gamepad",
	"lucide:music",
	"lucide:leaf",
	"lucide:user-x",
	"lucide:home",
	"lucide:microscope",
	"lucide:dumbbell",
	"lucide:tv",
	"lucide:luggage",
	"lucide:globe",
]

const iconPatternRows = ref<string[][]>([])
const NUM_ROWS = 20 // Nombre de lignes d'icônes
const ICONS_PER_ROW = 15 // Nombre d'icônes par ligne

// Fonction pour obtenir une icône aléatoire de la liste
const getRandomIconName = (excludeIcons: string[] = []): string => {
	let availableIcons = categoryIcons
	if (excludeIcons.length > 0 && categoryIcons.length > excludeIcons.length) {
		availableIcons = categoryIcons.filter(icon => !excludeIcons.includes(icon))
	}
	if (availableIcons.length === 0) return categoryIcons[0] // Fallback si toutes les icônes sont exclues (très improbable avec cette logique)

	const randomIndex = Math.floor(Math.random() * availableIcons.length)
	return availableIcons[randomIndex]
}

// Générer le pattern d'icônes au montage du composant
onMounted(() => {
	const newPattern: string[][] = []
	for (let i = 0; i < NUM_ROWS; i++) {
		const row: string[] = []
		let previousIcon: string | undefined
		for (let j = 0; j < ICONS_PER_ROW; j++) {
			const excluded: string[] = []
			if (previousIcon) excluded.push(previousIcon) // Exclure l'icône à gauche
			if (i > 0 && newPattern[i - 1][j]) excluded.push(newPattern[i - 1][j]) // Exclure l'icône au-dessus

			const currentIcon = getRandomIconName(excluded)
			row.push(currentIcon)
			previousIcon = currentIcon
		}
		newPattern.push(row)
	}
	iconPatternRows.value = newPattern
})
</script>
