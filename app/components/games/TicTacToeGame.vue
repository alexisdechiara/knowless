<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div
		id="tic-tac-toe-game"
		class="relative h-[480px] w-[720px] touch-none overflow-hidden bg-black"
	>
		<canvas
			ref="canvas"
			class="absolute left-0 top-0"
			:width="width"
			:height="height"
		/>

		<div
			v-if="gameOver"
			class="animate-fade-in absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/90 text-white"
		>
			<div class="text-3xl font-bold">{{ resultMessage }}</div>
			<button
				class="inline-flex p-2 underline underline-offset-2 hover:bg-white hover:text-black hover:no-underline"
				@click="restartGame"
			>
				Rejouer
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const width = 720
const height = 480

type Cell = "❌" | "⭕" | ""
const board = ref<Cell[]>(Array(9).fill(""))
const player = "❌"
const bot = "⭕"
const gameOver = ref(false)
const resultMessage = ref("")

const drawBoard = () => {
	const context = ctx.value
	if (!context) return

	context.clearRect(0, 0, width, height)
	context.strokeStyle = "#FFFFFF"
	context.lineWidth = 4

	const cellSize = 160
	const offsetX = (width - 3 * cellSize) / 2
	const offsetY = (height - 3 * cellSize) / 2

	for (let i = 1; i <= 2; i++) {
		context.beginPath()
		context.moveTo(offsetX + i * cellSize, offsetY)
		context.lineTo(offsetX + i * cellSize, offsetY + 3 * cellSize)
		context.stroke()

		context.beginPath()
		context.moveTo(offsetX, offsetY + i * cellSize)
		context.lineTo(offsetX + 3 * cellSize, offsetY + i * cellSize)
		context.stroke()
	}

	board.value.forEach((cell, index) => {
		const col = index % 3
		const row = Math.floor(index / 3)
		const x = offsetX + col * cellSize + cellSize / 2
		const y = offsetY + row * cellSize + cellSize / 2

		context.font = "bold 64px monospace"
		context.textAlign = "center"
		context.textBaseline = "middle"
		context.fillStyle = "#FFFFFF"
		if (cell) context.fillText(cell, x, y)
	})

	if (gameOver.value) {
		// This specific message drawing might be redundant if using the overlay div,
		// but kept for consistency if the overlay is conditional.
		// context.fillStyle = "#FFFFFF"
		// context.font = "bold 36px monospace"
		// context.textAlign = "center"
		// context.fillText(resultMessage.value, width / 2, 50)
	}
}

const handleClick = (e: MouseEvent) => {
	if (gameOver.value || !canvas.value) return

	const rect = canvas.value.getBoundingClientRect()
	const x = e.clientX - rect.left
	const y = e.clientY - rect.top

	const cellSize = 160
	const offsetX = (width - 3 * cellSize) / 2
	const offsetY = (height - 3 * cellSize) / 2

	const col = Math.floor((x - offsetX) / cellSize)
	const row = Math.floor((y - offsetY) / cellSize)

	if (col < 0 || col > 2 || row < 0 || row > 2) return

	const index = row * 3 + col
	if (board.value[index]) return

	board.value[index] = player

	// Dessine le coup du joueur immédiatement
	drawBoard()

	// Vérifie si le joueur a gagné ou s'il y a égalité
	if (checkWin(player)) {
		gameOver.value = true
		resultMessage.value = "Vous avez gagné"
		return // Le jeu est terminé, pas de coup du bot
	}

	if (board.value.every(c => c)) {
		gameOver.value = true
		resultMessage.value = "Egalité"
		return // Le jeu est terminé, pas de coup du bot
	}

	// Si le jeu n'est pas terminé, planifie le coup du bot après un délai
	setTimeout(botMove, 500)
}

const botMove = () => {
	if (gameOver.value) return // Ne pas jouer si la partie est déjà terminée par le joueur

	const emptyIndices = board.value
		.map((v, i) => (v === "" ? i : -1))
		.filter(i => i !== -1)

	if (emptyIndices.length === 0) return // Plus de place pour jouer

	// Stratégie du bot :
	// 1. Gagner si possible
	for (const i of emptyIndices) {
		board.value[i] = bot
		if (checkWin(bot)) {
			gameOver.value = true
			resultMessage.value = "Vous avez perdu"
			drawBoard()
			return
		}
		board.value[i] = "" // Annuler le coup test
	}

	// 2. Bloquer le joueur si le joueur peut gagner au prochain coup
	for (const i of emptyIndices) {
		board.value[i] = player
		if (checkWin(player)) {
			board.value[i] = bot // Bloquer ici
			drawBoard()
			return
		}
		board.value[i] = "" // Annuler le coup test
	}

	// 3. Jouer un coup aléatoire parmi les cases vides restantes
	const randIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)] || 0
	board.value[randIndex] = bot

	// Vérifier si le bot a gagné avec ce coup aléatoire ou s'il y a égalité
	if (checkWin(bot)) {
		gameOver.value = true
		resultMessage.value = "Vous avez perdu"
	}
	else if (board.value.every(c => c)) {
		gameOver.value = true
		resultMessage.value = "Egalité"
	}

	drawBoard()
}

const checkWin = (symbol: Cell): boolean => {
	const winPatterns = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
		[0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
		[0, 4, 8], [2, 4, 6], // Diagonales
	]
	return winPatterns.some(pattern =>
		pattern.every(i => board.value[i] === symbol),
	)
}

const restartGame = () => {
	board.value = Array(9).fill("")
	gameOver.value = false
	resultMessage.value = ""
	drawBoard()
}

onMounted(() => {
	if (canvas.value) {
		ctx.value = canvas.value.getContext("2d")
		canvas.value.addEventListener("click", handleClick)
	}
	drawBoard()
})

// Optionnel: nettoyer l'event listener si le composant est détruit
// import { onUnmounted } from "vue"
// onUnmounted(() => {
//   if (canvas.value) {
//     canvas.value.removeEventListener("click", handleClick)
//   }
// })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

canvas {
  image-rendering: pixelated;
}

#tic-tac-toe-game {
  font-family: 'Press Start 2P', monospace !important;
	image-rendering: pixelated;
}

/* Animation pour le message de fin de partie */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
