<template>
	<div
		id="tetris-game"
		class="relative flex h-[480px] w-[720px] bg-[#3B3B3B] p-4"
	>
		<!-- Left Panel (Hold and Next Pieces) -->
		<div class="flex w-[150px] flex-col justify-start space-y-4 bg-[#3B3B3B] px-4 pt-1 text-[#C4CFA1]">
			<div class="w-full border-2 border-[#C4CFA1] p-2 text-center text-sm">
				<div class="mb-1">RESERVE</div>
				<canvas ref="holdCanvas" :width="holdCanvasSize" :height="holdCanvasSize" class="mx-auto" />
			</div>

			<div class="w-full border-2 border-[#C4CFA1] p-2 text-center text-sm">
				<div class="mb-1">SUIVANT</div>
				<canvas ref="nextPiecesCanvas" :width="nextPiecesCanvasWidth" :height="nextPiecesCanvasHeight" class="mx-auto" />
			</div>
		</div>

		<!-- Game Board -->
		<canvas
			ref="canvas"
			:width="canvasWidth"
			:height="canvasHeight"
		/>

		<!-- Stats Area -->
		<div
			class="flex flex-1 flex-col justify-start space-y-3 bg-[#3B3B3B] px-4 pt-1 text-[#C4CFA1]"
		>
			<div class="flex w-full justify-between space-x-3">
				<div class="flex-1 border-2 border-[#C4CFA1] p-2 text-center text-sm">
					<div>MEILLEUR</div>
					<div class="text-lg font-bold">{{ bestScore }}</div>
				</div>
				<div class="flex-1 border-2 border-[#C4CFA1] p-2 text-center text-sm">
					<div>SCORE</div>
					<div class="text-lg font-bold">{{ score }}</div>
				</div>
			</div>

			<div class="flex w-full justify-between space-x-3">
				<div class="flex-1 border-2 border-[#C4CFA1] p-2 text-center text-sm">
					<div>LIGNES</div>
					<div class="text-lg font-bold">{{ linesCleared }}</div>
				</div>
				<div class="flex-1 border-2 border-[#C4CFA1] p-2 text-center text-sm">
					<div>COMBO</div>
					<div class="text-lg font-bold">{{ currentCombo }}</div>
				</div>
			</div>
			<div class="w-full border-2 border-[#C4CFA1] p-2 text-center text-sm">
				<div>TEMPS</div>
				<div class="text-lg font-bold">{{ formattedTime }}</div>
			</div>

			<!-- Controls Info -->
			<div class="mt-auto size-full border-2 border-[#C4CFA1] p-2 text-sm">
				<div class="mb-2 text-center">CONTROLES</div>
				<div class="flex flex-col space-y-2">
					<div class="flex justify-between">
						<span class="self-center">Déplacer:</span>
						<span class="text-lg">🡄 🡆</span>
					</div>
					<div class="flex justify-between">
						<span class="self-center">Rotation:</span>
						<span class="text-lg">🡅</span>
					</div>
					<div class="flex justify-between">
						<span class="self-center">Chute Douce:</span>
						<span class="text-lg">🡇</span>
					</div>
					<div class="flex justify-between">
						<span class="self-center">Chute Rapide:</span> <span class="self-center text-xs leading-tight">ESPACE</span>
					</div>
					<div class="flex justify-between">
						<span class="self-center">Garder:</span> <span class="self-center text-xs leading-tight">C</span>
					</div>
				</div>
			</div>
		</div>

		<div
			v-if="gameOver"
			class="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/90 text-[#C4CFA1]"
		>
			<div class="text-2xl font-bold">Game Over</div>
			<div>Score: {{ score }}</div>
			<div v-if="score === bestScore && score > 0">NOUVEAU MEILLEUR SCORE !</div>
			<button
				class="p-2 underline underline-offset-2 hover:bg-[#C4CFA1] hover:text-[#3B3B3B] hover:no-underline"
				@click="restartGame"
			>
				Rejouer
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue"

interface PieceState {
	shape: number[][]
	x: number
	y: number
	pieceId: number // Index of the shape in the shapes array (0-6)
}

const COLS = 10
const ROWS = 20
const BLOCK_SIZE = 24 // Canvas height 480 / 20 rows = 24px per block
const HUD_BLOCK_SIZE = 21 // Increased size for HUD blocks
const PANEL_WIDTH = 150 // Not used in script, but for CSS reference
const holdCanvasSize = 4 * HUD_BLOCK_SIZE // Use HUD_BLOCK_SIZE for hold canvas
const canvasWidth = COLS * BLOCK_SIZE // 10 * 24 = 240
const canvasHeight = ROWS * BLOCK_SIZE // 20 * 24 = 480

const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = computed(() => canvas.value?.getContext("2d"))

