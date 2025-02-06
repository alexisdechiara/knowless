<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { toast } from "vue-sonner"
import * as z from "zod"
import Card from "~/components/ui/card/Card.vue"
import { Lobby } from "~/models/lobby"

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const formSchema = toTypedSchema(z.object({
	pin: z.array(z.coerce.string()),
}))

const { handleSubmit, setFieldValue, values, setErrors } = useForm({
	validationSchema: formSchema,
})

const onSubmit = handleSubmit(async () => {
	const { data, error } = await supabase.from("lobbies").select("*").eq("id", values?.pin?.join("")).single()

	if (error) {
		setErrors({ pin: "Le lobby n'existe pas" })
	}
	else if (data) {
		const lobbyByCode = new Lobby(data)

		if (lobbyByCode.securityLevel.includes("code")) {
			joinLobby(lobbyByCode)
		}
		else {
			toast.error("Ce lobby interdit l'accès par code")
			setErrors({ pin: "" })
		}
	}
})

const lobbies = ref<Array<Lobby>>([])
const { data, error } = await supabase.from("lobbies").select("*")

if (error) {
	toast.error(`Erreur ${error.code}`, {
		description: error.message,
	})
}
else {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	lobbies.value = data.map((lobby: any) => new Lobby(lobby))
}
</script>

<template>
	<div class="mx-auto flex size-full max-w-xl flex-col items-center justify-center">
		<form class="scale-150 py-64" @submit="onSubmit">
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
		<Card v-if="lobbies && lobbies.length > 0" class="w-full">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead class="pointer-events-none text-base">
							Parties publiques
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<template v-for="lobby in lobbies" :key="lobby.id">
						<TableRow v-if="lobby.isPublic" class="flex items-center">
							<TableCell class="w-fit font-medium"> {{ lobby.title }} </TableCell>
							<TableCell class="flex-1 text-right"> {{ lobby.playerIds.length }} / {{ lobby.maxPlayers }} </TableCell>
							<TableCell class="w-fit text-center">
								<Button :disabled="lobby.playerIds.length >= lobby.maxPlayers || (user && lobby.bannedPlayersId.includes(user?.id))" @click="joinLobby(lobby)">
									{{ lobby.playerIds.length >= lobby.maxPlayers ? "Complet"
										: user && lobby.bannedPlayersId.includes(user?.id) ? "Banni"
											: "Rejoindre" }}
								</Button>
							</TableCell>
						</TableRow>
					</template>
				</TableBody>
			</Table>
		</Card>
	</div>
</template>
