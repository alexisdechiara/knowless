<template>
	<form @submit.prevent="createAccount">
		<div v-show="formStep === 0">
			<div class="mt-4 flex flex-col gap-4">
				<div class="flex flex-col space-y-2 text-center">
					<h1 class="text-2xl font-semibold tracking-tight">
						Personnalisez votre profil
					</h1>
					<p class="text-sm text-muted-foreground">
						Entrez votre nom d'utilisateur et choisissez un avatar pour commencer.
					</p>
				</div>
				<FormField name="avatar">
					<FormItem class="flex w-full flex-1 justify-center">
						<FormControl class="w-full flex-1">
							<Popover>
								<PopoverTrigger class="group relative cursor-pointer">
									<span class="absolute right-2 top-2 z-20 flex aspect-square size-fit items-center justify-center rounded-full border-2 border-background bg-foreground p-2">
										<Icon name="lucide:pencil" class="size-4 text-background" />
									</span>
									<div class="absolute inset-0 z-10 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-25" />
									<Avatar shape="circle" class="relative size-40 text-6xl">
										<AvatarImage :src="getAvatarUri" alt="avatar" />
									</Avatar>
								</PopoverTrigger>
								<PopoverContent side="left" :side-offset="8" class="w-full">
									<ToggleGroup :model-value="selectedAvatarSeed" type="single" class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 sm:gap-6 sm:p-0" @update:model-value="(seed) => { if (seed) selectedAvatarSeed = seed as string }">
										<div v-for="seed in seeds" :key="seed">
											<ToggleGroupItem :value="seed" class="flex aspect-square size-full items-center justify-center rounded-full cursor-pointer p-2 ring-primary transition-colors duration-75 data-[state=on]:ring-3">
												<Avatar>
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
				<div class="relative">
					<div class="flex gap-0">
						<FormField v-slot="{ componentField }" name="username" class="w-full flex-1">
							<FormItem class="z-10 w-full flex-1">
								<FormLabel>Nom d'utilisateur *</FormLabel>
								<FormControl class="w-full flex-1">
									<Input
										id="username"
										class="w-full flex-1 rounded-r-none"
										placeholder="xXDarkLordXx"
										type="text"
										v-bind="componentField"
									/>
								</FormControl>
							</FormItem>
						</FormField>

						<FormField v-slot="{ componentField }" name="usertag">
							<FormItem class="focus-within:z-10">
								<FormLabel class="invisible">Tag</FormLabel>
								<FormControl class="relative w-full max-w-20 items-center">
									<div>
										<Input id="usertag" v-bind="componentField" v-model="tagInput" type="text" maxlength="4" class="relative rounded-l-none border-l-0 pl-7 uppercase tracking-widest" @blur="formatTag" />
										<span class="absolute inset-y-0 start-0 flex items-center justify-center ps-2">
											<Icon name="heroicons:hashtag" class="size-4 text-muted-foreground" />
										</span>
									</div>
								</FormControl>
							</FormItem>
						</FormField>
					</div>

					<div v-auto-animate="{ duration: 150 }">
						<FormField v-slot="{ errorMessage }" name="username">
							<p v-if="errorMessage" class="mt-1 text-sm text-destructive">
								{{ errorMessage }}
							</p>
						</FormField>
						<FormField v-slot="{ errorMessage }" name="usertag">
							<p v-if="errorMessage" class="mt-1 text-sm text-destructive">
								{{ errorMessage }}
							</p>
						</FormField>
					</div>
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
						<FormDescription />
					</FormItem>
				</FormField>
			</div>

			<div class="mt-4 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Button type="button" class="absolute bottom-4 right-0 md:bottom-8 md:right-8" :disabled="!isProfileStepValid" @click="goToNextStep">
						Suivant
					</Button>
				</div>
			</div>
		</div>
		<div v-show="formStep === 1">
			<div class="mt-4 flex flex-col gap-4">
				<div class="hidden flex-col space-y-2 text-center sm:flex">
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

				<div class="flex items-center gap-x-4">
					<Checkbox id="acceptTermsAndConditions" v-model="acceptTermsAndConditions"/>
					<label for="acceptTermsAndConditions" class="sr-only">J'accepte les termes et conditions</label>
					<p class="text-xs text-muted-foreground">
						En cochant cette case, vous acceptez notre
						<NuxtLink to="/terms" target="_blank" class="underline underline-offset-4 hover:text-primary"> Conditions d'utilisation</NuxtLink>
						et
						<NuxtLink to="/privacy" target="_blank" class="underline underline-offset-4 hover:text-primary"> Politique de confidentialité</NuxtLink>.
					</p>
				</div>

				<Button variant="outline" size="lg" class="mt-2" type="submit" :disabled="(!values.email || !values.password || !values.confirmPassword) || !acceptTermsAndConditions">
					S'inscrire avec un email
				</Button>

				<Separator label="Ou" class="my-6 uppercase" />

				<Button size="lg" class="mb-6" type="button" @click.self="createAnonymousAccount">
					Continuer sans inscription
				</Button>
			</div>
			<div class="mt-4 flex items-center justify-between">
				<Button variant="outline" type="button" class="absolute bottom-4 left-0 md:bottom-8 md:left-8" @click="formStep = 0">
					Retour
				</Button>
			</div>
		</div>
	</form>
