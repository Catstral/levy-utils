import DiffMatchPatch from "diff-match-patch";

/**
 * @typedef TextDifferenceOptionsNodes
 * @prop {true} raw If raw nodes should be returned instead of a constructed string
 * @prop {boolean} [htmlAware] If the difference should be HTML aware
 */

export type TextDifferenceOptionsNodes = {
	/**
	 * If raw nodes should be returned instead of a constructed string
	 *
	 * @default false
	 */
	raw: true;
	/**
	 * If the difference should be HTML aware
	 *
	 * @default false
	 */
	htmlAware?: boolean;
};

export type TextDifferenceTag = string | [string, string];

/**
 * @typedef TextDifferenceOptionsStringContextTags
 * @prop {string | [string, string]} [equal] The tag(s) to wrap around nodes that are considered as equal
 * @prop {string | [string, string]} [insert] The tag(s) to wrap around nodes that are considered as inserted/new
 * @prop {string | [string, string]} [delete] The tag(s) to wrap around nodes that are considered as deleted/removed
 */

export type TextDifferenceOptionsStringTags = {
	/**
	 * The tag(s) to wrap around nodes that are considered as equal.
	 *
	 * By default no tags are wrapped around equal nodes.
	 */
	equal?: TextDifferenceTag;
	/**
	 * The tag(s) to wrap around nodes that are considered as inserted/new.
	 */
	insert?: TextDifferenceTag;
	/**
	 * The tag(s) to wrap around nodes that are considered as deleted/removed.
	 */
	delete?: TextDifferenceTag;
};

/**
 * @typedef TextDifferenceOptionsStringContextTags
 * @prop {TextDifferenceOptionsStringTags} [inlineContext] The tags to use when in a inline context for the diff
 * @prop {TextDifferenceOptionsStringTags} [blockContext] The tags to use when in a block context for the diff
 */

export type TextDifferenceOptionsStringContextTags = {
	/**
	 * The tags to use when in a inline context for the diff.
	 */
	inlineContext?: TextDifferenceOptionsStringTags;
	/**
	 * The tags to use when in a block context for the diff.
	 */
	blockContext?: TextDifferenceOptionsStringTags;
};

/**
 * @typedef TextDifferenceOptionsString
 * @prop {false} [raw] If raw nodes should be returned instead of a constructed string
 * @prop {boolean} [htmlAware] If the difference should be HTML aware
 * @prop {TextDifferenceOptionsStringContextTags | TextDifferenceOptionsStringTags} [tags] The tags to wrap around the diff
 */

export type TextDifferenceOptionsString = {
	/**
	 * If raw nodes should be returned instead of a constructed string
	 *
	 * @default false
	 */
	raw?: false;
} & (
	| {
			/**
			 * If the difference should be HTML aware
			 *
			 * @default false
			 */
			htmlAware?: false;
			/**
			 * The tags to use to mark the diff
			 */
			tags?: TextDifferenceOptionsStringTags;
	  }
	| {
			/**
			 * If the difference should be HTML aware
			 *
			 * @default false
			 */
			htmlAware: true;
			/**
			 * The tags to use to mark the diff
			 */
			tags?: TextDifferenceOptionsStringContextTags | TextDifferenceOptionsStringTags;
	  }
);

export type TextDifferenceNodeType = "EQUAL" | "INSERT" | "DELETE";
export type TextDifferenceNodeContext = "INLINE" | "BLOCK" | "UNKNOWN";

/**
 * @typedef TextDifferenceNode
 * @prop {"EQUAL" | "INSERT" | "DELETE"} type The operation type this node represents
 * @prop {string} content The content this diff type applies for
 * @prop {"INLINE" | "BLOCK" | "UNKNOWN"} context The HTML context this node is used in, this will always be `UNKNOWN` if `htmlAware` is not true
 */

