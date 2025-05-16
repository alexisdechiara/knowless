<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div id="flappy-bird" class="relative h-[480px] w-[720px] touch-none overflow-hidden">
		<canvas ref="canvas" class="absolute left-0 top-0" :width="width" :height="height" />

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
			<button class="inline-flex p-2 underline underline-offset-2 hover:bg-white hover:text-black hover:no-underline" @click="restartGame">
				Rejouer
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue"

const width = 720
const height = 480

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D

// Bird properties
const BIRD_X_POSITION = 100
let birdY = height / 2
let birdVelocity = 0
const BIRD_GRAVITY = 0.9
const BIRD_LIFT = -15 // Ajusté pour une meilleure sensation avec la nouvelle taille
let birdSpriteWidth = 16 // Largeur d'un frame du sprite original
let birdSpriteHeight = 16 // Hauteur d'un frame du sprite original
const BIRD_DRAW_WIDTH = 48 // Largeur cible pour dessiner l'oiseau
const BIRD_DRAW_HEIGHT = 48 // Hauteur cible pour dessiner l'oiseau
let currentBirdFrame = 0
let birdFrameCounter = 0
const BIRD_ANIMATION_SPEED = 5 // Changer de frame tous les 5 ticks
let birdAngle = 0

// Pipe properties
let pipes: Array<{ x: number, topPipeBottomY: number, passed: boolean }> = [] // Simplified pipe structure
const PIPE_SPRITE_WIDTH = 32 // Largeur de l'image source pipe.png
const PIPE_SPRITE_HEIGHT = 80 // Hauteur de l'image source pipe.png
const PIPE_DRAW_WIDTH = 64 // Largeur cible pour dessiner les tuyaux
let pipeCapDrawHeight = 0 // Hauteur du chapeau du tuyau, calculée
const pipeSpeed = 2
const pipeGap = 180 // Espace vertical entre les tuyaux
const pipeSpacing = 300 // Espace horizontal entre les départs des tuyaux

// Game state
const score = ref(0)
const bestScore = ref(Number(localStorage.getItem("flappy_best_score") || "0"))
const gameOver = ref(false)
const gameReady = ref(true) // Commence en état "prêt à jouer"
let gameIntervalId: number | undefined

// Images
let birdImage: HTMLImageElement
let pipeImage: HTMLImageElement
const imagesLoaded = ref(false)
let pipeBodyPattern: CanvasPattern | null = null

// // Sound effects (décommentez et configurez les chemins si besoin)
// const { play: playFlap } = useSound(flapSfx)
// const { play: playScore } = useSound(scoreSfx)
// const { play: playHit } = useSound(hitSfx)

watch(score, (val) => {
	if (val > bestScore.value) {
		bestScore.value = val
		localStorage.setItem("flappy_best_score", val.toString())
	}
})

function restartGame() {
	birdY = (height / 2) - (BIRD_DRAW_HEIGHT / 2) // Centre l'oiseau avec sa taille dessinée
	birdVelocity = 0
	birdAngle = 0
	currentBirdFrame = 0
	pipes = []
	score.value = 0
	gameOver.value = false
	gameReady.value = true // Game is now ready, waiting for first input
	if (gameIntervalId !== undefined) clearInterval(gameIntervalId)
	gameIntervalId = undefined
	startPipes() // Generate initial pipes immediately
	if (imagesLoaded.value) draw() // Draw initial state
}

function generatePipe(x: number) {
	// y est la coordonnée du BAS du tuyau du HAUT (donc le HAUT de l'ouverture)
	const minTopPipeBottomY = Math.max(80, pipeCapDrawHeight + 30) // Assure que le tuyau du haut a une taille minimale
	const maxTopPipeBottomY = height - pipeGap - Math.max(80, pipeCapDrawHeight + 30) // Idem pour le tuyau du bas
	const topPipeBottomY = Math.floor(Math.random() * (maxTopPipeBottomY - minTopPipeBottomY + 1)) + minTopPipeBottomY
	return {
		x: x,
		topPipeBottomY: topPipeBottomY, // Position Y du bas du tuyau du haut / haut du gap
		passed: false,
	}
}

function startPipes() {
	pipes = [] // Clear existing pipes
	const firstPipeX = width + 50 // Commence un peu en dehors de l'écran à droite
	pipes.push(generatePipe(firstPipeX))
	for (let i = 1; i < 3; i++) { // Generate 2 more pipes
		pipes.push(generatePipe(pipes[pipes.length - 1].x + pipeSpacing))
	}
}

