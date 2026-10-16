import type {
	CMYKParsedColor,
	ColorInput,
	LABParsedColor,
	OKLABParsedColor,
	ParsedColor,
	RGBParsedColor,
} from "./types";

export class ColorError extends Error {}

export class Color {
	#color: ParsedColor;

	public static from(color: ColorInput): Color {
		return new Color(color);
	}

	public static blend(base: ColorInput, blend: ColorInput, baseWeight?: number | null): Color {
		return new Color(base).blend(blend, baseWeight);
	}

	public constructor(color: ColorInput) {
		if (typeof color === "string") {
			this.#color = this.#parseColorString(color);

			return;
		}

		if (color instanceof Color) {
			this.#color = color.#color;

			return;
		}

		this.#color = color;
	}

	public toRGB(): string {
		const rgbSpace = this.#getColorInSpace("RGB");

		return `rgb(${rgbSpace.red} ${rgbSpace.green} ${rgbSpace.blue}${rgbSpace.alpha === null ? "" : ` / ${rgbSpace.alpha}`})`;
	}

	public toHex(): string {
		const rgbSpace = this.#getColorInSpace("RGB");

		const blendedR = this.#blendColorValue(rgbSpace.red, 255, rgbSpace.alpha);
		const blendedG = this.#blendColorValue(rgbSpace.green, 255, rgbSpace.alpha);
		const blendedB = this.#blendColorValue(rgbSpace.blue, 255, rgbSpace.alpha);

		return `#${this.#hexifyColorValue(blendedR)}${this.#hexifyColorValue(blendedG)}${this.#hexifyColorValue(blendedB)}`;
	}

	public toFullHex(): string {
		const rgbSpace = this.#getColorInSpace("RGB");

		return `#${this.#hexifyColorValue(rgbSpace.red)}${this.#hexifyColorValue(rgbSpace.green)}${this.#hexifyColorValue(rgbSpace.blue)}${this.#hexifyColorValue((rgbSpace.alpha ?? 1) * 255)}`;
	}

