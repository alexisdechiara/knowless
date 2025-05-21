<template>
	<Table v-if="packages.length">
		<TableHeader class="text-sm">
			<TableRow>
				<TableHead>Nom</TableHead>
				<TableHead>Version</TableHead>
				<TableHead>Licence</TableHead>
				<TableHead class="text-right">
					Auteur
				</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			<TableRow v-for="item in packages" :key="item.name">
				<TableCell class="font-medium">
					<a :href="item.link" target="_blank" rel="noopener">{{ item.name }}</a>
				</TableCell>
				<TableCell>{{ item.installedVersion }}</TableCell>
				<TableCell>{{ item.licenseType }}</TableCell>
				<TableCell class="text-right">
					<div>{{ extractAuthor(item.author).name || 'N/A' }}</div>
					<div v-if="extractAuthor(item.author).email" class="text-sm text-gray-600">
						<a :href="`mailto:${extractAuthor(item.author).email}`" class="underline">
							{{ extractAuthor(item.author).email }}
						</a>
					</div>
					<div v-if="extractAuthor(item.author).url" class="text-sm text-gray-600">
						<a
							:href="extractAuthor(item.author).url"
							target="_blank"
							rel="noopener"
							class="underline"
						>
							{{ extractAuthor(item.author).url }}
						</a>
					</div>
				</TableCell>
			</TableRow>
		</TableBody>
	</Table>
</template>

<script lang="ts" setup>
interface PackageInfo {
	name: string
	link: string
	installedVersion: string
	licenseType: string
	author: string
}

const packages = ref<PackageInfo[]>([])

const regex = /^([\wÀ-ÿ .'-]+?)\s*(?:<)?([\w.+-]+@[\w.-]+\.[\w.-]+)?(?:>)?\s*(?:\(?\s*(https?:\/\/[^\s)]+)\s*\)?)?$/i

function extractAuthor(authorString: string) {
	if (!authorString || authorString.toLowerCase() === "n/a") {
		return { name: "N/A", email: undefined, url: undefined }
	}
	const match = authorString.match(regex)
	if (match) {
		return {
			name: match[1]?.trim() || undefined,
			email: match[2]?.trim() || undefined,
			url: match[3]?.trim() || undefined,
		}
	}
	return { name: authorString, email: undefined, url: undefined }
}

const loadPackages = async () => {
	try {
		const response = await fetch("/licenses.json")
		packages.value = await response.json()
	}
	catch (e) {
		console.error("Erreur chargement licenses.json:", e)
	}
}

await loadPackages()
</script>
