<script setup lang="ts">
import * as z from "zod"
import { createAvatar } from "@dicebear/core"
import { bigEars } from "@dicebear/collection"
import { toast } from "vue-sonner"
import type { GenericObject } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import FormLabel from "~/components/ui/form/FormLabel.vue"
import Auth from "~/components/auth.vue"

const languages = [
	{ value: "en", label: "English" },
	{ value: "fr", label: "Français" },
	{ value: "es", label: "Español" },
	{ value: "it", label: "Italiano" },
	{ value: "de", label: "Deutsch" },
	{ value: "nl", label: "Nederlands" },
]

const seeds = ["Avery", "Mason", "George", "Liam", "Riley", "Oliver", "Amaya", "Sadie", "Mackenzie", "Eden", "Jack", "Eliza", "Adrian", "Jocelyn", "Katherine", "Luis"]

const randomTagNumber: string = String(1000 + Math.floor(Math.random() * 9000))

const username = ref<string>("")
const tagInput = ref<string>(randomTagNumber)
const selectedLanguage = ref<string>("fr")

const supabase = useSupabaseClient()

const profileSchema = z.object({
	username: z.string().min(2).max(50).nonempty(),
	tag: z.string().min(0).default(randomTagNumber),
	language: z.enum(["en", "fr", "es", "it", "de", "nl"]).default("fr"),
})

const accountSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(6).max(50),
		confirmPassword: z.string(),
	})
	.refine(values => values.password === values.confirmPassword, {
		message: "Les mots de passe doivent correspondre !",
		path: ["confirmPassword"],
	})

const profileCompleted = ref(false)

const formatTag = () => {
	if (tagInput.value.length < 4) {
		tagInput.value = tagInput.value.padStart(4, "0")
	}
}

const getAvatarUri = computed(() => {
	return createAvatar(bigEars, {
		seed: selectedAvatarSeed.value,
	}).toDataUri()
})

const getAvatarUrl = computed(() => `https://api.dicebear.com/6.x/big-ears/svg?seed=${selectedAvatarSeed.value}`)

const selectedAvatarSeed = ref<string>(seeds[Math.floor(Math.random() * seeds.length)])

const profileValues: GenericObject = {}

