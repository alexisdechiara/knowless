// utils/supabaseClient.ts
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
	if (!client) {
		client = useSupabaseClient()
	}
	return client
}
