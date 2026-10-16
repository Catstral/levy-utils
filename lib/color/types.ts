import type { Color } from "./color";

// NOTE - This is based on CSS specifications
// While it is possible to go outside the specified scale, it will be clamped down
// The scale is designed so that it fits perfectly into the allowed percentages (on a 0 - 100 scale usually)
// Do note that some percentages are allowed to also go to -100

// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/rgb
export type RGBParsedColor = {
	type: "RGB";
	/**
	 * Scale: 0 - 255
	 *
	 * Converted to integers
	 */
	red: number;
	/**
	 * Scale: 0 - 255
	 *
	 * Converted to integers
	 */
	green: number;
	/**
	 * Scale: 0 - 255
	 *
	 * Converted to integers
	 */
	blue: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	alpha?: number | null;
};

// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/device-cmyk
export type CMYKParsedColor = {
	type: "CMYK";
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	cyan: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	magenta: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	yellow: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	key: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	alpha?: number | number;
};

// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/lab
export type LABParsedColor = {
	type: "LAB";
	/**
	 * Scale: 0 - 100
	 *
	 * Converted to floats
	 */
	lightness: number;
	/**
	 * Scale: -125 - 125
	 *
	 * Converted to floats
	 */
	axisA: number;
	/**
	 * Scale: -125 - 125
	 *
	 * Converted to floats
	 */
	axisB: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	alpha?: number | number;
};

// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklab
export type OKLABParsedColor = {
	type: "OKLAB";
	/**
	 * Scale: 0 - 100
	 *
	 * Converted to floats
	 */
	lightness: number;
	/**
	 * Scale: -0.4 - 0.4
	 *
	 * Converted to floats
	 */
	axisA: number;
	/**
	 * Scale: -0.4 - 0.4
	 *
	 * Converted to floats
	 */
	axisB: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	alpha?: number | number;
};

// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/lch
export type LCHParsedColor = {
	type: "LCH";
	/**
	 * Scale: 0 - 100
	 *
	 * Converted to floats
	 */
	lightness: number;
	/**
	 * Scale: 0 - 150
	 *
	 * Converted to floats
	 */
	chroma: number;
	/**
	 * Scale: 0 - 360
	 *
	 * Converted to floats
	 */
	hue: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	alpha?: number | number;
};

// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch
export type OKLCHParsedColor = {
	type: "OKLCH";
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	lightness: number;
	/**
	 * Scale: 0 - 0.4
	 *
	 * Converted to floats
	 */
	chroma: number;
	/**
	 * Scale: 0 - 360
	 *
	 * Converted to floats
	 */
	hue: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	alpha?: number | number;
};

// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/hsl
export type HSLParsedColor = {
	type: "HSL";
	/**
	 * Scale: 0 - 360
	 *
	 * Converted to floats
	 */
	hue: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	saturation: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	lightness: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	alpha?: number | number;
};

// See: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/hwb
export type HWBParsedColor = {
	type: "HWB";
	/**
	 * Scale: 0 - 360
	 *
	 * Converted to floats
	 */
	hue: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	whiteness: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	blackness: number;
	/**
	 * Scale: 0 - 1
	 *
	 * Converted to floats
	 */
	alpha?: number | number;
};

export type ParsedColor =
	| RGBParsedColor
	| CMYKParsedColor
	| LABParsedColor
	| OKLABParsedColor
	| LCHParsedColor
	| OKLCHParsedColor
	| HSLParsedColor
	| HWBParsedColor;

export type ColorInput = string | Color | ParsedColor;
