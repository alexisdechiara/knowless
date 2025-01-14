<script setup lang="ts">

</script>

<template>
	<CustomCard back @back="navigateTo('/')">
		<template #header>
			<div class="gap-y-0.5">
				<h2 class="text-2xl font-bold tracking-tight">
					Paramètres
				</h2>
				<p class="text-muted-foreground">
					Gérer les paramètres et les préférences de votre compte
				</p>
			</div>
			<Separator class="my-6" />
		</template>
		<div class="flex size-full flex-col">
			<div class="flex size-full flex-col gap-y-8 lg:relative lg:flex-row lg:gap-x-12 lg:gap-y-0">
				<aside class="lg:absolute lg:left-0 lg:top-0 lg:w-1/5">
					<SettingsNavbar />
				</aside>
				<div class="h-full overflow-auto lg:absolute lg:left-1/4 lg:right-0 lg:top-0">
					<slot />
				</div>
			</div>
		</div>
	</CustomCard>
</template>
