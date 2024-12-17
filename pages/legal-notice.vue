<template>
	<div class="flex h-screen w-screen items-center justify-center">
		<Card class="flex size-2/3 flex-col shadow-md">
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
						<ContentDoc class="prose max-w-none text-justify prose-headings:text-2xl" />
					</TabsContent>
					<TabsContent value="lincenses" class="flex size-full items-center justify-center" />
				</tabs>
			</CardContent>
		</Card>
	</div>
</template>