export type TextDifferenceNode = {
	/**
	 * The operation type this node represents.
	 */
	type: TextDifferenceNodeType;
	/**
	 * The content this diff type applies for.
	 */
	content: string;
	/**
	 * The HTML context this node is used in, this will always be `UNKNOWN` if `htmlAware` is not true.
	 */
	context: TextDifferenceNodeContext;
};

type TextDifferenceTagsDefault = {
	equal: [string, string];
	insert: [string, string];
	delete: [string, string];
};

/**
 * HTML tags that never have a matching closing tag / children.
 */
const VOID_TAGS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

/**
 * HTML tags that are treated as inline (as opposed to block) context when wrapping a diff.
 */
const INLINE_TAGS = new Set([
	"a",
	"abbr",
	"b",
	"bdi",
	"bdo",
	"br",
	"button",
	"cite",
	"code",
	"data",
	"dfn",
	"em",
	"i",
	"img",
	"input",
	"kbd",
	"label",
	"mark",
	"q",
	"rp",
	"rt",
	"ruby",
	"s",
	"samp",
	"select",
	"small",
	"span",
	"strong",
	"sub",
	"sup",
	"textarea",
	"time",
	"u",
	"var",
	"wbr",
]);

type HtmlTextNode = {
	kind: "text";
	text: string;
};

type HtmlElementNode = {
	kind: "element";
	tag: string;
	openTag: string;
	closeTag: string;
	children: HtmlNode[];
};

type HtmlNode = HtmlTextNode | HtmlElementNode;

/**
 * Finds the index of the `>` that closes the tag starting at `start`, taking quoted
 * attribute values and comments into account so a `>` inside e.g. `title="a > b"` is skipped.
 */
function findTagEnd(input: string, start: number): number {
	if (input.startsWith("<!--", start)) {
		const end = input.indexOf("-->", start + 4);

		return end === -1 ? -1 : end + 2;
	}

	let quote: '"' | "'" | null = null;
	let charIndex = start;

	for (const char of input.slice(start + 1)) {
		charIndex += 1;

		if (quote) {
			if (char === quote) {
				quote = null;
			}

			continue;
		}

		if (char === '"' || char === "'") {
			quote = char;

			continue;
		}

		if (char === ">") {
			return charIndex;
		}
	}

	return -1;
}

type HtmlToken = {
	kind: "tag" | "text";
	value: string;
};

function tokenizeHtml(input: string): HtmlToken[] {
	const tokens: HtmlToken[] = [];
	let cursor = 0;

	while (cursor < input.length) {
		if (input[cursor] === "<") {
			const tagEnd = findTagEnd(input, cursor);

			if (tagEnd === -1) {
				tokens.push({
					kind: "text",
					value: input.slice(cursor),
				});

				break;
			}

			tokens.push({
				kind: "tag",
				value: input.slice(cursor, tagEnd + 1),
			});
			cursor = tagEnd + 1;

			continue;
		}

		const nextTagStart = input.indexOf("<", cursor);
		const end = nextTagStart === -1 ? input.length : nextTagStart;

		tokens.push({
			kind: "text",
			value: input.slice(cursor, end),
		});
		cursor = end;
	}

	return tokens;
}

function getTagName(tagToken: string): string {
	const match = /^<\/?\s*([a-zA-Z][a-zA-Z0-9:-]*)/.exec(tagToken);

	return match ? match[1].toLowerCase() : "";
}

/**
 * Parses an HTML string into a lightweight node tree (elements keep their raw open/close
 * tag strings verbatim, so `serializeNode` round-trips back to the original markup).
 */
