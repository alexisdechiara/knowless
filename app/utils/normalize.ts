function normalize(str: string) {
	return str
		.toLowerCase()
		.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		.replace(/[.,;:!?'"()[\]{}]/g, "")
		.replace(/\s+/g, "")
		.trim()
}

export default normalize
