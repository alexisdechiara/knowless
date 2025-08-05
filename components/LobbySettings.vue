<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { toast } from "vue-sonner"
import * as z from "zod"
import { Lobby } from "~/models/lobby"

const supabase = useSupabaseClient()

const lobby = defineModel<Lobby>()

const formSchema = toTypedSchema(z.object({
	title: z.string().min(4, "Le titre doit comporter au moins 4 caractères").max(30, "Le titre ne peut pas dépasser 30 caractères"),
	password: z.string().min(0).max(10, "Le mot de passe ne peut pas avoir plus de 10 caractères").optional(),
	status: z.enum(["public", "private"]),
	allowed: z.enum(["everyone", "friendsOnly"]),
	maxPlayers: z.number().min(2).max(16).default(12),
	securityLevel: z.array(z.string()),
}))

const securityLevel = ["code", "join"]

const { handleSubmit, setFieldValue, values, resetForm } = useForm({
	validationSchema: formSchema,
	keepValuesOnUnmount: true,
	initialValues: {
		title: lobby?.value?.title,
		password: lobby?.value?.password || "",
		status: lobby?.value?.isPublic ? "public" : "private",
		allowed: lobby?.value?.isFriendsOnly ? "friendsOnly" : "everyone",
		maxPlayers: lobby?.value?.maxPlayers || 12,
		securityLevel: lobby?.value?.securityLevel || ["code", "join"],
	},
})

const onSubmit = handleSubmit(async (values) => {
	const hasChanged = JSON.stringify(values) !== JSON.stringify({
		title: lobby?.value?.title,
		password: lobby?.value?.password || "",
		status: lobby?.value?.isPublic ? "public" : "private",
		allowed: lobby?.value?.isFriendsOnly ? "friendsOnly" : "everyone",
		maxPlayers: lobby?.value?.maxPlayers || 12,
		securityLevel: lobby?.value?.securityLevel || ["code", "join"],
	})
	if (hasChanged) {
		const { data, error } = await supabase
			.from("lobbies")
			.update({
				title: values.title,
				password: values.password,
				is_public: values.status === "public",
				friends_only: values.allowed === "friendsOnly",
				max_players: values.maxPlayers,
				security_level: values.securityLevel,
			})
			.eq("id", lobby?.value?.id)
			.select()
			.single()

		if (error) {
			toast.error(`Erreur ${error.code}`, {
				description: error.details,
			})
		}
		else {
			lobby.value = new Lobby(data)
		}
	}
})

const handleUpdate = (value: boolean) => {
	if (value) {
		resetForm({
			values: {
				title: lobby?.value?.title,
				password: lobby?.value?.password || "",
				status: lobby?.value?.isPublic ? "public" : "private",
				allowed: lobby?.value?.isFriendsOnly ? "friendsOnly" : "everyone",
				maxPlayers: lobby?.value?.maxPlayers || 12,
				securityLevel: lobby?.value?.securityLevel || ["code", "join"],
			},
		})
	}
	else {
		onSubmit()
	}
}
</script>

<template>
	<Dialog @update:open="handleUpdate">
		<DialogTrigger as-child>
			<slot />
		</DialogTrigger>
		<DialogContent class="w-full max-w-lg md:max-w-xl">
			<DialogHeader>
				<DialogTitle>Paramètres</DialogTitle>
			</DialogHeader>

			<form id="dialogForm" class="flex flex-col gap-6">
				<FormField v-slot="{ componentField }" name="title">
					<FormItem>
						<FormLabel>
							Titre*
							<HelpTooltip content="sert à identifier votre partie dans la liste si vous avez défini le statut sur public." />
						</FormLabel>
						<FormControl>
							<Input type="text" v-bind="componentField" />
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<div class="grid grid-cols-4 gap-x-6">
					<FormField v-slot="{ componentField }" name="status">
						<FormItem>
							<FormLabel>
								Statut
								<HelpTooltip>
									<b class="font-semibold">Public :</b> Votre partie sera visible par tout le monde dans la liste des parties. <br><br>
									<b class="font-semibold">Privée :</b> Votre partie ne sera pas visible dans la liste des parties, y compris par vos amis.
								</HelpTooltip>
							</FormLabel>
							<Select v-bind="componentField">
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Sélectionnez un statut" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="public">
											Public
										</SelectItem>
										<SelectItem value="private">
											Privée
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField v-slot="{ value }" name="maxPlayers">
						<FormItem>
							<FormLabel>
								Taille
								<HelpTooltip content="Le nombre maximum de joueurs qui peuvent rejoindre votre partie." />
							</FormLabel>
							<NumberField
								class="gap-2"
								:min="2"
								:model-value="value"
								:max="16"
								@update:model-value="(v) => {
									if (v) {
										setFieldValue('maxPlayers', v)
									}
									else {
										setFieldValue('maxPlayers', undefined)
									}
								}"
							>
								<NumberFieldContent>
									<NumberFieldDecrement />
									<FormControl>
										<NumberFieldInput />
									</FormControl>
									<NumberFieldIncrement />
								</NumberFieldContent>
							</NumberField>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField v-slot="{ componentField }" name="password">
						<FormItem class="col-span-2">
							<FormLabel>
								Mot de passe
								<HelpTooltip content="Permet de restreindre l'accès aux joueurs qui possède le mot de passe, il est recommandé d'utiliser uniquement le code du salon en partie privée." />
							</FormLabel>
							<FormControl>
								<Input type="password" v-bind="componentField" />
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
				</div>
				<div v-show="false" class="inline-flex items-center justify-center">
					<FormField v-slot="{ componentField }" name="allowed">
						<FormItem class="space-y-0">
							<Select v-bind="componentField">
								<FormControl>
									<SelectTrigger class="m-0 w-fit border-0 p-0 focus:ring-0 focus:ring-transparent [&>*:last-child]:hidden">
										<Button variant="ghost" class="me-0.5 h-9 px-1 align-baseline leading-none underline underline-offset-4">
											{{ values.allowed === "everyone" ? "Tout le monde" : "Seul mes amis" }}
										</Button>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="everyone">
											Tout le monde
										</SelectItem>
										<SelectItem value="friendsOnly">
											Seul mes amis
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField name="securityLevel">
						<FormItem class="space-y-0">
							<FormLabel>{{ values.allowed === "everyone" ? "est autorisé à rejoindre" : "sont autorisés à rejoindre" }}</FormLabel>
							<DropdownMenu>
								<DropdownMenuTrigger as-child>
									<Button variant="ghost" class="ms-0.5 h-9 px-1 py-0 align-baseline leading-none underline underline-offset-4">
										{{ values.securityLevel?.map((level: string) => (level === "code" ? "avec un code" : "depuis la liste d'amis")).join(" et ") || "sur invitation uniquement" }}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent class="w-fit p-2">
									<DropdownMenuCheckboxItem v-for="level in securityLevel" :key="level" :checked="values.securityLevel?.includes(level)" @update:checked="setFieldValue('securityLevel', (values.securityLevel || []).includes(level) ? (values.securityLevel || []).filter((l: string) => l !== level) : [...(values.securityLevel || []), level])">
										{{ level === "code" ? "Avec un code" : "Depuis la liste d'amis" }}
									</DropdownMenuCheckboxItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<FormMessage />
						</FormItem>
					</FormField>
				</div>
			</form>
		</DialogContent>
	</Dialog>
</template>
