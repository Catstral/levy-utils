// TODO: Write docs

export function slug(text: string) {
	return text
		.normalize()
		.toLowerCase()
		.replace(/[^\w ]+/g, "")
		.replace(/ +/g, "-");
}
