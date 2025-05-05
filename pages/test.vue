<template>
	<pre>
		{{ data }}
	</pre>
</template>

<script lang="ts" setup>
const { data, status, error, execute, refresh } = useQuizz(["games"], "fr")

console.log(data)
</script>
