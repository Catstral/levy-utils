// TODO: Write docs

export function toInt(value: unknown, fallback: number = 0): number {
	let result: number;

	switch (typeof value) {
		case "boolean": {
			result = value ? 1 : 0;

			break;
		}
		case "number":
		case "bigint": {
			result = Number.parseInt(value.toString(), 10);

			break;
		}
		case "string": {
			result = Number.parseInt(value, 10);

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
