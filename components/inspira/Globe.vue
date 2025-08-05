<template>
	<div
		:class="cn(
			'fixed inset-0 flex items-center justify-center z-0 overflow-hidden',
			$props.class,
		)"
	>
		<canvas
			ref="globeCanvasRef"
			class="aspect-square w-full max-w-[min(100vw,100vh)] opacity-0 transition-opacity duration-1000 ease-in-out contain-[layout_paint_size]"
			:height="height"
			:width="height"
			@pointerdown="(e) => updatePointerInteraction(e.clientX)"
			@pointerup="updatePointerInteraction(null)"
			@pointerout="updatePointerInteraction(null)"
			@mousemove="(e) => updateMovement(e.clientX)"
			@touchmove="(e) => e.touches[0] && updateMovement(e.touches[0].clientX)"
		/>
	</div>
</template>

<script lang="ts" setup>
import createGlobe, { type COBEOptions } from "cobe"
import { useSpring } from "vue-use-spring"
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { cn } from "@/lib/utils"

type GlobeProps = {
	class?: string
	config?: Partial<COBEOptions>
	mass?: number
	tension?: number
	friction?: number
	precision?: number
}

const props = withDefaults(defineProps<GlobeProps>(), {
	mass: 1,
	tension: 280,
	friction: 100,
	precision: 0.001,
})

const globeCanvasRef = ref<HTMLCanvasElement>()
const phi = ref(0)
const pointerInteracting = ref<number | null>(null)
const pointerInteractionMovement = ref<number | null>(null)
const markers = ref<COBEOptions["markers"]>([])
const { height } = useWindowSize()
const width = computed(() => height.value)

let globe: ReturnType<typeof createGlobe> | null = null

const spring = useSpring(
	{ r: 0 },
	{
		mass: props.mass,
		tension: props.tension,
		friction: props.friction,
		precision: props.precision,
	},
)

function updatePointerInteraction(clientX: number | null) {
	if (clientX !== null) {
		pointerInteracting.value = clientX - (pointerInteractionMovement.value ?? clientX)
	}
	else {
		pointerInteracting.value = null
	}

	if (globeCanvasRef.value) {
		globeCanvasRef.value.style.cursor = clientX ? "grabbing" : "grab"
	}
}

function updateMovement(clientX: number) {
	if (pointerInteracting.value !== null) {
		const delta = clientX - (pointerInteracting.value ?? clientX)
		pointerInteractionMovement.value = delta
		spring.r = delta / 200
	}
}

function onRender(state: Record<string, unknown>) {
	if (!pointerInteracting.value) {
		phi.value += 0.0025
	}

	state.phi = phi.value + spring.r
	state.width = width.value * 2
	state.height = height.value * 2
	state.markers = markers.value
}

function createGlobeOnMounted(config: Partial<COBEOptions>) {
	globe = createGlobe(globeCanvasRef.value!, {
		devicePixelRatio: 2,
		width: width.value * 2,
		height: height.value * 2,
		phi: 0,
		theta: 0.33,
		dark: 0,
		diffuse: 2,
		mapSamples: 16000,
		mapBrightness: 6,
		baseColor: [1, 1, 1],
		markerColor: [0, 0, 0],
		glowColor: [1.2, 1.2, 1.2],
		markers: [],
		...config,
		onRender,
	})
}

const { latitude, longitude } = useGeolocation()

watch([latitude, longitude], ([lat, lon]) => {
	if (lat !== null && lon !== null) {
		markers.value = [{ location: [lat, lon], size: 0.1 }]
	}
})

onMounted(() => {
	createGlobeOnMounted({ ...props.config })

	setTimeout(() => {
		if (globeCanvasRef.value) globeCanvasRef.value.style.opacity = "1"
	})
})

onBeforeUnmount(() => {
	globe?.destroy()
})
</script>
