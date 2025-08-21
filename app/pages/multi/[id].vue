<template>
  <ClientOnly>
    <div class="fixed inset-0 flex flex-col px-8 py-6 sm:px-16 sm:py-12 md:px-32 md:py-24">
      <template v-if="game">
        <Countdown v-if="game.phase === 'start'" @finished="startGame()" />
        <QuestionBoard
          v-else-if="(game.phase === 'question' || game.phase === 'correction') &&game?.questions[game?.currentQuestionIndex]"
          :key="`${game.phase}-${game.currentQuestionIndex}-${game.currentPlayerIndex}`"
          mode="multi"
          :phase="game.phase"
          :content="game.questions[game.currentQuestionIndex]!"
          :question-number="game.currentQuestionIndex"
          :duration="game.phase === 'question' ? 10000 : 0"
          :start-at="syncedStartAt"
          :lobby="lobby"
          :answer="getPlayerAnswerByIndex"
          :show-next="isHost"
          :show-switch="true"
          :switch-enabled="isHost"
          :correction-switch-value="correctionSwitchValue"
          @started="questionIndexAtStart = game?.currentQuestionIndex ?? null"
          @answer="submitAnswer($event)"
          @good-answer="result = true"
          @bad-answer="result = false"
          @corrected="handleHostCorrectionSwitch"
          @ended="game.phase === 'question' && handleQuestionEnded()"
          @next="isHost && nextPlayerCorrection()"
        >
          <template v-if="game.phase === 'correction'" #header>
            <div class="fixed left-1/2 top-4 flex -translate-x-1/2 items-center gap-4">
              <Avatar v-for="player in surroundingPlayers" :key="player.id" :size="game.playersData[game.currentPlayerIndex]!.id === player.id ? 'base' : 'sm'">
                <AvatarImage :src="player.avatar ? player.avatar : ''" alt="avatar" />
                <AvatarFallback class="text-xl">{{ player.username }}</AvatarFallback>
              </Avatar>
            </div>
            <span v-if="isDesktopBreakpoint" class="absolute start-1/2 top-20 -translate-x-1/2 text-4xl font-semibold" >{{ lobby.players.find( (player) => player.id === game?.playersData[game.currentPlayerIndex]?.id )?.username }}</span>
          </template>
          <template #next>
            <NextButton 
            v-if="isHost" 
            :variant="isLastPlayer && game.currentQuestionIndex === game.questions.length - 1 ? 'default' : outlineOrSecondary()" 
            :title="isLastPlayer && game.currentQuestionIndex === game.questions.length - 1 ? 'Ajustements' : isLastPlayer ? 'Question suivante' : 'Joueur suivant'" 
            @click="isHost && nextPlayerCorrection()" 
            />
          </template>
          <template #actions>
            <VoteDropdown v-model="personalVote" :votes="votes" />
          </template>
        </QuestionBoard>
        <div v-else-if="game.phase === 'adjustment'" class="flex justify-center">
          <div class="grid w-fit auto-cols-auto grid-cols-2 gap-12 md:grid-cols-6">
            <PlayerAdjustment
              v-for="playerData in game.playersData"
              :key="playerData.id"
              v-model="playerData.score.adjustment"
              :player="new User(lobby.players.find((player: User) => player.id === playerData.id))"
            />
            <NextButton
              v-if="isHost"
              title="Terminer"
              description="Voir les résultats"
              class="bottom-4 right-4"
              @click="changePhase('scoreboard')"
            />
          </div>
        </div>
        <Scoreboard
          v-else-if="game.phase === 'scoreboard'"
          :game="game"
          :players="lobby.players"
          :current-index="game?.currentPlayerIndex"
          :show-next="isHost"
          @next-player="nextPlayerScoreboard()"
          @end="changePhase('end')"
        />
      </template>
      <template v-else>
        <h1 class="mb-16 text-center text-2xl font-semibold sm:text-3xl md:text-5xl">
          {{ lobby?.title }}
          <TooltipProvider v-if="!lobby.isPublic" :delay-duration="0">
            <Tooltip>
              <TooltipTrigger as-child>
                <Icon
                  class="ms-2 cursor-pointer text-3xl text-muted-foreground"
                  name="lucide:lock"
                />
              </TooltipTrigger>
              <TooltipContent :side-offset="16">
                Le salon est en privé, il ne sera pas visible dans la liste des salons.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h1>
        <div class="flex size-full flex-col gap-y-8 md:grid md:grid-cols-5 md:gap-x-32">
          <div class="flex w-fit flex-col md:col-span-2">
            <div class="flex w-full max-w-lg items-center gap-4 overflow-auto md:mb-auto">
              <Avatar size="lg">
                <AvatarImage
                  :src="getPlayer.avatar ? getPlayer.avatar : ''"
                  alt="avatar"
                />
                <AvatarFallback class="text-xl">{{ getPlayer.username }}</AvatarFallback>
              </Avatar>
              <div class="flex flex-col text-2xl leading-normal">
                <span class="font-semibold text-primary">{{ getPlayer.username }}</span>
                <span class="italic text-muted-foreground">{{
                  lobby?.host === getPlayer.id ? "Hôte du salon" : "Joueur"
                }}</span>
              </div>
            </div>
            <div id="settings" />
          </div>
          <div
            class="flex size-full flex-col gap-4 md:col-span-3 md:justify-between md:gap-8"
          >
            <div class="flex h-full flex-col gap-y-4">
              <template v-for="player in lobby.players.filter((player) => player.id !== getPlayer.id)" :key="player.id">
                <div v-if="player.id !== getPlayer.id" class="flex w-full items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage :src="player.avatar ? player.avatar : ''" alt="avatar" />
                    <AvatarFallback class="text-xl">{{ player.username }}</AvatarFallback>
                  </Avatar>
                  <div class="flex flex-col text-sm leading-tight">
                    <span class="font-semibold text-primary">{{ player.username }}</span>
                    <span class="italic text-muted-foreground">{{
                      lobby?.host === player.id ? "Hôte du salon" : "Joueur"
                    }}</span>
                  </div>
                  <DropdownMenu v-if="isHost">
                    <DropdownMenuTrigger as-child>
                      <Button class="ms-auto" size="icon" variant="link">
                        <Icon name="lucide:ellipsis-vertical" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem v-if="isHost" @click="removePlayer(player, lobby)">
                        <Icon name="lucide:user-round-x" /> Exclure
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="isHost" @click="banPlayer(player, lobby)">
                        <Icon name="lucide:ban" /> Bannir
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="isHost" @click="promotePlayer(player, lobby)">
                        <Icon name="lucide:circle-fading-arrow-up" /> Promouvoir hôte
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </template>
            </div>
            <div id="settings-mobile" />
            <div class="flex w-full justify-end gap-x-8">
              <Button v-if="isHost" size="xxl" class="block w-full" @click="startLobby()">
                Démarrer
              </Button>
              <Button
                size="xxl"
                :variant="outlineOrSecondary()"
                class="block aspect-square w-fit items-center justify-center p-0"
                @click="leaveLobby()"
              >
                <Icon name="lucide:log-out" />
              </Button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <Teleport :to="isDesktopBreakpoint ? '#settings' : '#settings-mobile'">
      <div v-if="isHost" class="mt-auto flex flex-col gap-y-2 pt-4">
        <div class="flex w-full gap-x-2">
          <div class="relative w-full items-center">
            <TooltipProvider :delay-duration="0" trigger="hover" placement="top">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Input
                    :model-value="code"
                    class="me-10 cursor-pointer text-center align-middle text-2xl tracking-[1rem]"
                    :type="showCode ? 'text' : 'password'"
                    readonly
                    @click="isSupported ? copy(code) : (showCode = !showCode)"
                  />
                  <span class="absolute inset-y-0 end-0 flex cursor-pointer items-center justify-center px-4" @click="showCode = !showCode" >
                    <Icon :name="showCode ? 'lucide:eye-off' : 'lucide:eye'" />
                  </span>
                </TooltipTrigger>
                <TooltipContent v-if="isSupported"> Copier le code </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FriendListPopover>
            <Button
              variant="outline"
              size="lg"
              class="flex aspect-square w-fit items-center justify-center p-0"
            >
              <Icon name="lucide:users" class="text-base" />
            </Button>
          </FriendListPopover>
        </div>
        <LobbySettings v-model="lobby">
          <Button variant="outline" size="lg" class="block w-full">Paramètres</Button>
        </LobbySettings>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { Lobby } from "#shared/models/lobby";
