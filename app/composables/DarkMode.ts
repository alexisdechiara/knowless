export const useDarkMode = () => {
	const colorMode = useColorMode()
	function outlineOrSecondary() {
		if (colorMode.value === "dark") {
			return "secondary"
		}
		else {
			return "outline"
		}
	}

	return {
		outlineOrSecondary,
	}
}