const holdCanvas = ref<HTMLCanvasElement | null>(null)
const holdCtx = computed(() => holdCanvas.value?.getContext("2d"))

const nextPiecesCanvas = ref<HTMLCanvasElement | null>(null)
const nextPiecesCtx = computed(() => nextPiecesCanvas.value?.getContext("2d"))

const score = ref(0)
const bestScore = ref(0)
const level = ref(1)
const linesCleared = ref(0)
const currentCombo = ref(0)
const timePlayed = ref(0) // in seconds
const gameOver = ref(false)
const heldPiece = ref<PieceState | null>(null)
const canHold = ref(true)
const numNextPieces = 3 // How many next pieces to show

const board = ref<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)))
const shapes: number[][][] = [
	[[1, 1, 1, 1]], // I (pieceId: 0)
	[[1, 1], [1, 1]], // O (pieceId: 1)
	[[0, 1, 0], [1, 1, 1]], // T (pieceId: 2)
	[[1, 1, 0], [0, 1, 1]], // S (pieceId: 3)
	[[0, 1, 1], [1, 1, 0]], // Z (pieceId: 4)
	[[1, 0, 0], [1, 1, 1]], // L (pieceId: 5)
	[[0, 0, 1], [1, 1, 1]], // J (pieceId: 6)
]

// Calculate size for the canvas showing the next 3 pieces
const nextPiecesCanvasWidth = 4 * HUD_BLOCK_SIZE // Use HUD_BLOCK_SIZE
const nextPiecesCanvasHeight = numNextPieces * 4 * HUD_BLOCK_SIZE // Use HUD_BLOCK_SIZE

let currentPiece: PieceState
let nextPieces: PieceState[] = [] // Array to hold the next pieces
let gameLoopIntervalId: number | undefined = undefined
let timeUpdaterIntervalId: number | undefined = undefined

const formattedTime = computed(() => {
	const minutes = Math.floor(timePlayed.value / 60)
	const seconds = timePlayed.value % 60
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
})

function getRandomPiece(): PieceState {
	const shapeIndex = Math.floor(Math.random() * shapes.length)
	const shape = shapes[shapeIndex]
	const pieceId = shapeIndex // 0-6
	return {
		shape,
		x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
		y: 0,
		pieceId,
	}
}

function generateNextPieces() {
	nextPieces = []
	for (let i = 0; i < numNextPieces; i++) {
		nextPieces.push(getRandomPiece())
	}
}

function drawBlock(context: CanvasRenderingContext2D, xGrid: number, yGrid: number, pieceIdStored: number, blockSizeToUse: number) {
	if (!context || pieceIdStored === 0) return // 0 means empty

	const x = xGrid * blockSizeToUse
	const y = yGrid * blockSizeToUse
	const pieceType = pieceIdStored - 1 // Convert stored value (1-7) to pieceId (0-6)

	// Fill the block's background (matching game/HUD background)
	context.fillStyle = "#C4CFA1"
	context.fillRect(x, y, blockSizeToUse, blockSizeToUse)

	// Draw thick outer border
	const borderWidth = blockSizeToUse / 8 // Adjust for desired thickness (e.g., 3px for BLOCK_SIZE 24)
	context.strokeStyle = "#3B3B3B"
	context.lineWidth = borderWidth
	context.strokeRect(
		x + borderWidth / 2,
		y + borderWidth / 2,
		blockSizeToUse - borderWidth,
		blockSizeToUse - borderWidth,
	)

	// Draw inner black square
	const innerSquareRatio = 0.4 // Proportion of the block size for the inner square
	const innerSquareSize = blockSizeToUse * innerSquareRatio
	const innerSquarePadding = (blockSizeToUse - innerSquareSize) / 2
	context.fillStyle = "#3B3B3B"
	context.fillRect(
		x + innerSquarePadding,
		y + innerSquarePadding,
		innerSquareSize,
		innerSquareSize,
	)
}

function drawPiece(piece: PieceState, context: CanvasRenderingContext2D | null | undefined) {
	if (!context || !piece) return
	piece.shape.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value) {
				drawBlock(context, piece.x + x, piece.y + y, piece.pieceId + 1, BLOCK_SIZE)
			}
		})
	})
}

function drawHudPiece(piece: PieceState, context: CanvasRenderingContext2D | null | undefined) {
	if (!context || !piece) return
	piece.shape.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value) {
				drawBlock(context, piece.x + x, piece.y + y, piece.pieceId + 1, HUD_BLOCK_SIZE)
			}
		})
	})
}

