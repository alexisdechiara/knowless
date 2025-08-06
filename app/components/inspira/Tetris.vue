<template>
	<Transition
		appear
		name="fade"
	>
		<div
			:style="{
				'--cell': `${width / cols}px`,
				'--rows': rows - 1,
			}"
			:class="cn('relative w-full ', props.class)"
		>
			<div
				ref="el"
				class="absolute inset-0 grid auto-rows-(--cell) justify-center -space-y-px"
			>
				<div
					v-for="(row, rowIndex) in grid"
					:key="rowIndex"
					class="grid flex-1 auto-cols-(--cell) grid-flow-col -space-x-px"
				>
					<div
						v-for="(cell, cellIndex) in row"
						:key="cellIndex"
						class="relative border border-secondary"
					>
						<div
							class="absolute inset-0 bg-primary opacity-0 transition-opacity duration-1000 will-change-[opacity] hover:bg-primary/50"
							:class="[cell && 'cursor-pointer opacity-60']"
							@click="cell && removeCell(rowIndex, cellIndex)"
						/>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { useElementSize } from "@vueuse/core"
import { getColors } from "theme-colors"
import { ref, onMounted, onUnmounted, watch } from "vue"
import { cn } from "@/lib/utils"

interface Props {
	class?: string
	squareColor?: string
	base?: number
}

const props = withDefaults(defineProps<Props>(), {
	base: 10,
})

const theme = getColors(props.squareColor || "#020817")

const el = ref(null)
const grid = ref<(boolean | null)[][]>([])
const rows = ref(0)
const cols = ref(0)

const { width, height } = useElementSize(el)

function createGrid() {
	grid.value = []

	for (let i = 0; i < rows.value; i++) {
		grid.value.push(new Array(cols.value).fill(null))
	}
}

function createNewCell() {
  if (!grid.value?.[0] || cols.value === undefined) return
  
  const x = Math.floor(Math.random() * cols.value)
  grid.value[0][x] = true
}

function moveCellsDown() {
  if (!grid.value || rows.value === undefined || cols.value === undefined) return
  
  for (let row = rows.value - 1; row >= 0; row--) {
    for (let col = 0; col < cols.value; col++) {
      const currentRow = grid.value[row]
      const nextRow = grid.value[row + 1]
      
      if (!currentRow || !nextRow) continue
      
      const cell = currentRow[col]
      const nextCell = nextRow[col]
      
      if (cell !== null && cell !== undefined && nextCell === null) {
        nextRow[col] = cell
        currentRow[col] = null
      }
    }
  }
  
  setTimeout(() => {
    if (!grid.value || rows.value === undefined || cols.value === undefined) return
    
    const bottomRow = grid.value[rows.value - 1]
    if (!bottomRow) return
    
    const isFilled = bottomRow.every(cell => cell !== null)
    const lastRow = grid.value[rows.value]
    
    if (Array.isArray(lastRow) && isFilled) {
      for (let col = 0; col < cols.value; col++) {
        lastRow[col] = null
      }
    }
  }, 500)
}

function clearColumn() {
  if (!grid.value || rows.value === undefined || cols.value === undefined) return
  
  const bottomRow = grid.value[rows.value - 1]
  if (!bottomRow) return
  
  const isFilled = bottomRow.every(cell => cell === true)
  if (!isFilled) return
  
  for (let col = 0; col < cols.value; col++) {
    if (bottomRow[col] !== undefined) {
      (bottomRow as (boolean | null)[])[col] = null
    }
  }
}

function removeCell(row: number, col: number) {
  if (!grid.value?.[row]) return
  
  grid.value[row][col] = null
}

function calcGrid() {
	const cell = width.value / props.base

	rows.value = Math.floor(height.value / cell)
	cols.value = Math.floor(width.value / cell)

	createGrid()
}

watch(width, calcGrid)

let intervalId: NodeJS.Timeout | undefined

let timeoutId: NodeJS.Timeout | undefined

onMounted(() => {
	timeoutId = setTimeout(calcGrid, 50)

	intervalId = setInterval(() => {
		clearColumn()
		moveCellsDown()
		createNewCell()
	}, 800)
})

onUnmounted(() => {
	clearInterval(intervalId)
	clearTimeout(timeoutId)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
