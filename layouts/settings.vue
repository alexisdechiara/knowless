<script setup lang="ts">

</script>

<template>
	<CustomCard back @back="navigateTo('/')">
		<div class="hidden size-full flex-col md:flex">
			<div class="space-y-0.5">
				<h2 class="text-2xl font-bold tracking-tight">
					Paramètres
				</h2>
				<p class="text-muted-foreground">
					Gérer les paramètres et les préférences de votre compte
				</p>
			</div>
			<Separator class="my-6" />
			<div class="relative flex size-full flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
				<aside class="absolute left-0 top-0 -mx-4 lg:w-1/5">
					<SettingsNavbar />
				</aside>
				<div class="absolute left-[20%] right-0 top-0 size-full flex-1 overflow-auto lg:max-w-2xl">
					<div class="space-y-6">
						<slot />
					</div>
				</div>
			</div>
		</div>
	</CustomCard>
</template>