function draw() {
	if (!ctx) return

	// Background
	ctx.fillStyle = "#000000" // Fond noir
	ctx.fillRect(0, 0, width, height)

	// Draw bird
	if (imagesLoaded.value && birdImage.complete) {
		ctx.save()
		ctx.translate(BIRD_X_POSITION + BIRD_DRAW_WIDTH / 2, birdY + BIRD_DRAW_HEIGHT / 2)
		ctx.rotate(birdAngle)
		ctx.drawImage(
			birdImage,
			currentBirdFrame * birdSpriteWidth, // Source X for horizontal spritesheet
			0, // Source Y for horizontal spritesheet
			birdSpriteWidth, // Source Width
			birdSpriteHeight, // Source Height
			-BIRD_DRAW_WIDTH / 2, // Destination X (centré)
			-BIRD_DRAW_HEIGHT / 2, // Destination Y (centré)
			BIRD_DRAW_WIDTH, // Destination Width (scaled)
			BIRD_DRAW_HEIGHT, // Destination Height (scaled)
		)
		ctx.restore()
	}
	else { // Fallback si image non chargée
		ctx.fillStyle = "yellow"
		ctx.fillRect(BIRD_X_POSITION, birdY, BIRD_DRAW_WIDTH, BIRD_DRAW_HEIGHT)
	}

	// Draw pipes
	pipes.forEach((pipe) => {
		if (imagesLoaded.value && pipeImage.complete && pipeCapDrawHeight > 0) {
			const sourcePipeCapHeight = PIPE_SPRITE_HEIGHT / 2 // Hauteur du chapeau dans l'image source (40px)

			const pipeBodyColor = "#74BF2E" // Un vert classique pour les tuyaux
			// --- Top Pipe ---
			if (pipeBodyPattern) {
				ctx.fillStyle = pipeBodyPattern
				// To make the pattern align with the pipe's x, we translate temporarily
				ctx.save()
				ctx.translate(pipe.x, 0)
				ctx.fillRect(0, 0, PIPE_DRAW_WIDTH, pipe.topPipeBottomY - pipeCapDrawHeight)
				ctx.restore()
			}
			else { // Fallback if pattern not created
				ctx.fillStyle = pipeBodyColor
				ctx.fillRect(pipe.x, 0, PIPE_DRAW_WIDTH, pipe.topPipeBottomY - pipeCapDrawHeight)
			}
			// Cap of the top pipe (using the bottom half of pipe.png)
			ctx.drawImage(pipeImage, 0, sourcePipeCapHeight, PIPE_SPRITE_WIDTH, sourcePipeCapHeight, pipe.x, pipe.topPipeBottomY - pipeCapDrawHeight, PIPE_DRAW_WIDTH, pipeCapDrawHeight)

			// --- Bottom Pipe ---
			// Cap of the bottom pipe (using the top half of pipe.png)
			ctx.drawImage(pipeImage, 0, 0, PIPE_SPRITE_WIDTH, sourcePipeCapHeight, pipe.x, pipe.topPipeBottomY + pipeGap, PIPE_DRAW_WIDTH, pipeCapDrawHeight)
			if (pipeBodyPattern) {
				ctx.fillStyle = pipeBodyPattern
				ctx.save()
				ctx.translate(pipe.x, pipe.topPipeBottomY + pipeGap + pipeCapDrawHeight)
				ctx.fillRect(0, 0, PIPE_DRAW_WIDTH, height - (pipe.topPipeBottomY + pipeGap + pipeCapDrawHeight))
				ctx.restore()
			}
			else { // Fallback
				ctx.fillStyle = pipeBodyColor
				ctx.fillRect(pipe.x, pipe.topPipeBottomY + pipeGap + pipeCapDrawHeight, PIPE_DRAW_WIDTH, height - (pipe.topPipeBottomY + pipeGap + pipeCapDrawHeight))
			}
		}
		else { // Fallback if image not loaded or wrong size
			ctx.fillStyle = "green"
			ctx.fillRect(pipe.x, 0, PIPE_DRAW_WIDTH, pipe.topPipeBottomY) // Top part
			ctx.fillRect(pipe.x, pipe.topPipeBottomY + pipeGap, PIPE_DRAW_WIDTH, height - (pipe.topPipeBottomY + pipeGap)) // Bottom part
		}
	})

	// "Appuyer sur espace" message
	if (gameReady.value && !gameOver.value && imagesLoaded.value) {
		ctx.fillStyle = "white"
		ctx.font = "24px 'Press Start 2P'"
		ctx.textAlign = "center"
		const line1 = "Appuyer sur ESPACE"
		const line2 = "pour commencer"
		ctx.fillText(line1, width / 2, height / 2 - 20) // Adjusted y for two lines
		ctx.fillText(line2, width / 2, height / 2 + 15)
		ctx.strokeStyle = "black"
		ctx.lineWidth = 1
		ctx.strokeText(line1, width / 2, height / 2 - 20)
		ctx.strokeText(line2, width / 2, height / 2 + 15)
	}
}

