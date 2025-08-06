<template>
	<NuxtLayout name="informational" :title="data?.title" :description="data?.description" :content="data" :updatedAt="data?.updatedAt" />
</template>

<script setup>
const { data } = await useAsyncData("legal-notice", () => queryCollection("content").path("/legal-notice").first())
</script>
