<template>
	<form class="space-y-8" @submit="onSubmit">
		<!-- <FormField v-slot="{ componentField }" name="font">
			<FormItem class="w-64">
				<FormLabel>
					Font
				</FormLabel>
				<Select v-bind="componentField">
					<FormControl>
						<SelectTrigger>
							<SelectValue placeholder="Sélectionnez une police de caractères" />
						</SelectTrigger>
					</FormControl>
					<SelectContent default-value="inter">
						<SelectGroup>
							<SelectItem value="inter">
								Inter
							</SelectItem>
							<SelectItem value="manrope">
								Manrope
							</SelectItem>
							<SelectItem value="system">
								System
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<FormMessage />
				<FormDescription />
			</FormItem>
		</FormField> -->

		<FormField v-slot="{ componentField }" type="radio" name="theme">
			<FormItem class="space-y-1">
				<FormLabel>Theme</FormLabel>
				<FormMessage />
				<RadioGroup class="grid grid-cols-3 gap-2 pt-2" v-bind="componentField">
					<FormItem>
						<FormLabel class="[&:has([data-state=checked])>div]:border-primary">
							<FormControl>
								<RadioGroupItem value="light" class="sr-only" />
							</FormControl>
							<ThemeSelector color-mode="light" />
							<span class="block w-full p-2 text-center font-normal">
								Light
							</span>
						</FormLabel>
					</FormItem>
					<FormItem>
						<FormLabel class="[&:has([data-state=checked])>div]:border-primary">
							<FormControl>
								<RadioGroupItem value="dark" class="sr-only" />
							</FormControl>
							<ThemeSelector color-mode="dark" />
							<span class="block w-full p-2 text-center font-normal">
								Dark
							</span>
						</FormLabel>
					</FormItem>
					<FormItem>
						<FormLabel class="[&:has([data-state=checked])>div]:border-primary">
							<FormControl>
								<RadioGroupItem value="system" class="sr-only" />
							</FormControl>
							<ThemeSelector color-mode="system" />
							<span class="block w-full p-2 text-center font-normal">
								Auto
							</span>
						</FormLabel>
					</FormItem>
				</RadioGroup>
			</FormItem>
		</FormField>

		<div class="flex justify-start">
			<Button type="submit">
				Sauvegarder
			</Button>
		</div>
	</form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import * as z from "zod"
import { User } from "~/models/user"

const colorMode = useColorMode()

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const { data, error } = await supabase
	.from("players")
	.select("*")
	.eq("id", user?.value?.id).single()

if (error) {
	console.error(error)
}

const player = new User(data)

const appearanceFormSchema = toTypedSchema(z.object({
	theme: z.enum(["light", "dark", "system"], {
		required_error: "Veuillez sélectionner un thème.",
	}),
	// font: z.enum(["inter", "manrope", "system"], {
	// 	invalid_type_error: "Select a font",
	// 	required_error: "Please select a font.",
	// }),
}))

const { handleSubmit } = useForm({
	validationSchema: appearanceFormSchema,
	initialValues: {
		theme: player.theme,
	},
})

const onSubmit = handleSubmit(async (values) => {
	const { error } = await supabase
		.from("players")
		.update({
			theme: values.theme,
		})
		.eq("id", user?.value?.id)

	if (error) {
		console.error(error)
	}
	else {
		colorMode.preference = values.theme
	}
})
</script>