function drawBoard() {
	if (!ctx.value) return
	ctx.value.clearRect(0, 0, canvasWidth, canvasHeight)
	ctx.value.fillStyle = "#C4CFA1"
	ctx.value.fillRect(0, 0, canvasWidth, canvasHeight)

	// Draw border for the main game board in JavaScript
	const mainBorderWidth = 4
	ctx.value.strokeStyle = "#3B3B3B"
	ctx.value.lineWidth = mainBorderWidth
	ctx.value.strokeRect(
		mainBorderWidth / 2,
		mainBorderWidth / 2,
		canvasWidth - mainBorderWidth,
		canvasHeight - mainBorderWidth)

	for (let y = 0; y < ROWS; y++) {
		for (let x = 0; x < COLS; x++) {
			if (board.value[y][x]) {
				drawBlock(ctx.value, x, y, board.value[y][x], BLOCK_SIZE)
			}
		}
	}
	if (currentPiece) {
		drawPiece(currentPiece, ctx.value)
	}
}

function drawNextPieces() {
	if (!nextPiecesCanvas.value || !nextPiecesCtx.value) return
	const context = nextPiecesCtx.value

	context.clearRect(0, 0, nextPiecesCanvasWidth, nextPiecesCanvasHeight)
	context.fillStyle = "#C4CFA1"
	context.fillRect(0, 0, nextPiecesCanvasWidth, nextPiecesCanvasHeight)

	nextPieces.forEach((piece, index) => {
		const shape = piece.shape
		const pieceX = Math.floor((nextPiecesCanvasWidth / HUD_BLOCK_SIZE - shape[0].length) / 2)
		const pieceY = index * 4 + Math.floor((4 - shape.length) / 2)
		drawHudPiece({ ...piece, x: pieceX, y: pieceY }, context)
	})
}

function drawHoldPiece() {
	if (!holdCtx.value) return
	holdCtx.value.clearRect(0, 0, holdCanvasSize, holdCanvasSize)
	holdCtx.value.fillStyle = "#C4CFA1"
	holdCtx.value.fillRect(0, 0, holdCanvasSize, holdCanvasSize)

	if (heldPiece.value) {
		const shape = heldPiece.value.shape
		const pieceX = Math.floor((holdCanvasSize / HUD_BLOCK_SIZE - shape[0].length) / 2)
		const pieceY = Math.floor((holdCanvasSize / HUD_BLOCK_SIZE - shape.length) / 2)
		drawHudPiece({ ...heldPiece.value, x: pieceX, y: pieceY }, holdCtx.value)
	}
}

function isValidMove(shape: number[][], offsetX: number, offsetY: number): boolean {
	if (!currentPiece) return false
	for (let y = 0; y < shape.length; y++) {
		for (let x = 0; x < shape[y].length; x++) {
			if (shape[y][x]) {
				const newX = currentPiece.x + offsetX + x
				const newY = currentPiece.y + offsetY + y
				if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board.value[newY] && board.value[newY][newX])) {
					return false
				}
			}
		}
	}
	return true
}

function rotatePiece() {
	if (!currentPiece) return
	const shape = currentPiece.shape
	const newShape: number[][] = shape[0].map((_, i) => shape.map(row => row[i]).reverse())
	if (isValidMove(newShape, 0, 0)) {
		currentPiece.shape = newShape
	}
}

function mergePiece() {
	if (!currentPiece) return
	currentPiece.shape.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value) {
				board.value[currentPiece.y + y][currentPiece.x + x] = currentPiece.pieceId + 1
			}
		})
	})
}

function calculateScore(clearedLinesCount: number): number {
	if (clearedLinesCount === 0) return 0
	let baseScore = 0
	switch (clearedLinesCount) {
		case 1: baseScore = 40
			break
		case 2: baseScore = 100
			break
		case 3: baseScore = 300
			break
		case 4: baseScore = 1200
			break // Tetris
		default: baseScore = 1200
	}
	return baseScore * level.value
}

function clearLines(): number {
	let linesClearedCount = 0
	for (let y = ROWS - 1; y >= 0; y--) {
		if (board.value[y].every(cell => cell !== 0)) {
			board.value.splice(y, 1)
			board.value.unshift(Array(COLS).fill(0))
			linesClearedCount++
			y++
		}
	}
	if (linesClearedCount > 0) {
		score.value += calculateScore(linesClearedCount)
		linesCleared.value += linesClearedCount
		level.value = Math.floor(linesCleared.value / 10) + 1
		currentCombo.value++
	}
	return linesClearedCount
}

