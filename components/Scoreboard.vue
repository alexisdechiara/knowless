<template>
	<div v-if="currentIndex > 0" class="fixed left-1/2 top-1/2 flex max-h-[75vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-6">
		<AnimatePresence multiple as="div" class="grid grow grid-cols-3 gap-x-4">
			<Podium v-if="sortedPlayersByScore.length >= 2" v-show="1 >= sortedPlayersByScore.length - currentIndex" class="col-span-1 col-start-1" :player="sortedPlayersByScore[1]" :score="sortedPlayersByScore[1]?.score || 0" medal="silver" />
			<Podium v-if="sortedPlayersByScore.length >= 1" v-show="0 >= sortedPlayersByScore.length - currentIndex" class="col-span-1 col-start-2" :player="sortedPlayersByScore[0]" :score="sortedPlayersByScore[0]?.score || 0" medal="gold" />
			<Podium v-if="sortedPlayersByScore.length >= 3" v-show="2 >= sortedPlayersByScore.length - currentIndex" class="col-span-1 col-start-3" :player="sortedPlayersByScore[2]" :score="sortedPlayersByScore[2]?.score || 0" medal="bronze" />
		</AnimatePresence>
		<AnimatePresence v-if="sortedPlayersByScore.length >= 4" multiple as="div" class="flex flex-col gap-y-4 overflow-auto">
			<template v-for="(player, index) in sortedPlayersByScore" :key="player.id">
				<Motion
					v-if="index >= 3"
					v-show="index >= sortedPlayersByScore.length - currentIndex"
					as="div"
					class="flex items-center gap-2 rounded-lg border border-muted px-4 py-2"
					reduce-motion="user"
					:initial="{ opacity: 0, y: 10 }"
					:animate="{ opacity: 1, y: 0 }"
					:exit="{ opacity: 0, y: 10 }"
					:transition="{ duration: 0.4, ease: 'easeIn' }"
				>
					<Avatar size="sm">
						<AvatarImage :src=" player.avatar ? player.avatar : ''" alt="avatar" />
						<AvatarFallback class="text-xl">{{ player.username }}</AvatarFallback>
					</Avatar>
					<div class="flex flex-col">
						<span class="font-medium">{{ player.username }}</span>
						<span class="text-sm text-muted-foreground">{{ index + 1 }}ᵉ</span>
					</div>
					<span class="ms-auto">{{ player?.score }} {{ player?.score != null && player?.score > 1 ? "pts" : "pt" }}</span>
				</Motion>
			</template>
		</AnimatePresence>
	</div>
	<h1 v-else class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-16 text-xl font-semibold sm:text-3xl md:text-5xl">Voici les résutats ...</h1>
	<NextButton class="bottom-4 right-4" :variant="sortedPlayersByScore.length - currentIndex > 0 ? 'outline' : 'default'" :title="sortedPlayersByScore.length - currentIndex > 0 ? 'Prochain joueur' : 'Retour au salon'" :description="`Voir la ${sortedPlayersByScore.length - currentIndex}ᵉ place`" @click="sortedPlayersByScore.length - currentIndex > 0 ? $emit('next-player') : $emit('end')" />
</template>

<script lang="ts" setup>
import type { Game } from "~/models/game"
import type { User } from "~/models/user"

definePageMeta({
	layout: "default",
})

defineEmits(["next-player", "end"])

const props = defineProps<{
	game: Game
	players: Array<User>
	currentIndex: number
}>()

const sortedPlayersByScore = ref<Array<User>>([])

props.game.playersData.forEach((playerData) => {
	if (props.players.find(player => player.id === playerData.id)) {
		const newPlayer: User = props.players.find(player => player.id === playerData.id) as User
		newPlayer.score = playerData.score.default + playerData.score.adjustment
		sortedPlayersByScore.value.push(newPlayer)
	}
})

sortedPlayersByScore.value.sort((a, b) => (b?.score || 0) - (a?.score || 0))

// const sortedPlayersByScore = props.game.playersData
// 	.map(player => ({
// 		...player,
// 		score: {
// 			...player.score,
// 			total: player.score.default + player.score.adjustment,
// 		},
// 	}))
// 	.sort((a, b) => b.score.total - a.score.total)
</script>
