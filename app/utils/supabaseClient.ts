// utils/supabaseClient.ts
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from '~~/shared/types/database.types'

let client: SupabaseClient<Database> | null = null

export const getSupabaseClient = (): SupabaseClient<Database> => {
	if (!client) {
		client = useSupabaseClient<Database>()
	}
	return client
}
