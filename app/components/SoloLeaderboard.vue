<template>
  <Dialog>
    <DialogTrigger>
      <Button variant="default" size="icon" class="size-12">
        <Icon name="lucide:clipboard-list" class="text-xl" />
      </Button>
    </DialogTrigger>
    <DialogContent class="w-full max-w-lg md:max-w-xl">
      <DialogHeader>
        <DialogTitle>Tableau des scores</DialogTitle>
      </DialogHeader>
      <Separator />

      <div v-if="error" class="mb-3 text-sm text-destructive">
        <div class="mt-1 opacity-80">{{ error }}</div>
      </div>

      <Tabs default-value="easy">
        <TabsList class="w-full my-3">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="cursor-pointer"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>

        <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="font-semibold">Joueur</TableHead>
                <TableHead class="text-center">Meilleur score</TableHead>
                <TableHead class="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading[tab.value]">
                <TableCell colspan="5" class="text-center text-muted-foreground">Chargement…</TableCell>
              </TableRow>
              <TableRow v-else-if="!leaderboards[tab.value].length">
                <TableCell colspan="5" class="text-center text-muted-foreground">
                  Aucune donnée
                </TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in leaderboards[tab.value]" :key="row.user_id">
                  <TableCell class="font-semibold max-w-40 overflow-hidden text-ellipsis">{{ row.username }}</TableCell>
                  <TableCell class="text-center">{{ row.best_score }}</TableCell>
                  <TableCell class="text-right">{{ formatDate(row.best_score_date) }}</TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Database } from "~~/shared/types/database.types"
import { Statistic, type StatisticLeaderboardRow } from "~~/shared/models/statistic"

// Plus besoin de supabase directement ici, on passe par le modèle Statistic

type Difficulty = Database["public"]["Enums"]["difficulties"]
const tabs = [
  { value: "easy" as Difficulty, label: "Facile" },
  { value: "medium" as Difficulty, label: "Moyen" },
  { value: "hard" as Difficulty, label: "Difficile" },
] as const

type Row = StatisticLeaderboardRow

const leaderboards = reactive<Record<Difficulty, Row[]>>({
  easy: [],
  medium: [],
  hard: [],
})

const loading = reactive<Record<Difficulty, boolean>>({ easy: true, medium: true, hard: true })
const error = ref<string | null>(null)

function formatDate(date: string | null) {
  if (!date) return "-"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "-"

  const now = new Date()
  let diffMs = now.getTime() - d.getTime()

  // Si la date est dans le futur, affiche en format DD:MM:YY
  if (diffMs < 0) {
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yy = String(d.getFullYear()).slice(-2)
    return `${dd}:${mm}:${yy}`
  }

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 5) return "à l’instant"
  if (seconds < 60) return `il y a ${seconds} s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`

  const days = Math.floor(hours / 24)
  if (days <= 30) return `il y a ${days} j`

  // Au-delà de 30 jours: format DD:MM:YY
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}:${mm}:${yy}`
}

async function fetchLeaderboard(difficulty: Database["public"]["Enums"]["difficulties"]) {
  try {
    return await Statistic.fetchLeaderboard(difficulty, 10)
  }
  catch (err: any) {
    console.error("Leaderboard error:", err)
    error.value = `${err?.code ?? ''} ${err?.message ?? ''}`.trim() || "Erreur inconnue"
    return [] as Row[]
  }
}

onMounted(async () => {
  try {
    const [e, m, h] = await Promise.all([
      fetchLeaderboard("easy"),
      fetchLeaderboard("medium"),
      fetchLeaderboard("hard"),
    ])
    leaderboards.easy = e
    leaderboards.medium = m
    leaderboards.hard = h
  } finally {
    loading.easy = false
    loading.medium = false
    loading.hard = false
  }
})
</script>