function spawnNewPiece(): PieceState {
	const newPiece = nextPieces.shift()!
	nextPieces.push(getRandomPiece())

	// Temporarily set currentPiece to newPiece for isValidMove check from its perspective
	const tempCurrent = currentPiece
	currentPiece = newPiece
	if (!isValidMove(newPiece.shape, 0, 0)) { // Check validity for the new piece at its spawn point (0,0 relative to itself)
		gameOver.value = true
		if (gameLoopIntervalId) clearInterval(gameLoopIntervalId)
		if (timeUpdaterIntervalId) clearInterval(timeUpdaterIntervalId)
		if (score.value > bestScore.value) {
			bestScore.value = score.value
			localStorage.setItem("tetrisBestScore", bestScore.value.toString())
		}
	}
	currentPiece = tempCurrent // Restore currentPiece

	drawNextPieces()
	return newPiece // Return the piece that will become the new currentPiece
}

function dropPiece() {
	if (!currentPiece || gameOver.value) return
	if (isValidMove(currentPiece.shape, 0, 1)) {
		currentPiece.y++
	}
	else {
		mergePiece()
		const numCleared = clearLines()
		if (numCleared === 0 && !gameOver.value) {
			currentCombo.value = 0
		}
		if (!gameOver.value) {
			currentPiece = spawnNewPiece() // spawnNewPiece now returns the new piece
			canHold.value = true
		}
	}
	drawBoard()
}

function holdPieceAction() {
	if (!canHold.value || gameOver.value || !currentPiece) return

	if (heldPiece.value === null) {
		heldPiece.value = { ...currentPiece, x: 0, y: 0, pieceId: currentPiece.pieceId }
		currentPiece = spawnNewPiece()
	}
	else {
		const tempHold = { ...heldPiece.value }
		heldPiece.value = { ...currentPiece, x: 0, y: 0, pieceId: currentPiece.pieceId }
		currentPiece = {
			...tempHold,
			x: Math.floor(COLS / 2) - Math.floor(tempHold.shape[0].length / 2),
			y: 0,
			pieceId: tempHold.pieceId,
		}
		if (!isValidMove(currentPiece.shape, 0, 0)) {
			gameOver.value = true
		}
	}
	canHold.value = false
	drawHoldPiece()
	drawBoard()
}

const getGameSpeed = () => Math.max(150, 700 - (level.value - 1) * 50)

function gameLoop() {
	if (!gameOver.value) {
		dropPiece()
	}
}

function handleKeydown(e: KeyboardEvent) {
	if (gameOver.value || !currentPiece) return
	switch (e.key) {
		case "ArrowLeft":
			if (isValidMove(currentPiece.shape, -1, 0)) currentPiece.x--
			break
		case "ArrowRight":
			if (isValidMove(currentPiece.shape, 1, 0)) currentPiece.x++
			break
		case "ArrowDown":
			dropPiece()
			break
		case "ArrowUp":
			rotatePiece()
			break
		case " ": // Space for hard drop
			while (isValidMove(currentPiece.shape, 0, 1)) {
				currentPiece.y++
			}
			dropPiece()
			break
		case "c":
			holdPieceAction()
			break
	}
	if (!gameOver.value) drawBoard()
}

function startGame() {
	board.value = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
	score.value = 0
	level.value = 1
	linesCleared.value = 0
	currentCombo.value = 0
	timePlayed.value = 0
	gameOver.value = false
	heldPiece.value = null
	canHold.value = true

	generateNextPieces()
	currentPiece = nextPieces.shift()!
	nextPieces.push(getRandomPiece())

	if (gameLoopIntervalId) clearInterval(gameLoopIntervalId)
	gameLoopIntervalId = window.setInterval(gameLoop, getGameSpeed())

	if (timeUpdaterIntervalId) clearInterval(timeUpdaterIntervalId)
	timeUpdaterIntervalId = window.setInterval(() => {
		if (!gameOver.value) timePlayed.value++
	}, 1000)

	drawBoard()
	drawNextPieces()
	drawHoldPiece()
}

function restartGame() {
	startGame()
}

watch(level, () => {
	if (gameLoopIntervalId && !gameOver.value) {
		clearInterval(gameLoopIntervalId)
		gameLoopIntervalId = window.setInterval(gameLoop, getGameSpeed())
	}
})

watch(score, (newScore) => {
	if (newScore > bestScore.value) {
		bestScore.value = newScore
		localStorage.setItem("tetrisBestScore", newScore.toString())
	}
})

onMounted(() => {
	const savedBestScore = localStorage.getItem("tetrisBestScore")
	if (savedBestScore) {
		bestScore.value = parseInt(savedBestScore, 10)
	}
	currentPiece = getRandomPiece()
	startGame()
	window.addEventListener("keydown", handleKeydown)
	if (canvas.value) canvas.value.focus()
})

onUnmounted(() => {
	if (gameLoopIntervalId) clearInterval(gameLoopIntervalId)
	if (timeUpdaterIntervalId) clearInterval(timeUpdaterIntervalId)
	window.removeEventListener("keydown", handleKeydown)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

#tetris-game {
  font-family: 'Press Start 2P', monospace;
}
</style>
