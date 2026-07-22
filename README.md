# levyUtils
levyUtils is a lightweight, dependency-light library of common JS/TS utility functions covering everyday needs: array/object manipulation, type checks, async helpers, and value conversion.

## How to install
Install with a package manager
```bash
# using npm
npm install levy-utils

# using yarn
yarn add levy-utils

# using pnpm
pnpm add levy-utils

# using bun
bun add levy-utils
```

## Usage
```ts
import { range, sift, toggle } from "levy-utils";
```

## Utils
A list of all the utilities supported:
- [cluster](#clusteritems-size)
- [compute / isComputation](#computevalue-args--iscomputationvalue)
- [counting](#countinglist-identity)
- [defer](#defercallback)
- [entries](#entriesvalue)
- [fork](#forklist-condition)
- [isEmpty](#isemptyvalue)
- [isObject](#isobjectitem)
- [isPrimitive](#isprimitivevalue)
- [keys](#keysvalue)
- [omit](#omitobject-keys)
- [pick](#pickobject-keys)
- [parseUrlParams](#parseurlparamsurl-transform)
- [range](#rangestartorlength-end-options)
- [retry](#retrycallback-options)
- [sift](#siftlist)
- [sleep](#sleepdelay)
- [slug](#slugtext)
- [toFloat](#tofloatvalue-fallback)
- [toInt](#tointvalue-fallback)
- [toggle](#togglelist-itemtotoggle-options)

### `cluster(items, size)`
Clusters a list of items into a list of lists, each limited to a specified size.

```ts
cluster([1, 2, 3, 4, 5], 2);
// Expected output:
// [[1, 2], [3, 4], [5]]
```

### `compute(value, ...args)` / `isComputation(value)`
`compute` resolves a `Computable<T>` — either a plain value or a function that produces one — calling it with the given args if it's a function. `isComputation` checks whether a `Computable<T>` is the function variant.

```ts
compute(5);
// Expected output:
// 5

compute((a: number, b: number) => a + b, 2, 3);
// Expected output:
// 5
```

### `counting(list, identity)`
Reduces a list down to an object of keys (as determined by the `identity` callback) mapped to how many times that key occurred.

```ts
counting(["a", "b", "a", "c", "a"], (item) => item);
// Expected output:
// {
//     a: 3,
//     b: 1,
//     c: 1
// }
```

### `defer(callback)`
Defers a callback to the next execution cycle.

```ts
defer(() => console.log("runs after the current call stack clears"));
```

### `entries(value)`
A typed version of `Object.entries`.

```ts
entries({
    a: 1,
    b: "two",
});
// Expected output:
// [["a", 1], ["b", "two"]] (typed as [K, T[K]][])
```

### `fork(list, condition)`
Splits a list into a tuple of two arrays based on a condition: items that pass, and items that don't.

```ts
fork([1, 2, 3, 4], (n) => n % 2 === 0);
// Expected output:
// [[2, 4], [1, 3]]
```

### `isEmpty(value)`
Checks if a value is considered empty.

All values that are considered empty:
- An empty array (`[]`)
- An empty object (`{}`) (This checks for keys, if a key exist but has no values it will not be counted as empty, see example)
- An empty string (`""`)
- `null`
- `undefined`

```ts
isEmpty([]);
// Expected output:
// true

isEmpty({});
// Expected output:
// true

isEmpty("");
// Expected output:
// true

isEmpty(null);
// Expected output:
// true

isEmpty({
    a: undefined,
});
// Expected output:
// false (the key exists)
```

### `isObject(item)`
Checks if a value is an object, excluding arrays.

```ts
isObject({});
// Expected output:
// true

isObject([]);
// Expected output:
// false
```

### `isPrimitive(value)`
Checks if a value is a primitive: `string`, `number`, `boolean`, `symbol`, `null`, or `undefined`.

```ts
isPrimitive("foo");
// Expected output:
// true

isPrimitive({});
// Expected output:
// false
```

### `keys(value)`
A typed version of `Object.keys`.

```ts
keys({
    a: 1,
    b: 2,
});
// Expected output:
// ["a", "b"] (typed as (keyof T)[])
```

### `omit(object, keys)`
Returns a new object with the specified key(s) removed.

```ts
omit(
    {
        a: 1,
        b: 2,
        c: 3,
    },
    "b",
);
// Expected output:
// {
//     a: 1,
//     c: 3
// }

omit(
    {
        a: 1,
        b: 2,
        c: 3,
    },
    ["a", "c"],
);
// Expected output:
// {
//     b: 2
// }
```

### `pick(object, keys)`
Returns a new object containing only the specified key(s).

```ts
pick(
    {
        a: 1,
        b: 2,
        c: 3,
    },
    "b",
);
// Expected output:
// {
//     b: 2
// }

pick(
    {
        a: 1,
        b: 2,
        c: 3,
    },
    ["a", "c"],
);
// Expected output:
// {
//     a: 1,
//     c: 3
// }
```

### `parseUrlParams(url, transform?)`
Parses the query params of a URL into an object. Optionally accepts a `transform` object to map each param key to a parser function, producing a typed result.

```ts
parseUrlParams("https://example.com?page=2&active=true");
// Expected output:
// {
//     page: "2",
//     active: "true"
// }

parseUrlParams("https://example.com?page=2&active=true", {
    page: toInt,
    active: (value) => value === "true",
});
// Expected output:
// {
//     page: 2,
//     active: true
// }
```

### `range(startOrLength, end?, options?)`
Returns a generator that yields values over a specified range (inclusive), optionally stepped and/or mapped to another value.

```ts
for (const value of range(3)) {
    console.log(value);
}
// Expected output:
// logs 0, 1, 2, 3

for (const value of range(0, 3)) {
    console.log(value);
}
// Expected output:
// logs 0, 1, 2, 3

for (const value of range(0, 6, {
    step: 2,
})) {
    console.log(value);
}
// Expected output:
// logs 0, 2, 4, 6

for (const value of range(0, 3, {
    valueMapper: (step) => `foo-${step}`,
})) {
    console.log(value);
}
// Expected output:
// logs "foo-0", "foo-1", "foo-2", "foo-3"
```

### `retry(callback, options?)`
Retries an async (or sync) callback until it succeeds or the maximum number of attempts is reached.

```ts
await retry(() => fetchSomething(), {
    attempts: 5,
    delay: 500,
    backoff: true,
    onRetry: (error, attempt) => console.log(`attempt ${attempt} failed`, error),
});
```

Options:
- `attempts` — maximum number of attempts (default `3`)
- `delay` — delay between retries in milliseconds (default `1000`)
- `backoff` — whether to double the delay after each retry (default `false`)
- `onRetry` — callback invoked with the error and attempt number on each failed attempt

### `sift(list)`
Filters all falsy values out of a list.

Falsy values are:
- `false`
- `0`
- `0n` (bigint 0)
- `""`
- `null`
- `undefined`

```ts
sift([1, 0, 2, null, 3, undefined, false]);
// Expected output:
// [1, 2, 3]
```

### `sleep(delay)`
Returns a promise that resolves after the specified delay (in milliseconds).

```ts
await sleep(1000);
// Expected output:
// waits 1 second
```

### `slug(text)`
Converts a string into a URL-friendly slug.

```ts
slug("Hello, World!");
// Expected output:
// "hello-world"
```

### `toFloat(value, fallback?)`
Converts a value to a float, falling back to a default (`0` by default) if the conversion fails or the value isn't a supported type.

```ts
toFloat("3.14");
// Expected output:
// 3.14

toFloat(true);
// Expected output:
// 1

toFloat("not a number", -1);
// Expected output:
// -1
```

### `toInt(value, fallback?)`
Converts a value to an integer, falling back to a default (`0` by default) if the conversion fails or the value isn't a supported type.

```ts
toInt("42");
// Expected output:
// 42

toInt(true);
// Expected output:
// 1

toInt("not a number", -1);
// Expected output:
// -1
```

### `toggle(list, itemToToggle, options?)`
Toggles a value in an array: removes it if present, adds it if not.

```ts
toggle([1, 2, 3], 2);
// Expected output:
// [1, 3]

toggle([1, 2, 3], 4);
// Expected output:
// [1, 2, 3, 4]

toggle([1, 2, 3], 4, {
    strategy: "PREPEND",
});
// Expected output:
// [4, 1, 2, 3]

toggle(
    [{ id: 1 }, { id: 2 }],
    {
        id: 1,
    },
    {
        toKey: (item) => item.id,
    },
);
// Expected output:
// [{ id: 2 }]
```

Options:
- `toKey` — maps an item to a key used to determine equality (defaults to comparing items directly)
- `strategy` — `"APPEND"` or `"PREPEND"`, determines where new items are inserted (default `"APPEND"`)