import { User } from "#shared/models/user";
import { Game } from "#shared/models/game";

type VoteValue = "correct" | "incorrect" | "neutral";

const { getPlayers, removePlayer, banPlayer, promotePlayer } = useLobby();
const supabase = getSupabaseClient();
const route = useRoute();
const showCode = ref(false);
const code = ref(String(route.params.id));
const { copy, copied, isSupported } = useClipboard({ source: code });
const lobby = ref<Lobby>(new Lobby());
const game = ref<Game | null>(null);
const result = ref<boolean>(false);
const correctionSwitchValue = ref<boolean | undefined>(undefined);
const syncedStartAt = ref<number | undefined>(undefined);
// Capture the question index at the start of a question to tag answer submissions reliably
const questionIndexAtStart = ref<number | null>(null);
const personalVote = ref<VoteValue>("neutral");
const votes = ref<{ playerId: string; value: VoteValue }[]>([]);
const lobbyChannel = ref<null | RealtimeChannel>();
const gameChannel = ref<null | RealtimeChannel>();
const isDesktopBreakpoint = useBreakpoints(breakpointsTailwind).greaterOrEqual("md");
const { outlineOrSecondary } = useDarkMode();
const { getPlayer } = usePlayerStore();
const presence = usePresenceStore();
// Snapshot of players who were disconnected at the moment the correction phase started
const disconnectedAtCorrection = ref<Set<string>>(new Set());

