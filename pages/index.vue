<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="relative flex h-dvh w-screen items-center justify-start text-clip ps-4 sm:ps-8 md:ps-16">
		<ClientOnly v-if="isMotionable">
			<Tetris
				class="fixed right-0 top-1/3 z-0 size-full -translate-y-1/4 translate-x-1/4 scale-125 [mask-image:radial-gradient(450px_circle_at_center,#00C16A,transparent)]"
				:base="25"
			/>
		</ClientOnly>
		<ul class="z-50 flex w-fit flex-col gap-y-2 font-semibold italic text-foreground">
			<li>
				<h1 class="pointer-events-none mb-8 inline-flex w-fit items-center gap-x-2 text-6xl font-bold not-italic leading-none tracking-wide md:mb-16 md:text-8xl">
					Knowless
					<span class="mt-1 rounded-xl bg-foreground px-3 py-1.5 text-sm leading-none tracking-normal text-background sm:text-lg md:mt-6 md:px-4 md:py-2 md:text-2xl">Beta</span>
				</h1>
			</li>
			<NavLink label="Solo" :link="{ to: '/solo' }" size="lg" />
			<NavLink label="Multijoueurs" :link="{ to: '/multi' }" size="lg" class="md:mb-2" />
			<NavLink label="Communauté" size="sm" :link="{ to: 'https://github.com/alexisdechiara/knowless/discussions', target: '_blank' }">
				<template #trailing>
					<Icon name="lucide:external-link" class="text-base" />
				</template>
			</NavLink>
			<DialogSettings>
				<NavLink label="Options" size="sm" />
			</DialogSettings>
			<NavLink class="italic" size="sm">
				<FriendListPopover>
					<span class="italic">Social</span>
				</FriendListPopover>
			</NavLink>
			<NavLink size="sm">
				<Dialog>
					<DialogTrigger>
						<span class="italic">Légal</span>
					</DialogTrigger>
					<DialogContent class="h-3/4 max-w-4xl">
						<LegalDialog class="overflow-y-auto" />
					</DialogContent>
				</Dialog>
			</NavLink>
			<NavLink label="Déconnexion" class="text-destructive" size="sm" :link="{ to: '/register' }" @click="supabase.auth.signOut()" />
		</ul>
		<div v-if="isMotionable" class="absolute bottom-8 right-8 hidden gap-x-2 rounded-full bg-foreground p-2 shadow-md transition-all md:flex">
			<TabsRoot v-if="selectedGame != null && selectedGame !== ''" v-model="selectedGame" default-value="snake">
				<TabsList class="relative flex flex-wrap text-background ">
					<TabsIndicator :class="selectedGame === 'flappyBird' ? 'w-20 h-12' : 'size-12'" class="absolute translate-x-[--radix-tabs-indicator-position] rounded-full bg-background p-2 transition-[width,transform] duration-300" />
					<TabsTrigger value="snake" class="size-12 rounded-full">
						<Icon name="mdi:snake" class="text-white mix-blend-difference" />
					</TabsTrigger>
					<TabsTrigger value="tetris" class="size-12 rounded-full">
						<Icon name="fluent:tetris-app-16-filled" class="text-white mix-blend-difference" />
					</TabsTrigger>
					<TabsTrigger value="ticTacToe" class="size-12 rounded-full">
						<Icon name="hugeicons:tic-tac-toe" class="text-white mix-blend-difference" />
					</TabsTrigger>
					<TabsTrigger value="flappyBird" class="size-12 rounded-full transition-[margin]" :class="selectedGame === 'flappyBird' ? '-me-4' : 'me-0'">
						<Icon name="icon-park-solid:bird" class="text-white mix-blend-difference" />
					</TabsTrigger>
				</TabsList>
			</TabsRoot>
			<Button size="icon" :variant="selectedGame ? 'destructive' : 'default'" class="z-50 size-12 rounded-full p-3" @click="selectedGame !== null && selectedGame !== '' ? turnOffGame() : selectedGame = 'snake'">
				<Icon name="bx:bxs-joystick-button" class="size-full transition-transform" :class="selectedGame !== null && selectedGame !== '' ? 'rotate-45' : ''" />
			</Button>
		</div>
		<div v-if="selectedGame != null && selectedGame !== ''" class="crt absolute bottom-32 right-32 z-50 h-[480px] w-[720px] overflow-hidden rounded-[8%]" :class="{ 'animate-crt-power-on': selectedGame && !isPoweringOff, 'animate-crt-power-off': isPoweringOff }">
			<SnakeGame v-if="selectedGame === 'snake'" />
			<TicTacToeGame v-else-if="selectedGame === 'ticTacToe'" />
			<TetrisGame v-else-if="selectedGame === 'tetris'" />
			<FlappyBirdGame v-else-if="selectedGame === 'flappyBird'" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { TabsIndicator, TabsList, TabsRoot, TabsTrigger } from "radix-vue"
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core"

const supabase = useSupabaseClient()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isMotionable = computed(() => breakpoints.greaterOrEqual("md") && useDevice().isDesktop && usePreferredReducedMotion().value == "no-preference")

const selectedGame = ref<string | null>("")
const isPoweringOff = ref(false)

function turnOffGame() {
	isPoweringOff.value = true
	setTimeout(() => {
		selectedGame.value = null
		isPoweringOff.value = false
	}, 450)
}
</script>