async function createAnonymousAccount() {
	console.log("Création de compte anonyme")
	const { data, error } = await supabase.auth.signInAnonymously({
		options: {
			data: {
				username: username.value,
				usertag: tagInput.value,
				language: selectedLanguage.value,
				avatar: getAvatarUrl.value,
			},
		},
	})
	if (error) {
		toast.error(`Erreur ${error.status}`, {
			description: error.message,
		})
	}
	if (!error) {
		toast.success("Compte créé avec succès", {
			description: "vous êtes connecté en tant que " + data?.user?.user_metadata?.username,
		})
		await navigateTo("/")
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onSubmit(values: any) {
	console.log("Création de compte")
	const { data, error } = await supabase.auth.signUp({
		email: values.email,
		password: values.password,
		options: {
			data: {
				username: username.value,
				usertag: tagInput.value,
				language: selectedLanguage.value,
				avatar: getAvatarUrl.value,
			},
		},
	})
	if (error) {
		toast.error(`Erreur ${error.status}`, {
			description: error.message,
		})
	}
	if (!error) {
		toast.success("Compte créé avec succès", {
			description: "vous êtes connecté en tant que " + data?.user?.user_metadata?.username,
		})
		await navigateTo("/")
	}
}
</script>

<template>
	<Auth register>
		<Form
			v-show="!profileCompleted"
			v-slot="{ meta, values, validate }"
			keep-values
			:validation-schema="toTypedSchema(profileSchema)"
		>
			<form
				@submit="(e) => {
					e.preventDefault()
					validate()
					if (meta.valid) {
						profileCompleted = true
						profileValues = values
					}
				}"
			>
				<div class="mt-4 flex flex-col gap-4">
					<div class="flex flex-col space-y-2 text-center">
						<h1 class="text-2xl font-semibold tracking-tight">
							Personnalisez votre profil
						</h1>
						<p class="text-sm text-muted-foreground">
							Entrez votre nom d'utilisateur et choisissez un avatar pour commencer.
						</p>
					</div>
					<FormField v-slot="{ componentField }" name="avatar">
						<FormItem class="flex w-full flex-1 justify-center">
							<FormControl class="w-full flex-1">
								<Input
									id="avatar"
									v-model="selectedAvatarSeed"
									class="sr-only"
									type="text"
									v-bind="componentField"
								/>

								<Popover>
									<PopoverTrigger class="group relative">
										<span class="absolute right-2 top-2 z-20 flex aspect-square size-fit items-center justify-center rounded-full border-2 border-background bg-foreground p-2">
											<Icon name="lucide:pencil" class="size-4 text-background" />
										</span>
										<div class="absolute inset-0 z-10 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-25" />
										<Avatar shape="circle" size="xl" class="relative">
											<AvatarImage :src="getAvatarUri" alt="avatar" />
										</Avatar>
									</PopoverTrigger>
									<PopoverContent side="left" :side-offset="8" class="w-full">
										<ToggleGroup :model-value="selectedAvatarSeed" type="single" class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 sm:gap-6 sm:p-0" @update:model-value="(seed) => { if (seed) selectedAvatarSeed = seed as string }">
											<div v-for="seed in seeds" :key="seed">
												<ToggleGroupItem :value="seed" class="flex aspect-square size-full items-center justify-center rounded-full p-2 ring-primary transition-colors duration-75 hover:bg-inherit data-[state=on]:ring">
													<Avatar shape="circle" size="sm">
														<AvatarImage :src="createAvatar(bigEars, { seed: seed }).toDataUri()" alt="avatar" />
													</Avatar>
												</ToggleGroupItem>
											</div>
										</ToggleGroup>
									</PopoverContent>
								</Popover>
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
					<div class="flex gap-0">
						<FormField v-slot="{ componentField }" name="username" class="w-full flex-1">
							<FormItem class="z-10 w-full flex-1">
								<FormLabel>Nom d'utilisateur *</FormLabel>
								<FormControl class="w-full flex-1">
									<Input
										id="username"
										v-model="username"
										class="w-full flex-1 rounded-r-none"
										placeholder="Username"
										type="text"
										v-bind="componentField"
									/>
								</FormControl>
							</FormItem>
						</FormField>

						<FormField v-slot="{ componentField }" name="tag">
							<FormItem class="focus-within:z-10">
								<FormLabel class="invisible">Tag</FormLabel>
								<FormControl class="relative w-full max-w-20 items-center">
									<div>
										<Input id="tag" v-bind="componentField" v-model="tagInput" type="text" maxlength="4" class="relative rounded-l-none border-l-0 pl-7 uppercase tracking-widest" @blur="formatTag" />
										<span class="absolute inset-y-0 start-0 flex items-center justify-center ps-2">
											<Icon name="heroicons:hashtag" class="size-4 text-muted-foreground" />
										</span>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>
					</div>

					<FormField v-slot="{ componentField }" name="language">
						<FormItem>
							<FormLabel class="sr-only">Langue</FormLabel>
							<Select v-bind="componentField">
								<FormControl>
									<SelectTrigger>
										<SelectValue v-model="selectedLanguage" placeholder="Sélectionnez une langue" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectGroup>
										<SelectItem v-for="language in languages" :key="language.label" :value="language.value">
											{{ language.label }}
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
							<FormMessage />
							<FormDescription>Correspond à l'ensemble du site et si disponibles aux questions posées</FormDescription>
						</FormItem>
					</FormField>
				</div>

				<div class="mt-4 flex items-center justify-between">
					<Button disabled variant="outline" class="absolute bottom-4 left-4 md:bottom-8 md:left-8" @click="profileCompleted = false">
						Back
					</Button>
					<div class="flex items-center gap-3">
						<Button type="submit" class="absolute bottom-4 right-4 md:bottom-8 md:right-8" :disabled="!meta.valid" @click="profileCompleted = true">
							Next
						</Button>
					</div>
				</div>
			</form>
		</Form>
		<Form
			v-show="profileCompleted"
			v-slot="{ meta, values, validate }"
			keep-values
			:validation-schema="toTypedSchema(accountSchema)"
		>
			<form
				@submit="(e) => {
					e.preventDefault()
					validate()
					onSubmit(values)
				}"
			>
				<div class="mt-4 flex flex-col gap-4">
					<div class="flex flex-col space-y-2 text-center">
						<h1 class="text-2xl font-semibold tracking-tight">
							Choisissez le type de compte
						</h1>
						<p class="text-sm text-muted-foreground">
							Sélectionnez si vous préférez un compte anonyme sans enregistrement ou un compte classique.
						</p>
					</div>

					<FormField v-slot="{ componentField }" name="email">
						<FormItem>
							<FormLabel>Courriel *</FormLabel>
							<FormControl>
								<Input
									id="email"
									placeholder="nom@gmail.com"
									type="email"
									auto-capitalize="none"
									auto-complete="email"
									auto-correct="off"
									v-bind="componentField"
								/>
								<FormMessage />
							</FormControl>
						</FormItem>
					</FormField>

					<FormField v-slot="{ componentField }" name="password">
						<FormItem>
							<FormLabel>Mot de passe *</FormLabel>
							<FormControl>
								<Input id="password" type="password" v-bind="componentField" />
								<FormMessage />
							</FormControl>
						</FormItem>
					</FormField>

					<FormField v-slot="{ componentField }" name="confirmPassword">
						<FormItem>
							<FormLabel>Confirmer le mot de passe *</FormLabel>
							<FormControl>
								<Input id="confirmPassword" type="password" v-bind="componentField" />
								<FormMessage />
							</FormControl>
						</FormItem>
					</FormField>

					<Button variant="outline" size="lg" class="mt-2" type="submit" :disabled="!meta.valid">
						S'inscrire avec un email
					</Button>

					<Separator label="Ou" class="my-6 uppercase" />

					<Button size="lg" class="mb-6" type="button" @click.self="createAnonymousAccount">
						Continuer sans inscription
					</Button>

					<p class="px-8 text-center text-sm text-muted-foreground">
						En vous inscrivant, vous acceptez notre
						<a href="/terms" class="underline underline-offset-4 hover:text-primary"> Conditions d'utilisation</a>
						et
						<a href="/privacy" class="underline underline-offset-4 hover:text-primary"> Politique de confidentialité</a>.
					</p>
				</div>
				<div class="mt-4 flex items-center justify-between">
					<Button variant="outline" type="button" class="absolute bottom-4 left-4 md:bottom-8 md:left-8" @click="profileCompleted = false">
						Back
					</Button>
				</div>
			</form>
		</Form>
	</Auth>
</template>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	appearance: none;
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>
