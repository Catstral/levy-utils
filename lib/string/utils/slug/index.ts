// TODO: Write docs

import { createUtilConfig, type UtilConfigDefinitionShape } from "../../../config";

export interface SlugConfig {
	[key: string]: never;
}

export function slug(text: string) {
	return text
		.normalize()
		.toLowerCase()
		.replace(/[^\w ]+/g, "")
		.replace(/ +/g, "-");
}

slug.config = createUtilConfig<UtilConfigDefinitionShape<SlugConfig>>({});