<style scoped>
@keyframes flicker {
  0% {
    opacity: 0.27861;
  }
  5% {
    opacity: 0.34769;
  }
  10% {
    opacity: 0.23604;
  }
  15% {
    opacity: 0.90626;
  }
  20% {
    opacity: 0.18128;
  }
  25% {
    opacity: 0.83891;
  }
  30% {
    opacity: 0.65583;
  }
  35% {
    opacity: 0.67807;
  }
  40% {
    opacity: 0.26559;
  }
  45% {
    opacity: 0.84693;
  }
  50% {
    opacity: 0.96019;
  }
  55% {
    opacity: 0.08594;
  }
  60% {
    opacity: 0.20313;
  }
  65% {
    opacity: 0.71988;
  }
  70% {
    opacity: 0.53455;
  }
  75% {
    opacity: 0.37288;
  }
  80% {
    opacity: 0.71428;
  }
  85% {
    opacity: 0.70419;
  }
  90% {
    opacity: 0.7003;
  }
  95% {
    opacity: 0.36108;
  }
  100% {
    opacity: 0.24387;
  }
}

@keyframes textShadow {
  0% {
    text-shadow: 0.4389924193300864px 0 1px rgba(0,30,255,0.5), -0.4389924193300864px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  5% {
    text-shadow: 2.7928974010788217px 0 1px rgba(0,30,255,0.5), -2.7928974010788217px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  10% {
    text-shadow: 0.02956275843481219px 0 1px rgba(0,30,255,0.5), -0.02956275843481219px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  15% {
    text-shadow: 0.40218538552878136px 0 1px rgba(0,30,255,0.5), -0.40218538552878136px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  20% {
    text-shadow: 3.4794037899852017px 0 1px rgba(0,30,255,0.5), -3.4794037899852017px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  25% {
    text-shadow: 1.6125630401149584px 0 1px rgba(0,30,255,0.5), -1.6125630401149584px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  30% {
    text-shadow: 0.7015590085143956px 0 1px rgba(0,30,255,0.5), -0.7015590085143956px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  35% {
    text-shadow: 3.896914047650351px 0 1px rgba(0,30,255,0.5), -3.896914047650351px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  40% {
    text-shadow: 3.870905614848819px 0 1px rgba(0,30,255,0.5), -3.870905614848819px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  45% {
    text-shadow: 2.231056963361899px 0 1px rgba(0,30,255,0.5), -2.231056963361899px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  50% {
    text-shadow: 0.08084290417898504px 0 1px rgba(0,30,255,0.5), -0.08084290417898504px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  55% {
    text-shadow: 2.3758461067427543px 0 1px rgba(0,30,255,0.5), -2.3758461067427543px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  60% {
    text-shadow: 2.202193051050636px 0 1px rgba(0,30,255,0.5), -2.202193051050636px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  65% {
    text-shadow: 2.8638780614874975px 0 1px rgba(0,30,255,0.5), -2.8638780614874975px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  70% {
    text-shadow: 0.48874025155497314px 0 1px rgba(0,30,255,0.5), -0.48874025155497314px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  75% {
    text-shadow: 1.8948491305757957px 0 1px rgba(0,30,255,0.5), -1.8948491305757957px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  80% {
    text-shadow: 0.0833037308038857px 0 1px rgba(0,30,255,0.5), -0.0833037308038857px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  85% {
    text-shadow: 0.09769827255241735px 0 1px rgba(0,30,255,0.5), -0.09769827255241735px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  90% {
    text-shadow: 3.443339761481782px 0 1px rgba(0,30,255,0.5), -3.443339761481782px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  95% {
    text-shadow: 2.1841838852799786px 0 1px rgba(0,30,255,0.5), -2.1841838852799786px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
  100% {
    text-shadow: 2.6208764473832513px 0 1px rgba(0,30,255,0.5), -2.6208764473832513px 0 1px rgba(255,0,80,0.3), 0 0 3px;
  }
}
@keyframes crtPowerOn {
  0% {
    transform: scaleY(0.05) scaleX(0);
    opacity: 0;
  }
  30% {
    transform: scaleY(0.05) scaleX(1);
    opacity: 1;
  }
  60% {
    transform: scaleY(1) scaleX(1);
  }
  100% {
    opacity: 1;
    transform: scaleY(1) scaleX(1);
  }
}
@keyframes crtPowerOff {
  0% {
    transform: scaleX(1) scaleY(1);
    opacity: 1;
  }
  30% {
    transform: scaleX(1) scaleY(0.025);
    opacity: 1;
  }
  70% {
    transform: scaleX(0.01) scaleY(0.025);
    opacity: 0.8
  }
  90% {
    transform: scaleX(0) scaleY(0);
    opacity: 0.1;
  }
  100% {
    transform: scaleX(0) scaleY(0);
    opacity: 0;
  }
}

.crt::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(18, 16, 16, 0.1);
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: flicker 0.15s infinite;
	box-shadow: inset 0 0 250px rgba(0, 0, 0, 0.5);
}
.crt::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  z-index: 2;
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
}
.crt {
  animation: textShadow 1.6s infinite;
}
.animate-crt-power-on {
    animation: crtPowerOn 0.6s ease-out both;
}
.animate-crt-power-off {
  animation: crtPowerOff 0.45s ease-in forwards;
}
</style>
