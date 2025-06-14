<template>
	<form class="space-y-8" @submit="onSubmit">
		<FormField name="avatar">
			<FormItem class="flex w-fit items-center gap-4">
				<FormControl>
					<Avatar shape="circle" size="base">
						<AvatarImage :src="values.avatar || ''" alt="avatar" />
						<AvatarFallback />
					</Avatar>
					<Dialog>
						<DialogTrigger as-child>
							<Button type="button" variant="outline">
								Personnaliser
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Personnaliser votre avatar</DialogTitle>
								<DialogDescription>
									Cette section est encore en construction
								</DialogDescription>
							</DialogHeader>
							<ToggleGroup :model-value="selectedAvatarSeed" type="single" class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-5 sm:gap-6 sm:p-0" @update:model-value="(seed) => { if (seed) selectedAvatarSeed = seed as string }">
								<div v-for="seed in seeds" :key="seed">
									<ToggleGroupItem :value="seed" class="flex aspect-square size-full items-center justify-center rounded-full p-2 ring-primary transition-colors duration-75 hover:bg-inherit data-[state=on]:ring">
										<Avatar shape="circle" size="base">
											<AvatarImage :src="createAvatar(bigEars, { seed: seed }).toDataUri()" alt="avatar" />
										</Avatar>
									</ToggleGroupItem>
								</div>
							</ToggleGroup>
							<DialogFooter>
								<DialogClose as-child>
									<Button type="button" @click="setFieldValue('avatar', `https://api.dicebear.com/6.x/big-ears/svg?seed=${selectedAvatarSeed}`)">
										Valider
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
		<div class="flex max-w-xs gap-0">
			<FormField v-slot="{ componentField }" name="username" class="w-full flex-1">
				<FormItem class="z-10 w-full flex-1">
					<FormLabel>Nom d'utilisateur</FormLabel>
					<FormControl class="w-full flex-1">
						<Input
							id="username"
							class="w-full flex-1 rounded-r-none"
							placeholder="Username"
							type="text"
							v-bind="componentField"
						/>
					</FormControl>
					<FormDescription>
						Sera visible par les autres joueurs
					</FormDescription>
					<FormMessage />
				</FormItem>
			</FormField>

			<FormField v-slot="{ componentField }" name="usertag">
				<FormItem class="focus-within:z-10">
					<FormLabel class="invisible">Tag</FormLabel>
					<FormControl class="relative w-full max-w-20 items-center">
						<div>
							<Input id="tag" v-bind="componentField" type="text" maxlength="4" class="relative rounded-l-none border-l-0 pl-7 uppercase tracking-widest" />
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
				<FormLabel>
					Langue
				</FormLabel>
				<Select v-bind="componentField">
					<FormControl class="w-fit min-w-32 max-w-64">
						<SelectTrigger>
							<SelectValue placeholder="Sélectionnez une langue" />
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
				<FormDescription>Langue des questions posées</FormDescription>
			</FormItem>
		</FormField>

		<FormField name="categories">
			<FormItem class="flex flex-col">
				<FormLabel>Catégories</FormLabel>
				<Popover>
					<PopoverTrigger as-child>
						<FormControl>
							<Button variant="outline" role="combobox" class="w-fit justify-between font-normal text-muted-foreground">
								Sélectionner des catégories..
								<Icon name="lucide:chevrons-up-down" class="ml-2 size-4 shrink-0 opacity-50" />
							</Button>
						</FormControl>
					</PopoverTrigger>
					<PopoverContent class="w-[200px] p-0">
						<Command>
							<CommandInput placeholder="Search language..." />
							<CommandEmpty>Rien n'a été trouvé.</CommandEmpty>
							<CommandList>
								<CommandGroup>
									<CommandItem
										v-for="category in categoryList"
										:key="category.value"
										:value="category.value"
										class="transition-colors duration-150 ease-out"
										:class="{ 'rounded-none bg-emerald-400/[0.17]': values?.categories?.includes(category.value) }"
										@select="() => {
											setFieldValue('categories', values.categories?.includes(category.value)
												? values.categories?.filter((c) => c !== category.value)
												: [...(values?.categories || []), category.value])
										}"
									>
										<Icon :name="values?.categories?.includes(category.value) ? 'lucide:check' : category.icon" class="mr-2 size-4" />
										{{ category.title }}
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				<FormDescription>
					L'ensemble des catégories dont les questions seront posées
				</FormDescription>
				<FormMessage />
			</FormItem>
		</FormField>

		<Button type="submit">
			Sauvegarder
		</Button>
	</form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import { useForm } from "vee-validate"
import { createAvatar } from "@dicebear/core"
import { bigEars } from "@dicebear/collection"
import { toast } from "vue-sonner"
import { User } from "~/models/user"

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { data, error } = await supabase
	.from("players")
	.select("*")
	.eq("id", user?.value?.id).single()

if (error) {
	console.error(error)
}

const player = new User(data)

const profileFormSchema = toTypedSchema(z.object({
	username: z.string().min(2).max(50).nonempty(),
	usertag: z.string().min(0),
	language: z.string(),
	avatar: z.string().nullable(),
	categories: z.array(z.string()).default([]),
}))

