<template>
	<div class="flex h-screen w-screen items-center justify-center">
		<component :is="breakpoints.greater('sm').value ? Card : 'div'" class="flex size-full flex-col sm:h-3/4 sm:w-2/3 sm:shadow-md">
			<CardContent class="mb-8 flex size-full justify-center overflow-auto scroll-smooth p-8">
				<Tabs default-value="notice" class="flex size-full flex-col items-center">
					<TabsList class="mb-6">
						<TabsTrigger value="notice" class="w-full">
							Mentions légales
						</TabsTrigger>
						<TabsTrigger value="lincenses" class="w-full">
							Lincence
						</TabsTrigger>
					</TabsList>
					<TabsContent value="notice" class="flex size-full">
						<ContentDoc class="prose max-w-none prose-headings:text-2xl sm:text-justify" />
					</TabsContent>
					<TabsContent value="lincenses" class="flex size-full items-center justify-center" />
				</tabs>
			</CardContent>
		</component>
	</div>
</template>

<script lang="ts" setup>
import { Card } from "~/components/ui/card"

const breakpoints = useScreenSize()
</script>
