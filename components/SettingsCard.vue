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
					<slot name="account" />
				</TabsContent>
				<TabsContent value="categories" class="size-full overflow-auto p-1">
					<slot name="categories" />
				</TabsContent>
			</Tabs>
		</CardContent>
	</component>
</template>

<script lang="ts" setup>
import { Card } from "~/components/ui/card"

const breakpoints = useScreenSize()
</script>
