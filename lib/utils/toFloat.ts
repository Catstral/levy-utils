// TODO: Write docs

export function toFloat(value: unknown, fallback: number = 0): number {
	let result: number;

	switch (typeof value) {
		case "boolean": {
			result = value ? 1 : 0;

			break;
		}
		case "number":
		case "bigint": {
			result = Number.parseFloat(value.toString());

			break;
		}
		case "string": {
			result = Number.parseFloat(value);

			break;
		}
		default: {
			return fallback;
		}
	}

	if (Number.isNaN(result) || !Number.isFinite(result)) {
		return fallback;
	}

	return result;
}
