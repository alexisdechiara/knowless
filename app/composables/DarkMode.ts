const colorMode = useColorMode()
export const useDarkMode = () => {
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