function update() {
	if (gameOver.value || !imagesLoaded.value) return

	// Bird physics
	birdVelocity += BIRD_GRAVITY
	birdY += birdVelocity
	birdAngle = Math.min(Math.PI / 6, birdVelocity * 0.035) // Tilt based on velocity

	// Bird animation
	birdFrameCounter++
	if (birdFrameCounter >= BIRD_ANIMATION_SPEED) {
		currentBirdFrame = (currentBirdFrame + 1) % 4 // 4 frames for bird.png
		birdFrameCounter = 0
	}

	// Pipe movement
	pipes.forEach((pipe) => {
		pipe.x -= pipeSpeed
	})

	// Add new pipe if needed & remove off-screen pipes
	if (pipes.length > 0 && pipes[0].x + PIPE_DRAW_WIDTH < 0) {
		pipes.shift()
	}
	if (pipes.length < 3 && (pipes.length === 0 || pipes[pipes.length - 1].x < width - pipeSpacing)) {
		const lastPipeX = pipes.length > 0 ? pipes[pipes.length - 1].x : width - pipeSpacing - PIPE_DRAW_WIDTH
		pipes.push(generatePipe(lastPipeX + pipeSpacing))
	}

	// Collision detection
	const birdHitboxX = BIRD_X_POSITION + BIRD_DRAW_WIDTH * 0.15 // Hitbox basé sur la taille dessinée
	const birdHitboxY = birdY + BIRD_DRAW_HEIGHT * 0.15
	const birdHitboxW = BIRD_DRAW_WIDTH * 0.7
	const birdHitboxH = BIRD_DRAW_HEIGHT * 0.7

	// Ground and ceiling collision
	if (birdY + BIRD_DRAW_HEIGHT >= height || birdY <= 0) {
		// playHit()
		endGame()
		return
	}

	// Pipe collision
	for (const pipe of pipes) {
		const pipeTopSolidBottomY = pipe.topPipeBottomY // Bottom edge of the top solid pipe part
		const pipeBottomSolidTopY = pipe.topPipeBottomY + pipeGap // Top edge of the bottom solid pipe part

		const birdCollidesWithPipe
			= birdHitboxX < pipe.x + PIPE_DRAW_WIDTH
				&& birdHitboxX + birdHitboxW > pipe.x
				&& (birdHitboxY < pipeTopSolidBottomY || birdHitboxY + birdHitboxH > pipeBottomSolidTopY)

		if (birdCollidesWithPipe) {
			// playHit()
			endGame()
			return
		}

		// Score
		if (pipe.x + PIPE_DRAW_WIDTH < BIRD_X_POSITION && !pipe.passed) {
			pipe.passed = true
			score.value++
			// playScore()
		}
	}
}

function gameLoop() {
	if (gameOver.value || gameReady.value || !imagesLoaded.value) {
		// Still draw if game is ready (for "press space") or game over, or loading, but only if ctx is available
		if (ctx && (imagesLoaded.value || gameReady.value || (!imagesLoaded.value && !gameOver.value))) {
			draw()
			if (!imagesLoaded.value && !gameOver.value && gameReady.value) { // Show loading text if images not ready
				ctx.fillStyle = "white"
				ctx.font = "20px 'Press Start 2P'"
				ctx.textAlign = "center"
				ctx.fillText("Chargement des images...", width / 2, height / 2 + 40)
			}
		}
		return
	}
	update()
	if (ctx) draw()
}

function flap() {
	if (gameOver.value || !imagesLoaded.value) return
	birdVelocity = BIRD_LIFT
	birdAngle = -Math.PI / 5 // Tilt up on flap
	// playFlap()
}

let keydownHandler: ((e: KeyboardEvent) => void) | null = null

