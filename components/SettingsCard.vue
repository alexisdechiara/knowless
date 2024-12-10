<template>
	<Card class="size-2/3 p-6 shadow-md">
		<CardContent class="flex size-full justify-center">
			<Tabs default-value="account" class="flex size-full flex-col items-center">
				<TabsList class="mb-6 w-1/3">
					<TabsTrigger value="account" class="w-full">
						Compte
					</TabsTrigger>
					<TabsTrigger value="themes" class="w-full">
						Thèmes
					</TabsTrigger>
				</TabsList>
				<TabsContent value="account" class="h-full w-2/3 items-center justify-center">
					<form class="flex size-full flex-col items-center justify-center gap-10" @submit="onSubmit">
						<div class="grid grid-cols-6 items-center gap-x-10">
							<Avatar shape="circle" size="lg" class="col-span-2 row-span-2 size-40">
								<AvatarImage src="https://api.dicebear.com/9.x/big-ears/svg?seed=Mackenzie" alt="avatar" />
								<AvatarFallback class="text-xl">{{ userStore.user.username }}</AvatarFallback>
							</Avatar>
							<FormField v-slot="{ componentField }" name="username">
								<FormItem class="col-span-4">
									<FormLabel>Pseudo*</FormLabel>
									<FormControl>
										<Input type="text" v-bind="componentField" :default-value="userStore.user.username" />
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
							<div class="col-span-4 flex h-fit w-full gap-x-4">
								<FormField v-slot="{ componentField }" name="tag1">
									<FormItem class="mt-auto w-full">
										<FormLabel>Tags</FormLabel>
										<Select v-bind="componentField">
											<FormControl>
												<SelectTrigger>
													<SelectValue :default-value="userStore.user.tag1" placeholder="1ère partie" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="french">
														Français
													</SelectItem>
													<SelectItem value="english">
														English
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								</FormField>
								<FormField v-slot="{ componentField }" name="tag2">
									<FormItem class="mt-auto w-full">
										<Select v-bind="componentField">
											<FormControl>
												<SelectTrigger>
													<SelectValue :default-value="userStore.user.tag1" placeholder="2nd partie" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="french">
														Français
													</SelectItem>
													<SelectItem value="english">
														English
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								</FormField>
							</div>
						</div>

						<!-- <FormField v-slot="{ componentField }" name="language">
							<FormItem>
								<FormLabel>Langue</FormLabel>

								<Select v-bind="componentField" default-value="french">
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="french">
												Français
											</SelectItem>
											<SelectItem value="english">
												English
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
								<FormDescription> La langue d'affichage de l'interface ainsi que des questions, si disponible. </FormDescription>
								<FormMessage />
							</FormItem>
						</FormField> -->
						<Button type="submit" class="w-full">
							Submit
						</Button>
					</form>
				</TabsContent>
				<TabsContent value="themes" class="size-full">
					<ToggleGroup variant="outline" type="multiple" class="grid h-fit w-full grid-cols-3 items-start justify-start gap-3">
						<ToggleGroupItem v-for="theme in themeList" :key="theme.title" class="group flex h-24 w-full items-start justify-start gap-4 p-4 transition data-[state=off]:-translate-y-0.5 data-[state=on]:bg-[#34D399]/[0.17] data-[state=off]:shadow-md data-[state=on]:shadow-none hover:data-[state=off]:translate-y-0 hover:data-[state=off]:bg-inherit hover:data-[state=off]:shadow-sm" :value="theme.value">
							<!-- eslint-disable-next-line tailwindcss/no-custom-classname -->
							<div class="icon flex aspect-square size-10 items-center justify-center rounded-full border-2 border-border transition-colors">
								<Icon name="lucide:check" class="text-2xl text-primary-foreground opacity-0 transition-opacity" />
							</div>
							<div class="flex h-full flex-col">
								<div class="text-start text-sm font-semibold">{{ theme.title }}</div>
								<div class="overflow-hidden text-ellipsis text-start text-sm font-normal">{{ theme.descriton }}</div>
							</div>
						</ToggleGroupItem>
					</ToggleGroup>
				</TabsContent>
			</Tabs>
		</CardContent>
	</Card>
</template>

<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import * as z from "zod"

const userStore = useUserStore()

const formSchema = toTypedSchema(z.object({
	username: z.string().min(2).max(50).default(userStore.user.username),
	tag1: z.string().min(2).max(50).default(userStore.user.tag1).optional(),
	tag2: z.string().min(2).max(50).default(userStore.user.tag2).optional(),
}))

const { handleSubmit } = useForm({
	validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
	console.log(values)
})

const themeList = [
	{
		title: "Monuments",
		descriton: "Lieu, taille ou encore histoire des monuments les plus célèbres",
		value: "monuments",
	},
	{
		title: "Animaux",
		descriton: "Habitat, caractéristiques et comportements des animaux fascinants",
		value: "animals",
	},
	{
		title: "Cinéma",
		descriton: "Films cultes, réalisateurs emblématiques et scènes inoubliables",
		value: "cinema",
	},
	{
		title: "Espace",
		descriton: "Planètes, étoiles et mystères de l'univers fascinant",
		value: "space",
	},
	{
		title: "Cuisine",
		descriton: "Plats célèbres, techniques culinaires et traditions gourmandes",
		value: "cooking",
	},
	{
		title: "Histoire",
		descriton: "Événements marquants, figures clés et périodes incontournables",
		value: "history",
	},
	{
		title: "Technologie",
		descriton: "Inventions, innovations et objets révolutionnaires",
		value: "technology",
	},
	{
		title: "Sports",
		descriton: "Records, champions légendaires et moments mémorables",
		value: "sports",
	},
	{
		title: "Mythologie",
		descriton: "Divinités, légendes et créatures des mythes anciens",
		value: "mythology",
	},
]
</script>

<style scoped>
[data-state="on"] .icon {
	@apply bg-[#10B981] border-[#10B981]
}

[data-state="on"] .icon span {
		@apply opacity-100
	}
</style>
