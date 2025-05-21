<template>
	<NuxtLayout name="informational" :title="data?.title" :description="data?.description" :content="data" :updatedAt="data?.updatedAt" />
</template>

<script lang="ts" setup>
const { data } = await useAsyncData("privacy", () => queryCollection("content").path("/privacy").first())
</script>