	#hexifyColorValue(value: number) {
		return Math.round(value).toString(16).padStart(2, "0");
	}

	public toString(): string {
		return this.toFullHex();
	}

	public toJSON(): string {
		return this.toFullHex();
	}

	public blend(color: ColorInput, baseWeight?: number | null): Color {
		const blend = new Color(color).#getColorInSpace("RGB");
		const rgbSpace = this.#getColorInSpace("RGB");

		const r = this.#blendColorValue(rgbSpace.red, blend.red, baseWeight);
		const g = this.#blendColorValue(rgbSpace.green, blend.green, baseWeight);
		const b = this.#blendColorValue(rgbSpace.blue, blend.blue, baseWeight);

		let alpha: number | null = null;

		if (rgbSpace.alpha !== null || blend.alpha !== null) {
			alpha = this.#blendColorValue(rgbSpace.alpha ?? 1, blend.alpha ?? 1, baseWeight);
		}

		return new Color({
			type: "RGB",
			red: r,
			green: g,
			blue: b,
			alpha,
		});
	}

	#getColorInSpace<T extends ParsedColor["type"]>(space: T): Extract<ParsedColor, { type: T }> {
		switch (this.#color.type) {
			case "CMYK": {
				return this.#convertToCMYK() as Extract<ParsedColor, { type: T }>;
			}
			case "RGB": {
				return this.#convertToRGB() as Extract<ParsedColor, { type: T }>;
			}
		}

		throw new ColorError(`Tried to convert into an unsupported color space: ${space}`);
	}

	#convertToCMYK(): CMYKParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				break;
			}
			case "CMYK": {
				return this.#color;
			}
		}

		throw new ColorError(`Tried to convert an unsupported color type to CMYK: ${this.#color.type}`);
	}

	#convertToRGB(): RGBParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				return this.#color;
			}
			case "CMYK": {
				break;
			}
		}

		throw new ColorError(`Tried to convert an unsupported color type to RGB: ${this.#color.type}`);
	}

	#blendColorValue(base: number, blend: number, baseWeight?: number | null): number {
		const finalBaseWeight = baseWeight ?? 0.5;

		const blendWeight = 1 - finalBaseWeight;

		if (blendWeight <= 0) {
			return base;
		} else if (blendWeight >= 1) {
			return blend;
		}

		return base * finalBaseWeight + blend * blendWeight;
	}

	// SECTION: Parsing

	#clampIntoRange(floor: number, value: number, ceil: number): number;
	#clampIntoRange(floor: number, value: number | null, ceil: number): number | null;
	#clampIntoRange(floor: number, value: number | null, ceil: number): number | null {
		if (typeof value !== "number") {
			return value;
		}

		return Math.min(Math.max(value, floor), ceil);
	}

	#parseCmyk(_color: string): ParsedColor | null {
		return null;
	}

	#parseHsl(_color: string): ParsedColor | null {
		return null;
	}

	#parseOklch(_color: string): ParsedColor | null {
		return null;
	}

	#parseLch(_color: string): ParsedColor | null {
		return null;
	}

	// SECTION - OKLAB

	static #oklabRegex =
		/^oklab\((-?\d+(?:\.\d+)?|\.\d+|none)%? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? *(?:\/ *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

	#parseOklab(color: string): OKLABParsedColor | null {
		const match = color.match(Color.#oklabRegex);

		if (match) {
			const l = match[1];
			const a = match[2];
			const aIsPercentage = !!match[3];
			const b = match[4];
			const bIsPercentage = !!match[5];
			const alpha = match[6];
			const alphaIsPercentage = !!match[7];

			let finalAlpha: number | null = null;

			if (alpha && alpha !== "none") {
				finalAlpha = Number.parseFloat(alpha);

				if (alphaIsPercentage) {
					finalAlpha /= 100;
				}

				if (Number.isNaN(finalAlpha)) {
					throw new ColorError(
						"Failed to parse color string: Failed to parse LAB alpha value into a color number",
					);
				}
			}

			// NOTE: while this can be a percentage, the base value range is the same scale.
			const lightness = Number.parseFloat(l);

			if (Number.isNaN(lightness)) {
				throw new ColorError(
					"Failed to parse color string: Failed to parse LAB lightness value into a color number",
				);
			}

			let axisA = Number.parseFloat(a);

			if (Number.isNaN(axisA)) {
				throw new ColorError(
					"Failed to parse color string: Failed to parse LAB A axis value into a color number",
				);
			}

			if (aIsPercentage) {
				axisA = (0.4 / 100) * axisA;
			}

			let axisB = Number.parseFloat(b);

			if (Number.isNaN(axisB)) {
				throw new ColorError(
					"Failed to parse color string: Failed to parse LAB A axis value into a color number",
				);
			}

			if (bIsPercentage) {
				axisB = (0.4 / 100) * axisB;
			}

			return {
				type: "OKLAB",
				lightness: this.#clampIntoRange(0, lightness, 100),
				axisA: this.#clampIntoRange(-0.4, lightness, 0.4),
				axisB: this.#clampIntoRange(-0.4, lightness, 0.4),
			};
		}

		return null;
	}

	// !SECTION - OKLAB
	// SECTION - LAB

	static #labRegex =
		/^lab\((-?\d+(?:\.\d+)?|\.\d+|none)%? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? *(?:\/ *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

	#parseLab(color: string): LABParsedColor | null {
		const match = color.match(Color.#labRegex);

		if (match) {
			const l = match[1];
			const a = match[2];
			const aIsPercentage = !!match[3];
			const b = match[4];
			const bIsPercentage = !!match[5];
			const alpha = match[6];
			const alphaIsPercentage = !!match[7];

			let finalAlpha: number | null = null;

			if (alpha && alpha !== "none") {
				finalAlpha = Number.parseFloat(alpha);

				if (alphaIsPercentage) {
					finalAlpha /= 100;
				}

				if (Number.isNaN(finalAlpha)) {
					throw new ColorError(
						"Failed to parse color string: Failed to parse LAB alpha value into a color number",
					);
				}
			}

			// NOTE: while this can be a percentage, the base value range is the same scale.
			const lightness = Number.parseFloat(l);

			if (Number.isNaN(lightness)) {
				throw new ColorError(
					"Failed to parse color string: Failed to parse LAB lightness value into a color number",
				);
			}

			let axisA = Number.parseFloat(a);

			if (Number.isNaN(axisA)) {
				throw new ColorError(
					"Failed to parse color string: Failed to parse LAB A axis value into a color number",
				);
			}

			if (aIsPercentage) {
				axisA *= 1.25;
			}

			let axisB = Number.parseFloat(b);

			if (Number.isNaN(axisB)) {
				throw new ColorError(
					"Failed to parse color string: Failed to parse LAB A axis value into a color number",
				);
			}

			if (bIsPercentage) {
				axisB *= 1.25;
			}

			return {
				type: "LAB",
				lightness: this.#clampIntoRange(0, lightness, 100),
				axisA: this.#clampIntoRange(-125, lightness, 125),
				axisB: this.#clampIntoRange(-125, lightness, 125),
			};
		}

		return null;
	}

	// !SECTION - LAB
	// SECTION - RGB

	#parseRGBColorValueWithPercentage(value: string, isPercentage: boolean, isAlpha: boolean = false): number {
		const parsed = Number.parseInt(value, 10);

		if (Number.isNaN(parsed)) {
			throw new ColorError("Failed to parse color string: Failed to parse RGB(A) values into a color number");
		}

		if (isAlpha && !isPercentage) {
			return parsed * 255;
		}

		if (!isPercentage) {
			return parsed;
		}

		const computedPercentage = (255 / 100) * parsed;

		if (isAlpha) {
			return computedPercentage / 255;
		}

		return computedPercentage;
	}

	static #rgbRegex =
		/^rgba?\( *(-?\d+(?:\.\d)?)(%?)(?: +| *, *)(-?\d+(?:\.\d)?)(%?)(?: +| *, *)(-?\d+(?:\.\d)?)(%?)(?: *\/ *(-?\d+(?:\.\d)?)(%?))? *\)$/;

	#parseRGB(color: string): RGBParsedColor | null {
		const rgbMatch = color.match(Color.#rgbRegex);

		if (rgbMatch) {
			const r = rgbMatch[1];
			const rIsPercentage = !!rgbMatch[2];
			const g = rgbMatch[3];
			const gIsPercentage = !!rgbMatch[4];
			const b = rgbMatch[5];
			const bIsPercentage = !!rgbMatch[6];
			const a = rgbMatch[7] || null;
			const aIsPercentage = !!rgbMatch[8];

			let alpha: number | null = null;

			if (a !== null) {
				alpha = this.#parseRGBColorValueWithPercentage(a, aIsPercentage, true);
			}

			const red = this.#parseRGBColorValueWithPercentage(r, rIsPercentage);
			const green = this.#parseRGBColorValueWithPercentage(g, gIsPercentage);
			const blue = this.#parseRGBColorValueWithPercentage(b, bIsPercentage);

			return {
				type: "RGB",
				red: this.#clampIntoRange(0, red, 255),
				green: this.#clampIntoRange(0, green, 255),
				blue: this.#clampIntoRange(0, blue, 255),
				alpha: this.#clampIntoRange(0, alpha, 1),
			};
		}

		return null;
	}

	// !SECTION - RGB
	// SECTION - HEX

	#parseHex(color: string): RGBParsedColor | null {
		if (/#[0-9a-fA-F]+/.test(color)) {
			const hex = color.slice(1);

			let r: number;
			let g: number;
			let b: number;
			let alpha: number | null = null;

			switch (hex.length) {
				case 3: {
					r = Number.parseInt(`${hex[0]}${hex[0]}`, 16);
					g = Number.parseInt(`${hex[1]}${hex[1]}`, 16);
					b = Number.parseInt(`${hex[2]}${hex[2]}`, 16);

					break;
				}
				case 6:
				case 8: {
					r = Number.parseInt(hex.slice(0, 2), 16);
					g = Number.parseInt(hex.slice(2, 4), 16);
					b = Number.parseInt(hex.slice(4, 6), 16);

					const alphaSlice = hex.slice(6, 8) || null;

					if (alphaSlice !== null) {
						alpha = Number.parseInt(alphaSlice, 16) / 255;
					}

					break;
				}
				default: {
					throw new ColorError(
						`Failed to parse color string: Detected hex color string, but hex length is not of a known correct size: ${hex.length}`,
					);
				}
			}

			if (
				Number.isNaN(r) ||
				Number.isNaN(g) ||
				Number.isNaN(b) ||
				(typeof alpha === "number" && Number.isNaN(alpha))
			) {
				throw new ColorError("Failed to parse color string: Failed to parse hex values into a color number");
			}

			return {
				type: "RGB",
				red: this.#clampIntoRange(0, r, 255),
				green: this.#clampIntoRange(0, g, 255),
				blue: this.#clampIntoRange(0, b, 255),
				alpha: this.#clampIntoRange(0, alpha, 1),
			};
		}

		return null;
	}

	// !SECTION - HEX

	#parseColorString(color: string): ParsedColor {
		const hex = this.#parseHex(color);

		if (hex) {
			return hex;
		}

		const rgb = this.#parseRGB(color);

		if (rgb) {
			return rgb;
		}

		const lab = this.#parseLab(color);

		if (lab) {
			return lab;
		}

		const oklab = this.#parseOklab(color);

		if (oklab) {
			return oklab;
		}

		const lch = this.#parseLch(color);

		if (lch) {
			return lch;
		}

		const oklch = this.#parseOklch(color);

		if (oklch) {
			return oklch;
		}

		const hsl = this.#parseHsl(color);

		if (hsl) {
			return hsl;
		}

		const cmyk = this.#parseCmyk(color);

		if (cmyk) {
			return cmyk;
		}

		throw new ColorError("Failed to parse color string: Unknown format.");
	}

	// !SECTION
}

console.log(Color.from("#ff00F0").toRGB());