function buildHtmlTree(input: string): HtmlNode[] {
	const root: HtmlNode[] = [];
	const stack: HtmlElementNode[] = [];

	const currentChildren = () => {
		return stack.length ? stack[stack.length - 1].children : root;
	};

	for (const token of tokenizeHtml(input)) {
		if (token.kind === "text") {
			if (token.value) {
				currentChildren().push({
					kind: "text",
					text: token.value,
				});
			}

			continue;
		}

		const tagToken = token.value;

		if (tagToken.startsWith("<!")) {
			currentChildren().push({
				kind: "element",
				tag: "",
				openTag: tagToken,
				closeTag: "",
				children: [],
			});

			continue;
		}

		const tagName = getTagName(tagToken);

		if (tagToken.startsWith("</")) {
			let matchIndex = -1;

			for (let index = stack.length - 1; index >= 0; index -= 1) {
				if (stack[index].tag === tagName) {
					matchIndex = index;

					break;
				}
			}

			if (matchIndex === -1) {
				// Stray/unmatched closing tag, keep it as literal text instead of dropping it.
				currentChildren().push({
					kind: "text",
					text: tagToken,
				});

				continue;
			}

			const target = stack[matchIndex];

			while (stack.length > matchIndex) {
				stack.pop();
			}

			target.closeTag = tagToken;

			continue;
		}

		const node: HtmlElementNode = {
			kind: "element",
			tag: tagName,
			openTag: tagToken,
			closeTag: "",
			children: [],
		};

		currentChildren().push(node);

		if (!/\/\s*>$/.test(tagToken) && !VOID_TAGS.has(tagName)) {
			stack.push(node);
		}
	}

	return root;
}

function tagContext(tag: string): TextDifferenceNodeContext {
	return INLINE_TAGS.has(tag) ? "INLINE" : "BLOCK";
}

/**
 * Renders a node back to its original HTML string.
 */
function serializeNode(node: HtmlNode): string {
	if (node.kind === "text") {
		return node.text;
	}

	return `${node.openTag}${node.children.map(serializeNode).join("")}${node.closeTag}`;
}

/**
 * Renders a node into a key used purely for equality comparisons while aligning sibling
 * lists, distinguishing text nodes from elements so identical-looking content never collides.
 */
function serializeNodeKey(node: HtmlNode): string {
	if (node.kind === "text") {
		return `T:${node.text}`;
	}

	return `E:${node.openTag}${node.children.map(serializeNodeKey).join("")}${node.closeTag}`;
}

function getDiffType(marker: number): TextDifferenceNodeType {
	switch (marker) {
		case DiffMatchPatch.DIFF_EQUAL: {
			return "EQUAL";
		}
		case DiffMatchPatch.DIFF_INSERT: {
			return "INSERT";
		}
		case DiffMatchPatch.DIFF_DELETE: {
			return "DELETE";
		}
		default: {
			throw new Error("Got invalid difference marker to determine type");
		}
	}
}

type SequenceDiffOp<T> =
	| {
			type: "EQUAL";
			oldItem: T;
			newItem: T;
	  }
	| {
			type: "DELETE";
			oldItem: T;
	  }
	| {
			type: "INSERT";
			newItem: T;
	  };

type DiffSequenceDetails<T> = {
	oldItems: T[];
	newItems: T[];
	key: (item: T) => string;
};

/**
 * Aligns two item sequences by giving every distinct item (using the `key` fn) its own unicode
 * character and running `diff-match-patch` over the resulting strings. Since every character
 * represents one whole item, this yields a sequence-level LCS diff where items are the atomic
 * unit, instead of a character-level diff of their contents.
 */