// voteResult/truePercentage moved to VoteDropdown component

// Initialisation du broadcast game
const broadcastGame = useBroadcastGame(String(route.params.id), getPlayer.id, []);

const lobbyTitle = computed(() => {
  return game.value?.phase
    ? `Partie en cours - ${lobby.value?.title}`
    : lobby.value?.title || "Multijoueurs - Salon";
});

useHead({
  title: lobbyTitle,
});

function updatePresenceForLobby() {
  if (!lobby.value || !lobby.value.id) return;
  if (lobby.value.gameId) {
    presence.setPlaying(Number(lobby.value.id));
  } else {
    presence.setInLobby(Number(lobby.value.id));
  }
}

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  window.removeEventListener("unload", handleUnload);
  broadcastGame.disconnect();
  if (lobbyChannel.value) {
    supabase.removeChannel(lobbyChannel.value);
  }
  if (gameChannel.value) {
    supabase.removeChannel(gameChannel.value);
  }
  // Leaving the page -> clear presence back to online
  presence.clear();
});

onMounted(async () => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("unload", handleUnload);

  const { data, error } = await supabase
    .from("lobbies")
    .select()
    .eq("id", Number(route.params.id))
    .single();

  if (error) {
    throw showError({
      statusCode: 404,
      statusMessage: "Le salon n'existe pas",
    });
  } else if (data) {
    const { data: fetchedPlayers } = await supabase
      .from("players")
      .select("*")
      .in("id", data.players || []);

    lobby.value = new Lobby(data, fetchedPlayers);

    if (
      getPlayer.id !== lobby.value?.host &&
      !lobby.value?.playerIds.includes(getPlayer.id)
    ) {
      navigateTo(`/multi/join`);
    } else if (
      lobby.value?.invitedPlayersId &&
      lobby.value?.invitedPlayersId.includes(getPlayer.id) &&
      lobby.value?.maxPlayers > lobby.value?.players.length
    ) {
      navigateTo(`/multi/join`);
    }

    // Connexion du broadcast après avoir chargé le lobby
    broadcastGame.connect(lobby.value?.host === getPlayer.id);
    broadcastGame.updateAllPlayerIds(lobby.value?.playerIds || []);

    // Update presence now that the lobby is confirmed
    updatePresenceForLobby();

    const lobbyCh = supabase.channel(`lobby-${route.params.id}-updates`)
    ;(lobbyCh as any)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobbies",
          filter: `id=eq.${route.params.id}`,
        },
        async (payload: any) => {
          if (payload.new) {
            // Diff before applying new lobby for leave notifications
            const prevIds = Array.isArray(lobby.value?.playerIds)
              ? [...lobby.value.playerIds]
              : [];
            // Snapshot previous players to resolve usernames of those who left
            const prevPlayers = Array.isArray(lobby.value?.players)
              ? [...lobby.value.players]
              : [];
            const newLobby: Lobby = new Lobby(payload.new);
            const nextIds = Array.isArray(newLobby.playerIds)
              ? [...newLobby.playerIds]
              : [];
            const removedIds = prevIds.filter((id) => !nextIds.includes(id));
            // Apply lobby update
            lobby.value = newLobby;
            lobby.value.players = await getPlayers(newLobby.playerIds);

            // Mise à jour du broadcast avec les nouveaux joueurs et le statut d'hôte
            broadcastGame.updateHostFlag(newLobby.host === getPlayer.id);
            broadcastGame.updateAllPlayerIds(newLobby.playerIds);

            // Notify on players removed from lobby (explicit leave)
            for (const id of removedIds) {
              if (id === getPlayer.id) continue;
              // Prefer previous players snapshot to get the correct username
              const username =
                prevPlayers.find((p) => p.id === id)?.username ||
                lobby.value.players.find((p) => p.id === id)?.username ||
                "Un joueur";
              toast.message(`${username} a quitté le salon`);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "update",
          schema: "public",
          table: "players",
          filter: `lobby_id=eq.${route.params.id}`,
        },
        (payload: any) => {
          try {
            const oldStatus = payload.old?.status as string | undefined;
            const newStatus = payload.new?.status as string | undefined;
            const pid = payload.new?.id as string | undefined;
            if (!pid) return;
            // Update local lobby players' status so UI can react immediately
            const target = lobby.value?.players.find((p) => p.id === pid);
            if (target && newStatus) target.status = newStatus as any;
            const username = target?.username || "Un joueur";
            if (oldStatus !== newStatus) {
              // Suppress disconnect toasts to avoid false positives from transient unloads
              if (
                (newStatus === "playing" || newStatus === "in-lobby") &&
                oldStatus === "offline"
              ) {
                if (pid !== getPlayer.id) toast.message(`${username} a rejoint à nouveau`);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      )
      .subscribe();
    lobbyChannel.value = lobbyCh;
  }
});

// Watcher pour les événements de broadcast
watch(
  () => broadcastGame.events.value,
  (events) => {
    const lastEvent = events[events.length - 1];
    if (!lastEvent) return;

    switch (lastEvent.event) {
      case "next_question":
        handleBroadcastNextQuestion(lastEvent.payload);
        break;
      case "change_mode":
        handleBroadcastChangeMode(lastEvent.payload);
        break;
      case "answer_submit":
        handleBroadcastAnswerSubmit(lastEvent.payload);
        break;
      case "vote":
        applyVote(lastEvent.payload);
        break;
      case "correction_switch":
        correctionSwitchValue.value = !!lastEvent.payload?.value;
        break;
    }
  },
  { deep: true }
);

// Handlers pour les événements de broadcast
function handleBroadcastNextQuestion(payload: any) {
  // Les invités se synchronisent sur le startAt défini par l'hôte, corrigé par l'offset d'horloge
  if (!isHost.value && typeof payload?.startAt === "number") {
    const offset = broadcastGame.clockOffsetMs;
    syncedStartAt.value = payload.startAt - (typeof offset === "number" ? offset : 0);
    // Optionnel: préparer l'index de question pour le prochain écran
    if (typeof payload?.toIndex === "number") {
      questionIndexAtStart.value = payload.toIndex;
    }
  }

  // Rafraîchit les playersData 1s après le lancement de la question suivante
  // On applique la mise à jour au tour précédent: fromIndex si fourni, sinon currentQuestionIndex - 1
  if (
    game.value &&
    Array.isArray(game.value.questions) &&
    game.value.questions.length > 0
  ) {
    const len = game.value.questions.length;
    const prevIndex =
      typeof payload?.fromIndex === "number"
        ? payload.fromIndex
        : (game.value.currentQuestionIndex - 1 + len) % len;
    setTimeout(() => {
      refreshPlayersData(prevIndex);
    }, 1000);
  }
}

function handleBroadcastChangeMode(payload: any) {
  if (
    !isHost.value &&
    payload?.mode === "question" &&
    typeof payload?.startAt === "number"
  ) {
    const offset = broadcastGame.clockOffsetMs;
    syncedStartAt.value = payload.startAt - (typeof offset === "number" ? offset : 0);
    if (typeof payload?.questionIndex === "number") {
      questionIndexAtStart.value = payload.questionIndex;
    }
  }
  // Fin de partie: tous les clients retournent à l'accueil
  if (payload?.mode === "end") {
    cleanupAndGoHome();
  }
}

function handleBroadcastAnswerSubmit(payload: any) {
  console.log("Réponse soumise via broadcast:", payload);
  // Logique pour traiter la réponse d'un autre joueur
}

function applyVote(vote: { playerId: string; value: VoteValue }) {
  // Remplace le vote précédent du même joueur, sinon ajoute
  const idx = votes.value.findIndex((v) => v.playerId === vote.playerId);
  if (idx !== -1) {
    votes.value[idx] = vote;
  } else {
    votes.value.push(vote);
  }
}

// Envoie un broadcast lorsqu'un vote personnel change
watch(
  () => personalVote.value,
  (newVal) => {
    if (!newVal) return;
    // Mettre à jour localement également
    applyVote({ playerId: getPlayer.id, value: newVal });
    broadcastGame.sendVote(newVal);
  }
);

async function handleUnload() {
  broadcastGame.disconnect();
  navigator.sendBeacon(
    `/api/lobby/leave`,
    JSON.stringify({
      lobby: {
        id: lobby.value?.id,
        host: lobby.value?.host,
        playerIds: lobby.value?.playerIds.filter((playerId) => playerId !== getPlayer.id),
      },
      userId: getPlayer.id,
    })
  );
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
}

// Nettoyage des canaux et retour à l'accueil
async function cleanupAndGoHome() {
  try {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("unload", handleUnload);
    broadcastGame.disconnect();
    if (lobbyChannel.value) {
      supabase.removeChannel(lobbyChannel.value);
      lobbyChannel.value = null;
    }
    if (gameChannel.value) {
      supabase.removeChannel(gameChannel.value);
      gameChannel.value = null;
    }
  } finally {
    presence.clear();
    await navigateTo("/");
  }
}

watch(copied, (value) => {
  if (value) {
    toast.success("Code copié dans le presse-papier");
  }
});

const isHost = ref<boolean>(false);

watch(
  [lobby, getPlayer],
  () => {
    isHost.value = lobby.value?.host === getPlayer.id;
  },
  { immediate: true }
);

async function leaveLobby() {
  await removePlayer(getPlayer, lobby.value).then(async () => {
    presence.clear();
    await navigateTo("/");
  });
}

async function startLobby() {
  try {
    await $fetch("/api/game/create", {
      method: "POST",
      query: {
        nbQuestions: lobby.value?.nbQuestions || 20,
        lobbyId: route.params.id,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de la création du salon:", error);
    toast.error("Une erreur est survenue lors de la création du salon", {
      description: error.data?.message || error.message || "Erreur inconnue",
    });
  }
}

async function startGame() {
  // Seul l'hôte démarre la partie et synchronise le timer de la première question
  if (!isHost.value || !game.value) return;

  const startAt = Date.now() + 800;
  syncedStartAt.value = startAt;
  // Broadcast du changement de mode avec startAt pour synchroniser tous les clients
  broadcastGame.sendChangeMode("question", startAt, game.value?.currentQuestionIndex);

  const { error } = await supabase
    .from("games")
    .update({
      phase: "question",
    })
    .eq("id", game.value!.id);

  if (error) {
    console.error(error);
    toast.error("Une erreur est survenue lors de la mise a jour", {
      description: error.details,
    });
  }
}

async function nextPlayerScoreboard() {
  if (!game.value) return;
  const { error } = await supabase
    .from("games")
    .update({
      current_player_index: (game.value?.currentPlayerIndex || 0) + 1,
    })
    .eq("id", game.value?.id);

  if (error) {
    console.error(error);
    toast.error("Une erreur est survenue lors de la mise a jour", {
      description: error.details,
    });
  }
}

// Fonction modifiée pour utiliser le broadcast
function handleQuestionEnded() {
  if (isHost.value && game.value) {
    // Calcule un startAt commun légèrement dans le futur pour amortir la latence
    const prevIndex = game.value.currentQuestionIndex; // index de la question qui vient de se terminer
    const startAt = Date.now();
    syncedStartAt.value = startAt;
    // L'hôte envoie l'événement avec le startAt
    broadcastGame.sendNextQuestion(
      String(game.value.currentQuestionIndex + 1),
      startAt,
      game.value.currentQuestionIndex,
      (game.value.currentQuestionIndex + 1) % game.value.questions.length
    );
    // Puis met à jour l'état côté base pour propager l'index de question
    nextQuestion();

    // Et enfin, rafraîchir les playersData 1s après le lancement de la question suivante
    setTimeout(() => {
      refreshPlayersData(prevIndex);
    }, 1000);
  }
}

// Récupère depuis la base la dernière version de players_data
async function refreshPlayersData(prevIndex: number) {
  if (!game.value) return;
  try {
    const { data, error } = await supabase
      .from("games")
      .select("players_data")
      .eq("id", game.value.id)
      .single();

    if (error) {
      console.error("Erreur lors du rafraîchissement des playersData", error);
      return;
    }
    if (data?.players_data && Array.isArray(data.players_data)) {
      // On remplace playersData localement; les réponses pour prevIndex seront ainsi à jour
      game.value.playersData = (data.players_data as unknown) as Game["playersData"];
      console.log(
        `playersData rafraîchi pour la question précédente (index ${prevIndex})`
      );
    }
  } catch (e) {
    console.error(e);
  }
}

async function nextQuestion() {
  if (
    game.value?.currentQuestionIndex != null &&
    game.value?.currentQuestionIndex < game.value?.questions.length - 1
  ) {
    const { error } = await supabase
      .from("games")
      .update({
        current_question_index:
          (game.value?.currentQuestionIndex + 1) % game.value?.questions.length,
      })
      .eq("id", game.value?.id);

    if (error) {
      console.error(error);
      toast.error(`Erreur ${error.code}`, {
        description: error.details,
      });
    }
  } else {
    changePhase("correction");
  }
}

// Fonction modifiée pour utiliser le broadcast
async function submitAnswer(newAnswer: string) {
  if (!game.value) return;

  // Snapshot the intended question index at which this answer belongs
  const indexAtSubmit =
    typeof questionIndexAtStart.value === "number"
      ? questionIndexAtStart.value
      : game.value.currentQuestionIndex;

  // Envoie via broadcast pour synchronisation temps réel
  broadcastGame.sendAnswerSubmit(newAnswer, indexAtSubmit);

  const { error } = await supabase.rpc("update_answer", {
    p_game_id: game.value?.id,
    p_player_id: getPlayer.id,
    p_new_answer: newAnswer,
    p_answer_index: indexAtSubmit,
  });

  if (error) {
    console.error(error);
    toast.error(`Erreur ${error.code}`, {
      description: error.message,
    });
  }
}

const isLastPlayer = computed(() =>
  game.value?.playersData
    ? game.value?.currentPlayerIndex === game.value?.playersData.length - 1
    : false
);

async function nextPlayerCorrection() {
  if (game.value) {
    const currentPlayerIndex = game.value?.currentPlayerIndex ?? 0;
    const currentQuestionIndex = game.value?.currentQuestionIndex ?? 0;

    const baseScore = game.value?.playersData[currentPlayerIndex]?.score?.default ?? 0;
    const questionPoints = game.value?.questions[currentQuestionIndex]?.points ?? 0;

    const newDefaultScore = result.value ? baseScore + questionPoints : baseScore;

    const { data, error } = await supabase.rpc("next_player_correction", {
      p_game_id: game.value.id,
      p_player_id: game.value?.playersData[game.value?.currentPlayerIndex]!.id,
      p_new_default_score: newDefaultScore,
      p_new_player_index: isLastPlayer.value
        ? 0
        : (game.value.currentPlayerIndex ?? 0) + 1,
      p_new_question_index: isLastPlayer.value
        ? (game.value?.currentQuestionIndex + 1) % game.value?.questions.length
        : game.value?.currentQuestionIndex,
    });

    if (error) {
      console.error(error);
      toast.error(`Erreur ${error.code}`, {
        description: error.message,
      });
    } else {
      // Prepare state for the next player's correction round
      result.value = false;
      if (
        isLastPlayer.value &&
        game.value?.currentQuestionIndex == game.value.questions.length - 1
      ) {
        changePhase("adjustment");
      }
    }
  }
}

// Fonction modifiée pour utiliser le broadcast
async function changePhase(
  phase: "start" | "question" | "correction" | "adjustment" | "scoreboard" | "end"
) {
  // L'hôte envoie le changement de mode via broadcast
  if (isHost.value) {
    if (phase === "question") {
      const startAt = Date.now();
      syncedStartAt.value = startAt;
      broadcastGame.sendChangeMode(phase, startAt, game.value?.currentQuestionIndex);
    } else {
      broadcastGame.sendChangeMode(phase);
    }
  }

  if (phase === "scoreboard") {
    const { error } = await supabase
      .from("games")
      .update({
        phase: phase,
        current_player_index: 0,
        current_question_index: 0,
        players_data: game.value?.playersData,
      })
      .eq("id", game.value!.id);

    if (error) {
      console.error(error);
      toast.error(`Erreur ${error.code}`, {
        description: error.details,
      });
    }
  } else {
    const { error } = await supabase
      .from("games")
      .update({
        current_question_index: 0,
        current_player_index: 0,
        phase: phase,
      })
      .eq("id", game.value!.id);

    if (error) {
      console.error(error);
      toast.error(`Erreur ${error.code}`, {
        description: error.details,
      });
    }
  }

  if (phase === "end") {
    const { data, error } = await supabase
      .from("lobbies")
      .update({ game_id: null })
      .eq("id", Number(lobby.value!.id))
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error(`Erreur ${error.code}`, {
        description: error.details,
      });
    } else if (data) {
      lobby.value = new Lobby(data);
    }

    // L'hôte retourne à l'accueil et ferme les canaux
    await cleanupAndGoHome();
  }
}

function handleVote(status: VoteValue) {
  // Met à jour localement
  applyVote({ playerId: getPlayer.id, value: status });
  // Diffuse aux autres joueurs
  broadcastGame.sendVote(status);
}

function handleHostCorrectionSwitch(correction: boolean) {
  // Local state
  result.value = correction;
  correctionSwitchValue.value = correction;
  // Only the host should broadcast the value
  if (isHost.value) {
    broadcastGame.sendCorrectionSwitch(correction);
  }
}

const getPlayerAnswerByIndex = computed(
  () =>
    // Hide answers during correction for players who were disconnected at correction start
    ((): string | undefined => {
      if (!game.value) return undefined;
      const playerId = game.value.playersData[game.value.currentPlayerIndex]?.id;
      const answer =
        game.value.playersData[game.value.currentPlayerIndex]?.answers[
          game.value.currentQuestionIndex
        ];
      if (
        game.value.phase === "correction" &&
        playerId &&
        disconnectedAtCorrection.value.has(playerId)
      ) {
        return undefined;
      }
      return answer;
    })()
);

// Réinitialise les votes et le vote personnel à chaque entrée en phase "correction"
watch(
  () => game.value?.phase,
  (phase) => {
    if (phase === "correction") {
      votes.value = [];
      personalVote.value = "neutral";
      // Reset the last player's result to avoid carry-over to the next player
      result.value = false;
      // Reset external switch so clients use local auto-evaluation until host changes it
      correctionSwitchValue.value = undefined;
      // Snapshot which players are disconnected right now; their answers will be hidden during this correction phase
      const snapshot = new Set<string>();
      for (const p of lobby.value?.players || []) {
        if (p.status !== "playing") snapshot.add(p.id);
      }
      disconnectedAtCorrection.value = snapshot;
    }
  }
);

// Réinitialise les votes à chaque changement de joueur en phase "correction"
watch(
  () => game.value?.currentPlayerIndex,
  () => {
    if (game.value?.phase === "correction") {
      votes.value = [];
      personalVote.value = "neutral";
      // Reset the last player's result when moving to the next player
      result.value = false;
      // Reset external switch at each player change
      correctionSwitchValue.value = undefined;
    }
  }
);

watch(
  () => lobby.value?.gameId,
  async (newGameId, oldGameId) => {
    if (oldGameId && gameChannel.value) {
      supabase.removeChannel(gameChannel.value);
      gameChannel.value = null;
    }

    if (!newGameId && lobby.value?.id) {
      // Back to lobby state
      presence.setInLobby(Number(lobby.value.id));
    }

    if (newGameId) {
      const { data, error } = await supabase
        .from("games")
        .select()
        .eq("id", newGameId)
        .single();

      if (error) {
        toast.error(`Erreur lors du chargement du jeu ${newGameId}`, {
          description: error.message,
        });
        game.value = null;
      } else if (data) {
        game.value = new Game(data);
        // In game
        if (lobby.value?.id) presence.setPlaying(Number(lobby.value.id));
        const gameCh = supabase.channel(`game-${newGameId}-updates`)
        ;(gameCh as any)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "games",
              filter: `id=eq.${newGameId}`,
            },
            async (payload: any) => {
              if (payload.new && game.value) {
                let updated = false;
                if (
                  payload.new.phase !== undefined &&
                  game.value.phase !== payload.new.phase
                ) {
                  game.value.phase = payload.new.phase;
                  updated = true;
                }
                if (
                  payload.new.current_question_index !== undefined &&
                  typeof payload.new.current_question_index === "number" &&
                  game.value.currentQuestionIndex !== payload.new.current_question_index
                ) {
                  game.value.currentQuestionIndex = payload.new.current_question_index;
                  // Lorsque l'index de question change côté base, si l'hôte n'a pas encore défini de startAt local (rare), on en crée un
                  if (
                    isHost.value &&
                    game.value.phase === "question" &&
                    typeof syncedStartAt.value !== "number"
                  ) {
                    const startAt = Date.now();
                    syncedStartAt.value = startAt;
                    broadcastGame.sendNextQuestion(
                      String(game.value.currentQuestionIndex),
                      startAt
                    );
                  }
                  updated = true;
                }
                if (
                  payload.new.current_player_index !== undefined &&
                  typeof payload.new.current_player_index === "number" &&
                  game.value.currentPlayerIndex !== payload.new.current_player_index
                ) {
                  game.value.currentPlayerIndex = payload.new.current_player_index;
                  updated = true;
                }
                if (
                  payload.new.players_data !== undefined &&
                  JSON.stringify(game.value.playersData) !==
                    JSON.stringify(payload.new.players_data)
                ) {
                  game.value.playersData = payload.new.players_data;
                  updated = true;
                }
                if (updated) {
                  console.log(
                    "Game state updated via merge:",
                    JSON.parse(JSON.stringify(game.value))
                  );
                } else {
                  console.log("No relevant changes detected in payload.");
                }
              }
            }
          )
          .subscribe();
        gameChannel.value = gameCh;
      }
    } else if (gameChannel.value) {
      game.value = null;
    }
  },
  { immediate: true }
);

const surroundingPlayers = computed(() => {
  if (game.value) {
    let surroundingPlayerIds: Array<string> = [];
    if (game.value?.playersData && game.value.playersData.length > 5) {
      if (game.value?.currentPlayerIndex < 5) {
        surroundingPlayerIds = game.value?.playersData
          .slice(0, 5)
          .map((player) => player.id);
      } else if (game.value?.currentPlayerIndex > game.value?.playersData.length - 6) {
        surroundingPlayerIds = game.value?.playersData
          .slice(-5)
          .map((player) => player.id);
      } else {
        surroundingPlayerIds = game.value?.playersData
          .slice(game.value?.currentPlayerIndex - 2, game.value?.currentPlayerIndex + 3)
          .map((player) => player.id);
      }
    } else {
      surroundingPlayerIds = game.value?.playersData.map((player) => player.id);
    }
    return lobby.value?.players
      .filter((player) => surroundingPlayerIds.includes(player.id))
      .sort((a, b) => {
        return surroundingPlayerIds.indexOf(a.id) - surroundingPlayerIds.indexOf(b.id);
      });
  } else {
    return [];
  }
});
</script>
