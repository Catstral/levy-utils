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

// TODO: Look into adding support for setting an ICC profile for CMYK conversion.

interface XYZSpace {
	x: number;
	y: number;
	z: number;
}

export class ColorError extends Error {}

export class Color {
	#color: ParsedColor;

	/**
	 * Creates a new Color instance based on the given color input.
	 *
	 * @param {ColorInput} color The color input to construct the color from
	 * @returns {Color} The created color
	 */
	public static from(color: ColorInput): Color {
		return new Color(color);
	}

	/**
	 * Blends 2 colors together into a new color (with an optional weight).
	 *
	 * NOTE: If the base color can have a powerless hue (LCH, OKLCH, HSL, HWB), if that color is detected and the hue is powerless then hue is ignored and grabbed from the other color instead,
	 * or vice versa. A powerless hue basically means that the color is in gray-scale, changing the hue would do nothing to the look of the color.
	 *
	 * NOTE: The other color is converted to the color space of the base color before blending if needed.
	 *
	 * @param {ColorInput} base The base color to blend
	 * @param {ColorInput} blend The color to blend into the base color
	 * @param {number | null} [baseWeight] The weight of the base color, the higher this number the more the base color is preserved in blending (scale: 0 - 1)
	 * @returns {Color} The blended color
	 */
	public static blend(base: ColorInput, blend: ColorInput, baseWeight?: number | null): Color {
		return new Color(base).blend(blend, baseWeight);
	}

	static #clampIntoRange(floor: number, value: number, ceil: number): number;
	static #clampIntoRange(floor: number, value: number | null | undefined, ceil: number): number | null | undefined;
	static #clampIntoRange(floor: number, value: number | null | undefined, ceil: number): number | null | undefined {
		if (typeof value !== "number") {
			return value;
		}