function diffSequenceByKey<T>({ oldItems, newItems, key }: DiffSequenceDetails<T>): SequenceDiffOp<T>[] {
	const charMap = new Map<string, string>();
	let nextCode = 0x21;

	const nextChar = () => {
		if (nextCode === 0xd800) {
			// Skip the surrogate range, these are not valid standalone UTF-16 code units.
			nextCode = 0xe000;
		}

		const char = String.fromCharCode(nextCode);

		nextCode += 1;

		return char;
	};

	const encode = (items: T[]) => {
		let result = "";

		for (const item of items) {
			const currentKey = key(item);
			let char = charMap.get(currentKey);

			if (char === undefined) {
				char = nextChar();
				charMap.set(currentKey, char);
			}

			result += char;
		}

		return result;
	};

	const oldEncoded = encode(oldItems);
	const newEncoded = encode(newItems);

	const diffMatchPatch = new DiffMatchPatch();
	const diffs = diffMatchPatch.diff_main(oldEncoded, newEncoded);

	const ops: SequenceDiffOp<T>[] = [];
	let oldIndex = 0;
	let newIndex = 0;

	for (const [marker, chars] of diffs) {
		for (const _ of chars) {
			if (marker === DiffMatchPatch.DIFF_EQUAL) {
				ops.push({
					type: "EQUAL",
					oldItem: oldItems[oldIndex],
					newItem: newItems[newIndex],
				});

				oldIndex += 1;
				newIndex += 1;
			} else if (marker === DiffMatchPatch.DIFF_DELETE) {
				ops.push({
					type: "DELETE",
					oldItem: oldItems[oldIndex],
				});

				oldIndex += 1;
			} else {
				ops.push({
					type: "INSERT",
					newItem: newItems[newIndex],
				});

				newIndex += 1;
			}
		}
	}

	return ops;
}

function diffTextContent(oldText: string, newText: string): TextDifferenceNode[] {
	const diffMatchPatch = new DiffMatchPatch();
	const diffs = diffMatchPatch.diff_main(oldText, newText);

	diffMatchPatch.diff_cleanupSemantic(diffs);

	return diffs.map(([marker, content]) => ({
		type: getDiffType(marker),
		content,
		context: "INLINE",
	}));
}

function htmlNodeToTextDifferenceNode(node: HtmlNode, type: TextDifferenceNodeType): TextDifferenceNode {
	if (node.kind === "text") {
		return {
			type,
			content: node.text,
			context: "INLINE",
		};
	}

	return {
		type,
		content: serializeNode(node),
		context: tagContext(node.tag),
	};
}

/**
 * Diffs two HTML node lists (siblings). Nodes are aligned as whole units, so a node that is
 * missing on either side becomes a whole INSERT/DELETE. Matched element pairs are only
 * recursed into when their opening AND closing tags are identical on both sides, i.e. when
 * only their children changed — the moment a tag itself differs (attribute added/changed/
 * removed, different element entirely), the whole element is treated as one INSERT/DELETE
 * block instead of trying to diff the tag itself, preventing the element from being able
 * to render correctly.
 */
function diffHtmlNodes(oldNodes: HtmlNode[], newNodes: HtmlNode[]): TextDifferenceNode[] {
	const ops = diffSequenceByKey({
		oldItems: oldNodes,
		newItems: newNodes,
		key: serializeNodeKey,
	});
	const result: TextDifferenceNode[] = [];

	for (let index = 0; index < ops.length; index += 1) {
		const op = ops[index];

		if (op.type === "EQUAL") {
			result.push(htmlNodeToTextDifferenceNode(op.oldItem, "EQUAL"));

			continue;
		}

		const next = ops[index + 1];

		if (op.type === "DELETE" && next?.type === "INSERT") {
			const oldNode = op.oldItem;
			const newNode = next.newItem;

			if (
				oldNode.kind === "element" &&
				newNode.kind === "element" &&
				oldNode.tag === newNode.tag &&
				oldNode.openTag === newNode.openTag &&
				oldNode.closeTag === newNode.closeTag
			) {
				result.push(
					{
						type: "EQUAL",
						content: oldNode.openTag,
						context: tagContext(oldNode.tag),
					},
					...diffHtmlNodes(oldNode.children, newNode.children),
				);

				if (oldNode.closeTag) {
					result.push({
						type: "EQUAL",
						content: oldNode.closeTag,
						context: tagContext(oldNode.tag),
					});
				}

				index += 1;

				continue;
			}

			if (oldNode.kind === "text" && newNode.kind === "text") {
				result.push(...diffTextContent(oldNode.text, newNode.text));

				index += 1;

				continue;
			}

			result.push(
				htmlNodeToTextDifferenceNode(oldNode, "DELETE"),
				htmlNodeToTextDifferenceNode(newNode, "INSERT"),
			);

			index += 1;

			continue;
		}

		if (op.type === "DELETE") {
			result.push(htmlNodeToTextDifferenceNode(op.oldItem, "DELETE"));

			continue;
		}

		result.push(htmlNodeToTextDifferenceNode(op.newItem, "INSERT"));
	}

	return result;
}

