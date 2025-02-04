<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import * as z from "zod"

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const formSchema = toTypedSchema(z.object({
	pin: z.array(z.coerce.string()),
}))

const { handleSubmit, setFieldValue, values, setErrors } = useForm({
	validationSchema: formSchema,
})

const onSubmit = handleSubmit(async () => {
	const { data: lobby, error } = await supabase.from("lobbies").select("*").eq("id", values?.pin?.join("")).single()

	if (error) {
		setErrors({ pin: "Le lobby n'existe pas" })
	}
	else if (lobby) {
		if (lobby.banned_players.includes(user.value?.id)) {
			setErrors({ pin: "Vous avez été banni de ce lobby" })
		}
		else if (lobby.max_players <= lobby.players.length) {
			setErrors({ pin: "Le lobby est plein" })
		}
		else if (lobby.is_public) {
			if (!lobby.players.includes(user.value?.id)) {
				await supabase.from("lobbies").update({ players: [...lobby.players, user.value?.id] }).eq("id", lobby.id)
			}
			await navigateTo(`/multi/${lobby.id}`)
		}
		else {
			if (lobby.players.includes(user.value?.id) || lobby.host === user.value?.id) {
				await navigateTo(`/multi/${lobby.id}`)
			}
			else if (lobby.invited_friends.includes(user.value?.id)) {
				await supabase.from("lobbies").update({ players: [...lobby.players, user.value?.id] }).eq("id", lobby.id)
				await navigateTo(`/multi/${lobby.id}/join`)
			}
			else if (lobby.security_level.includes("code")) {
				const { status: isFriend } = await supabase
					.from("friendship")
					.select("*")
					.or(`and(friend_id.eq.${user.value?.id},user_id.eq.${lobby.host}),and(friend_id.eq.${lobby.host},user_id.eq.${user.value?.id})`)
					.eq("status", "accepted")

				if ((lobby.friends_only && isFriend === 200) || lobby.friends_only === false) {
					await supabase.from("lobbies").update({ players: [...lobby.players, user.value?.id] }).eq("id", lobby.id)
					await navigateTo(`/multi/${lobby.id}/join`)
				}
				else {
					setErrors({ pin: "Vous n'êtes pas autorisé à accéder à ce lobby" })
				}
			}
		}
	}
})
</script>

<template>
	<form class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-150" @submit="onSubmit">
		<FormField v-slot="{ componentField, value }" name="pin">
			<FormItem>
				<FormLabel class="inline-flex w-full justify-center text-lg">
					Code du lobby
				</FormLabel>
				<FormControl>
					<PinInput
						id="pin-input"
						:model-value="value"
						placeholder="○"
						class="mt-1 flex items-center gap-2"
						otp
						type="number"
						:name="componentField.name"
						@update:model-value="(arrStr) => {
							setFieldValue('pin', arrStr.filter(Boolean))
						}"
						@complete="onSubmit()"
					>
						<PinInputGroup>
							<PinInputInput
								v-for="(id, index) in 4"
								:key="id"
								:index="index"
							/>
						</PinInputGroup>
					</PinInput>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
	</form>
</template>
