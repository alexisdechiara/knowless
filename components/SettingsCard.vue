<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<component :is="breakpoints.greater('sm').value ? Card : 'div'" class="size-full p-6 sm:size-2/3 sm:shadow-md">
		<CardContent class="flex size-full justify-center">
			<Tabs default-value="account" class="flex size-full flex-col items-center">
				<TabsList class="mb-6 sm:w-1/3">
					<TabsTrigger value="account" class="w-full">
						Compte
					</TabsTrigger>
					<TabsTrigger value="categories" class="w-full">
						Catégories
					</TabsTrigger>
				</TabsList>
				<TabsContent value="account" class="h-full w-2/3 items-center justify-center">
					<form class="flex size-full flex-col items-center justify-center gap-10" @submit="onSubmit">
						<div class="grid grid-cols-1 items-center gap-x-10 sm:grid-cols-6">
							<Avatar shape="circle" size="lg" class="mb-4 size-40 sm:col-span-2 sm:row-span-2 sm:mb-0">
								<AvatarImage src="https://api.dicebear.com/9.x/big-ears/svg?seed=Mackenzie" alt="avatar" />
								<AvatarFallback class="text-xl">{{ userStore.user.username }}</AvatarFallback>
							</Avatar>
							<FormField v-slot="{ componentField }" name="username">
								<FormItem class="sm:col-span-4">
									<FormLabel>Pseudo*</FormLabel>
									<FormControl>
										<Input type="text" v-bind="componentField" :default-value="userStore.user.username" />
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
						<Button type="submit" class="w-full" :disabled="!formSchema.safeParse(form.values).success">
							Submit
						</Button>
					</form>
				</TabsContent>
				<TabsContent value="categories" class="size-full overflow-auto p-1">
					<ToggleGroup v-model="settingsStore.categories" variant="outline" type="multiple" class="grid h-fit w-full grid-cols-1 items-start justify-start gap-3 sm:grid-cols-3">
						<ToggleGroupItem v-for="categoty in categotyList" :key="categoty.title" class="group flex h-24 w-full items-start justify-start gap-4 p-4 transition data-[state=off]:-translate-y-0.5 data-[state=on]:bg-emerald-400/[0.17] data-[state=off]:shadow-md data-[state=on]:shadow-none hover:data-[state=off]:translate-y-0 hover:data-[state=off]:bg-inherit hover:data-[state=off]:shadow-sm" :value="categoty.value">
							<div class="icon flex aspect-square size-10 items-center justify-center rounded-full border-2 border-border transition-colors">
								<Icon :name="categoty.icon" class="block text-lg text-secondary-foreground opacity-100 transition-opacity" />
								<Icon name="lucide:check" class="check hidden text-2xl text-primary-foreground opacity-0 transition-opacity" />
							</div>
							<div class="flex h-full flex-col">
								<div class="text-start text-sm font-semibold">{{ categoty.title }}</div>
								<div class="overflow-hidden text-ellipsis text-start text-sm font-normal">{{ categoty.descriton }}</div>
							</div>
						</ToggleGroupItem>
					</ToggleGroup>
				</TabsContent>
			</Tabs>
		</CardContent>
	</component>
</template>

<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import * as z from "zod"
import { Card } from "~/components/ui/card"

const breakpoints = useScreenSize()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const formSchema = z.object({
	username: z.string().min(2).max(50).default(userStore.user.username),
})

const form = useForm({
	validationSchema: toTypedSchema(formSchema),
})

const onSubmit = form.handleSubmit((values) => {
	userStore.updateUser(values.username)
})

const categotyList = [
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
		title: "BD",
		descriton: "Univers, personnages et histoires emblématiques de la bande dessinée",
		value: "comics",
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
		value: "random_culture",
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
		descriton: "Pays, continents et phénomènes géographiques fascinants",
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
		title: "Loisirs",
		descriton: "Activités, jeux et divertissements pour tous les goûts",
		value: "hobbies",
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
		title: "Pays du monde",
		descriton: "Capitaux, cultures et particularités des nations du globe",
		value: "countries",
		icon: "lucide:earth",
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
		value: "science",
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

<style scoped>
[data-state="on"] .icon {
	@apply bg-emerald-500 border-emerald-500
}

[data-state="on"] .icon span.check {
	@apply opacity-100 block
}

[data-state="on"] .icon span {
	@apply opacity-0 hidden
}
</style>