</template>

<script setup lang="ts">
import { createAvatar } from "@dicebear/core"
import { bigEars } from "@dicebear/collection"
import { toast } from "vue-sonner"
import FormLabel from "~/components/ui/form/FormLabel.vue"

definePageMeta({
	layout: "auth",
	title: "Inscription",
	description: "Créez votre compte",
	noIndex: true,
})

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

const tagInput = ref<string>(randomTagNumber)
const selectedLanguage = ref<string>("fr")
const acceptTermsAndConditions = ref<boolean>(false)
const route = useRoute()

const supabase = useSupabaseClient()

const formStep = ref<number>(0)

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

const selectedAvatarSeed = ref<string>(seeds[Math.floor(Math.random() * seeds.length)]!)

const {
	handleSubmit,
	setFieldValue,
	validateProfileStep,
	meta,
	values,
	isFieldValid,
} = useRegisterForm(randomTagNumber, getAvatarUrl.value)

const isProfileStepValid = computed(() => {
	return (
		isFieldValid("username")
		&& isFieldValid("usertag")
		&& isFieldValid("avatar")
		&& isFieldValid("language")
	)
})

const goToNextStep = async () => {
	const isValid = await validateProfileStep()
	if (isValid && isProfileStepValid.value) {
		formStep.value = 1
	}
}

watch(selectedAvatarSeed, () => setFieldValue("avatar", getAvatarUrl.value))

const createAnonymousAccount = async () => {
	const isValid = await validateProfileStep()

	if (!isValid || !isProfileStepValid.value) {
		throw new Error("Formulaire non valide")
	}

	const { data, error } = await supabase.auth.signInAnonymously({
		options: {
			data: {
				username: values.username,
				usertag: values.usertag,
				language: values.language,
				avatar: values.avatar,
			},
		},
	})
	if (error) {
		if (error.code === "P0001") {
			toast.error("Nom d'utilisateur indisponible", {
				description: `Le nom d'utilisateur ${values.username} avec le tag #${values.usertag} est indisponible`,
			})
		}
		else {
			toast.error(`Erreur ${error.status}`, {
				description: error.message,
			})
		}
	}
	if (!error) {
		toast.success("Compte créé avec succès", {
			description: "vous êtes connecté en tant que " + data?.user?.user_metadata?.username,
		})
		await navigateTo({
			path: route.query.redirect ? String(route.query.redirect) : "/",
		})
	}
}

const createAccount = handleSubmit(async (values) => {
	const { data, error } = await supabase.auth.signUp({
		email: values.email,
		password: values.password,
		options: {
			data: {
				username: values.username,
				usertag: values.usertag,
				language: values.language,
				avatar: values.avatar,
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
		await navigateTo({
			path: route.query.redirect ? String(route.query.redirect) : "/",
		})
	}
})
</script>

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
