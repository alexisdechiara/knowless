<script setup lang="ts">
const user = useSupabaseUser()

const selectedItem = ref("profile")

const sidebarNavItems = [
	{
		title: "Profil",
		value: "profile",
	},
	{
		title: "Compte",
		value: "account",
	},
	// {
	// 	title: "Appearance",
	// 	value: "appearance",
	// },
]
</script>

<template>
	<div class="flex flex-1 gap-6 overflow-hidden px-6 pb-6">
		<aside class="lg:w-1/5">
			<nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
				<TooltipProvider v-for="item in sidebarNavItems" :key="item.title">
					<Tooltip>
						<TooltipTrigger class="cursor-not-allowed" :class="user?.is_anonymous && item.value === 'account' && 'cursor-default'">
							<Button
								variant="ghost"
								class="w-full justify-start text-left"
								:class="[selectedItem === item.value && 'bg-muted hover:bg-muted', user?.is_anonymous && item.value === 'account' && 'pointer-events-none cursor-not-allowed opacity-50']"
								@click="selectedItem = item.value"
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
		</aside>
		<div class="h-full flex-1 overflow-y-auto">
			<div class="ml-6 space-y-6">
				<Profile v-if="selectedItem === 'profile'" />
				<Account v-else-if="selectedItem === 'account'" />
				<!-- <Appearance v-else-if="selectedItem === 'appearance'" /> -->
			</div>
		</div>
	</div>
</template>