function mergeAdjacentNodes(nodesToMerge: TextDifferenceNode[]): TextDifferenceNode[] {
	const merged: TextDifferenceNode[] = [];

	for (const node of nodesToMerge) {
		const last = merged[merged.length - 1];

		if (last && last.type === node.type && last.context === node.context) {
			last.content += node.content;

			continue;
		}

		merged.push({
			...node,
		});
	}

	return merged;
}

/**
 * Turns 2 strings into a constructed string, showing the difference using tags wrapped around changes.
 *
 * @param {string} oldValue A string representing what the text used to be
 * @param {string} newValue A string representing what the text has turned into
 * @param {TextDifferenceOptionsString} [options] Options to tweak the result (see {@link TextDifferenceOptionsString} for more details)
 * @returns {string} A constructed string based on the difference between the 2 given strings
 */
export function textDifference(oldValue: string, newValue: string, options?: TextDifferenceOptionsString): string;
/**
 * Turns 2 strings into a list of difference nodes containing the info needed to be able to construct/view a difference of the 2.
 *
 * @param {string} oldValue A string representing what the text used to be
 * @param {string} newValue A string representing what the text has turned into
 * @param {TextDifferenceOptionsNodes} [options] Options to tweak the result (see {@link TextDifferenceOptionsNodes} for more details)
 * @returns {TextDifferenceNode[]} A list of raw nodes that represent the difference between the 2 given strings (see {@link TextDifferenceNode} for more details)
 */
