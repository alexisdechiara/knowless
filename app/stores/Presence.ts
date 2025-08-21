// stores/presence.ts
import { defineStore } from "pinia"

export type PresenceStatus = "online" | "in-lobby" | "playing" | "offline"

export const usePresenceStore = defineStore("Presence Store", () => {
  const supabase = getSupabaseClient()
  const authUser = useSupabaseUser()

  const status = ref<PresenceStatus>("online")
  const lobbyId = ref<number | null>(null)

  const heartbeatId = ref<ReturnType<typeof setInterval> | null>(null)
  const unloadBound = ref(false)

  const isInSession = computed(() => status.value === "in-lobby" || status.value === "playing")

  const computePayload = () => ({
    last_active_at: new Date().toISOString(),
    status: isInSession.value ? status.value : "online",
    lobby_id: isInSession.value ? lobbyId.value : null,
  })

  const syncNow = async () => {
    try {
      if (!authUser.value?.id) return
      const payload = computePayload()
      const { error } = await supabase
        .from("players")
        .update(payload)
        .eq("id", authUser.value.id)
      if (error) console.error("Presence sync error:", error)
    } catch (e) {
      console.error(e)
    }
  }

  const setOnline = async () => {
    status.value = "online"
    lobbyId.value = null
    void syncNow()
  }

  const setInLobby = async (id: number) => {
    status.value = "in-lobby"
    lobbyId.value = id
    void syncNow()
  }

  const setPlaying = async (id?: number | null) => {
    status.value = "playing"
    lobbyId.value = typeof id === "number" ? id : null
    void syncNow()
  }

  const clear = async () => {
    await setOnline()
  }

  const startHeartbeat = (intervalMs = 30000) => {
    if (heartbeatId.value) clearInterval(heartbeatId.value)
    heartbeatId.value = setInterval(() => void syncNow(), intervalMs)
  }

  const stopHeartbeat = () => {
    if (heartbeatId.value) {
      clearInterval(heartbeatId.value)
      heartbeatId.value = null
    }
  }

  const bindUnload = () => {
    if (unloadBound.value) return
    if (import.meta.client) {
      window.addEventListener("unload", () => {
        try {
          const id = authUser.value?.id
          if (!id) return
          navigator.sendBeacon(
            "/api/players/status",
            JSON.stringify({ id, status: "offline" })
          )
        } catch (e) {
          console.error(e)
        }
      })
      unloadBound.value = true
    }
  }

  const init = () => {
    bindUnload()
    // Start/stop heartbeat based on auth
    watch(
      authUser,
      (u) => {
        if (u?.id) {
          startHeartbeat(30000)
          void syncNow()
        } else {
          stopHeartbeat()
        }
      },
      { immediate: true }
    )
  }

  const getStatus = computed(() => status.value)
  const getLobbyId = computed(() => lobbyId.value)

  return {
    // state
    getStatus,
    getLobbyId,
    // actions
    init,
    syncNow,
    startHeartbeat,
    stopHeartbeat,
    setOnline,
    setInLobby,
    setPlaying,
    clear,
  }
})
