export class ColorError extends Error {}

export interface ParsedColor {
	r: number;
	g: number;
	b: number;
	a?: number | null;
}

export type ColorInput = string | Color | ParsedColor;

export class Color {
	#r: number;
	#g: number;
	#b: number;
	#a: number | null = null;

	#origin: string | null = null;

	public static from(color: ColorInput): Color {
		return new Color(color);
	}

	public static blend(base: ColorInput, blend: ColorInput, baseWeight?: number | null): Color {
		return new Color(base).blend(blend, baseWeight);
	}

	public constructor(color: ColorInput) {
		if (typeof color === "string") {
			this.#origin = color;

			const parsed = this.#parseColorString(color);

			this.#r = parsed.r;
			this.#g = parsed.g;
			this.#b = parsed.b;
			this.#a = parsed.a ?? null;

			return;
		}

		if (color instanceof Color) {
			this.#origin = color.#origin;

			this.#r = color.#r;
			this.#g = color.#g;
			this.#b = color.#b;
			this.#a = color.#a;

			return;
		}

		this.#r = color.r;
		this.#g = color.g;
		this.#b = color.b;
		this.#a = color.a ?? null;
	}

	public get red(): number {
		return this.#r;
	}

	public get green(): number {
		return this.#g;
	}

	public get blue(): number {
		return this.#b;
	}

	public get alpha(): number | null {
		return this.#a;
	}

	public toRGB(): string {
		return `rgb(${this.#r} ${this.#g} ${this.#b}${this.#a === null ? "" : ` / ${this.#a}`})`;
	}

	public toHex(): string {
		const blendedR = this.#blendColorValue(this.#r, 255, this.#a);
		const blendedG = this.#blendColorValue(this.#g, 255, this.#a);
		const blendedB = this.#blendColorValue(this.#b, 255, this.#a);

		return `#${this.#hexifyColorValue(blendedR)}${this.#hexifyColorValue(blendedG)}${this.#hexifyColorValue(blendedB)}`;
	}

	public toFullHex(): string {
		return `#${this.#hexifyColorValue(this.#r)}${this.#hexifyColorValue(this.#g)}${this.#hexifyColorValue(this.#b)}${this.#hexifyColorValue((this.#a ?? 1) * 255)}`;
	}

	public toString(): string {
		return this.toFullHex();
	}

	public toJSON(): string {
		return this.toFullHex();
	}

	public blend(color: ColorInput, baseWeight?: number | null): Color {
		const blend = new Color(color);

		const r = this.#blendColorValue(this.#r, blend.#r, baseWeight);
		const g = this.#blendColorValue(this.#g, blend.#g, baseWeight);
		const b = this.#blendColorValue(this.#b, blend.#b, baseWeight);

		let a: number | null = null;

		if (this.#a !== null || blend.#a !== null) {
			a = this.#blendColorValue(this.#a ?? 1, blend.#a ?? 1, baseWeight);
		}

		return new Color({
			r,
			g,
			b,
			a,
		});
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

	#hexifyColorValue(value: number) {
		return Math.round(value).toString(16).padStart(2, "0");
	}

	// SECTION: Parsing

	#parseCmyk(color: string): ParsedColor | null {
		return null;
	}

	#parseHsl(color: string): ParsedColor | null {
		return null;
	}

	#parseLch(color: string): ParsedColor | null {
		return null;
	}

	#parseOklab(color: string): ParsedColor | null {
		return null;
	}

	static #labRegex =
		/^lab\((-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? *(?:\/ *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

	#parseLab(color: string): ParsedColor | null {
		const match = color.match(Color.#labRegex);

		if (match) {
			const l = match[1];
			let lIsPercentage = !!match[2];
			const a = match[3];
			let aIsPercentage = !!match[4];
			const b = match[5];
			let bIsPercentage = !!match[6];
			const alpha = match[7];
			let alphaIsPercentage = !!match[8];

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

			const lightness = Number.parseFloat(l);

			if (finalAlpha === null || finalAlpha === 1) {
				if (lightness === 1) {
					return {
						r: 255,
						g: 255,
						b: 255,
						a: finalAlpha,
					};
				}

				if (lightness === 0) {
					return {
						r: 0,
						g: 0,
						b: 0,
						a: finalAlpha,
					};
				}
			}
		}

		return null;
	}

	#parseRGBColorValueWithPercentage(value: string, isPercentage: boolean, isAlpha: boolean = false): number {
		const parsed = Number.parseInt(value, 10);

		if (Number.isNaN(parsed)) {
			throw new ColorError("Failed to parse color string: Failed to parse RGB(A) values into a color number");
		}

		if (isAlpha && !isPercentage) {
			const clamped = Math.max(Math.min(parsed, 1), 0);

			return clamped * 255;
		}

		// NOTE: this is to reflect browser standards on how these numbers are parsed
		const clamped = Math.max(Math.min(parsed, isPercentage ? 100 : 255), 0);

		if (!isPercentage) {
			return clamped;
		}

		const computedPercentage = (255 / 100) * clamped;

		if (isAlpha) {
			return computedPercentage / 255;
		}

		return computedPercentage;
	}

	static #rgbRegex =
		/^rgba?\( *(-?\d+(?:\.\d)?)(%?)(?: +| *, *)(-?\d+(?:\.\d)?)(%?)(?: +| *, *)(-?\d+(?:\.\d)?)(%?)(?: *\/ *(-?\d+(?:\.\d)?)(%?))? *\)$/;

	#parseRGB(color: string): ParsedColor | null {
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

			let finalAlpha: number | null = null;

			if (a !== null) {
				finalAlpha = this.#parseRGBColorValueWithPercentage(a, aIsPercentage, true);
			}

			return {
				r: this.#parseRGBColorValueWithPercentage(r, rIsPercentage),
				g: this.#parseRGBColorValueWithPercentage(g, gIsPercentage),
				b: this.#parseRGBColorValueWithPercentage(b, bIsPercentage),
				a: finalAlpha,
			};
		}

		return null;
	}

	#parseHex(color: string): ParsedColor | null {
		if (/#[0-9a-fA-F]+/.test(color)) {
			const hex = color.slice(1);

			switch (hex.length) {
				case 3: {
					const r = Number.parseInt(`${hex[0]}${hex[0]}`, 16);
					const g = Number.parseInt(`${hex[1]}${hex[1]}`, 16);
					const b = Number.parseInt(`${hex[2]}${hex[2]}`, 16);

					if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
						throw new ColorError(
							"Failed to parse color string: Failed to parse hex values into a color number",
						);
					}

					return {
						r,
						g,
						b,
						a: null,
					};
				}
				case 6:
				case 8: {
					const r = Number.parseInt(hex.slice(0, 2), 16);
					const g = Number.parseInt(hex.slice(2, 4), 16);
					const b = Number.parseInt(hex.slice(4, 6), 16);

					let a: number | null = null;

					const alphaSlice = hex.slice(6, 8);

					if (alphaSlice) {
						a = Number.parseInt(hex.slice(6, 8) || "FF", 16) / 255;
					}

					if (
						Number.isNaN(r) ||
						Number.isNaN(g) ||
						Number.isNaN(b) ||
						(typeof a === "number" && Number.isNaN(a))
					) {
						throw new ColorError(
							"Failed to parse color string: Failed to parse hex values into a color number",
						);
					}

					return {
						r,
						g,
						b,
						a,
					};
				}
				default: {
					throw new ColorError(
						`Failed to parse color string: Detected hex color string, but hex length is not of a know correct size: ${hex.length}`,
					);
				}
			}
		}

		return null;
	}

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