onMounted(() => {
	const el = canvas.value
	if (!el) return
	const context = el.getContext("2d")
	if (!context) return
	ctx = context

	// Image loading
	birdImage = new Image()
	pipeImage = new Image()
	let loadedCount = 0
	const totalImages = 2

	const onAllImagesLoaded = () => {
		imagesLoaded.value = true
		// Assuming bird.png is a HORIZONTAL strip of 4 16x16 sprites (e.g., 64x16)
		// If it's 64px wide and 16px tall:
		birdSpriteWidth = birdImage.width / 4 // e.g., 64 / 4 = 16
		birdSpriteHeight = birdImage.height // e.g., 16

		// Calculate drawn pipe cap height based on target width and source aspect ratio
		const sourcePipeCapHeight = PIPE_SPRITE_HEIGHT / 2
		pipeCapDrawHeight = sourcePipeCapHeight * (PIPE_DRAW_WIDTH / PIPE_SPRITE_WIDTH)

		// Create pipe body pattern from the center 32x32 of pipe.png
		if (pipeImage.complete && pipeImage.width === PIPE_SPRITE_WIDTH && pipeImage.height === PIPE_SPRITE_HEIGHT && ctx) {
			const tempCanvas = document.createElement("canvas")
			const tempCtx = tempCanvas.getContext("2d")

			// Define the dimensions of the tile from the source pipe image
			const patternSourceTileHeight = 32 // Height of the repeating segment from pipe.png
			const patternSourceTileWidth = PIPE_SPRITE_WIDTH // Width of the segment from pipe.png (should be its full width)
			const patternSourceTileY = (PIPE_SPRITE_HEIGHT - patternSourceTileHeight) / 2 // Y-offset to center the segment

			// Calculate scaling factor and destination dimensions for the pattern tile
			const scaleFactor = PIPE_DRAW_WIDTH / patternSourceTileWidth // How much to scale the source tile
			const patternDestTileWidth = PIPE_DRAW_WIDTH // Target width for the pattern tile (same as drawn pipes)
			const patternDestTileHeight = patternSourceTileHeight * scaleFactor // Scaled height for the pattern tile

			if (tempCtx) {
				tempCanvas.width = patternDestTileWidth
				tempCanvas.height = patternDestTileHeight

				// Ensure pixelated rendering when scaling for the pattern
				tempCtx.imageSmoothingEnabled = false

				tempCtx.drawImage(
					pipeImage,
					0, // Source X from pipeImage
					patternSourceTileY, // Source Y from pipeImage
					patternSourceTileWidth, // Source Width of the tile
					patternSourceTileHeight, // Source Height of the tile
					0, // Destination X on tempCanvas
					0, // Destination Y on tempCanvas
					patternDestTileWidth, // Destination Width (scaled)
					patternDestTileHeight, // Destination Height (scaled)
				)
				pipeBodyPattern = ctx.createPattern(tempCanvas, "repeat-y")
			}
		}
		restartGame() // This will also call draw()
		// Start game loop interval if not already started (for initial "press space" screen)
		if (gameIntervalId === undefined) {
			gameIntervalId = window.setInterval(gameLoop, 1000 / 60)
		}
	}

	birdImage.onload = () => {
		loadedCount++
		if (loadedCount === totalImages) onAllImagesLoaded()
	}
	pipeImage.onload = () => {
		loadedCount++
		if (loadedCount === totalImages)
			onAllImagesLoaded()
	}
	birdImage.onerror = () => console.error("Failed to load bird.png")
	pipeImage.onerror = () => console.error("Failed to load pipe.png")

	birdImage.src = "/flappy-bird/bird.png"
	pipeImage.src = "/flappy-bird/pipe.png"

	keydownHandler = (e: KeyboardEvent) => {
		if (e.code === "Space" || e.code === "ArrowUp") {
			e.preventDefault() // Prevent page scroll on spacebar

			if (gameOver.value) {
				// "Rejouer" button handles the restart.
				return
			}

			if (gameReady.value) {
				gameReady.value = false
				flap() // Perform the first flap
				// Game loop should already be running from onAllImagesLoaded or started below
				if (gameIntervalId === undefined) { // Safety: if not started, start it
					gameIntervalId = window.setInterval(gameLoop, 1000 / 60)
				}
			}
			else if (!gameOver.value) { // Game is active
				flap()
			}
		}
	}
	window.addEventListener("keydown", keydownHandler)

	// Initial call to gameLoop to draw "Loading..." or "Press Space" if images load very fast
	if (gameIntervalId === undefined) {
		gameIntervalId = window.setInterval(gameLoop, 1000 / 60)
	}
})

onUnmounted(() => {
	if (gameIntervalId !== undefined) clearInterval(gameIntervalId)
	if (keydownHandler) {
		window.removeEventListener("keydown", keydownHandler)
	}
})

function endGame() {
	if (gameOver.value) return // Eviter appels multiples
	gameOver.value = true
	gameReady.value = false // Not ready for immediate start
	// Interval is stopped by the gameLoop condition, no need to clear here explicitly
	// if (gameIntervalId !== undefined) clearInterval(gameIntervalId); // Loop will stop itself
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

canvas {
  image-rendering: pixelated;
}

#flappy-bird {
  font-family: 'Press Start 2P', monospace !important;
  image-rendering: pixelated;
}

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
  animation: fade-in 0.5s ease-out;
}
</style>
