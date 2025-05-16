<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div id="snake-game" class="relative h-[480px] w-[720px] touch-none overflow-hidden" @touchstart="handleTouchStart" @touchmove="handleTouchMove">
		<canvas
			ref="canvas"
			class="absolute left-0 top-0"
			:width="width"
			:height="height"
		/>
		<div class="absolute right-4 top-2 space-y-2 text-right text-xl leading-normal text-white">
			<div class="flex items-end justify-end gap-2">
				<span>🏆</span>
				<span class="leading-none"> {{ bestScore }}</span>
			</div>
			<div class="flex items-end justify-end gap-2">
				<span>🎯</span>
				<span class="leading-none">{{ score }}</span>
			</div>
		</div>
		<div v-if="gameOver" class="animate-fade-in absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/90 text-white">
			<div class="text-3xl font-bold">Game Over</div>
			<div class="text-xl">Votre score est de : {{ score }}</div>
			<div class="text-md">Meilleur score : {{ bestScore }}</div>
			<button class="inline-flex p-2 underline underline-offset-2 hover:bg-white hover:text-black hover:no-underline" @click="restartGame">Rejouer</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue"

const width = 720
const height = 480
const canvas = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D
let interval: number
let speed = 150
let direction = "right"
let snake: { x: number, y: number }[] = []
let food = { x: 0, y: 0, emoji: "🍎" }
const box = 24
const gameOver = ref(false)
const emojis = ["🍎", "🍌", "🍇", "🍓", "🍒", "🥝", "🍉", "🥕", "🌽", "🍍"]
const score = ref(0)
const bestScore = ref(Number(localStorage.getItem("snake_best_score") || "0"))

watch(score, (newScore) => {
	if (newScore > bestScore.value) {
		bestScore.value = newScore
		localStorage.setItem("snake_best_score", newScore.toString())
	}
})

let touchStartX = 0
let touchStartY = 0

function initGame() {
	direction = "right"
	gameOver.value = false
	speed = 150
	score.value = 0
	clearInterval(interval)
	snake = [
		{ x: 6 * box, y: 5 * box },
		{ x: 5 * box, y: 5 * box },
	]
	generateFood()
	interval = window.setInterval(gameLoop, speed)
}

function restartGame() {
	initGame()
	draw()
}

function generateFood() {
	food = {
		x: Math.floor(Math.random() * (width / box)) * box,
		y: Math.floor(Math.random() * (height / box)) * box,
		emoji: emojis[Math.floor(Math.random() * emojis.length)],
	}
}

function draw() {
	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 0, width, height)

	snake.forEach((segment) => {
		ctx.fillStyle = "#ffffff"
		ctx.fillRect(segment.x, segment.y, box, box)
	})

	ctx.font = `${box}px serif`
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.fillText(food.emoji, food.x + box / 2, food.y + box / 2)
}

function moveSnake() {
	const head = { ...snake[0] }

	if (direction === "right") head.x += box
	if (direction === "left") head.x -= box
	if (direction === "up") head.y -= box
	if (direction === "down") head.y += box

	if (head.x >= width) head.x = 0
	if (head.x < 0) head.x = width - box
	if (head.y >= height) head.y = 0
	if (head.y < 0) head.y = height - box

	if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
		gameOver.value = true
		clearInterval(interval)
		return
	}

	snake.unshift(head)

	if (head.x === food.x && head.y === food.y) {
		generateFood()
		score.value++
		speed = Math.max(50, speed - 5)
		clearInterval(interval)
		interval = window.setInterval(gameLoop, speed)
	}
	else {
		snake.pop()
	}
}

function gameLoop() {
	moveSnake()
	draw()
}

function keyDownHandler(e: KeyboardEvent) {
	const key = e.key
	if (key === "ArrowUp" && direction !== "down") direction = "up"
	else if (key === "ArrowDown" && direction !== "up") direction = "down"
	else if (key === "ArrowLeft" && direction !== "right") direction = "left"
	else if (key === "ArrowRight" && direction !== "left") direction = "right"
}

function handleTouchStart(e: TouchEvent) {
	touchStartX = e.touches[0].clientX
	touchStartY = e.touches[0].clientY
}

function handleTouchMove(e: TouchEvent) {
	const dx = e.touches[0].clientX - touchStartX
	const dy = e.touches[0].clientY - touchStartY

	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx > 0 && direction !== "left") direction = "right"
		else if (dx < 0 && direction !== "right") direction = "left"
	}
	else {
		if (dy > 0 && direction !== "up") direction = "down"
		else if (dy < 0 && direction !== "down") direction = "up"
	}
}

onMounted(() => {
	const el = canvas.value
	if (!el) return
	const context = el.getContext("2d")
	if (!context) return
	ctx = context
	initGame()
	draw()
	window.addEventListener("keydown", keyDownHandler)
})

onUnmounted(() => {
	window.clearInterval(interval)
	window.removeEventListener("keydown", keyDownHandler)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

canvas {
  image-rendering: pixelated;
}

#snake-game {
  font-family: 'Press Start 2P', monospace !important;
	image-rendering: pixelated;
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>
