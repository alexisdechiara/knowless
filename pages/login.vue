<template>
	<form @submit.prevent="onSubmit" @blur="validate()">
		<div class="grid gap-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">
				Connectez-vous à votre compte
			</h1>
			<p class="text-pretty text-sm text-muted-foreground">
				Entrez votre email ci-dessous pour vous connecter à votre compte
			</p>
		</div>
		<div class="mt-4 grid gap-4">
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
					</FormControl>
				</FormItem>
			</FormField>
			<FormField v-slot="{ componentField }" name="password">
				<FormItem>
					<div class="flex items-center">
						<FormLabel>Mot de passe</FormLabel>
						<a href="/forgot-password" class="ml-auto inline-block text-sm underline"> mot de passe oublié ?</a>
					</div>
					<FormControl>
						<Input id="password" type="password" v-bind="componentField" />
					</FormControl>
				</FormItem>
			</FormField>
			<span v-if="errorLogin" class="text-sm font-medium text-red-500"> Email ou mot de passe incorrect </span>
			<Button type="submit" :disabled="!meta.valid" class="w-full">	Connexion </Button>
			<div class="mt-4 text-center text-sm">
				Vous n'avez pas de compte ?
				<NuxtLink to="/register" class="underline"> S'inscrire </NuxtLink>
			</div>
		</div>
	</form>
</template>

<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import { toast } from "vue-sonner"
import { useForm } from "vee-validate"

definePageMeta({
	layout: "auth",
	title: "Connexion",
	description: "Connectez-vous à votre compte",
	noIndex: true,
})

const supabase = useSupabaseClient()
const errorLogin = ref<boolean>(false)

const formSchema = toTypedSchema(z.object({
	email: z.string().email(),
	password: z.string().max(50),
}))

const { meta, validate, handleSubmit } = useForm({
	validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (values, { setFieldError }) => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email: values.email,
		password: values.password,
	})

	if (error) {
		if (error.status === 400) {
			toast.error("Erreur de connexion", {
				description: "Vérifiez votre email et votre mot de passe",
			})
			errorLogin.value = true
			setFieldError("email", "Email ou mot de passe incorrect")
			setFieldError("password", "Email ou mot de passe incorrect")
		}
		else {
			toast.error(`Erreur ${error.status}`, {
				description: error.message,
			})
		}
	}
	if (!error) {
		toast.success("Connexion réussie", {
			description: "vous êtes connecté en tant que " + data?.user?.user_metadata?.username,
		})
		await navigateTo("/")
	}
})
</script>
