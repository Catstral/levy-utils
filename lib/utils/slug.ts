// TODO: Write docs

export function slug(text: string) {
	return text
		.toLowerCase()
		.replace(/[^\w ]+/g, "")
		.replace(/ +/g, "-");
}
