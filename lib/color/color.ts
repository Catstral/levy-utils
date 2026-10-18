import type {
	CMYKParsedColor,
	ColorInput,
	HSLParsedColor,
	HWBParsedColor,
	LABParsedColor,
	LCHParsedColor,
	NamedColor,
	OKLABParsedColor,
	OKLCHParsedColor,
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

	#stringifyMap: Record<ParsedColor["type"], () => string> = {
		RGB: this.toHex,
		CMYK: this.toCMYKString,
		LAB: this.toLABString,
		OKLAB: this.toOKLABString,
		LCH: this.toLCHString,
		OKLCH: this.toOKLCHString,
		HSL: this.toHSLString,
		HWB: this.toHWBString,
	};

	public toString(): string {
		return this.#stringifyMap[this.#color.type]();
	}

	public toJSON(): string {
		return this.toString();
	}

	// SECTION - Public conversion
	// SECTION - HEX

	#hexifyColorValue(...values: number[]) {
		return values.reduce((acc, value) => `${acc}${Math.round(value).toString(16).padStart(2, "0")}`, "");
	}

	public tofixedHex(withAlpha: boolean = false): string {
		const rgbSpace = this.#getColorInSpace("RGB");
		const alpha = rgbSpace.alpha ?? 1;

		if (withAlpha) {
			return `#${this.#hexifyColorValue(rgbSpace.red, rgbSpace.green, rgbSpace.blue, alpha * 255)}`;
		}

		const blendedR = this.#blendColorValue(rgbSpace.red, 255, alpha);
		const blendedG = this.#blendColorValue(rgbSpace.green, 255, alpha);
		const blendedB = this.#blendColorValue(rgbSpace.blue, 255, alpha);

		return `#${this.#hexifyColorValue(blendedR, blendedG, blendedB)}`;
	}

	public toHex(): string {
		const rgbSpace = this.#getColorInSpace("RGB");

		return `#${this.#hexifyColorValue(rgbSpace.red, rgbSpace.green, rgbSpace.blue)}${typeof rgbSpace.alpha === "number" ? this.#hexifyColorValue(rgbSpace.alpha * 255) : ""}`;
	}

	// !SECTION - HEX
	// SECTION - RGB

	public toRGB(): RGBParsedColor {
		return this.#getColorInSpace("RGB");
	}

	public toRGBString(): string {
		const rgbSpace = this.#getColorInSpace("RGB");

		return `rgb(${rgbSpace.red} ${rgbSpace.green} ${rgbSpace.blue}${typeof rgbSpace.alpha === "number" ? ` / ${rgbSpace.alpha}` : ""})`;
	}

	// !SECTION - RGB
	// SECTION - CMYK

	public toCMYK(): CMYKParsedColor {
		return this.#getColorInSpace("CMYK");
	}

	public toCMYKString(): string {
		const cmykSpace = this.#getColorInSpace("CMYK");

		return `device-cmyk(${cmykSpace.cyan} ${cmykSpace.magenta} ${cmykSpace.yellow} ${cmykSpace.key}${typeof cmykSpace.alpha === "number" ? ` / ${cmykSpace.alpha}` : ""})`;
	}

	// !SECTION - CMYK
	// SECTION - LAB

	public toLAB(): LABParsedColor {
		return this.#getColorInSpace("LAB");
	}

	public toLABString(): string {
		const labSpace = this.#getColorInSpace("LAB");

		return `lab(${labSpace.lightness}% ${labSpace.axisA} ${labSpace.axisB}${typeof labSpace.alpha === "number" ? ` / ${labSpace.alpha}` : ""})`;
	}

	// !SECTION - LAB
	// SECTION - OKLAB

	public toOKLAB(): OKLABParsedColor {
		return this.#getColorInSpace("OKLAB");
	}

	public toOKLABString(): string {
		const oklabSpace = this.#getColorInSpace("OKLAB");

		return `oklab(${oklabSpace.lightness}% ${oklabSpace.axisA} ${oklabSpace.axisB}${typeof oklabSpace.alpha === "number" ? ` / ${oklabSpace.alpha}` : ""})`;
	}

	// !SECTION - OKLAB
	// SECTION - LCH

	public toLCH(): LCHParsedColor {
		return this.#getColorInSpace("LCH");
	}

	public toLCHString(): string {
		const lchSpace = this.#getColorInSpace("LCH");

		return `lch(${lchSpace.lightness}% ${lchSpace.chroma} ${lchSpace.hue}${typeof lchSpace.alpha === "number" ? ` / ${lchSpace.alpha}` : ""})`;
	}

	// !SECTION - LCH
	// SECTION - OKLCH

	public toOKLCH(): OKLCHParsedColor {
		return this.#getColorInSpace("OKLCH");
	}

	public toOKLCHString(): string {
		const oklchSpace = this.#getColorInSpace("OKLCH");

		return `oklch(${oklchSpace.lightness}% ${oklchSpace.chroma} ${oklchSpace.hue}${typeof oklchSpace.alpha === "number" ? ` / ${oklchSpace.alpha}` : ""})`;
	}

	// !SECTION - OKLCH
	// SECTION - HSL

	public toHSL(): HSLParsedColor {
		return this.#getColorInSpace("HSL");
	}

	public toHSLString(): string {
		const hslSpace = this.#getColorInSpace("HSL");

		return `hsl(${hslSpace.hue}deg ${hslSpace.saturation}% ${hslSpace.lightness}%${typeof hslSpace.alpha === "number" ? ` / ${hslSpace.alpha}` : ""})`;
	}

	// !SECTION - HSL
	// SECTION - HWB

	public toHWB(): HWBParsedColor {
		return this.#getColorInSpace("HWB");
	}

	public toHWBString(): string {
		const hwbSpace = this.#getColorInSpace("HWB");

		return `hwb(${hwbSpace.hue}deg ${hwbSpace.whiteness}% ${hwbSpace.blackness}%${typeof hwbSpace.alpha === "number" ? ` / ${hwbSpace.alpha}` : ""})`;
	}

	// !SECTION - HWB
	// !SECTION - Public conversion
	// SECTION - Color space converion

	#getColorInSpace<T extends ParsedColor["type"]>(space: T): Extract<ParsedColor, { type: T }> {
		switch (space) {
			case "RGB": {
				return this.#convertToRGB() as Extract<ParsedColor, { type: T }>;
			}
			case "CMYK": {
				return this.#convertToCMYK() as Extract<ParsedColor, { type: T }>;
			}
			case "LAB": {
				return this.#convertToLAB() as Extract<ParsedColor, { type: T }>;
			}
			case "OKLAB": {
				return this.#convertToOKLAB() as Extract<ParsedColor, { type: T }>;
			}
			case "LCH": {
				return this.#convertToLCH() as Extract<ParsedColor, { type: T }>;
			}
			case "OKLCH": {
				return this.#convertToOKLCH() as Extract<ParsedColor, { type: T }>;
			}
			case "HSL": {
				return this.#convertToHSL() as Extract<ParsedColor, { type: T }>;
			}
			case "HWB": {
				return this.#convertToHWB() as Extract<ParsedColor, { type: T }>;
			}
		}
	}

	// SECTION - RGB

	#convertToRGB(): RGBParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				return this.#color;
			}
			case "CMYK": {
				break;
			}
			case "LAB": {
				break;
			}
			case "OKLAB": {
				break;
			}
			case "LCH": {
				break;
			}
			case "OKLCH": {
				break;
			}
			case "HSL": {
				break;
			}
			case "HWB": {
				break;
			}
		}

		// TODO: Remove error once all conversions are written
		throw new ColorError(`Tried to convert an unsupported color type to RGB: ${this.#color.type}`);
	}

	// !SECTION - RGB
	// SECTION - CMYK

	#convertToCMYK(): CMYKParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				break;
			}
			case "CMYK": {
				return this.#color;
			}
			case "LAB": {
				break;
			}
			case "OKLAB": {
				break;
			}
			case "LCH": {
				break;
			}
			case "OKLCH": {
				break;
			}
			case "HSL": {
				break;
			}
			case "HWB": {
				break;
			}
		}

		// TODO: Remove error once all conversions are written
		throw new ColorError(`Tried to convert an unsupported color type to CMYK: ${this.#color.type}`);
	}

	// !SECTION - CMYK
	// SECTION - LAB

	#convertToLAB(): LABParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				break;
			}
			case "CMYK": {
				break;
			}
			case "LAB": {
				return this.#color;
			}
			case "OKLAB": {
				break;
			}
			case "LCH": {
				break;
			}
			case "OKLCH": {
				break;
			}
			case "HSL": {
				break;
			}
			case "HWB": {
				break;
			}
		}

		// TODO: Remove error once all conversions are written
		throw new ColorError(`Tried to convert an unsupported color type to LAB: ${this.#color.type}`);
	}

	// !SECTION - LAB
	// SECTION - OKLAB

	#convertToOKLAB(): OKLABParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				break;
			}
			case "CMYK": {
				break;
			}
			case "LAB": {
				break;
			}
			case "OKLAB": {
				return this.#color;
			}
			case "LCH": {
				break;
			}
			case "OKLCH": {
				break;
			}
			case "HSL": {
				break;
			}
			case "HWB": {
				break;
			}
		}

		// TODO: Remove error once all conversions are written
		throw new ColorError(`Tried to convert an unsupported color type to OKLAB: ${this.#color.type}`);
	}

	// !SECTION - OKLAB
	// SECTION - LCH

	#convertToLCH(): LCHParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				break;
			}
			case "CMYK": {
				break;
			}
			case "LAB": {
				break;
			}
			case "OKLAB": {
				break;
			}
			case "LCH": {
				return this.#color;
			}
			case "OKLCH": {
				break;
			}
			case "HSL": {
				break;
			}
			case "HWB": {
				break;
			}
		}

		// TODO: Remove error once all conversions are written
		throw new ColorError(`Tried to convert an unsupported color type to LCH: ${this.#color.type}`);
	}

	// !SECTION - LCH
	// SECTION - OKLCH

	#convertToOKLCH(): OKLCHParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				break;
			}
			case "CMYK": {
				break;
			}
			case "LAB": {
				break;
			}
			case "OKLAB": {
				break;
			}
			case "LCH": {
				break;
			}
			case "OKLCH": {
				return this.#color;
			}
			case "HSL": {
				break;
			}
			case "HWB": {
				break;
			}
		}

		// TODO: Remove error once all conversions are written
		throw new ColorError(`Tried to convert an unsupported color type to OKLCH: ${this.#color.type}`);
	}

	// !SECTION - OKLCH
	// SECTION - HSL

	#convertToHSL(): HSLParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				break;
			}
			case "CMYK": {
				break;
			}
			case "LAB": {
				break;
			}
			case "OKLAB": {
				break;
			}
			case "LCH": {
				break;
			}
			case "OKLCH": {
				break;
			}
			case "HSL": {
				return this.#color;
			}
			case "HWB": {
				break;
			}
		}

		// TODO: Remove error once all conversions are written
		throw new ColorError(`Tried to convert an unsupported color type to HSL: ${this.#color.type}`);
	}

	// !SECTION - HSL
	// SECTION - HWB

	#convertToHWB(): HWBParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				break;
			}
			case "CMYK": {
				break;
			}
			case "LAB": {
				break;
			}
			case "OKLAB": {
				break;
			}
			case "LCH": {
				break;
			}
			case "OKLCH": {
				break;
			}
			case "HSL": {
				break;
			}
			case "HWB": {
				return this.#color;
			}
		}

		// TODO: Remove error once all conversions are written
		throw new ColorError(`Tried to convert an unsupported color type to HWB: ${this.#color.type}`);
	}

	// !SECTION - HWB
	// !SECTION - Color space conversion
	// SECTION - Color blending

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

	// !SECTION - Color blending
	// SECTION - Parsing

	#clampIntoRange(floor: number, value: number, ceil: number): number;
	#clampIntoRange(floor: number, value: number | null, ceil: number): number | null;
	#clampIntoRange(floor: number, value: number | null, ceil: number): number | null {
		if (typeof value !== "number") {
			return value;
		}

		return Math.min(Math.max(value, floor), ceil);
	}

	#parsePercentage(value: string, isPercentage: boolean, scale: 1 | 100 | 255): number;
	#parsePercentage(value: string | null, isPercentage: boolean, scale: 1 | 100 | 255): number | null;
	#parsePercentage(value: string | null = "none", isPercentage: boolean, scale: 1 | 100 | 255): number | null {
		if (value === null) {
			return null;
		}

		if (value === "none") {
			return 0;
		}

		const parsed = Number.parseFloat(value);

		if (Number.isNaN(parsed)) {
			throw new ColorError("Failed to parse percentage value");
		}

		if (!isPercentage) {
			return parsed;
		}

		switch (scale) {
			case 1: {
				return parsed / 100;
			}
			case 100: {
				return parsed;
			}
			case 255: {
				return (255 / 100) * parsed;
			}
		}
	}

	#parseAngleValue(value: string = "none", type: string = "deg") {
		if (value === "none") {
			return 0;
		}

		const parsed = Number.parseFloat(value);

		if (Number.isNaN(parsed)) {
			throw new ColorError("Failed to parse angle value");
		}

		let converted = parsed;

		switch (type) {
			case "deg": {
				break;
			}
			case "grad": {
				converted = (parsed / 400) * 360;

				break;
			}
			case "rad": {
				converted = parsed * (180 / Math.PI);

				break;
			}
			case "turn": {
				converted = parsed * 360;

				break;
			}
			default: {
				throw new ColorError("Failed to determine angle value type");
			}
		}

		return converted % 360;
	}

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
	// SECTION - RGB

	static #rgbRegex =
		/^rgba?\((-?\d+(?:\.\d+)?|\.\d+|none)(%)?(?: +|,) *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?(?: +|,) *(-?\d+(?:\.\d+)?|\.\d+|none)(%)? *(?:(?:\/|,) *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

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

			return {
				type: "RGB",
				red: this.#clampIntoRange(0, this.#parsePercentage(r, rIsPercentage, 255), 255),
				green: this.#clampIntoRange(0, this.#parsePercentage(g, gIsPercentage, 255), 255),
				blue: this.#clampIntoRange(0, this.#parsePercentage(b, bIsPercentage, 255), 255),
				alpha: this.#clampIntoRange(0, this.#parsePercentage(a, aIsPercentage, 1), 1),
			};
		}

		return null;
	}

	// !SECTION - RGB
	// SECTION - CMYK

	static #cmykRegex =
		/^(?:device-)?cmyk\((-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? *(?:\/ *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

	#parseCmyk(color: string): CMYKParsedColor | null {
		const match = color.match(Color.#cmykRegex);

		if (match) {
			const c = match[1];
			const cIsPercentage = !!match[2];
			const m = match[3];
			const mIsPercentage = !!match[4];
			const y = match[5];
			const yIsPercentage = !!match[6];
			const k = match[7];
			const kIsPercentage = !!match[8];
			const alpha = match[9] || null;
			const alphaIsPercentage = !!match[10];

			return {
				type: "CMYK",
				cyan: this.#clampIntoRange(0, this.#parsePercentage(c, cIsPercentage, 1), 1),
				magenta: this.#clampIntoRange(0, this.#parsePercentage(m, mIsPercentage, 1), 1),
				yellow: this.#clampIntoRange(0, this.#parsePercentage(y, yIsPercentage, 1), 1),
				key: this.#clampIntoRange(0, this.#parsePercentage(k, kIsPercentage, 1), 1),
				alpha: this.#clampIntoRange(0, this.#parsePercentage(alpha, alphaIsPercentage, 1), 1),
			};
		}

		return null;
	}

	// !SECTION - CMYK
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

			let axisA = a === "none" ? 0 : Number.parseFloat(a);

			if (Number.isNaN(axisA)) {
				throw new ColorError(
					"Failed to parse color string: Failed to parse LAB A axis value into a color number",
				);
			}

			if (aIsPercentage) {
				axisA *= 1.25;
			}

			let axisB = b === "none" ? 0 : Number.parseFloat(b);

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
				lightness: this.#clampIntoRange(0, this.#parsePercentage(l, true, 100), 100),
				axisA: this.#clampIntoRange(-125, axisA, 125),
				axisB: this.#clampIntoRange(-125, axisB, 125),
				alpha: this.#clampIntoRange(0, this.#parsePercentage(alpha, alphaIsPercentage, 1), 1),
			};
		}

		return null;
	}

	// !SECTION - LAB
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

			let axisA = a === "none" ? 0 : Number.parseFloat(a);

			if (Number.isNaN(axisA)) {
				throw new ColorError("Failed to parse A axis value");
			}

			if (aIsPercentage) {
				axisA = (0.4 / 100) * axisA;
			}

			let axisB = b === "none" ? 0 : Number.parseFloat(b);

			if (Number.isNaN(axisB)) {
				throw new ColorError("Failed to parse B axis value");
			}

			if (bIsPercentage) {
				axisB = (0.4 / 100) * axisB;
			}

			return {
				type: "OKLAB",
				lightness: this.#clampIntoRange(0, this.#parsePercentage(l, true, 100), 100),
				axisA: this.#clampIntoRange(-0.4, axisA, 0.4),
				axisB: this.#clampIntoRange(-0.4, axisB, 0.4),
				alpha: this.#clampIntoRange(0, this.#parsePercentage(alpha, alphaIsPercentage, 1), 1),
			};
		}

		return null;
	}

	// !SECTION - OKLAB
	// SECTION - LCH

	static #lchRegex =
		/^lch\((-?\d+(?:\.\d+)?|\.\d+|none)%? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(deg|grad|rad|turn)? *(?:\/ *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

	#parseLch(color: string): LCHParsedColor | null {
		const match = color.match(Color.#lchRegex);

		if (match) {
			const l = match[1];
			const c = match[2];
			const cIsPercentage = !!match[3];
			const h = match[4];
			const hAngleType = match[5];
			const alpha = match[6] || null;
			const alphaIsPercentage = !!match[7];

			let chroma = c === "none" ? 0 : Number.parseFloat(c);

			if (Number.isNaN(chroma)) {
				throw new ColorError("Failed to parse chroma value");
			}

			if (cIsPercentage) {
				chroma *= 1.5;
			}

			return {
				type: "LCH",
				lightness: this.#clampIntoRange(0, this.#parsePercentage(l, true, 100), 100),
				chroma: this.#clampIntoRange(0, chroma, 150),
				hue: this.#parseAngleValue(h, hAngleType),
				alpha: this.#clampIntoRange(0, this.#parsePercentage(alpha, alphaIsPercentage, 1), 1),
			};
		}

		return null;
	}

	// !SECTION - LCH
	// SECTION - OKLCH

	static #oklchRegex =
		/^oklch\((-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(%)? +(-?\d+(?:\.\d+)?|\.\d+|none)(deg|grad|rad|turn)? *(?:\/ *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

	#parseOklch(color: string): OKLCHParsedColor | null {
		const match = color.match(Color.#oklchRegex);

		if (match) {
			const l = match[1];
			const lIsPercentage = !!match[2];
			const c = match[3];
			const cIsPercentage = !!match[4];
			const h = match[5];
			const hAngleType = match[6];
			const alpha = match[7] || null;
			const alphaIsPercentage = !!match[8];

			let chroma = c === "none" ? 0 : Number.parseFloat(c);

			if (Number.isNaN(chroma)) {
				throw new ColorError("Failed to parse chroma value");
			}

			if (cIsPercentage) {
				chroma = (0.4 / 100) * chroma;
			}

			return {
				type: "OKLCH",
				lightness: this.#clampIntoRange(0, this.#parsePercentage(l, lIsPercentage, 1), 1),
				chroma: this.#clampIntoRange(0, chroma, 0.4),
				hue: this.#parseAngleValue(h, hAngleType),
				alpha: this.#clampIntoRange(0, this.#parsePercentage(alpha, alphaIsPercentage, 1), 1),
			};
		}

		return null;
	}

	// !SECTION - OKHLC
	// SECTION - HSL

	static #hslRegex =
		/^hsla?\((-?\d+(?:\.\d+)?|\.\d+|none)(deg|grad|rad|turn)?(?: +| *, *)(-?\d+(?:\.\d+)?|\.\d+|none)%?(?: +| *, *)(-?\d+(?:\.\d+)?|\.\d+|none)%? *(?:(?:\/|,) *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

	#parseHsl(color: string): HSLParsedColor | null {
		const match = color.match(Color.#hslRegex);

		if (match) {
			const h = match[1];
			const hAngleType = match[2];
			const s = match[3];
			const l = match[4];
			const alpha = match[5] || null;
			const alphaIsPercentage = !!match[6];

			return {
				type: "HSL",
				hue: this.#parseAngleValue(h, hAngleType),
				saturation: this.#clampIntoRange(0, this.#parsePercentage(s, true, 100), 100),
				lightness: this.#clampIntoRange(0, this.#parsePercentage(l, true, 100), 100),
				alpha: this.#clampIntoRange(0, this.#parsePercentage(alpha, alphaIsPercentage, 1), 1),
			};
		}

		return null;
	}

	// !SECTION - HSL
	// SECTION - HWB

	static #hwbRegex =
		/^hwb\((-?\d+(?:\.\d+)?|\.\d+|none)(deg|grad|rad|turn)? +(-?\d+(?:\.\d+)?|\.\d+|none)%? +(-?\d+(?:\.\d+)?|\.\d+|none)%? *(?:\/ *(-?\d+(?:\.\d+)?|\.\d+|none)(%)?)? *\)$/;

	#parseHwb(color: string): HWBParsedColor | null {
		const match = color.match(Color.#hwbRegex);

		if (match) {
			const h = match[1];
			const hAngleType = match[2];
			const w = match[3];
			const b = match[4];
			const alpha = match[5] || null;
			const alphaIsPercentage = !!match[6];

			return {
				type: "HWB",
				hue: this.#parseAngleValue(h, hAngleType),
				whiteness: this.#clampIntoRange(0, this.#parsePercentage(w, true, 100), 100),
				blackness: this.#clampIntoRange(0, this.#parsePercentage(b, true, 100), 100),
				alpha: this.#clampIntoRange(0, this.#parsePercentage(alpha, alphaIsPercentage, 1), 1),
			};
		}

		return null;
	}

	// !SECTION - HWB
	// SECTION - Named colors

	// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/named-color#value
	#namedColors: Record<NamedColor, Omit<RGBParsedColor, "type"> | string> = {
		aliceblue: "#f0f8ff",
		antiquewhite: "#faebd7",
		aqua: "#00ffff",
		aquamarine: "#7fffd4",
		azure: "#f0ffff",
		beige: "#f5f5dc",
		bisque: "#ffe4c4",
		black: "#000000",
		blanchedalmond: "#ffebcd",
		blue: "#0000ff",
		blueviolet: "#8a2be2",
		brown: "#a52a2a",
		burlywood: "#deb887",
		cadetblue: "#5f9ea0",
		chartreuse: "#7fff00",
		chocolate: "#d2691e",
		coral: "#ff7f50",
		cornflowerblue: "#6495ed",
		cornsilk: "#fff8dc",
		crimson: "#dc143c",
		cyan: "#00ffff",
		darkblue: "#00008b",
		darkcyan: "#008b8b",
		darkgoldenrod: "#b8860b",
		darkgray: "#a9a9a9",
		darkgreen: "#006400",
		darkgrey: "#a9a9a9",
		darkkhaki: "#bdb76b",
		darkmagenta: "#8b008b",
		darkolivegreen: "#556b2f",
		darkorange: "#ff8c00",
		darkorchid: "#9932cc",
		darkred: "#8b0000",
		darksalmon: "#e9967a",
		darkseagreen: "#8fbc8f",
		darkslateblue: "#483d8b",
		darkslategray: "#2f4f4f",
		darkslategrey: "#2f4f4f",
		darkturquoise: "#00ced1",
		darkviolet: "#9400d3",
		deeppink: "#ff1493",
		deepskyblue: "#00bfff",
		dimgray: "#696969",
		dimgrey: "#696969",
		dodgerblue: "#1e90ff",
		firebrick: "#b22222",
		floralwhite: "#fffaf0",
		forestgreen: "#228b22",
		fuchsia: "#ff00ff",
		gainsboro: "#dcdcdc",
		ghostwhite: "#f8f8ff",
		gold: "#ffd700",
		goldenrod: "#daa520",
		gray: "#808080",
		green: "#008000",
		greenyellow: "#adff2f",
		grey: "#808080",
		honeydew: "#f0fff0",
		hotpink: "#ff69b4",
		indianred: "#cd5c5c",
		indigo: "#4b0082",
		ivory: "#fffff0",
		khaki: "#f0e68c",
		lavender: "#e6e6fa",
		lavenderblush: "#fff0f5",
		lawngreen: "#7cfc00",
		lemonchiffon: "#fffacd",
		lightblue: "#add8e6",
		lightcoral: "#f08080",
		lightcyan: "#e0ffff",
		lightgoldenrodyellow: "#fafad2",
		lightgray: "#d3d3d3",
		lightgreen: "#90ee90",
		lightgrey: "#d3d3d3",
		lightpink: "#ffb6c1",
		lightsalmon: "#ffa07a",
		lightseagreen: "#20b2aa",
		lightskyblue: "#87cefa",
		lightslategray: "#778899",
		lightslategrey: "#778899",
		lightsteelblue: "#b0c4de",
		lightyellow: "#ffffe0",
		lime: "#00ff00",
		limegreen: "#32cd32",
		linen: "#faf0e6",
		magenta: "#ff00ff",
		maroon: "#800000",
		mediumaquamarine: "#66cdaa",
		mediumblue: "#0000cd",
		mediumorchid: "#ba55d3",
		mediumpurple: "#9370db",
		mediumseagreen: "#3cb371",
		mediumslateblue: "#7b68ee",
		mediumspringgreen: "#00fa9a",
		mediumturquoise: "#48d1cc",
		mediumvioletred: "#c71585",
		midnightblue: "#191970",
		mintcream: "#f5fffa",
		mistyrose: "#ffe4e1",
		moccasin: "#ffe4b5",
		navajowhite: "#ffdead",
		navy: "#000080",
		oldlace: "#fdf5e6",
		olive: "#808000",
		olivedrab: "#6b8e23",
		orange: "#ffa500",
		orangered: "#ff4500",
		orchid: "#da70d6",
		palegoldenrod: "#eee8aa",
		palegreen: "#98fb98",
		paleturquoise: "#afeeee",
		palevioletred: "#db7093",
		papayawhip: "#ffefd5",
		peachpuff: "#ffdab9",
		peru: "#cd853f",
		pink: "#ffc0cb",
		plum: "#dda0dd",
		powderblue: "#b0e0e6",
		purple: "#800080",
		rebeccapurple: "#663399",
		red: "#ff0000",
		rosybrown: "#bc8f8f",
		royalblue: "#4169e1",
		saddlebrown: "#8b4513",
		salmon: "#fa8072",
		sandybrown: "#f4a460",
		seagreen: "#2e8b57",
		seashell: "#fff5ee",
		sienna: "#a0522d",
		silver: "#c0c0c0",
		skyblue: "#87ceeb",
		slateblue: "#6a5acd",
		slategray: "#708090",
		slategrey: "#708090",
		snow: "#fffafa",
		springgreen: "#00ff7f",
		steelblue: "#4682b4",
		tan: "#d2b48c",
		teal: "#008080",
		thistle: "#d8bfd8",
		tomato: "#ff6347",
		transparent: {
			red: 0,
			green: 0,
			blue: 0,
			alpha: 0,
		},
		turquoise: "#40e0d0",
		violet: "#ee82ee",
		wheat: "#f5deb3",
		white: "#ffffff",
		whitesmoke: "#f5f5f5",
		yellow: "#ffff00",
		yellowgreen: "#9acd32",
	};

	// !SECTION - Named colors

	#parseColorString(color: string): ParsedColor {
		if (color in this.#namedColors) {
			const namedColor = this.#namedColors[color as NamedColor];

			if (typeof namedColor === "string") {
				const hex = this.#parseHex(namedColor);

				if (!hex) {
					throw new ColorError("Failed to parse named color");
				}

				return hex;
			}

			return {
				type: "RGB",
				alpha: null,
				...namedColor,
			};
		}

		const hex = this.#parseHex(color);

		if (hex) {
			return hex;
		}

		const rgb = this.#parseRGB(color);

		if (rgb) {
			return rgb;
		}

		const cmyk = this.#parseCmyk(color);

		if (cmyk) {
			return cmyk;
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

		const hwb = this.#parseHwb(color);

		if (hwb) {
			return hwb;
		}

		throw new ColorError("Failed to parse color string: Unknown or invalid format.");
	}

	// !SECTION
}
