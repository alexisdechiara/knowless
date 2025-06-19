<template>
	<form class="space-y-8" @submit="onSubmit">
		<FormField v-slot="{ componentField }" name="email">
			<FormItem>
				<FormLabel>Courriel</FormLabel>
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
					<FormDescription>
						Votre addresse de courriel vous permet de vous connecter.
					</FormDescription>
					<FormMessage />
				</FormControl>
			</FormItem>
		</FormField>

		<FormField v-slot="{ componentField }" name="password">
			<FormItem>
				<FormLabel>Mot de passe *</FormLabel>
				<FormControl>
					<Input id="password" type="password" v-bind="componentField" />
					<FormDescription>
						Doit faire au moins 6 caractères.
					</FormDescription>
					<FormMessage />
				</FormControl>
			</FormItem>
		</FormField>

		<FormField v-slot="{ componentField }" name="confirmPassword">
			<FormItem>
				<FormLabel>Confirmer le mot de passe *</FormLabel>
				<FormControl>
					<Input id="confirmPassword" type="password" v-bind="componentField" />
					<FormDescription>
						Veuillez confirmer votre mot de passe.
					</FormDescription>
					<FormMessage />
				</FormControl>
			</FormItem>
		</FormField>
		<Button type="submit">
			Sauvegarder
		</Button>
	</form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { toast } from "vue-sonner"
import * as z from "zod"

const profileFormSchema = toTypedSchema(z.object({
	email: z.string().email(),
	password: z.string().min(6).max(50),
	confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, {
	message: "Les mots de passe doivent correspondre.",
	path: ["confirmPassword"],
}),
)

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const { handleSubmit } = useForm({
	validationSchema: profileFormSchema,
	initialValues: {
		email: user.value?.email,
	},
})

const onSubmit = handleSubmit(async (values) => {
	const { error } = await supabase.auth.updateUser({
		email: values.email,
		password: values.password,
	})

	if (error) {
		toast.error(`Erreur ${error.status}`, {
			description: error.message,
		})
	}

	toast.success("Compte mis à jour", {
		description: `Vous avez mis à jour votre compte`,
	})
})
</script>
