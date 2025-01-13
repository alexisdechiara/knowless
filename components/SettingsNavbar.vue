<script setup lang="ts">
const $route = useRoute()

const user = useSupabaseUser()

const sidebarNavItems = [
	{
		title: "Profil",
		value: "profile",
		to: "/settings/profile",
	},
	{
		title: "Compte",
		value: "account",
		to: "/settings/account",
	},
	// {
	// 	title: "Appearance",
	// 	href: "/settings/appearance",
	// },
]
</script>

<template>
	<nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
		<TooltipProvider
			v-for="item in sidebarNavItems"
			:key="item.title"
		>
			<Tooltip>
				<TooltipTrigger :class="user?.is_anonymous && item.value === 'account' && 'cursor-default'">
					<Button
						as="a"
						:href="item.to"
						variant="ghost"
						class="w-full justify-start text-left"
						:class="[$route.path === `${item.to}` && 'bg-muted hover:bg-muted', user?.is_anonymous && item.value === 'account' && 'pointer-events-none opacity-50']"
					>
						{{ item.title }}
						<Icon v-if="user?.is_anonymous && item.value === 'account'" name="lucide:lock" class="ml-auto text-muted-foreground" />
					</Button>
				</TooltipTrigger>
				<TooltipContent v-if="user?.is_anonymous && item.value === 'account'" side="right">
					Vous devez créer un compte pour utiliser cette fonctionnalité
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</nav>
</template>
