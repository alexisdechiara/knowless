import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "~~/shared/types/database.types"
import { getSupabaseClient } from "~/utils/supabaseClient"

export type Difficulty = Database["public"]["Enums"]["difficulties"]
export type StatisticRow = Database["public"]["Tables"]["statistics"]["Row"]
export type StatisticUpdate = Database["public"]["Tables"]["statistics"]["Update"]

export class Statistic {
  userId: string
  difficulty: Difficulty
  createdAt: Date
  updatedAt: Date | null
  bestScore: number | null
  bestScoreDate: Date | null
  nbGames: number | null
  nbRounds: number | null

  constructor(row: StatisticRow) {
    this.userId = row.user_id
    this.difficulty = row.difficulty
    this.createdAt = new Date(row.created_at)
    this.updatedAt = row.updated_at ? new Date(row.updated_at) : null
    this.bestScore = row.best_score
    this.bestScoreDate = row.best_score_date ? new Date(row.best_score_date) : null
    this.nbGames = row.nb_games
    this.nbRounds = row.nb_rounds
  }

  static async fetchById(userId: string, difficulty: Difficulty, client?: SupabaseClient): Promise<Statistic | null> {
    const supabase = client || getSupabaseClient()

    const { data, error, status } = await supabase
      .from("statistics")
      .select("*")
      .eq("user_id", userId)
      .eq("difficulty", difficulty)
      .maybeSingle()

    if (error && status !== 406) {
      console.error(error)
      throw new Error("Erreur lors de la récupération de la statistique")
    }

    if (!data) return null

    return new Statistic(data)
  }

  static async fetchByUser(userId: string, client?: SupabaseClient): Promise<Statistic[]> {
    const supabase = client || getSupabaseClient()

    const { data, error } = await supabase
      .from("statistics")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      throw new Error("Erreur lors de la récupération des statistiques utilisateur")
    }

    return (data || []).map((r) => new Statistic(r))
  }

  static async updateById(
    userId: string,
    difficulty: Difficulty,
    updates: Partial<Pick<Statistic, "bestScore" | "bestScoreDate" | "nbGames" | "nbRounds">>,
    client?: SupabaseClient,
  ): Promise<Statistic | null> {
    const supabase = client || getSupabaseClient()

    const payload: StatisticUpdate = {
      best_score: updates.bestScore ?? undefined,
      best_score_date: updates.bestScoreDate ? updates.bestScoreDate.toISOString() : undefined,
      nb_games: updates.nbGames ?? undefined,
      nb_rounds: updates.nbRounds ?? undefined,
      updated_at: new Date().toISOString(),
      // user_id & difficulty sont dans le filtre
    }

    const { data, error } = await supabase
      .from("statistics")
      .update(payload)
      .eq("user_id", userId)
      .eq("difficulty", difficulty)
      .select("*")
      .maybeSingle()

    if (error) {
      console.error(error)
      throw new Error("Erreur lors de la mise à jour de la statistique")
    }

    return data ? new Statistic(data) : null
  }

  static async upsert(
    values: Pick<StatisticRow, "user_id" | "difficulty"> & Partial<StatisticRow>,
    client?: SupabaseClient,
  ): Promise<Statistic> {
    const supabase = client || getSupabaseClient()

    const { data, error } = await supabase
      .from("statistics")
      .upsert({
        user_id: values.user_id,
        difficulty: values.difficulty,
        best_score: values.best_score ?? null,
        best_score_date: values.best_score_date ?? null,
        nb_games: values.nb_games ?? null,
        nb_rounds: values.nb_rounds ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,difficulty" })
      .select("*")
      .maybeSingle()

    if (error || !data) {
      console.error(error)
      throw new Error("Erreur lors de l'upsert de la statistique")
    }

    return new Statistic(data)
  }

  static async fetchLeaderboard(
    difficulty: Difficulty,
    limit = 10,
    client?: SupabaseClient,
  ): Promise<StatisticLeaderboardRow[]> {
    const supabase = client || getSupabaseClient()

    // Joindre la table players pour récupérer le username/usertag
    const { data, error } = await supabase
      .from("statistics")
      .select(
        `user_id, best_score, best_score_date,
         players:players!scores_user_id_fkey(id, username, usertag)`
      )
      .eq("difficulty", difficulty)
      .not("best_score", "is", null)
      .order("best_score", { ascending: false })
      .limit(limit)

    if (error) {
      console.error(error)
      throw new Error("Erreur lors de la récupération du leaderboard")
    }

    const rows = (data as any[] | null) || []
    return rows.map((r) => {
      const player = Array.isArray(r.players) ? r.players[0] : r.players
      return {
        user_id: r.user_id as string,
        username: player?.username ?? r.user_id,
        usertag: player?.usertag ?? null,
        best_score: r.best_score ?? null,
        best_score_date: r.best_score_date ?? null,
      }
    })
  }
}

export type StatisticLeaderboardRow = {
  user_id: string
  username: string
  usertag: string | null
  best_score: number | null
  best_score_date: string | null
}
