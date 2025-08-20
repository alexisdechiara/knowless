// composables/useBroadcastGame.ts
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useBroadcastGame(lobbyId: string, currentPlayerId: string, initialPlayerIds: string[]) {
  const client = getSupabaseClient()
  const channel = ref<RealtimeChannel | null>(null)
  const events = ref<{ event: string; payload: any }[]>([])
  const pendingAcks = ref(new Set<string>())
  const isHost = ref(false)
  const allPlayerIds = ref<string[]>([...initialPlayerIds])
  const clockOffsetMs = ref(0) // hostNow - clientNow

  // Ping/Pong pour estimer le décalage de l'horloge entre client et hôte
  let pingSeq = 0
  const pendingPings = new Map<number, number>() // seq -> clientSent
  type OffsetSample = { offset: number; rtt: number }
  const samples: OffsetSample[] = []
  const MAX_SAMPLES = 6

  function connect(hostFlag: boolean) {
    if (channel.value) return
    isHost.value = hostFlag

    channel.value = client.channel(`broadcast-game-${lobbyId}`, {
      config: { broadcast: { self: false } }
    })

    channel.value.on('broadcast', { event: 'next_question' }, ({ payload }) => {
      events.value.push({ event: 'next_question', payload })
      if (!isHost.value) {
        sendAck()
      }
    })

    channel.value.on('broadcast', { event: 'change_mode' }, ({ payload }) => {
      events.value.push({ event: 'change_mode', payload })
      if (!isHost.value) {
        sendAck()
      }
    })

    channel.value.on('broadcast', { event: 'ack' }, ({ payload }) => {
      events.value.push({ event: 'ack', payload })
      if (isHost.value) {
        pendingAcks.value.delete(payload.playerId)
        if (pendingAcks.value.size === 0) {
          onAllAcksReceived()
        }
      }
    })

    channel.value.on('broadcast', { event: 'answer_submit' }, ({ payload }) => {
      events.value.push({ event: 'answer_submit', payload })
    })

    channel.value.on('broadcast', { event: 'vote' }, ({ payload }) => {
      events.value.push({ event: 'vote', payload })
    })

    channel.value.on('broadcast', { event: 'correction_switch' }, ({ payload }) => {
      events.value.push({ event: 'correction_switch', payload })
    })

    // Un invité envoie des pings; l'hôte répond avec pong incluant l'heure hôte
    channel.value.on('broadcast', { event: 'ping' }, ({ payload }) => {
      events.value.push({ event: 'ping', payload })
      if (isHost.value) {
        sendPlayerEvent('pong', { seq: payload.seq, clientSent: payload.clientSent, hostNow: Date.now() })
      }
    })

    channel.value.on('broadcast', { event: 'pong' }, ({ payload }) => {
      events.value.push({ event: 'pong', payload })
      if (!isHost.value) {
        const clientReceive = Date.now()
        const clientSent = pendingPings.get(payload.seq)
        if (typeof clientSent === 'number') {
          pendingPings.delete(payload.seq)
          const hostNow = payload.hostNow as number
          // offset = hostNow - (clientSent + clientReceive)/2
          const offset = hostNow - (clientSent + clientReceive) / 2
          const rtt = clientReceive - clientSent
          samples.push({ offset, rtt })
          if (samples.length > MAX_SAMPLES) samples.shift()
          // moyenne sur les meilleurs rtt (NTP-style): on prend les 3 plus faibles rtt
          const best = [...samples].sort((a, b) => a.rtt - b.rtt).slice(0, Math.min(3, samples.length))
          const avg = best.reduce((sum, s) => sum + s.offset, 0) / best.length
          clockOffsetMs.value = Math.round(avg)
        }
      }
    })

    channel.value.subscribe()

    // Lancer une petite rafale de pings côté invité pour estimer l'offset
    if (!isHost.value) {
      const sendOnePing = () => {
        const seq = ++pingSeq
        const clientSent = Date.now()
        pendingPings.set(seq, clientSent)
        sendPlayerEvent('ping', { seq, clientSent })
      }
      // 5 pings espacés
      for (let i = 0; i < MAX_SAMPLES; i++) {
        setTimeout(sendOnePing, i * 150)
      }
    }
  }

  function disconnect() {
    if (channel.value) {
      channel.value.unsubscribe()
      channel.value = null
      pendingAcks.value.clear()
      events.value = []
      isHost.value = false
      allPlayerIds.value = []
    }
  }

  function updateHostFlag(newHostFlag: boolean) {
    isHost.value = newHostFlag
  }

  function updateAllPlayerIds(newPlayerIds: string[]) {
    allPlayerIds.value = [...newPlayerIds]
  }

  function sendHostEvent(eventName: string, payload: object) {
    if (!channel.value) return
    if (eventName === 'next_question' || eventName === 'change_mode') {
      pendingAcks.value = new Set(allPlayerIds.value.filter(id => id !== currentPlayerId))
    }
    channel.value.send({
      type: 'broadcast',
      event: eventName,
      payload
    })
  }

  function sendPlayerEvent(eventName: string, payload: object) {
    if (!channel.value) return
    channel.value.send({
      type: 'broadcast',
      event: eventName,
      payload
    })
  }

  function sendNextQuestion(
    questionId: string,
    startAt: number,
    fromIndex?: number,
    toIndex?: number
  ) {
    // Provide indices to allow clients to reconcile if they receive late
    sendHostEvent('next_question', { questionId, startAt, fromIndex, toIndex })
  }

  function sendChangeMode(mode: string, startAt?: number, questionIndex?: number) {
    // Include questionIndex when switching to question mode (optional)
    sendHostEvent('change_mode', { mode, startAt, questionIndex })
  }

  function sendAck() {
    sendPlayerEvent('ack', { playerId: currentPlayerId })
  }

  function sendAnswerSubmit(answer: string, questionIndex?: number) {
    // Attach the question index at the time of submission (optional)
    sendPlayerEvent('answer_submit', { playerId: currentPlayerId, answer, questionIndex })
  }

  function sendVote(value: 'correct' | 'incorrect' | 'neutral') {
    sendPlayerEvent('vote', { playerId: currentPlayerId, value })
  }

  function sendCorrectionSwitch(value: boolean) {
    // Host broadcasts the correction switch value to all
    sendHostEvent('correction_switch', { value })
  }

  function onAllAcksReceived() {
    console.log('Tous les joueurs ont accusé réception, on peut continuer')
  }

  return {
    connect,
    disconnect,
    updateHostFlag,
    updateAllPlayerIds,
    sendNextQuestion,
    sendChangeMode,
    sendAck,
    sendAnswerSubmit,
    sendVote,
    sendCorrectionSwitch,
    events: computed(() => events.value),
    pendingAcks: computed(() => pendingAcks.value),
    isHost: computed(() => isHost.value),
    clockOffsetMs: computed(() => clockOffsetMs.value),
    onAllAcksReceived,
  }
}