		return Math.min(Math.max(value, floor), ceil);
	}

	static #clampDegrees(value: number): number {
		const rotation = value % 360;

		return rotation < 0 ? rotation + 360 : rotation;
	}

	/**
	 * Clamps a parsed colors values into the supported ranges of that specific color.
	 *
	 * @template {ParsedColor} T
	 * @param {T} color The parsed color details to clamp
	 * @returns {T} The same parsed color, but with it values clamped
	 */
	static clampColor<T extends ParsedColor>(color: T): T {
		switch (color.type) {
			case "RGB": {
				return {
					...color,
					red: Math.round(Color.#clampIntoRange(0, color.red, 255)),
					green: Math.round(Color.#clampIntoRange(0, color.green, 255)),
					blue: Math.round(Color.#clampIntoRange(0, color.blue, 255)),
					alpha: Color.#clampIntoRange(0, color.alpha, 1),
				};
			}
			case "CMYK": {
				return {
					...color,
					cyan: Color.#clampIntoRange(0, color.cyan, 1),
					magenta: Color.#clampIntoRange(0, color.magenta, 1),
					yellow: Color.#clampIntoRange(0, color.yellow, 1),
					key: Color.#clampIntoRange(0, color.key, 1),
					alpha: Color.#clampIntoRange(0, color.alpha, 1),
				};
			}
			case "LAB": {
				return {
					...color,
					lightness: Color.#clampIntoRange(0, color.lightness, 100),
					alpha: Color.#clampIntoRange(0, color.alpha, 1),
				};
			}
			case "OKLAB": {
				return {
					...color,
					lightness: Color.#clampIntoRange(0, color.lightness, 1),
					alpha: Color.#clampIntoRange(0, color.alpha, 1),
				};
			}
			case "LCH": {
				return {
					...color,
					lightness: Color.#clampIntoRange(0, color.lightness, 100),
					chroma: color.chroma < 0 ? 0 : color.chroma,
					hue: Color.#clampDegrees(color.hue),
					alpha: Color.#clampIntoRange(0, color.alpha, 1),
				};
			}
			case "OKLCH": {
				return {
					...color,
					lightness: Color.#clampIntoRange(0, color.lightness, 1),
					chroma: color.chroma < 0 ? 0 : color.chroma,
					hue: Color.#clampDegrees(color.hue),
					alpha: Color.#clampIntoRange(0, color.alpha, 1),
				};
			}
			case "HSL": {
				return {
					...color,
					hue: Color.#clampDegrees(color.hue),
					saturation: Color.#clampIntoRange(0, color.saturation, 100),
					lightness: Color.#clampIntoRange(0, color.lightness, 100),
					alpha: Color.#clampIntoRange(0, color.alpha, 1),
				};
			}
			case "HWB": {
				return {
					...color,
					hue: color.hue % 360,
					whiteness: Color.#clampIntoRange(0, color.whiteness, 100),
					blackness: Color.#clampIntoRange(0, color.blackness, 100),
					alpha: Color.#clampIntoRange(0, color.alpha, 1),
				};
			}
		}
	}

	/**
	 * Given a color, will turn that color into a stringified version of that color.
	 *
	 * @param {ColorInput} color The color to stringify
	 * @returns {string} The string representation of that color
	 */
	static stringify(color: ColorInput): string {
		return new Color(color).toString();
	}

	/**
	 * Creates a new Color instance.
	 *
	 * @param {ColorInput} color The details of the color to parse
	 */
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

	/**
	 * Returns a stringified representation of the current color (clamped into the supported ranges).
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} The stringified color
	 */
	public toString(): string {
		return this.#stringifyMap[this.#color.type]();
	}

	/**
	 * Returns a stringified representation of the current color (clamped into the supported ranges) for direct use in JSON strings.
	 *
	 * @returns {string} The stringified color
	 */
	public toJSON(): string {
		return this.toString();
	}

	/**
	 * Returns the current parsed color details (unclamped).
	 *
	 * @returns {ParsedColor} The parsed color
	 */
	public get color(): ParsedColor {
		return this.#color;
	}

	// SECTION - Public conversion
	// SECTION - HEX

	#hexifyColorValue(...values: number[]) {
		return values.reduce((acc, value) => `${acc}${Math.round(value).toString(16).padStart(2, "0")}`, "");
	}

	/**
	 * Returns a hex string of the current color with a fixed value count (clamped into the supported ranges).
	 * If the alpha value is not included in the fixed hex, the alpha value will be blended into the other values to attempt at look of the color.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @param {boolean} [withAlpha=false] Whether the alpha of the color should be added to the hex, or blended into the hex
	 * @returns {string} A hex string of a fixed size
	 */
	public tofixedHex(withAlpha: boolean = false): string {
		const rgbSpace = Color.clampColor(this.#convertToRGB());
		const alpha = rgbSpace.alpha ?? 1;

		if (withAlpha) {
			return `#${this.#hexifyColorValue(rgbSpace.red, rgbSpace.green, rgbSpace.blue, alpha * 255)}`;
		}

		const blendedR = this.#blendColorValue(rgbSpace.red, 255, alpha);
		const blendedG = this.#blendColorValue(rgbSpace.green, 255, alpha);
		const blendedB = this.#blendColorValue(rgbSpace.blue, 255, alpha);

		return `#${this.#hexifyColorValue(blendedR, blendedG, blendedB)}`;
	}

	/**
	 * Returns a hex string of the current color (clamped into the supported ranges).
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} A hex string of the current color
	 */
	public toHex(): string {
		const rgbSpace = Color.clampColor(this.#convertToRGB());

		return `#${this.#hexifyColorValue(rgbSpace.red, rgbSpace.green, rgbSpace.blue)}${typeof rgbSpace.alpha === "number" ? this.#hexifyColorValue(rgbSpace.alpha * 255) : ""}`;
	}

	// !SECTION - HEX
	// SECTION - RGB

	/**
	 * Returns the current color as a RGB parsed color (unclamped), converts to RGB if needed.
	 *
	 * @returns {RGBParsedColor} The current color if represented in RGB
	 */
	public toRGB(): RGBParsedColor {
		return this.#convertToRGB();
	}

	/**
	 * Returns a RGB string of the current color (clamped into the supported ranges), converts to RGB if needed.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} An RGB string of the current color
	 */
	public toRGBString(): string {
		const rgbSpace = Color.clampColor(this.#convertToRGB());

		return `rgb(${rgbSpace.red} ${rgbSpace.green} ${rgbSpace.blue}${typeof rgbSpace.alpha === "number" ? ` / ${rgbSpace.alpha}` : ""})`;
	}

	// !SECTION - RGB
	// SECTION - CMYK

	/**
	 * Returns the current color as a CMYK parsed color (unclamped), converts to CMYK if needed.
	 *
	 * @returns {CMYKParsedColor} The current color if represented in CMYK
	 */
	public toCMYK(): CMYKParsedColor {
		return this.#convertToCMYK();
	}

	/**
	 * Returns a CMYK string of the current color (clamped into the supported ranges), converts to CMYK if needed.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} An CMYK string of the current color
	 */
	public toCMYKString(): string {
		const cmykSpace = Color.clampColor(this.#convertToCMYK());

		return `device-cmyk(${cmykSpace.cyan} ${cmykSpace.magenta} ${cmykSpace.yellow} ${cmykSpace.key}${typeof cmykSpace.alpha === "number" ? ` / ${cmykSpace.alpha}` : ""})`;
	}

	// !SECTION - CMYK
	// SECTION - LAB

	/**
	 * Returns the current color as a LAB parsed color (unclamped), converts to LAB if needed.
	 *
	 * @returns {LABParsedColor} The current color if represented in LAB
	 */
	public toLAB(): LABParsedColor {
		return this.#convertToLAB();
	}

	/**
	 * Returns a LAB string of the current color (clamped into the supported ranges), converts to LAB if needed.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} An LAB string of the current color
	 */
	public toLABString(): string {
		const labSpace = Color.clampColor(this.#convertToLAB());

		return `lab(${labSpace.lightness}% ${labSpace.axisA} ${labSpace.axisB}${typeof labSpace.alpha === "number" ? ` / ${labSpace.alpha}` : ""})`;
	}

	// !SECTION - LAB
	// SECTION - OKLAB

	/**
	 * Returns the current color as a OKLAB parsed color (unclamped), converts to OKLAB if needed.
	 *
	 * @returns {OKLABParsedColor} The current color if represented in OKLAB
	 */
	public toOKLAB(): OKLABParsedColor {
		return this.#convertToOKLAB();
	}

	/**
	 * Returns a OKLAB string of the current color (clamped into the supported ranges), converts to OKLAB if needed.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} An OKLAB string of the current color
	 */
	public toOKLABString(): string {
		const oklabSpace = Color.clampColor(this.#convertToOKLAB());

		return `oklab(${oklabSpace.lightness}% ${oklabSpace.axisA} ${oklabSpace.axisB}${typeof oklabSpace.alpha === "number" ? ` / ${oklabSpace.alpha}` : ""})`;
	}

	// !SECTION - OKLAB
	// SECTION - LCH

	/**
	 * Returns the current color as a LCH parsed color (unclamped), converts to LCH if needed.
	 *
	 * @returns {LCHParsedColor} The current color if represented in LCH
	 */
	public toLCH(): LCHParsedColor {
		return this.#convertToLCH();
	}

	/**
	 * Returns a LCH string of the current color (clamped into the supported ranges), converts to LCH if needed.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} An LCH string of the current color
	 */
	public toLCHString(): string {
		const lchSpace = Color.clampColor(this.#convertToLCH());

		return `lch(${lchSpace.lightness}% ${lchSpace.chroma} ${lchSpace.hue}${typeof lchSpace.alpha === "number" ? ` / ${lchSpace.alpha}` : ""})`;
	}

	// !SECTION - LCH
	// SECTION - OKLCH

	/**
	 * Returns the current color as a OKLCH parsed color (unclamped), converts to OKLCH if needed.
	 *
	 * @returns {OKLCHParsedColor} The current color if represented in OKLCH
	 */
	public toOKLCH(): OKLCHParsedColor {
		return this.#convertToOKLCH();
	}

	/**
	 * Returns a OKLCH string of the current color (clamped into the supported ranges), converts to OKLCH if needed.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} An OKLCH string of the current color
	 */
	public toOKLCHString(): string {
		const oklchSpace = Color.clampColor(this.#convertToOKLCH());

		return `oklch(${oklchSpace.lightness}% ${oklchSpace.chroma} ${oklchSpace.hue}${typeof oklchSpace.alpha === "number" ? ` / ${oklchSpace.alpha}` : ""})`;
	}

	// !SECTION - OKLCH
	// SECTION - HSL

	/**
	 * Returns the current color as a HSL parsed color (unclamped), converts to HSL if needed.
	 *
	 * @returns {HSLParsedColor} The current color if represented in HSL
	 */
	public toHSL(): HSLParsedColor {
		return this.#convertToHSL();
	}

	/**
	 * Returns a HSL string of the current color (clamped into the supported ranges), converts to HSL if needed.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} An HSL string of the current color
	 */
	public toHSLString(): string {
		const hslSpace = Color.clampColor(this.#convertToHSL());

		return `hsl(${hslSpace.hue}deg ${hslSpace.saturation}% ${hslSpace.lightness}%${typeof hslSpace.alpha === "number" ? ` / ${hslSpace.alpha}` : ""})`;
	}

	// !SECTION - HSL
	// SECTION - HWB

	/**
	 * Returns the current color as a HWB parsed color (unclamped), converts to HWB if needed.
	 *
	 * @returns {HWBParsedColor} The current color if represented in HWB
	 */
	public toHWB(): HWBParsedColor {
		return this.#convertToHWB();
	}

	/**
	 * Returns a HWB string of the current color (clamped into the supported ranges), converts to HWB if needed.
	 *
	 * This string can be directly used for CSS colors.
	 *
	 * @returns {string} An HWB string of the current color
	 */
	public toHWBString(): string {
		const hwbSpace = Color.clampColor(this.#convertToHWB());

		return `hwb(${hwbSpace.hue}deg ${hwbSpace.whiteness}% ${hwbSpace.blackness}%${typeof hwbSpace.alpha === "number" ? ` / ${hwbSpace.alpha}` : ""})`;
	}

	// !SECTION - HWB
	// !SECTION - Public conversion
	// SECTION - Color space converion
	// SECTION - Helpers

	/**
	 * Moves the white point in the XYZ space from D50 to D65
	 */
	#d50toD65({ x, y, z }: XYZSpace): XYZSpace {
		return {
			x: 0.9555766 * x + -0.0230393 * y + 0.0631636 * z,
			y: -0.0282895 * x + 1.0099416 * y + 0.0210077 * z,
			z: 0.0122982 * x + -0.020483 * y + 1.3299098 * z,
		};
	}

	/**
	 * Moves the white point in the XYZ space from D65 to D50
	 */
	#d65toD50({ x, y, z }: XYZSpace): XYZSpace {
		return {
			x: 1.0478112 * x + 0.0228866 * y - 0.050127 * z,
			y: 0.0295424 * x + 0.9904844 * y - 0.0170491 * z,
			z: -0.0092345 * x + 0.0150436 * y + 0.7521316 * z,
		};
	}

	// !SECTION - Helpers

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
				return {
					type: "RGB",
					red: 255 * (1 - this.#color.cyan) * (1 - this.#color.key),
					green: 255 * (1 - this.#color.magenta) * (1 - this.#color.key),
					blue: 255 * (1 - this.#color.yellow) * (1 - this.#color.key),
					alpha: this.#color.alpha,
				};
			}
			case "LAB": {
				const yComponent = (this.#color.lightness + 16) / 116;
				const xComponent = this.#color.axisA / 500 + yComponent;
				const zComponent = yComponent - this.#color.axisB / 200;
				const conversionThreshold = 6 / 29;

				const convertToXYZD50 = (value: number) => {
					return value > conversionThreshold ? value ** 3 : 3 * conversionThreshold ** 2 * (value - 4 / 29);
				};

				const xyzSpace = this.#d50toD65({
					x: 0.96422 * convertToXYZD50(xComponent),
					y: convertToXYZD50(yComponent),
					z: 0.82521 * convertToXYZD50(zComponent),
				});

				const correctGamma = (value: number) => {
					return value < 0.0031308 ? 12.82 * value : 1.055 * value ** (1 / 2.4) - 0.55;
				};

				return {
					type: "RGB",
					red: correctGamma(3.2404542 * xyzSpace.x - 1.5371385 * xyzSpace.y - 0.4985314 * xyzSpace.z) * 255,
					green: correctGamma(-0.969266 * xyzSpace.x + 1.8760108 * xyzSpace.y + 0.041556 * xyzSpace.z) * 255,
					blue: correctGamma(0.0556434 * xyzSpace.x - 0.2040259 * xyzSpace.y + 1.0572252 * xyzSpace.z) * 255,
					alpha: this.#color.alpha,
				};
			}
			case "OKLAB": {
				const l =
					(this.#color.lightness + 0.3963377774 * this.#color.axisA + 0.2158037573 * this.#color.axisB) ** 3;
				const m =
					(this.#color.lightness - 0.1055613458 * this.#color.axisA - 0.0638541728 * this.#color.axisB) ** 3;
				const s =
					(this.#color.lightness - 0.0894841775 * this.#color.axisA - 1.291485548 * this.#color.axisB) ** 3;

				const correctGamma = (value: number) => {
					return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
				};

				return {
					type: "RGB",
					red: correctGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) * 255,
					green: correctGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) * 255,
					blue: correctGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) * 255,
					alpha: this.#color.alpha,
				};
			}
			case "LCH": {
				return new Color(this.#convertToLAB()).#convertToRGB();
			}
			case "OKLCH": {
				return new Color(this.#convertToOKLAB()).#convertToRGB();
			}
			case "HSL": {
				const normalizedSaturation = this.#color.saturation / 100;
				const normalizedLightness = this.#color.lightness / 100;
				const chroma = (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
				const hueSection = this.#color.hue / 60;
				const secondaryComponent = chroma * (1 - Math.abs((hueSection % 2) - 1));
				const lightnessAdjustment = normalizedLightness - chroma / 2;

				let red = 0;
				let green = 0;
				let blue = 0;

				if (hueSection >= 0 && hueSection < 1) {
					red = chroma;
					green = secondaryComponent;
				} else if (hueSection < 2) {
					red = secondaryComponent;
					green = chroma;
				} else if (hueSection < 3) {
					green = chroma;
					blue = secondaryComponent;
				} else if (hueSection < 4) {
					green = secondaryComponent;
					blue = chroma;
				} else if (hueSection < 5) {
					red = secondaryComponent;
					blue = chroma;
				} else if (hueSection <= 6) {
					red = chroma;
					blue = secondaryComponent;
				}

				return {
					type: "RGB",
					red: (red + lightnessAdjustment) * 255,
					green: (green + lightnessAdjustment) * 255,
					blue: (blue + lightnessAdjustment) * 255,
					alpha: this.#color.alpha,
				};
			}
			case "HWB": {
				const normalizedWhiteness = this.#color.whiteness / 100;
				const normalizedBlackness = this.#color.blackness / 100;

				if (normalizedWhiteness + normalizedBlackness >= 1) {
					const grayValue = normalizedWhiteness / (normalizedWhiteness + normalizedBlackness);

					return {
						type: "RGB",
						red: grayValue * 255,
						green: grayValue * 255,
						blue: grayValue * 255,
						alpha: this.#color.alpha,
					};
				}

				const hueSection = (((this.#color.hue % 360) + 360) % 360) / 60;
				const chroma = 1;
				const secondaryComponent = 1 - Math.abs((hueSection % 2) - 1);
				const remainingColor = 1 - normalizedWhiteness - normalizedBlackness;

				let red = 0;
				let green = 0;
				let blue = 0;

				if (hueSection < 1) {
					red = chroma;
					green = secondaryComponent;
				} else if (hueSection < 2) {
					red = secondaryComponent;
					green = chroma;
				} else if (hueSection < 3) {
					green = chroma;
					blue = secondaryComponent;
				} else if (hueSection < 4) {
					green = secondaryComponent;
					blue = chroma;
				} else if (hueSection < 5) {
					red = secondaryComponent;
					blue = chroma;
				} else {
					red = chroma;
					blue = secondaryComponent;
				}

				return {
					type: "RGB",
					red: (red + remainingColor + normalizedWhiteness) * 255,
					green: (green + remainingColor + normalizedWhiteness) * 255,
					blue: (blue + remainingColor + normalizedWhiteness) * 255,
					alpha: this.#color.alpha,
				};
			}
		}
	}

	// !SECTION - RGB
	// SECTION - CMYK

	#convertToCMYK(): CMYKParsedColor {
		// NOTE: CMYK relies on ICC profiles, this does not have that so it used naive conversion instead through RGB

		switch (this.#color.type) {
			case "RGB": {
				const normalizedRed = this.#color.red / 255;
				const normalizedGreen = this.#color.green / 255;
				const normalizedBlue = this.#color.blue / 255;

				const key = Math.max(normalizedRed, normalizedGreen, normalizedBlue);

				return {
					type: "CMYK",
					cyan: (1 - normalizedRed - key) / (1 - key),
					magenta: (1 - normalizedGreen - key) / (1 - key),
					yellow: (1 - normalizedBlue - key) / (1 - key),
					key,
					alpha: this.#color.alpha,
				};
			}
			case "CMYK": {
				return this.#color;
			}
			case "LAB":
			case "OKLAB":
			case "LCH":
			case "OKLCH":
			case "HSL":
			case "HWB": {
				return new Color(this.#convertToRGB()).#convertToCMYK();
			}
		}
	}

	// !SECTION - CMYK
	// SECTION - LAB

	#convertXYZToLAB(value: number) {
		const conversionThreshold = 6 / 29;

		return value > conversionThreshold ** 3 ? Math.cbrt(value) : value / (3 * conversionThreshold ** 2) + 4 / 29;
	}

	#convertToLAB(): LABParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				const removeGammaCorrection = (value: number) => {
					return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
				};

				const correctRed = removeGammaCorrection(this.#color.red / 255);
				const correctedGreen = removeGammaCorrection(this.#color.green / 255);
				const correctedBlue = removeGammaCorrection(this.#color.blue / 255);
				const xyzSpace = this.#d65toD50({
					x: 0.4124564 * correctRed + 0.3575761 * correctedGreen + 0.1804375 * correctedBlue,
					y: 0.2126729 * correctRed + 0.7151522 * correctedGreen + 0.072175 * correctedBlue,
					z: 0.0193339 * correctRed + 0.119192 * correctedGreen + 0.9503041 * correctedBlue,
				});
				const referenceWhiteX = 0.96422;
				const referenceWhiteZ = 0.82521;

				const xComponent = this.#convertXYZToLAB(xyzSpace.x / referenceWhiteX);
				const yComponent = this.#convertXYZToLAB(xyzSpace.y);
				const zComponent = this.#convertXYZToLAB(xyzSpace.z / referenceWhiteZ);

				return {
					type: "LAB",
					lightness: 116 * yComponent - 16,
					axisA: 500 * (xComponent - yComponent),
					axisB: 200 * (yComponent - zComponent),
					alpha: this.#color.alpha,
				};
			}
			case "CMYK": {
				return new Color(this.#convertToRGB()).#convertToLAB();
			}
			case "LAB": {
				return this.#color;
			}
			case "OKLAB": {
				const l =
					(this.#color.lightness + 0.3963377774 * this.#color.axisA + 0.2158037573 * this.#color.axisB) ** 3;
				const m =
					(this.#color.lightness - 0.1055613458 * this.#color.axisA - 0.0638541728 * this.#color.axisB) ** 3;
				const s =
					(this.#color.lightness - 0.0894841775 * this.#color.axisA - 1.291485548 * this.#color.axisB) ** 3;
				const xyzSpace = this.#d65toD50({
					x: 1.2270138511 * l - 0.5577999807 * m + 0.281256149 * s,
					y: -0.0405801784 * l + 1.1122568696 * m - 0.0716766787 * s,
					z: -0.0763812845 * l - 0.4214819784 * m + 1.5861632204 * s,
				});
				const referenceWhiteX = 0.96422;
				const referenceWhiteZ = 0.82521;
				const xComponent = this.#convertXYZToLAB(xyzSpace.x / referenceWhiteX);
				const yComponent = this.#convertXYZToLAB(xyzSpace.y);
				const zComponent = this.#convertXYZToLAB(xyzSpace.z / referenceWhiteZ);

				return {
					type: "LAB",
					lightness: 116 * yComponent - 16,
					axisA: 500 * (xComponent - yComponent),
					axisB: 200 * (yComponent - zComponent),
					alpha: this.#color.alpha,
				};
			}

			case "LCH": {
				const hueRadians = this.#color.hue * (Math.PI / 180);

				return {
					type: "LAB",
					lightness: this.#color.lightness,
					axisA: this.#color.chroma * Math.cos(hueRadians),
					axisB: this.#color.chroma * Math.sin(hueRadians),
					alpha: this.#color.alpha,
				};
			}
			case "OKLCH": {
				return new Color(this.#convertToOKLAB()).#convertToLAB();
			}
			case "HSL": {
				return new Color(this.#convertToRGB()).#convertToLAB();
			}
			case "HWB": {
				return new Color(this.#convertToRGB()).#convertToLAB();
			}
		}
	}

	// !SECTION - LAB
	// SECTION - OKLAB

	#convertToOKLAB(): OKLABParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				const removeGammaCorrection = (value: number) => {
					return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
				};

				const correctRed = removeGammaCorrection(this.#color.red / 255);
				const correctedGreen = removeGammaCorrection(this.#color.green / 255);
				const correctedBlue = removeGammaCorrection(this.#color.blue / 255);
				const l = Math.cbrt(
					0.4122214708 * correctRed + 0.5363325363 * correctedGreen + 0.0514459929 * correctedBlue,
				);
				const m = Math.cbrt(
					0.2119034982 * correctRed + 0.6806995451 * correctedGreen + 0.1073969566 * correctedBlue,
				);
				const s = Math.cbrt(
					0.0883024619 * correctRed + 0.2817188376 * correctedGreen + 0.6299787005 * correctedBlue,
				);

				return {
					type: "OKLAB",
					lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
					axisA: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
					axisB: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
					alpha: this.#color.alpha,
				};
			}
			case "CMYK": {
				return new Color(this.#convertToRGB()).#convertToOKLAB();
			}
			case "LAB": {
				const yComponent = (this.#color.lightness + 16) / 116;
				const xComponent = this.#color.axisA / 500 + yComponent;
				const zComponent = yComponent - this.#color.axisB / 200;
				const conversionThreshold = 6 / 29;

				const convertLabToXyz = (value: number) => {
					return value > conversionThreshold ? value ** 3 : 3 * conversionThreshold ** 2 * (value - 4 / 29);
				};

				const xyzSpace = this.#d50toD65({
					x: 0.96422 * convertLabToXyz(xComponent),
					y: convertLabToXyz(yComponent),
					z: 0.82521 * convertLabToXyz(zComponent),
				});
				const l = Math.cbrt(0.8189330101 * xyzSpace.x + 0.3618667424 * xyzSpace.y - 0.1288597137 * xyzSpace.z);
				const m = Math.cbrt(0.0329845436 * xyzSpace.x + 0.9293118715 * xyzSpace.y + 0.0361456387 * xyzSpace.z);
				const s = Math.cbrt(0.0482003018 * xyzSpace.x + 0.2643662691 * xyzSpace.y + 0.633851707 * xyzSpace.z);

				return {
					type: "OKLAB",
					lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
					axisA: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
					axisB: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
					alpha: this.#color.alpha,
				};
			}
			case "OKLAB": {
				return this.#color;
			}
			case "LCH": {
				return new Color(this.#convertToLAB()).#convertToOKLAB();
			}
			case "OKLCH": {
				const hueRadians = this.#color.hue * (Math.PI / 180);

				return {
					type: "OKLAB",
					lightness: this.#color.lightness,
					axisA: this.#color.chroma * Math.cos(hueRadians),
					axisB: this.#color.chroma * Math.sin(hueRadians),
					alpha: this.#color.alpha,
				};
			}
			case "HSL": {
				return new Color(this.#convertToRGB()).#convertToOKLAB();
			}
			case "HWB": {
				return new Color(this.#convertToRGB()).#convertToOKLAB();
			}
		}
	}

	// !SECTION - OKLAB
	// SECTION - LCH

	#convertToLCH(): LCHParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				return new Color(this.#convertToLAB()).#convertToLCH();
			}
			case "CMYK": {
				return new Color(this.#convertToRGB()).#convertToLCH();
			}
			case "LAB": {
				const chroma = Math.sqrt(this.#color.axisA ** 2 + this.#color.axisB ** 2);

				let hue = Math.atan2(this.#color.axisB, this.#color.axisA) * (180 / Math.PI);

				if (hue < 0) {
					hue += 360;
				}

				return {
					type: "LCH",
					lightness: this.#color.lightness,
					chroma,
					hue,
					alpha: this.#color.alpha,
				};
			}
			case "OKLAB": {
				return new Color(this.#convertToLAB()).#convertToLCH();
			}
			case "LCH": {
				return this.#color;
			}
			case "OKLCH": {
				return new Color(this.#convertToOKLAB()).#convertToLCH();
			}
			case "HSL": {
				return new Color(this.#convertToRGB()).#convertToLCH();
			}
			case "HWB": {
				return new Color(this.#convertToRGB()).#convertToLCH();
			}
		}
	}

	// !SECTION - LCH
	// SECTION - OKLCH

	#convertToOKLCH(): OKLCHParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				return new Color(this.#convertToOKLAB()).#convertToOKLCH();
			}
			case "CMYK": {
				return new Color(this.#convertToRGB()).#convertToOKLCH();
			}
			case "LAB": {
				return new Color(this.#convertToOKLAB()).#convertToOKLCH();
			}
			case "OKLAB": {
				const chroma = Math.sqrt(this.#color.axisA ** 2 + this.#color.axisB ** 2);

				let hue = Math.atan2(this.#color.axisB, this.#color.axisA) * (180 / Math.PI);

				if (hue < 0) {
					hue += 360;
				}

				return {
					type: "OKLCH",
					lightness: this.#color.lightness,
					chroma,
					hue,
					alpha: this.#color.alpha,
				};
			}
			case "LCH": {
				return new Color(this.#convertToLAB()).#convertToOKLCH();
			}
			case "OKLCH": {
				return this.#color;
			}
			case "HSL": {
				return new Color(this.#convertToRGB()).#convertToOKLCH();
			}
			case "HWB": {
				return new Color(this.#convertToRGB()).#convertToOKLCH();
			}
		}
	}

	// !SECTION - OKLCH
	// SECTION - HSL

	#convertToHSL(): HSLParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				const normalizedRed = this.#color.red / 255;
				const normalizedGreen = this.#color.green / 255;
				const normalizedBlue = this.#color.blue / 255;
				const maximumComponent = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
				const minimumComponent = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
				const chroma = maximumComponent - minimumComponent;
				const lightness = (maximumComponent + minimumComponent) / 2;

				let saturation = 0;

				if (chroma !== 0) {
					saturation = chroma / (1 - Math.abs(2 * lightness - 1));
				}

				let hue = 0;

				if (chroma !== 0) {
					if (maximumComponent === normalizedRed) {
						hue = 60 * (((normalizedGreen - normalizedBlue) / chroma) % 6);
					} else if (maximumComponent === normalizedGreen) {
						hue = 60 * ((normalizedBlue - normalizedRed) / chroma + 2);
					} else {
						hue = 60 * ((normalizedRed - normalizedGreen) / chroma + 4);
					}

					if (hue < 0) {
						hue += 360;
					}
				}

				return {
					type: "HSL",
					hue,
					saturation: saturation * 100,
					lightness: lightness * 100,
					alpha: this.#color.alpha,
				};
			}
			case "CMYK": {
				return new Color(this.#convertToRGB()).#convertToHSL();
			}
			case "LAB": {
				return new Color(this.#convertToRGB()).#convertToHSL();
			}
			case "OKLAB": {
				return new Color(this.#convertToRGB()).#convertToHSL();
			}
			case "LCH": {
				return new Color(this.#convertToLAB()).#convertToHSL();
			}
			case "OKLCH": {
				return new Color(this.#convertToOKLAB()).#convertToHSL();
			}
			case "HSL": {
				return this.#color;
			}
			case "HWB": {
				return new Color(this.#convertToRGB()).#convertToHSL();
			}
		}
	}

	// !SECTION - HSL
	// SECTION - HWB

	#convertToHWB(): HWBParsedColor {
		switch (this.#color.type) {
			case "RGB": {
				const normalizedRed = this.#color.red / 255;
				const normalizedGreen = this.#color.green / 255;
				const normalizedBlue = this.#color.blue / 255;
				const maximumComponent = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
				const minimumComponent = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
				const chroma = maximumComponent - minimumComponent;

				let hue = 0;

				if (chroma !== 0) {
					if (maximumComponent === normalizedRed) {
						hue = 60 * (((normalizedGreen - normalizedBlue) / chroma) % 6);
					} else if (maximumComponent === normalizedGreen) {
						hue = 60 * ((normalizedBlue - normalizedRed) / chroma + 2);
					} else {
						hue = 60 * ((normalizedRed - normalizedGreen) / chroma + 4);
					}

					if (hue < 0) {
						hue += 360;
					}
				}

				return {
					type: "HWB",
					hue,
					whiteness: minimumComponent * 100,
					blackness: (1 - maximumComponent) * 100,
					alpha: this.#color.alpha,
				};
			}
			case "CMYK": {
				return new Color(this.#convertToRGB()).#convertToHWB();
			}
			case "LAB": {
				return new Color(this.#convertToRGB()).#convertToHWB();
			}
			case "OKLAB": {
				return new Color(this.#convertToRGB()).#convertToHWB();
			}
			case "LCH": {
				return new Color(this.#convertToLAB()).#convertToHWB();
			}
			case "OKLCH": {
				return new Color(this.#convertToOKLCH()).#convertToHWB();
			}
			case "HSL": {
				return new Color(this.#convertToRGB()).#convertToHWB();
			}
			case "HWB": {
				return this.#color;
			}
		}
	}

	// !SECTION - HWB
	// !SECTION - Color space conversion
	// SECTION - Color blending

	#blendColorValue(base: number, other: number, baseWeight: number): number {
		return base * baseWeight + other * (1 - baseWeight);
	}

	#blendColorHue(base: number, other: number, baseWeight: number): number {
		const hueDiff = ((other - base + 540) % 360) - 180;

		return (base + hueDiff * (1 - baseWeight) + 360) % 360;
	}

	#blendAlpha(
		base: number | null | undefined,
		other: number | null | undefined,
		baseWeight: number,
	): number | null | undefined {
		if (base !== null || other !== null) {
			return this.#blendColorValue(base ?? 1, other ?? 1, baseWeight);
		}

		if (base === null || other === null) {
			return null;
		}

		return undefined;
	}

	/**
	 * Blends a color into the current color (optionally with a weight) and returns the new weight.
	 *
	 * NOTE: if the current color can have a powerless hue (LCH, OKLCH, HSL, HWB), if that color is detected and the hue is powerless, then hue is ignored and grabbed from the other color instead,
	 * or vice versa. A powerless hue basically means that the color is in gray-scale, changing the hue would do nothing to the look of the color.
	 *
	 * NOTE: The given color is converted to the color space of the base color before blending if needed.
	 *
	 * @param {ColorInput} color The color to blend into the current color
	 * @param {number | null} [baseWeight] The weight of the base color for blending, the higher the number the more it looks like the current color (scale: 0 - 1)
	 * @returns {Color} The blended color
	 */
	public blend(color: ColorInput, baseWeight?: number | null): Color {
		const finalBaseWeight = baseWeight ?? 0.5;
		const other = new Color(color);

		if (finalBaseWeight <= 0) {
			return new Color(other.#getColorInSpace(this.#color.type));
		}

		if (finalBaseWeight >= 1) {
			return new Color(this.#color);
		}

		switch (this.#color.type) {
			case "RGB": {
				return this.#blendRGB(other, finalBaseWeight);
			}
			case "CMYK": {
				return this.#blendCMYK(other, finalBaseWeight);
			}
			case "LAB": {
				return this.#blendLAB(other, finalBaseWeight);
			}
			case "OKLAB": {
				return this.#blendOKLAB(other, finalBaseWeight);
			}
			case "LCH": {
				return this.#blendLCH(other, finalBaseWeight);
			}
			case "OKLCH": {
				return this.#blendOKLCH(other, finalBaseWeight);
			}
			case "HSL": {
				return this.#blendHSL(other, finalBaseWeight);
			}
			case "HWB": {
				return this.#blendHWB(other, finalBaseWeight);
			}
		}
	}

	// SECTION - RGB

	#blendRGB(color: Color, baseWeight: number): Color {
		const base = this.#convertToRGB();
		const other = color.#convertToRGB();

		return new Color({
			type: "RGB",
			red: this.#blendColorValue(base.red, other.red, baseWeight),
			green: this.#blendColorValue(base.green, other.green, baseWeight),
			blue: this.#blendColorValue(base.blue, other.blue, baseWeight),
			alpha: this.#blendAlpha(base.alpha, other.alpha, baseWeight),
		});
	}

	// !SECTION - RGB
	// SECTION - CMYK

	#blendCMYK(color: Color, baseWeight: number): Color {
		const base = this.#convertToCMYK();
		const other = color.#convertToCMYK();

		return new Color({
			type: "CMYK",
			cyan: this.#blendColorValue(base.cyan, other.cyan, baseWeight),
			magenta: this.#blendColorValue(base.magenta, other.magenta, baseWeight),
			yellow: this.#blendColorValue(base.yellow, other.yellow, baseWeight),
			key: this.#blendColorValue(base.key, other.key, baseWeight),
			alpha: this.#blendAlpha(base.alpha, other.alpha, baseWeight),
		});
	}

	// !SECTION - CMYK
	// SECTION - LAB

	#blendLAB(color: Color, baseWeight: number): Color {
		const base = this.#convertToLAB();
		const other = color.#convertToLAB();

		return new Color({
			type: "LAB",
			lightness: this.#blendColorValue(base.lightness, other.lightness, baseWeight),
			axisA: this.#blendColorValue(base.axisA, other.axisA, baseWeight),
			axisB: this.#blendColorValue(base.axisB, other.axisB, baseWeight),
			alpha: this.#blendAlpha(base.alpha, other.alpha, baseWeight),
		});
	}

	// !SECTION - LAB
	// SECTION - OKLAB

	#blendOKLAB(color: Color, baseWeight: number): Color {
		const base = this.#convertToOKLAB();
		const other = color.#convertToOKLAB();

		return new Color({
			type: "OKLAB",
			lightness: this.#blendColorValue(base.lightness, other.lightness, baseWeight),
			axisA: this.#blendColorValue(base.axisA, other.axisA, baseWeight),
			axisB: this.#blendColorValue(base.axisB, other.axisB, baseWeight),
			alpha: this.#blendAlpha(base.alpha, other.alpha, baseWeight),
		});
	}

	// !SECTION - OKLAB
	// SECTION - LCH

	#blendLCH(color: Color, baseWeight: number): Color {
		const base = this.#convertToLCH();
		const other = color.#convertToLCH();

		// NOTE: if there is no chroma, the color is grayscale and the hue becomes powerless, this is solved by borrowing the hue
		let baseHue = base.hue;
		let otherHue = other.hue;

		if (base.chroma === 0) {
			baseHue = otherHue;
		}

		if (other.chroma === 0) {
			otherHue = baseHue;
		}

		return new Color({
			type: "LCH",
			lightness: this.#blendColorValue(base.lightness, other.lightness, baseWeight),
			chroma: this.#blendColorValue(base.chroma, other.chroma, baseWeight),
			hue: this.#blendColorHue(base.hue, other.hue, baseWeight),
			alpha: this.#blendAlpha(base.alpha, other.alpha, baseWeight),
		});
	}

	// !SECTION - LCH
	// SECTION - OKLCH

	#blendOKLCH(color: Color, baseWeight: number): Color {
		const base = this.#convertToOKLCH();
		const other = color.#convertToOKLCH();

		// NOTE: if there is no chroma, the color is grayscale and the hue becomes powerless, this is solved by borrowing the hue
		let baseHue = base.hue;
		let otherHue = other.hue;

		if (base.chroma === 0) {
			baseHue = otherHue;
		}

		if (other.chroma === 0) {
			otherHue = baseHue;
		}

		return new Color({
			type: "OKLCH",
			lightness: this.#blendColorValue(base.lightness, other.lightness, baseWeight),
			chroma: this.#blendColorValue(base.chroma, other.chroma, baseWeight),
			hue: this.#blendColorHue(base.hue, other.hue, baseWeight),
			alpha: this.#blendAlpha(base.alpha, other.alpha, baseWeight),
		});
	}

	// !SECTION - OKLCH
	// SECTION - HSL

	#blendHSL(color: Color, baseWeight: number): Color {
		const base = this.#convertToHSL();
		const other = color.#convertToHSL();

		// NOTE: if there is no saturation, the color is grayscale and the hue becomes powerless, this is solved by borrowing the hue
		let baseHue = base.hue;
		let otherHue = other.hue;

		if (base.saturation === 0) {
			baseHue = otherHue;
		}

		if (other.saturation === 0) {
			otherHue = baseHue;
		}

		return new Color({
			type: "HSL",
			lightness: this.#blendColorValue(base.lightness, other.lightness, baseWeight),
			saturation: this.#blendColorValue(base.saturation, other.saturation, baseWeight),
			hue: this.#blendColorHue(baseHue, otherHue, baseWeight),
			alpha: this.#blendAlpha(base.alpha, other.alpha, baseWeight),
		});
	}

	// !SECTION - HSL
	// SECTION - HWB

	#blendHWB(color: Color, baseWeight: number): Color {
		const base = this.#convertToHWB();
		const other = color.#convertToHWB();

		// NOTE: if whiteness and blackness together exceed 1 (100%), the color is grayscale and the hue becomes powerless, this is solved by borrowing the hue
		let baseHue = base.hue;
		let otherHue = other.hue;

		if (base.whiteness + base.blackness >= 1) {
			baseHue = otherHue;
		}

		if (other.whiteness + other.blackness >= 1) {
			otherHue = baseHue;
		}

		return new Color({
			type: "HWB",
			hue: this.#blendColorHue(baseHue, otherHue, baseWeight),
			whiteness: this.#blendColorValue(base.whiteness, other.whiteness, baseWeight),
			blackness: this.#blendColorValue(base.blackness, other.blackness, baseWeight),
			alpha: this.#blendAlpha(base.alpha, other.alpha, baseWeight),
		});
	}

	// !SECTION - HWB
	// !SECTION - Color blending
	// SECTION - Color clamping

	// !SECTION
	// SECTION - Parsing

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

	#parseHex(color: string, strict: true): RGBParsedColor;
	#parseHex(color: string, strict: false): RGBParsedColor | null;
	#parseHex(color: string, strict: boolean): RGBParsedColor | null {
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
				red: r,
				green: g,
				blue: b,
				alpha: alpha,
			};
		}

		if (strict) {
			throw new ColorError("Invalid hex detected.");
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
				red: this.#parsePercentage(r, rIsPercentage, 255),
				green: this.#parsePercentage(g, gIsPercentage, 255),
				blue: this.#parsePercentage(b, bIsPercentage, 255),
				alpha: this.#parsePercentage(a, aIsPercentage, 1),
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
				cyan: this.#parsePercentage(c, cIsPercentage, 1),
				magenta: this.#parsePercentage(m, mIsPercentage, 1),
				yellow: this.#parsePercentage(y, yIsPercentage, 1),
				key: this.#parsePercentage(k, kIsPercentage, 1),
				alpha: this.#parsePercentage(alpha, alphaIsPercentage, 1),
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
				lightness: this.#parsePercentage(l, true, 100),
				axisA: axisA,
				axisB: axisB,
				alpha: this.#parsePercentage(alpha, alphaIsPercentage, 1),
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
				lightness: this.#parsePercentage(l, true, 1),
				axisA: axisA,
				axisB: axisB,
				alpha: this.#parsePercentage(alpha, alphaIsPercentage, 1),
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
				lightness: this.#parsePercentage(l, true, 100),
				chroma: chroma,
				hue: this.#parseAngleValue(h, hAngleType),
				alpha: this.#parsePercentage(alpha, alphaIsPercentage, 1),
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
				lightness: this.#parsePercentage(l, lIsPercentage, 1),
				chroma: chroma,
				hue: this.#parseAngleValue(h, hAngleType),
				alpha: this.#parsePercentage(alpha, alphaIsPercentage, 1),
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
				saturation: this.#parsePercentage(s, true, 100),
				lightness: this.#parsePercentage(l, true, 100),
				alpha: this.#parsePercentage(alpha, alphaIsPercentage, 1),
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
				whiteness: this.#parsePercentage(w, true, 100),
				blackness: this.#parsePercentage(b, true, 100),
				alpha: this.#parsePercentage(alpha, alphaIsPercentage, 1),
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
				return this.#parseHex(namedColor, true);
			}

			return {
				type: "RGB",
				alpha: null,
				...namedColor,
			};
		}

		const hex = this.#parseHex(color, false);

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
