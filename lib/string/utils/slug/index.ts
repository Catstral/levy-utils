// TODO: Write docs

import { createUtilConfig } from "../../../config";

export interface SlugUtilConfig {
	[key: string]: never;
}

export function slug(text: string) {
	return text
		.normalize()
		.toLowerCase()
		.replace(/[^\w ]+/g, "")
		.replace(/ +/g, "-");
}

slug.config = createUtilConfig<SlugUtilConfig>({});