export function textDifference(
	oldValue: string,
	newValue: string,
	options?: TextDifferenceOptionsNodes,
): TextDifferenceNode[];
export function textDifference(
	oldValue: string,
	newValue: string,
	options?: TextDifferenceOptionsString | TextDifferenceOptionsNodes,
): string | TextDifferenceNode[] {
	const htmlAware = options?.htmlAware ?? false;
	const keepRaw = options?.raw ?? false;
	const nodes: TextDifferenceNode[] = [];

	if (htmlAware) {
		const oldNodes = buildHtmlTree(oldValue);
		const newNodes = buildHtmlTree(newValue);

		nodes.push(...mergeAdjacentNodes(diffHtmlNodes(oldNodes, newNodes)));
	} else {
		const diffMatchPatch = new DiffMatchPatch();
		const diffs = diffMatchPatch.diff_main(oldValue, newValue);

		diffMatchPatch.diff_cleanupSemantic(diffs);

		for (const [marker, content] of diffs) {
			nodes.push({
				content,
				type: getDiffType(marker),
				context: "UNKNOWN",
			});
		}
	}

	if (!keepRaw) {
		let output = "";

		let equalInlineTags: [string, string] = ["", ""];
		let equalBlockTags: [string, string] = ["", ""];
		let insertInlineTags: [string, string] = ['<span data-diff="insert">', "</span>"];
		let insertBlockTags: [string, string] = ['<div data-diff="insert">', "</div>"];
		let deleteInlineTags: [string, string] = ['<span data-diff="delete">', "</span>"];
		let deleteBlockTags: [string, string] = ['<div data-diff="delete">', "</div>"];

		const parseTags = (tags: TextDifferenceOptionsStringTags, defaults: TextDifferenceTagsDefault) => {
			let equalTags = defaults.equal;
			let insertTags = defaults.insert;
			let deleteTags = defaults.delete;

			if (typeof tags.equal === "string") {
				equalTags = [tags.equal, tags.equal];
			} else if (tags.equal) {
				equalTags = tags.equal;
			}

			if (typeof tags.insert === "string") {
				insertTags = [tags.insert, tags.insert];
			} else if (tags.insert) {
				insertTags = tags.insert;
			}

			if (typeof tags.delete === "string") {
				deleteTags = [tags.delete, tags.delete];
			} else if (tags.delete) {
				deleteTags = tags.delete;
			}

			return {
				equalTags,
				insertTags,
				deleteTags,
			};
		};

		if (options && "tags" in options && options.tags) {
			if ("inlineContext" in options.tags || "blockContext" in options.tags) {
				if (options.tags.inlineContext) {
					const tags = parseTags(options.tags.inlineContext, {
						equal: ["", ""],
						insert: ['<span data-diff="insert">', "</span>"],
						delete: ['<span data-diff="delete">', "</span>"],
					});

					equalInlineTags = tags.equalTags;
					insertInlineTags = tags.insertTags;
					deleteInlineTags = tags.deleteTags;
				}

				if (options.tags.blockContext) {
					const tags = parseTags(options.tags.blockContext, {
						equal: ["", ""],
						insert: ['<div data-diff="insert">', "</div>"],
						delete: ['<div data-diff="delete">', "</div>"],
					});

					equalBlockTags = tags.equalTags;
					insertBlockTags = tags.insertTags;
					deleteBlockTags = tags.deleteTags;
				}
			} else if ("equal" in options.tags || "insert" in options.tags || "delete" in options.tags) {
				if (htmlAware) {
					const inlineTags = parseTags(options.tags, {
						equal: ["", ""],
						insert: ['<span data-diff="insert">', "</span>"],
						delete: ['<span data-diff="delete">', "</span>"],
					});
					const blockTags = parseTags(options.tags, {
						equal: ["", ""],
						insert: ['<div data-diff="insert">', "</div>"],
						delete: ['<div data-diff="delete">', "</div>"],
					});

					equalInlineTags = inlineTags.equalTags;
					equalBlockTags = blockTags.equalTags;
					insertInlineTags = inlineTags.insertTags;
					insertBlockTags = blockTags.insertTags;
					deleteInlineTags = inlineTags.deleteTags;
					deleteBlockTags = blockTags.deleteTags;
				} else {
					const tags = parseTags(options.tags, {
						equal: ["", ""],
						insert: ['<span data-diff="insert">', "</span>"],
						delete: ['<span data-diff="delete">', "</span>"],
					});

					equalInlineTags = tags.equalTags;
					equalBlockTags = tags.equalTags;
					insertInlineTags = tags.insertTags;
					insertBlockTags = tags.insertTags;
					deleteInlineTags = tags.deleteTags;
					deleteBlockTags = tags.deleteTags;
				}
			}
		}

		for (const node of nodes) {
			let beforeTag: string;
			let afterTag: string;

			switch (node.type) {
				case "EQUAL": {
					switch (node.context) {
						case "BLOCK": {
							beforeTag = equalBlockTags[0];
							afterTag = equalBlockTags[1];

							break;
						}
						case "INLINE":
						case "UNKNOWN": {
							beforeTag = equalInlineTags[0];
							afterTag = equalInlineTags[1];

							break;
						}
					}

					break;
				}
				case "INSERT": {
					switch (node.context) {
						case "BLOCK": {
							beforeTag = insertBlockTags[0];
							afterTag = insertBlockTags[1];

							break;
						}
						case "INLINE":
						case "UNKNOWN": {
							beforeTag = insertInlineTags[0];
							afterTag = insertInlineTags[1];

							break;
						}
					}

					break;
				}
				case "DELETE": {
					switch (node.context) {
						case "BLOCK": {
							beforeTag = deleteBlockTags[0];
							afterTag = deleteBlockTags[1];

							break;
						}
						case "INLINE":
						case "UNKNOWN": {
							beforeTag = deleteInlineTags[0];
							afterTag = deleteInlineTags[1];

							break;
						}
					}

					break;
				}
			}

			output += `${beforeTag}${node.content}${afterTag}`;
		}

		return output;
	}

	return nodes;
}