const seeds = ["Avery", "Mason", "George", "Liam", "Riley", "Oliver", "Amaya", "Sadie", "Mackenzie", "Eden", "Jack", "Eliza", "Adrian", "Jocelyn", "Katherine", "Luis"]
const selectedAvatarSeed = ref<string>("")
const { handleSubmit, setFieldValue, values } = useForm({
	validationSchema: profileFormSchema,
	initialValues: {
		username: player.username,
		usertag: player.usertag,
		language: player.language,
		avatar: player.avatar,
		categories: player.categories,
	},
})

const onSubmit = handleSubmit(async (values) => {
	const { error } = await supabase
		.from("players")
		.update({
			username: values.username,
			usertag: values.usertag,
			language: values.language,
			avatar: values.avatar,
			categories: values.categories,
		})
		.eq("id", user?.value?.id)

	if (error) {
		if (error.code === "P0001") {
			toast.error("Nom d'utilisateur indisponible", {
				description: `Le nom d'utilisateur ${values.username} avec le tag #${values.usertag} est indisponible`,
			})
		}
		else {
			toast.error(`Erreur ${error.code}`, {
				description: error.details || error.message,
			})
		}
	}
	else {
		toast.success("Profil mis à jour", {
			description: `Vous avez mis à jour votre profil`,
		})
	}
})

const languages = [
	{ value: "en", label: "English" },
	{ value: "fr", label: "Français" },
	{ value: "es", label: "Español" },
	{ value: "it", label: "Italiano" },
	{ value: "de", label: "Deutsch" },
	{ value: "nl", label: "Nederlands" },
]

const categoryList = [
	{
		title: "Animaux",
		descriton: "Découverte des espèces animales, leurs habitats et comportements",
		value: "animals",
		icon: "lucide:paw-print",
	},
	{
		title: "Archéologie",
		descriton: "Exploration des civilisations anciennes et de leurs trésors enfouis",
		value: "archaeology",
		icon: "lucide:landmark",
	},
	{
		title: "Arts",
		descriton: "Peinture, sculpture et expressions artistiques à travers les âges",
		value: "arts",
		icon: "lucide:palette",
	},
	{
		title: "Œuvres graphiques et animées",
		descriton: "Univers, personnages et histoires emblématiques de la bande dessinée (BD, comics et manga) ou de l'animation (dessin animé, cartoon et animes)",
		value: "graphic_and_animated",
		icon: "lucide:book-open",
	},
	{
		title: "Célébrités",
		descriton: "Stars, figures publiques et anecdotes sur des personnalités connues",
		value: "celebrities",
		icon: "lucide:star",
	},
	{
		title: "Cinéma",
		descriton: "Films, réalisateurs et moments marquants du grand écran",
		value: "cinema",
		icon: "lucide:film",
	},
	{
		title: "Culture en vrac",
		descriton: "Un mélange de faits intéressants et de connaissances variées",
		value: "bulk_culture",
		icon: "lucide:layers",
	},
	{
		title: "Culture générale",
		descriton: "Faits divers et savoirs incontournables dans différents domaines",
		value: "general_culture",
		icon: "lucide:book-open-text",
	},
	{
		title: "Gastronomie",
		descriton: "Plats, saveurs et traditions culinaires du monde entier",
		value: "gastronomy",
		icon: "lucide:utensils-crossed",
	},
	{
		title: "Géographie",
		descriton: "Pays, continents et villes",
		value: "geography",
		icon: "lucide:map",
	},
	{
		title: "Histoire",
		descriton: "Grands événements, figures clés et époques marquantes",
		value: "history",
		icon: "lucide:castle",
	},
	{
		title: "Informatique",
		descriton: "Technologies, logiciels et évolution du numérique",
		value: "computing",
		icon: "lucide:monitor",
	},
	{
		title: "Littérature",
		descriton: "Œuvres, auteurs et mouvements littéraires majeurs",
		value: "literature",
		icon: "lucide:feather",
	},
	{
		title: "Jeux",
		descriton: "Jeux vidéo, consoles et jeux de société",
		value: "games",
		icon: "lucide:gamepad",
	},
	{
		title: "Musique",
		descriton: "Genres, artistes et morceaux qui ont marqué l'histoire musicale",
		value: "music",
		icon: "lucide:music",
	},
	{
		title: "Nature",
		descriton: "Écosystèmes, phénomènes naturels et merveilles de la biodiversité",
		value: "nature",
		icon: "lucide:leaf",
	},
	{
		title: "Pour adultes",
		descriton: "Sujets sérieux ou plus osés destinés à un public adulte",
		value: "adults",
		icon: "lucide:user-x",
	},
	{
		title: "Quotidien",
		descriton: "Objets, habitudes et curiosités du quotidien",
		value: "daily_life",
		icon: "lucide:home",
	},
	{
		title: "Sciences",
		descriton: "Découvertes, théories et expériences scientifiques fascinantes",
		value: "sciences",
		icon: "lucide:microscope",
	},
	{
		title: "Sports",
		descriton: "Records, athlètes et moments marquants dans le sport",
		value: "sports",
		icon: "lucide:dumbbell",
	},
	{
		title: "Télévision",
		descriton: "Émissions cultes, séries et moments marquants de la télé",
		value: "television",
		icon: "lucide:tv",
	},
	{
		title: "Tourisme",
		descriton: "Destinations, attractions et voyages inoubliables",
		value: "tourism",
		icon: "lucide:luggage",
	},
	{
		title: "Web",
		descriton: "Sites, tendances et culture numérique à travers Internet",
		value: "web",
		icon: "lucide:globe",
	},
]
</script>
