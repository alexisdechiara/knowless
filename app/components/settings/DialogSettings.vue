<template>
	<Dialog>
		<DialogTrigger as-child>
			<slot />
		</DialogTrigger>
		<DialogContent class="flex h-[calc(100vh-8rem)] md:max-w-4xl w-full flex-col p-0 sm:h-[70vh]">
			<DialogHeader class="p-6 pb-0">
				<DialogTitle class="text-2xl font-bold tracking-tight">
					Paramètres
				</DialogTitle>
				<DialogDescription class="text-muted-foreground">
					Personnalisez votre profil, vos paramètres de jeu et votre compte
				</DialogDescription>
			</DialogHeader>
			<Separator class="sm:my-6" />
			<SettingsNavbar />
		</DialogContent>
	</Dialog>
</template>
