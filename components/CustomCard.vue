<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<component :is="breakpoints.greater('sm').value ? Card : 'div'" class="fixed left-1/2 top-1/2 flex size-full -translate-x-1/2 -translate-y-1/2 gap-4 p-6 sm:size-2/3 sm:shadow-md">
		<CardHeader v-if="$slots.header" class="flex p-0">
			<slot name="header" />
		</CardHeader>
		<CardContent class="flex size-full">
			<Tabs v-if="Array.isArray(tabs) && tabs.length > 0" :default-value="tabs[0].value" class="flex size-full flex-col items-center">
				<TabsList class="mb-6 sm:w-1/3">
					<TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value" class="w-full">
						{{ tab.label }}
					</TabsTrigger>
				</TabsList>
				<TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="size-full items-center justify-center overflow-auto">
					<slot :name="tab.value" />
				</TabsContent>
			</Tabs>
			<slot />
		</CardContent>
		<Button v-if="back" variant="secondary" class="absolute bottom-6 left-6" size="icon" @click="$emit('back')">
			<Icon name="lucide:chevron-left" />
		</Button>
		<CardFooter v-if="$slots.footer" class="flex p-0">
			<slot name="footer" />
		</CardFooter>
	</component>
</template>

<script lang="ts" setup>
import { Card } from "~/components/ui/card"

const breakpoints = useScreenSize()

defineProps<{
	back?: boolean
	tabs?: Array<{
		label: string
		value: string
	}>
}>()

defineEmits(["back"])
</script>
