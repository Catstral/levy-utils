export type UuidRNG = () => Uint8Array;

export interface UuidRNGOptions {
	rng?: UuidRNG;
	random?: Uint8Array;
}
