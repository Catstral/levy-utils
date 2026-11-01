import { beforeEach, describe, expect, test } from "bun:test";
import { textDifference } from ".";

describe("textDifference", () => {
	beforeEach(() => {
		textDifference.config.reset();
	});

	describe("Plain text (default options)", () => {
		test("Identical strings produce no visible markup", () => {
			expect(textDifference("Hello World", "Hello World")).toBe("Hello World");
		});

		test("Simple insertion", () => {
			expect(textDifference("cat", "cats")).toBe('cat<span data-diff="insert">s</span>');
		});

		test("Full replacement with nothing in common", () => {
			expect(textDifference("foo", "bar")).toBe(
				'<span data-diff="delete">foo</span><span data-diff="insert">bar</span>',
			);
		});

		test("Pure insertion from an empty old value", () => {
			expect(textDifference("", "hello")).toBe('<span data-diff="insert">hello</span>');
		});

		test("Pure deletion to an empty new value", () => {
			expect(textDifference("hello", "")).toBe('<span data-diff="delete">hello</span>');
		});

		test("Both values empty", () => {
			expect(textDifference("", "")).toBe("");
		});
	});

	describe("Plain text raw nodes", () => {
		test("Raw nodes use UNKNOWN context", () => {
			expect(
				textDifference("cat", "cats", {
					raw: true,
				}),
			).toEqual([
				{
					type: "EQUAL",
					content: "cat",
					context: "UNKNOWN",
				},
				{
					type: "INSERT",
					content: "s",
					context: "UNKNOWN",
				},
			]);
		});

		test("Raw nodes for a full replacement", () => {
			expect(
				textDifference("foo", "bar", {
					raw: true,
				}),
			).toEqual([
				{
					type: "DELETE",
					content: "foo",
					context: "UNKNOWN",
				},
				{
					type: "INSERT",
					content: "bar",
					context: "UNKNOWN",
				},
			]);
		});
	});

	describe("Custom tags", () => {
		test("String shorthand wraps the same marker on both sides", () => {
			expect(
				textDifference("cat", "cats", {
					tags: {
						insert: "**",
					},
				}),
			).toBe("cat**s**");
		});

		test("Tuple form uses different open/close markers", () => {
			expect(
				textDifference("foo", "bar", {
					tags: {
						insert: ["<ins>", "</ins>"],
						delete: ["<del>", "</del>"],
					},
				}),
			).toBe("<del>foo</del><ins>bar</ins>");
		});

		test("Custom equal tag wraps unchanged content", () => {
			expect(
				textDifference("abc", "abc", {
					tags: {
						equal: "_",
					},
				}),
			).toBe("_abc_");
		});

		test("Tuple form equal tag uses different open/close markers", () => {
			expect(
				textDifference("abc", "abc", {
					tags: {
						equal: ["<mark>", "</mark>"],
					},
				}),
			).toBe("<mark>abc</mark>");
		});
	});

	describe("HTML aware - matching tags recurse into children", () => {
		test("Same tag, same attributes: only the text content is diffed", () => {
			expect(
				textDifference("<p>foo</p>", "<p>bar</p>", {
					htmlAware: true,
				}),
			).toBe('<p><span data-diff="delete">foo</span><span data-diff="insert">bar</span></p>');
		});

		test("Identical HTML produces no visible markup", () => {
			const html = "<p>Hello <b>World</b></p>";

			expect(
				textDifference(html, html, {
					htmlAware: true,
				}),
			).toBe(html);
		});

		test("Attribute value containing '>' is parsed correctly", () => {
			expect(
				textDifference('<a title="a > b">foo</a>', '<a title="a > b">bar</a>', {
					htmlAware: true,
				}),
			).toBe('<a title="a > b"><span data-diff="delete">foo</span><span data-diff="insert">bar</span></a>');
		});
	});

	describe("HTML aware - mismatched tags/attributes replace the whole element", () => {
		test("Different tag name replaces the whole element as one block", () => {
			expect(
				textDifference("<p>foo</p>", "<div>foo</div>", {
					htmlAware: true,
				}),
			).toBe('<div data-diff="delete"><p>foo</p></div><div data-diff="insert"><div>foo</div></div>');
		});

		test("Different attribute value replaces the whole inline element", () => {
			expect(
				textDifference('<a href="a">text</a>', '<a href="b">text</a>', {
					htmlAware: true,
				}),
			).toBe(
				'<span data-diff="delete"><a href="a">text</a></span><span data-diff="insert"><a href="b">text</a></span>',
			);
		});
	});

	describe("HTML aware - raw nodes", () => {
		test("Block vs inline context is reflected on the nodes", () => {
			expect(
				textDifference("<p>foo</p>", "<p>bar</p>", {
					htmlAware: true,
					raw: true,
				}),
			).toEqual([
				{
					type: "EQUAL",
					content: "<p>",
					context: "BLOCK",
				},
				{
					type: "DELETE",
					content: "foo",
					context: "INLINE",
				},
				{
					type: "INSERT",
					content: "bar",
					context: "INLINE",
				},
				{
					type: "EQUAL",
					content: "</p>",
					context: "BLOCK",
				},
			]);
		});

		test("HTML comments are treated as opaque block-context nodes", () => {
			expect(
				textDifference("<!-- old -->", "<!-- new -->", {
					htmlAware: true,
					raw: true,
				}),
			).toEqual([
				{
					type: "DELETE",
					content: "<!-- old -->",
					context: "BLOCK",
				},
				{
					type: "INSERT",
					content: "<!-- new -->",
					context: "BLOCK",
				},
			]);
		});

		test("An unmatched closing tag is kept as literal text and merged with adjacent equal text", () => {
			expect(
				textDifference("foo</div>bar", "foo</div>baz", {
					htmlAware: true,
					raw: true,
				}),
			).toEqual([
				{
					type: "EQUAL",
					content: "foo</div>ba",
					context: "INLINE",
				},
				{
					type: "DELETE",
					content: "r",
					context: "INLINE",
				},
				{
					type: "INSERT",
					content: "z",
					context: "INLINE",
				},
			]);
		});

		test("An unterminated tag (no closing '>') is kept as literal text", () => {
			expect(
				textDifference("foo<div", "foo<div", {
					htmlAware: true,
					raw: true,
				}),
			).toEqual([
				{
					type: "EQUAL",
					content: "foo<div",
					context: "INLINE",
				},
			]);
		});

		test("A whole sibling element removed with nothing inserted in its place", () => {
			expect(
				textDifference("<p>foo</p><p>bar</p>", "<p>foo</p>", {
					htmlAware: true,
					raw: true,
				}),
			).toEqual([
				{
					type: "EQUAL",
					content: "<p>foo</p>",
					context: "BLOCK",
				},
				{
					type: "DELETE",
					content: "<p>bar</p>",
					context: "BLOCK",
				},
			]);
		});

		test("A whole sibling element inserted with nothing removed in its place", () => {
			expect(
				textDifference("<p>foo</p>", "<p>foo</p><p>bar</p>", {
					htmlAware: true,
					raw: true,
				}),
			).toEqual([
				{
					type: "EQUAL",
					content: "<p>foo</p>",
					context: "BLOCK",
				},
				{
					type: "INSERT",
					content: "<p>bar</p>",
					context: "BLOCK",
				},
			]);
		});
	});

	describe("HTML aware with context-specific tags", () => {
		test("inlineContext and blockContext tags are applied independently", () => {
			expect(
				textDifference("<p>foo</p>", "<p>bar</p>", {
					htmlAware: true,
					tags: {
						inlineContext: {
							insert: "**",
							delete: "~~",
						},
					},
				}),
			).toBe("<p>~~foo~~**bar**</p>");
		});

		test("Flat tags (no inline/block split) apply uniformly to both contexts", () => {
			expect(
				textDifference("<p>foo</p>", "<div>foo</div>", {
					htmlAware: true,
					tags: {
						insert: "**",
						delete: "~~",
					},
				}),
			).toBe("~~<p>foo</p>~~**<div>foo</div>**");
		});

		test("blockContext tags are applied to block-level EQUAL nodes independently from inline ones", () => {
			expect(
				textDifference("<p>foo</p>", "<p>bar</p>", {
					htmlAware: true,
					tags: {
						blockContext: {
							equal: "§",
						},
					},
				}),
			).toBe('§<p>§<span data-diff="delete">foo</span><span data-diff="insert">bar</span>§</p>§');
		});
	});

	describe("config", () => {
		test("Reading the default configuration values (regression test)", () => {
			expect(textDifference.config.default.htmlAware).toBeFalse();
			expect(textDifference.config.default.tags).toBeEmptyObject();
			expect(textDifference.config.htmlAware).toBeFalse();
			expect(textDifference.config.tags).toBeEmptyObject();
		});

		describe("Custom tags", () => {
			test("String shorthand wraps the same marker on both sides", () => {
				textDifference.config.tags = {
					insert: "**",
				};

				expect(textDifference("cat", "cats")).toBe("cat**s**");
			});

			test("Tuple form uses different open/close markers", () => {
				textDifference.config.tags = {
					insert: ["<ins>", "</ins>"],
					delete: ["<del>", "</del>"],
				};

				expect(textDifference("foo", "bar")).toBe("<del>foo</del><ins>bar</ins>");
			});

			test("Custom equal tag wraps unchanged content", () => {
				textDifference.config.tags = {
					equal: "_",
				};

				expect(textDifference("abc", "abc")).toBe("_abc_");
			});

			test("Tuple form equal tag uses different open/close markers", () => {
				textDifference.config.tags = {
					equal: ["<mark>", "</mark>"],
				};

				expect(textDifference("abc", "abc")).toBe("<mark>abc</mark>");
			});
		});

		describe("HTML aware - matching tags recurse into children", () => {
			test("Same tag, same attributes: only the text content is diffed", () => {
				textDifference.config.htmlAware = true;

				expect(textDifference("<p>foo</p>", "<p>bar</p>")).toBe(
					'<p><span data-diff="delete">foo</span><span data-diff="insert">bar</span></p>',
				);
			});

			test("Identical HTML produces no visible markup", () => {
				textDifference.config.htmlAware = true;

				const html = "<p>Hello <b>World</b></p>";

				expect(textDifference(html, html)).toBe(html);
			});

			test("Attribute value containing '>' is parsed correctly", () => {
				textDifference.config.htmlAware = true;

				expect(textDifference('<a title="a > b">foo</a>', '<a title="a > b">bar</a>')).toBe(
					'<a title="a > b"><span data-diff="delete">foo</span><span data-diff="insert">bar</span></a>',
				);
			});
		});

		describe("HTML aware - mismatched tags/attributes replace the whole element", () => {
			test("Different tag name replaces the whole element as one block", () => {
				textDifference.config.htmlAware = true;

				expect(textDifference("<p>foo</p>", "<div>foo</div>")).toBe(
					'<div data-diff="delete"><p>foo</p></div><div data-diff="insert"><div>foo</div></div>',
				);
			});

			test("Different attribute value replaces the whole inline element", () => {
				textDifference.config.htmlAware = true;

				expect(textDifference('<a href="a">text</a>', '<a href="b">text</a>')).toBe(
					'<span data-diff="delete"><a href="a">text</a></span><span data-diff="insert"><a href="b">text</a></span>',
				);
			});
		});

		describe("HTML aware - raw nodes", () => {
			test("Block vs inline context is reflected on the nodes", () => {
				textDifference.config.htmlAware = true;

				expect(
					textDifference("<p>foo</p>", "<p>bar</p>", {
						raw: true,
					}),
				).toEqual([
					{
						type: "EQUAL",
						content: "<p>",
						context: "BLOCK",
					},
					{
						type: "DELETE",
						content: "foo",
						context: "INLINE",
					},
					{
						type: "INSERT",
						content: "bar",
						context: "INLINE",
					},
					{
						type: "EQUAL",
						content: "</p>",
						context: "BLOCK",
					},
				]);
			});

			test("HTML comments are treated as opaque block-context nodes", () => {
				textDifference.config.htmlAware = true;

				expect(
					textDifference("<!-- old -->", "<!-- new -->", {
						raw: true,
					}),
				).toEqual([
					{
						type: "DELETE",
						content: "<!-- old -->",
						context: "BLOCK",
					},
					{
						type: "INSERT",
						content: "<!-- new -->",
						context: "BLOCK",
					},
				]);
			});

			test("An unmatched closing tag is kept as literal text and merged with adjacent equal text", () => {
				textDifference.config.htmlAware = true;

				expect(
					textDifference("foo</div>bar", "foo</div>baz", {
						raw: true,
					}),
				).toEqual([
					{
						type: "EQUAL",
						content: "foo</div>ba",
						context: "INLINE",
					},
					{
						type: "DELETE",
						content: "r",
						context: "INLINE",
					},
					{
						type: "INSERT",
						content: "z",
						context: "INLINE",
					},
				]);
			});

			test("An unterminated tag (no closing '>') is kept as literal text", () => {
				textDifference.config.htmlAware = true;

				expect(
					textDifference("foo<div", "foo<div", {
						raw: true,
					}),
				).toEqual([
					{
						type: "EQUAL",
						content: "foo<div",
						context: "INLINE",
					},
				]);
			});

			test("A whole sibling element removed with nothing inserted in its place", () => {
				textDifference.config.htmlAware = true;

				expect(
					textDifference("<p>foo</p><p>bar</p>", "<p>foo</p>", {
						raw: true,
					}),
				).toEqual([
					{
						type: "EQUAL",
						content: "<p>foo</p>",
						context: "BLOCK",
					},
					{
						type: "DELETE",
						content: "<p>bar</p>",
						context: "BLOCK",
					},
				]);
			});

			test("A whole sibling element inserted with nothing removed in its place", () => {
				textDifference.config.htmlAware = true;

				expect(
					textDifference("<p>foo</p>", "<p>foo</p><p>bar</p>", {
						raw: true,
					}),
				).toEqual([
					{
						type: "EQUAL",
						content: "<p>foo</p>",
						context: "BLOCK",
					},
					{
						type: "INSERT",
						content: "<p>bar</p>",
						context: "BLOCK",
					},
				]);
			});
		});

		describe("HTML aware with context-specific tags", () => {
			test("inlineContext and blockContext tags are applied independently", () => {
				textDifference.config.htmlAware = true;
				textDifference.config.tags = {
					inlineContext: {
						insert: "**",
						delete: "~~",
					},
				};

				expect(textDifference("<p>foo</p>", "<p>bar</p>")).toBe("<p>~~foo~~**bar**</p>");
			});

			test("Flat tags (no inline/block split) apply uniformly to both contexts", () => {
				textDifference.config.htmlAware = true;
				textDifference.config.tags = {
					insert: "**",
					delete: "~~",
				};

				expect(textDifference("<p>foo</p>", "<div>foo</div>")).toBe("~~<p>foo</p>~~**<div>foo</div>**");
			});

			test("blockContext tags are applied to block-level EQUAL nodes independently from inline ones", () => {
				textDifference.config.htmlAware = true;
				textDifference.config.tags = {
					blockContext: {
						equal: "§",
					},
				};

				expect(textDifference("<p>foo</p>", "<p>bar</p>")).toBe(
					'§<p>§<span data-diff="delete">foo</span><span data-diff="insert">bar</span>§</p>§',
				);
			});
		});
	});
});
