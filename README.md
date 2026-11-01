# @catstral/levy-utils
@catstral/levy-utils is a lightweight, dependency-light library of common JS/TS utility functions covering everyday needs: array/object manipulation, type checks, async helpers, and value conversion.

## How to install
Install with a package manager
```bash
# using npm
npm install @catstral/levy-utils

# using yarn
yarn add @catstral/levy-utils

# using pnpm
pnpm add @catstral/levy-utils

# using bun
bun add @catstral/levy-utils
```

## Usage
```ts
import { range, sift, toggle } from "@catstral/levy-utils";
```

## Configuration
Every utility has a changable config that can be set to change the default behavior of the utility. This means that you don't have to change how that utility works every time you call it. The config is always available by simply accessing `<utilName>.config`. It also has the readonly defaults available by doing `<utilName>.config.default`.

For example, if you want the [`reduce`](#reducelist-initial-callback-options) utility to always work in descending direction you can do the following:
```ts
reduce.config.direction = "DESCENDING";
```

And now any time you use [`reduce`](#reducelist-initial-callback-options) it will work in the descending direction. The default value of it can still be read out if needed by just reading the `reduce.config.default.direction` value.

If you at some point need to reset the configuration for whatever reason, there is a reset available for the config aswell, it performed by doing `<utilName>.config.reset()`.

> Even if a utilty doesn't have any supported way of configuring how it works, it will still have a config object available for consistency.

## Utils
A list of all the utilities supported:
- [Array utilities](#array-utilities)
  - [cluster](#clusteritems-size)
  - [concat](#concatvalues)
  - [counting](#countinglist-identity)
  - [filter](#filterlist-predicate)
  - [filterMap](#filtermaplist-filter-mapper)
  - [first](#firstlist-fallback)
  - [fork](#forklist-condition)
  - [group](#grouplist-identity)
  - [hasItems](#hasitemslist)
  - [isArray](#isarrayvalue)
  - [last](#lastlist-fallback)
  - [list](#liststartorlength-end-options)
  - [map](#maplist-callback)
  - [max](#maxlist-mapper-options)
  - [min](#minlist-mapper-options)
  - [overflow](#overflowlist-clamplength)
  - [reduce](#reducelist-initial-callback-options)
  - [select](#selectlist-callback)
  - [sift](#siftlist)
  - [sum](#sumlist-mapper)
  - [toggle](#togglelist-itemtotoggle-options)
- [Callback utilities](#callback-utilities)
  - [chain](#chaincallbacks)
  - [compose](#composecallbacks)
  - [defer](#defercallback)
  - [noop](#noop)
  - [pipe](#pipevalue-callback)
  - [preset](#presetcallback-parameters)
  - [retry](#retrycallback-options)
  - [task](#taskcallback)
- [Miscellaneous utilities](#miscellaneous-utilities)
  - [compute / isComputation](#computevalue-args--iscomputationvalue)
  - [identity](#identityvalue)
  - [isEmpty](#isemptyvalue)
  - [isNull](#isnullvalue)
  - [isNullish](#isnullishvalue)
  - [isPrimitive](#isprimitivevalue)
  - [isPromise](#ispromisevalue)
  - [isPromiseLike](#ispromiselikevalue)
  - [isUndefined](#isundefinedvalue)
  - [match](#matchvalue-clause-fallback)
  - [raise](#raisevalue)
  - [Range (class)](#rangerangestring)
    - [static from](#static-fromrange)
    - [details (getter)](#details-getter)
      - [start (getter)](#start-getter)
      - [end (getter)](#end-getter)
      - [step (getter)](#step-getter)
      - [mapper (getter)](#mapper-getter)
    - [start](#startstart)
    - [end](#endend)
    - [step](#stepstep)
    - [map](#mapmapper)
    - [includes](#includesvalue)
    - [excludes](#excludesvalue)
    - [toArray](#toarray)
    - [clone](#clone)
  - [range](#rangestartorlength-end-options)
  - [readOnly / isReadOnly](#readonlyvalue-deepfreeze--isreadonlyvalue)
  - [safe](#safecallback)
  - [sleep](#sleepdelay)
  - [timeout / isTimeoutError](#timeoutvalue-delayms-options--istimeouterrorvalue)
  - [unwrap](#unwrapoption-fallback)
  - [values](#valuestarget)
- [Number utilities](#number-utilities)
  - [Math utilities](#math-utilities)
    - [isPrime](#isPrimevalue)
    - [mod](#moddividend-divisor)
  - [clamp](#clampmin-value-max)
  - [isDecimal](#isdecimalvalue)
  - [isEven](#isevenvalue)
  - [isInteger](#isintegervalue)
  - [isNegative](#isnegativevalue)
  - [isOdd](#isoddvalue)
  - [isPositive](#ispositivevalue)
  - [negative](#negativevalue)
  - [positive](#positivevalue)
  - [sign](#signvalue)
  - [toFloat](#tofloatvalue-fallback)
  - [toInt](#tointvalue-fallback)
  - [trunc](#truncvalue-fractiondigits)
- [Object utilities](#object-utilities)
  - [entries](#entriesvalue)
  - [extend](#extendvalue-other)
  - [isObject](#isobjectitem)
  - [keys](#keysvalue)
  - [omit](#omitobject-keys)
  - [pick](#pickobject-keys)
- [Randomization utilities](#randomization-utilities)
  - [UUID utilities](#uuid-utilities)
    - [uuidMax](#uuidmax)
    - [uuidNil](#uuidnil)
    - [uuidV1 / v1](#uuidv1options)
    - [uuidV4 / v4 / uuid](#uuidv4options)
    - [uuidV7 / v7](#uuidv7options)
  - [chance](#chancepercentage)
  - [draw](#drawlist)
  - [maybe](#maybe)
  - [random](#randommin-max)
  - [scatter](#scatterlist-split-options)
  - [shuffle](#shufflelist)
  - [uid](#uidlength-charset)
- [String utilities](#string-utilities)
  - [Casing utilities](#casing-utilities)
    - [camelCase](#camelcasestr-options)
    - [capitalize](#capitalizestr)
    - [customCase](#customcasestr-options)
    - [httpHeaderCase / trainCase](#httpheadercasestr-options)
    - [kebabCase](#kebabcasestr-options)
    - [lowerCase](#lowercasestr)
    - [pascalCase](#pascalcasestr-options)
    - [snakeCase](#snakecasestr-options)
    - [titleCase](#titlecasestr-options)
    - [uncapitalize](#uncapitalizestr)
    - [upperCase](#uppercasestr)
  - [parseUrlParams](#parseurlparamsurl-transform)
  - [slug](#slugtext)
  - [textDifference](#textdifferenceoldvalue-newvalue-options)

<!-- SECTION: Array utils -->

### Array utilities
#### `cluster(items, size)`
Clusters a list of items into a list of lists, each limited to a specified size.

```ts
cluster([1, 2, 3, 4, 5], 2);
// Expected output:
// [[1, 2], [3, 4], [5]]
```

##### Config
This utility does not have any config.

#### `concat(...values)`
Concatenates values and arrays into a new array.

```ts
concat(1, [2, 3], 4);
// Expected output:
// [1, 2, 3, 4]
```

##### Config
This utility does not have any config.

#### `counting(list, identity)`
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

##### Config
This utility does not have any config.

#### `filter(list, predicate)`
Returns a new list containing the items of a given list that pass a predicate.

If the predicate returns a promise for any item, a promise is returned that resolves once all of them have.

```ts
filter([1, 2, 3, 4], (n) => n % 2 === 0);
// Expected output:
// [2, 4]

await filter([1, 2, 3], async (n) => n > 1);
// Expected output:
// [2, 3]
```

##### Config
This utility does not have any config.

#### `filterMap(list, filter, mapper)`
Returns a new list of items based on filtered and mapped values of a given list.

```ts
filterMap(
    [1, 2, 3, 4],
    (n) => n % 2 === 0,
    (n) => n * 10,
);
// Expected output:
// [20, 40]
```

> This utility was formerly called `select`.

##### Config
This utility does not have any config.

#### `first(list, fallback?)`
Returns the first item of a list, or a fallback if the list is empty.

```ts
first([1, 2, 3]);
// Expected output:
// 1

first([], "none");
// Expected output:
// "none"
```

##### Config
This utility does not have any config.

#### `fork(list, condition)`
Splits a list into a tuple of two arrays based on a condition: items that pass, and items that don't.

```ts
fork([1, 2, 3, 4], (n) => n % 2 === 0);
// Expected output:
// [[2, 4], [1, 3]]
```

##### Config
This utility does not have any config.

#### `group(list, identity)`
Groups the items of a list into an object of keys (as determined by the `identity` callback) mapped to the items with that key.

```ts
group(["apple", "avocado", "banana"], (item) => item[0]);
// Expected output:
// {
//     a: ["apple", "avocado"],
//     b: ["banana"],
// }
```

##### Config
This utility does not have any config.

#### `hasItems(list)`
Checks if a list has at least one item, narrowing its type to a non-empty tuple.

```ts
hasItems([1, 2, 3]);
// Expected output:
// true

hasItems([]);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isArray(value)`
Returns a boolean whether the given value is an array or not.

```ts
isArray([]);
// Expected output:
// true

isArray({});
// expected output:
// false
```

##### Config
This utility does not have any config.

#### `last(list, fallback?)`
Returns the last item of a list, or a fallback if the list is empty.

```ts
last([1, 2, 3]);
// Expected output:
// 3

last([], "none");
// Expected output:
// "none"
```

##### Config
This utility does not have any config.

### `list(startOrLength, end?, options?)`
Returns an array with values to a specified size (inclusive), optionally stepped and/or mapped to another value.

```ts
list(3)
// Expected output:
// [0, 1, 2, 3]

list(0, 3)
// Expected output:
// [0, 1, 2, 3]

list(0, 6, {
    step: 2,
})
// Expected output:
// [0, 2, 4, 6]

list(0, 3, {
    valueMapper: (step) => `foo-${step}`,
})
// Expected output:
// ["foo-0", "foo-1", "foo-2", "foo-3"]
```

options:
- `step` - The steps used to generate the array.
- `valueMapper` - A mapper function to map a step to a value.

##### Config
This utility has the following config available:
- `step` (default: `undefined`) - The step used to generate the array.

#### `map(list, callback)`
Returns a new list of items based on mapped values of a given list.

If the callback returns a promise for any item, a promise is returned that resolves once all of them have.

```ts
map([1, 2, 3], (n) => n * 2);
// Expected output:
// [2, 4, 6]

await map([1, 2, 3], async (n) => n + 1);
// Expected output:
// [2, 3, 4]
```

##### Config
This utility does not have any config.

#### `max(list, mapper?, options?)`
Returns the largest item from a list.

```ts
max([1, 2, 3]);
// Expected output:
// 3

max(
    [
        {
            name: "Bob"
            weight: 54
        },
        {
            name: "Paul"
            weight: 87
        },
        {
            name: "Jane"
            weight: 63
        },
    ],
    (item) => item.weight,
);
// Expected output:
// {
//     name: "Paul",
//     weight: 87,
// }
```

##### Config
This utility has the following config available:
- `direction` (default: `"ASCENDING"`) - The direction the list should be checked in.

#### `min(list, mapper?, options?)`
Returns the smallest item from a list.

```ts
min([1, 2, 3]);
// Expected output:
// 1

min(
    [
        {
            name: "Bob"
            weight: 54
        },
        {
            name: "Paul"
            weight: 87
        },
        {
            name: "Jane"
            weight: 63
        },
    ],
    (item) => item.weight,
);
// Expected output:
// {
//     name: "Bob",
//     weight: 54,
// }
```

##### Config
This utility has the following config available:
- `direction` (default: `"ASCENDING"`) - The direction the list should be checked in.

#### `overflow(list, clampLength)`
Splits a list into a tuple of two arrays: the first `clampLength` items, and the rest of the items.

Throws an `OverflowUtilError` if the clamp length is negative or the given list is not an array.

```ts
overflow([1, 2, 3, 4, 5], 3);
// Expected output:
// [[1, 2, 3], [4, 5]]
```

##### Config
This utility does not have any config.

#### `reduce(list, initial, callback, options?)`
Reduces all items of a list down to an accumulated result.

```ts
reduce([1, 2, 3], 0, (acc, n) => acc + n);
// Expected output:
// 6

reduce(["a", "b", "c"], "", (acc, letter) => acc + letter, {
    direction: "DESCENDING",
});
// Expected output:
// "cba"

reduce([1, 2, 3], 0, (acc, n) => acc + n, {
    result: (total) => `Total: ${total}`,
});
// Expected output:
// "Total: 6"
```

Options:
- `direction` - `"ASCENDING"` or `"DESCENDING"`, determines the order the list is reduced in (default `"ASCENDING"`)
- `result` - transforms the final accumulator into the returned result

##### Config
This utility has the following config available:
- `direction` (default: `"ASCENDING"`) - The direction the list should be checked in.

#### `select(list, callback)`
Returns a new list built by deciding, per item, what should end up in the result. The callback receives a context object and must return one of its actions.

```ts
select(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ({ item, keep, discard, filter }) => {
        if (item < 3) {
            return keep();
        }
    
        if (item > 8) {
            return discard();
        }
    
        return filter(item % 2 === 0);
    },
);
// Expected output:
// [1, 2, 4, 6, 8]

select<number | string[] | null, string>(
    [1, ["2", "3", "4"], null, ["7", "8", "9"], 10],
    ({ item, map, flat, spread }) => {
        if (typeof item === "number") {
            return map(item.toString());
        }

        if (Array.isArray(item)) {
            return flat(item);
        }

        return spread("5", "6");
    },
);
// Expected output:
// ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
```

Available actions:
- `keep()` - keeps the current item
- `discard()` - removes the current item
- `filter(keep)` - keeps or removes the current item based on a boolean
- `map(value)` - replaces the current item with a value
- `flat(values)` - replaces the current item with every value of a list
- `spread(...values)` - replaces the current item with every given value

Throws a `SelectUtilError` if the callback returns an invalid action.

This utility was reworked, it's old behaviour has moved to the `filterMap` utility.

##### Config
This utility does not have any config.

#### `sift(list)`
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

##### Config
This utility does not have any config.

#### `sum(list, mapper?)`
Sums a list of items into a total number.

```ts
sum([1, 2, 3]);
// Expected output:
// 6

sum([1, 2, 3], (n) => n * 2);
// Expected output:
// 12

sum([false, true, "", "Hello", null, {}, undefined, []]);
// Expected output:
// 4

sum(["3", "4", "5"], (item) => Number.parseInt(item, 10));
// Expected output:
// 12
```

##### Config
This utility does not have any config.

#### `toggle(list, itemToToggle, options?)`
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
- `toKey` - maps an item to a key used to determine equality (defaults to comparing items directly)
- `strategy` - `"APPEND"` or `"PREPEND"`, determines where new items are inserted (default `"APPEND"`)

##### Config
This utility has the following config available:
- `strategy` (default: `"APPEND"`) - The strategy to use when toggling a value.

<!-- !SECTION -->
<!-- SECTION: Callback utils -->


### Callback utilities
#### `chain(...callbacks)`
Chains many callbacks together, with each callback accepting the result of the previous one as an argument, returning the result of the final callback.

Note: due to a TypeScript limitation, the argument of each chained callback requires a type hint in order to infer the argument correctly (it does not allow passing an invalid argument type however).

```ts
// note the type hint for the argument
chain(() => true, (value: boolean) => value ? "true" : "false");
// Expected output:
// "true"
```

##### Config
This utility does not have any config.

#### `compose(...callbacks)`
Turns many callbacks into a single re-usable callback.

```ts
const fn = compose(
    (n: number) => n + 1,
    (n: number) => n * 2,
);

fn(2);
// Expected output:
// 6

fn(5);
// Expected output:
// 12
```

##### Config
This utility does not have any config.

#### `defer(callback)`
Defers a callback to the next execution cycle.

```ts
defer(() => console.log("runs after the current call stack clears"));
```

##### Config
This utility does not have any config.

#### `noop()`
No operation, this function does nothing. Useful for placeholder code.

```ts
noop();
// Expected output:
// undefined
```

##### Config
This utility does not have any config.

#### `pipe(value, callback)`
Pipes a value into a callback and returns its result.

```ts
pipe(5, (n) => n * 2);
// Expected output:
// 10

pipe("Foo", (value) => `${value} Bar`);
// Expected output:
// "Foo Bar"
```

##### Config
This utility does not have any config.

#### `preset(callback, parameters)`
Presets the parameters of a callback with a callback that computes its arguments.

```ts
const fn = preset(
    Number.parseInt,
    (value: string): [string, number] => [value, 10],
);

fn("10");
// Expected output:
// 10

fn("3.2");
// Expected output:
// 3

preset(Number.parseInt, ["0", 10])();
// Expected output:
// 0
```

##### Config
This utility does not have any config.

#### `retry(callback, options?)`
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
- `attempts` - maximum number of attempts (default `3`)
- `delay` - delay between retries in milliseconds (default `1000`)
- `backoff` - whether to double the delay after each retry (default `false`)
- `onRetry` - callback invoked with the error and attempt number on each failed attempt

##### Config
This utility has the following config available:
- `attempts` (default: `3`) - Maximum number of attempts.
- `delay` (default: `1000`) - Delay between retries in milliseconds.
- `backoff` (default: `false`) - Whether to double the delay after each retry
- `onRetry` (default: `undefined`) - callback invoked with the error and attempt number on each failed attempt.

#### `task(callback?)`
Executes the given callback in asynchronous context.

```ts
// This yields execution to the microtask queue.
await task();

// A task that has a seperate asynchronous flow 
task(async () => {
    await doSomething();
});
```

##### Config
This utility does not have any config.

<!-- !SECTION -->
<!-- SECTION: Misc utils -->

### miscellaneous utilities
#### `compute(value, ...args)` / `isComputation(value)`
`compute` resolves a `Computable<T>` - either a plain value or a function that produces one - calling it with the given args if it's a function. `isComputation` checks whether a `Computable<T>` is the function variant.

```ts
compute(5);
// Expected output:
// 5

compute((a: number, b: number) => a + b, 2, 3);
// Expected output:
// 5
```

##### Config
This utility does not have any config.

#### `identity(value)`
Returns the given value as is, with its type inferred as narrowly as possible (as a `const` generic).

```ts
identity(5);
// Expected output:
// 5

identity({
    a: 1,
});
// Expected output:
// {
//     a: 1,
// }
```

##### Config
This utility does not have any config.

#### `isEmpty(value)`
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

##### Config
This utility does not have any config.

#### `isNull(value)`
Checks if a value is `null`.

```ts
isNull(null);
// Expected output:
// true

isNull(undefined);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isNullish(value)`
Checks if a value is nullish: `null` or `undefined`.

```ts
isNullish(null);
// Expected output:
// true

isNullish(undefined);
// Expected output:
// true

isNullish(0);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isPrimitive(value)`
Checks if a value is a primitive: `string`, `number`, `boolean`, `symbol`, `null`, or `undefined`.

```ts
isPrimitive("foo");
// Expected output:
// true

isPrimitive({});
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isPromise(value)`
Checks if a value is a `Promise` (an instance of `Promise`).

```ts
isPromise(Promise.resolve(1));
// Expected output:
// true

isPromise({ 
    then: () => {},
});
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isPromiseLike(value)`
Checks if a value is promise-like: an object with a `then` function.

```ts
isPromiseLike(Promise.resolve(1));
// Expected output:
// true

isPromiseLike({
    then: () => {},
});
// Expected output:
// true

isPromiseLike({});
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isUndefined(value)`
Checks if a value is `undefined`.

```ts
isUndefined(undefined);
// Expected output:
// true

isUndefined(null);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `match(value, clause, fallback?)`
Matches a value to a clause that return a value
and returns a fallback if none of the cases match.

```ts
const fn = (value: string) => {
    return match(
        value,
        {
            A: 1,
            B: 2,
        },
        -1,
    );
};

fn("A");
// Expected output:
// 1

fn("B");
// Expected output:
// 2

fn("C");
// Expected output:
// -1
```

##### Config
This utility does not have any config.

#### `raise(value)`
Throws the given value, never returns.

- A string is wrapped in an `Error`.
- A function is called without arguments and its result is thrown.
- Any other value is thrown as is.

This is useful for throwing in expression positions, such as a fallback.

```ts
raise("Something went wrong");
// Expected to throw:
// Error("Something went wrong")

raise(() => new RangeError("Out of range"));
// Expected to throw:
// RangeError("Out of range")
```

##### Config
This utility does not have any config.

#### `Range(rangeString?)`
> The constructor of this has an overload:  
> `Range(details?)`
> 
> Details:
> - `start` - The start value of the range (optional).
> - `inclusiveStart` - If the range should consider the `start` to be inclusive (optional).
> - `end` - The end value of the range (optional)
> - `inclusiveEnd` - If the range should consider the `end` to be inclusive (optional).
> - `step` - The step value of the range (optional).
> - `mapper` - The mapper of the range, this maps a step to a value (optional).

This is a class representing a range value, it is an iterable and generates values based on a start and end value (if specified).

If no start of end value is specified the range will work as expected with methods, but trying to iterate over it will throw an error.

It can also be given a `step` and a `mapper` to define how it should be generating a value.

If the argument given is a string, then it is expected to have that string match the following definition:
`S?>?..=?E?` where:
* `S` - The start of the range (optional)
* `E` - The end of the range (optional)
* `>` - If the start value is exclusive of this range (optional)
* `=` - If the end value is inclusive of this range (optional)

Here is a simple table explaining the different types of range strings:
| Syntax             | Range           | Is iterable |
| -------------------| --------------- | ----------- |
| `[start]..[end]`   | start ≤ x < end | Yes         |
| `[start]>..[end]`  | start < x < end | Yes         |
| `[start]..=[end]`  | start ≤ x ≤ end | Yes         |
| `[start]>..=[end]` | start < x ≤ end | Yes         |
| `..`               | -               | No          |
| `[start]..`        | start ≤ x       | No          |
| `[start]>..`       | start < x       | No          |
| `..[end]`          | x < end         | No          |
| `..=[end]`         | x ≤ end         | No          |

If a value is not iterable, that means it will throw an error on attempting to iterate the range.  
A full range is a range without bounds, this mostly exists for completeness and would effect how certain methods of the range work, see the methods for more details on how they are effected.

> This class can also be gotten from the [range](#rangestartorlength-end-options) utility function.

##### `static from(range)`
Creates a new range with the details from the specified range.

> This does the same as [Range.clone](#clone)

##### `details (getter)`
Gets the internal details of the Range.

> This is a getter, no value can be set here.

###### `start (getter)`
Gets the start value of range.

> This is a getter, no value can be set here.

###### `end (getter)`
Gets the end value of range.

> This is a getter, no value can be set here.

###### `step (getter)`
Gets the step value of range.

> This is a getter, no value can be set here.

###### `mapper (getter)`
Gets the mapper value of range.

> This is a getter, no value can be set here.

##### `start(start?)`
Creates a new Range with a given start value set.

##### `inclusiveStart(inclusiveStart)`
Creates a new Range with a given inclusive start value set.

##### `end(end?)`
Creates a new Range with a given end value set.

##### `inclusiveEnd(inclusiveEnd)`
Creates a new Range with a given inclusive  end value set.

##### `step(step?)`
Creates a new Range with a given step value set.

##### `map(mapper)`
Creates a new Range with a given mapper set.

##### `includes(value)`
Returns a boolean to signal if the given value is included in the range.

> Notes:
> - If the range is a full range, then this will **always** return true.
> - `NaN` will **always** return false (unless the range is a full range).

##### `excludes(value)`
Returns a boolean to signal if the given value is excluded from the range.

> Notes:
> - If the range is a full range, then this will **always** return false.
> - `NaN` will **always** return false.

##### `toArray()`
Returns an array based on the values of the range.

##### `clone()`
Returns a new Range with same details.

> This does the same as [static Range.from](#static-fromrange)

#### `range(startOrLength, end?, options?)`
Returns a [Range](#rangerangestring) that yields values over a specified range (inclusive), optionally stepped and/or mapped to another value.

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

for (const value of range(0, 3, {
    inclusiveStart: false,
})) {
    console.log(value);
}
// Expected output:
// logs 1, 2, 3

for (const value of range(0, 3, {
    inclusiveEnd: false,
})) {
    console.log(value);
}
// Expected output:
// logs 0, 1, 2
```

options:
- `step` - The steps used to generate the array.
- `valueMapper` - A mapper function to map a step to a value.
- `inclusiveStart` - Wether the start value is considered inclusive.
- `inclusiveEnd` - Wether the end value is considered inclusive.

> NOTE: `inclusiveEnd` default value here differs from the `inclusiveEnd` value set by [`Range`](#rangerangestring), this is for backwards compatibility.

##### Config
This utility does not have any config.

#### `readOnly(value, deepFreeze?)` / `isReadOnly(value)`
`readOnly` returns a read-only copy of an object, array, map, or set.

`isReadOnly` checks if a value is frozen.

```ts
const original = {
    a: 1,
    nested: {
        b: 2
    }
};
const shallow = readOnly(original);
const deep = readOnly(original, true);

isReadOnly(shallow);
// Expected output:
// true

shallow.nested === original.nested;
// Expected output:
// true (nested values are shared and still mutable)

deep.nested === original.nested;
// Expected output:
// false (nested values are cloned and frozen)

isReadOnly(original);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `safe(callback)`
Executes the given callback and returns an option of the result.

```ts
safe(() => {
    return "Hello world";
});
// Expected output:
// {
//     success: true,
//     value: "Hello world",
// }

safe(() => {  
    throw new Error("Goodbye world");
});
// Expected output:
// {
//     success: false,
//     error: Error("Goodbye world"),
// }
```

##### Config
This utility does not have any config.

#### `sleep(delay)`
Returns a promise that resolves after the specified delay (in milliseconds).

```ts
await sleep(1000);
// Expected output:
// waits 1 second
```

##### Config
This utility does not have any config.

#### `timeout(value, delayMs, options?)` / `isTimeoutError(value)`
Wraps a promise (or a callback that returns one) into a promise that rejects with a `TimeoutError` if it hasn't settled after the given delay (in milliseconds). If the promise settles first, its result (or error) is passed through.

When given a callback, it receives an `AbortSignal` which is aborted when the delay elapses, so the underlying operation can be cancelled.

`isTimeoutError` checks if a value is a `TimeoutError`.

```ts
await timeout(sleep(100), 1000);
// Expected output:
// resolves after 100ms

await timeout(sleep(2000), 1000);
// Expected to throw:
// TimeoutError("The operation was timed out after 1000ms")

await timeout(
    (signal) => fetch("https://example.com", { 
        signal,
    }),
    1000,
);
// Expected output:
// the response, or a rejection (and an aborted request) if it takes longer than 1 second

try {
    await timeout(sleep(2000), 1000);
} catch (error) {
    isTimeoutError(error);
    // Expected output:
    // true
}
```

Options:
- `onTimeout` - a callback invoked with the delay when it elapses. Throwing inside it rejects the promise with the thrown value instead of a `TimeoutError`.

##### Config
This utility does not have any config.

#### `unwrap(option, fallback?)`
Directly returns the option's value, or throws the option's error.
An option's error won't be thrown when a fallback is provided.

```ts
const option = safe(() => {
    throw new Error("Goodbye world");
});

unwrap(option);
// Expected to throw:
// Error("Goodbye world")

unwrap(option, null);
// Expected output:
// null
```

##### Config
This utility does not have any config.

#### `values(target)`
Returns an array of values based on the given target.

```ts
values([1, 2, 3]);
// Expected output:
// [1, 2, 3]

values(new Set([4, 5, 6]));
// Expected output:
// [4, 5, 6]

values({
  A: "a",
  B: "b",
  C: "c",
});
// Expected output:
// ["a", "b", "c"]

values(new Map([
  ["D", "d"],
  ["E", "e"],
  ["F", "f"],
]));
// Expected output:
// ["d", "e", "f"]
```

##### Config
This utility does not have any config.

<!-- !SECTION -->
<!-- SECTION: Number utils -->

### Number utilities
#### Math utilities
##### `isPrime(value)`
Checks if the given value is a prime number.

```ts
isPrime(11);
// Expected output:
// true

isPrime(4);
// Expected output:
// false

isPrime(103);
// Expected output:
// true

isPrime(-9.2);
// Expected output:
// false
```

###### Config
This utility does not have any config.

##### `mod(dividend, divisor)`
Returns the modulo of a dividend and a divisor.

```ts
mod(10, 5);
// Expected output:
// 0

mod(-2, 4);
// Expected output:
// 2

mod(6, 10);
// Expected output:
// 6
```

###### Config
This utility does not have any config.

#### `clamp(min, value, max)`
Clamps a number between a minimum and maximum value.

```ts
clamp(-5, 0, 5);
// Expected output:
// 0

clamp(-5, 20, 5);
// Expected output:
// 5

clamp(-5, -20, 5);
// Expected output:
// -5
```

##### Config
This utility does not have any config.

#### `isDecimal(value)`
Checks if the given value is a number with decimals.

```ts
isDecimal(1.1);
// Expected output:
// true

isDecimal(1);
// Expected output:
// false

isDecimal(NaN);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isEven(value)`
Checks if the given value is an even number.

```ts
isEven(4);
// Expected output:
// true

isEven(3);
// Expected output:
// false

isEven(0.5);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isInteger(value)`
Checks if the given value is an integer.

```ts
isInteger(4);
// Expected output:
// true

isInteger(4.5);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isNegative(value)`
Checks if the given value is a negative number.

```ts
isNegative(-5);
// Expected output:
// true

isNegative(5);
// Expected output:
// false

isNegative(-0);
// Expected output:
// true
```

##### Config
This utility does not have any config.

#### `isOdd(value)`
Checks if the given value is an odd number.

```ts
isOdd(3);
// Expected output:
// true

isOdd(4);
// Expected output:
// false

isOdd(0.5);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `isPositive(value)`
Checks if the given value is a positive number.

```ts
isPositive(5);
// Expected output:
// true

isPositive(-5);
// Expected output:
// false

isPositive(0);
// Expected output:
// true
```

##### Config
This utility does not have any config.

#### `negative(value)`
Converts a number into a negative number.

```ts
negative(5);
// Expected output:
// -5

negative(-5);
// Expected output:
// -5
```

##### Config
This utility does not have any config.

#### `positive(value)`
Converts a number into a positive number.

```ts
positive(-5);
// Expected output:
// 5

positive(5);
// Expected output:
// 5
```

##### Config
This utility does not have any config.

#### `sign(value)`
Returns the sign of the given number: `1` if positive, `-1` if negative, `0` if zero (`NaN` is converted into zero).

```ts
sign(5);
// Expected output:
// 1

sign(-5);
// Expected output:
// -1

sign(0);
// Expected output:
// 0

sign(NaN);
// Expected output:
// 0
```

##### Config
This utility does not have any config.

#### `toFloat(value, fallback?)`
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

##### Config
This utility has the following config available:
- `fallback` (default: `0`) - The number to fallback to if the conversion fails.

#### `toInt(value, fallback?)`
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

##### Config
This utility has the following config available:
- `fallback` (default: `0`) - The number to fallback to if the conversion fails.

#### `trunc(value, fractionDigits?)`
Truncates a number to the specified number of fraction digits.

```ts
trunc(1.58);
// Expected output:
// 1

trunc(1.456, 2);
// Expected output:
// 1.45

trunc(1.789, 10)
// Expected output:
// 1.789
```

##### Config
This utility has the following config available:
- `fractionDigits` (default: `0`) - The number of fraction digits to truncate to.

<!-- !SECTION -->
<!-- SECTION: object -->

### Object utilities
#### `entries(value)`
A typed version of `Object.entries`.

```ts
entries({
    a: 1,
    b: "two",
});
// Expected output:
// [["a", 1], ["b", "two"]] (typed as [K, T[K]][])
```

##### Config
This utility does not have any config.

#### `extend(value, other)`
Extends an object with another object.

```ts
extend(
    {
        key: "value",
    },
    {
        foo: "bar",
    },
);
// Expected output:
// {
//     key: "value",
//     foo: "bar",
// }
```

##### Config
This utility does not have any config.

#### `isObject(item)`
Checks if a value is an object, excluding arrays.

```ts
isObject({});
// Expected output:
// true

isObject([]);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `keys(value)`
A typed version of `Object.keys`.

```ts
keys({
    a: 1,
    b: 2,
});
// Expected output:
// ["a", "b"] (typed as (keyof T)[])
```

##### Config
This utility does not have any config.

#### `omit(object, keys)`
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

##### Config
This utility does not have any config.

#### `pick(object, keys)`
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

##### Config
This utility does not have any config.

<!-- !SECTION -->
<!-- SECTION: Random utils -->
### Randomization utilities
Almost all utilites that generate someting at random are done with a cryptographically secure pseudorandom number generator (called from now own **CSPRNG**) and utilizes the [`crypto.getRandomValues`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) method. If a utility does not use this, it will be mentioned in the description of that utility.

#### UUID utilities
##### `uuidMax()`
Returns the max UUID string possible.

```ts
uuidMax();
// Expected output:
// "ffffffff-ffff-ffff-ffff-ffffffffffff"
```

##### Config
This utility does not have any config.

##### `uuidNil()`
Returns the nil UUID string.

```ts
uuidNil();
// Expected output:
// "00000000-0000-0000-0000-000000000000"
```

##### Config
This utility does not have any config.

#### `uuidV1(options?)`
> This is also aliased to `v1`

Returns a randomly generated UUID V1 string.

```ts
uuidV1();
// Possible output:
// c232ab00-9414-11ec-b3c8-9f68deced846

uuidV1({
    random: Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 0, 0x33c8 >> 8, 0x33c8 & 0xff, 0x9f, 0x68, 0xde, 0xce, 0xd8, 0x46),
    milliseconds: 0x17f22e279b0,
    nanoseconds: 0,
    clockSequence: 0x33c8,
    node: Uint8Array.of(0x9f, 0x68, 0xde, 0xce, 0xd8, 0x46),
})
// Expected output:
// c232ab00-9414-11ec-b3c8-9f68deced846
```

options:
- `random` - The random bytes used to generate the UUID.
- `rng` - A function to generate a list of random bytes for UUID generation.
- `milliseconds` - A number that represents the amount of milliseconds from the EPOCH (number of milliseconds since 01-01-1970).
- `nanoseconds` - A number that represents tha amount of nanoseconds have elapsed in the specified millisecond (This will always be 0 if not defined, javascript does not measure beyond the millisecond range).
- `clockSequence` - The current clock sequence used for generation.
- `node` - A list of random bytes used to complete the UUID V1.

##### Config
This utility has the following config available:
- `random` (default: `undefined`) - The random bytes used to generate the UUID.
- `rng` (default: `undefined`) - A function to generate a list of random bytes for UUID generation.
- `milliseconds` (default: `undefined`) - A number that represents the amount of milliseconds from the EPOCH (number of milliseconds since 01-01-1970).
- `nanoseconds` (default: `undefined`) - A number that represents tha amount of nanoseconds have elapsed in the specified millisecond (This will always be 0 if not defined, javascript does not measure beyond the millisecond range).
- `clockSequence` (default: `undefined`) - The current clock sequence used for generation.
- `node` (default: `undefined`) - A list of random bytes used to complete the UUID V1.

#### `uuidV4(options?)`
> This is also aliased to `v4` or `uuid`

Returns a randomly generated UUID V4 string.

```ts
uuidV4();
// Possible output:
// 919108f7-52d1-4320-9bac-f847db4148a8

uuidV4({
    random: Uint8Array.of(0x91, 0x91, 0x08, 0xf7, 0x52, 0xd1, 0x43, 0x20, 0x9b, 0xac, 0xf8, 0x47, 0xdb, 0x41, 0x48, 0xa8),
})
// Expected output:
// 919108f7-52d1-4320-9bac-f847db4148a8
```

options:
- `random` - The random bytes used to generate the UUID.
- `rng` - A function to generate a list of random bytes for UUID generation.

##### Config
This utility has the following config available:
- `random` (default: `undefined`) - The random bytes used to generate the UUID.
- `rng` (default: `undefined`) - A function to generate a list of random bytes for UUID generation.

#### `uuidV7(options?)`
> This is also aliased to `v7`

Returns a randomly generated UUID V7 string.

```ts
uuidV7();
// Possible output:
// 017f22e2-79b0-7cc3-98c4-dc0c0c07398f

uuidV7({
    random: Uint8Array.of(0x10, 0x7f, 0x22, 0xe2, 0x79, 0xb0, 0x7c, 0xc3, 0x98, 0xc4, 0xdc, 0x0c, 0x0c, 0x07, 0x39, 0x8f),
    milliseconds: 0x017f22e279b0,
    sequence: 0xcc363137,
})
// Expected output:
// 017f22e2-79b0-7cc3-98c4-dc0c0c07398f
```

options:
- `random` - The random bytes used to generate the UUID.
- `rng` - A function to generate a list of random bytes for UUID generation.
- `milliseconds` - A number that represents the amount of milliseconds from the EPOCH (number of milliseconds since 01-01-1970).
- `sequence` - The current clock sequence used for generation.

##### Config
This utility has the following config available:
- `random` (default: `undefined`) - The random bytes used to generate the UUID.
- `rng` (default: `undefined`) - A function to generate a list of random bytes for UUID generation.
- `milliseconds` (default: `undefined`) - A number that represents the amount of milliseconds from the EPOCH (number of milliseconds since 01-01-1970).
- `sequence` (default: `undefined`) - The current clock sequence used for generation.

#### `chance(percentage)`
Returns a random boolean based on the specified percentage.  
The percentage must be a number between 0 and 1. If it is not inside that range it will return a fixed value according to that percentage, so if percentage is more than or equal to 1 it will always return true and if percentage is less than or equal to 0 it will always return false.

```ts
chance(0.5);
// Expected output:
// true | false

chance(1);
// Expected output:
// true

chance(0);
// Expected output:
// false
```

##### Config
This utility does not have any config.

#### `draw(list)`
Returns a random item from a specified list (or `undefined` if the list is empty).

```ts
draw([0, 1, 2, 3]);
// Expected output:
// 0 | 1 | 2 | 3

draw([]);
// Expected output:
// undefined
```

##### Config
This utility does not have any config.

#### `maybe()`
Returns a random boolean.

```ts
maybe();
// Expected output:
// true | false
```

##### Config
This utility does not have any config.

#### `random(min?, max?)`
Returns a random value between a specified minimum and maximum value.

If the minimum and maximum values contradict each other, then this function will return `NaN`.

> NOTE: this utility does **NOT** use [CSPRNG](#randomization-utilities).

```ts
random();
// Expected output:
// n where n > 0 and n < 1

random(10, 20);
// Expected output:
// n where n > 10 and n < 20

random(1, 0);
// Expected output:
// NaN
```

##### Config
This utility does not have any config.

#### `scatter(list, split?, options?)`
Given an array, splits that array into 2 given a hard split and devides the items at random into the 2 given lists.  
The split must be a number between 0 and 1. If it is not inside that range it will return a fixed sized array according to that split, so if percentage is more than or equal to 1 it will always return `[list, []]` and if percentage is less than or equal to 0 it will always return `[[], list]` (Do note that these are handled as exception cases, meaning if this is the case then the first list will not be in a random order, but preserved order instead).

> NOTE: the first array will be in a random order, while the second array will have the order preserved.

```ts
scatter([0, 1, 2, 3, 4]);
// Possible output:
// [[3, 2, 4], [0, 1]]

scatter([0, 1, 2, 3, 4], 0.6);
// Possible output:
// [[3, 2, 4], [0, 1]]

scatter([0, 1, 2, 3, 4], 0.4);
// Possible output:
// [[2, 4], [0, 1, 3]]


scatter([0, 1, 2, 3, 4], 0.5, {
    bias: "FLOOR",
});
// Possible output:
// [[2, 4], [0, 1, 3]]

scatter([0, 1, 2, 3, 4], 0.5, {
    bias: "ROUND",
});
// Possible output:
// [[3, 2, 4], [0, 1]]

scatter([0, 1, 2, 3, 4], 0.5, {
    bias: "CEILING",
});
// Possible output:
// [[3, 2, 4], [0, 1]]
```

options:
- `bias` - When the split does not work exactly for the given array length, this will decide how to split the final item (e.g. given an array of 5 items and a split of `0.5` (50%), the bias will decide if the split will be `3 - 2` or `2 - 3`) (default = `"ROUND"`)

##### Config
This utility has the following config available:
- `bias` (default: `"ROUND"`) - When the split does not work exactly for the given array length, this will decide how to split the final item.

#### `shuffle(list)`
Shuffles the array into a new array will all the items in a random order.

```ts
shuffle([0, 1, 2, 3, 4]);
// Possible output:
// [2, 4, 0, 1, 3]
```

##### Config
This utility does not have any config.

#### `uid(length?, charset?)`
Returns a random string of characters gotten from a specified charset that can be used for ids.  
The default length is `8` and the default charset is `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`.

```ts
uid();
// Possible output:
// "Dae3pmZH"

uid(12);
// Possible output:
// "9lqD8Mp3CUrK"

uid(8, "Aa");
// Possible output:
// "AaAAAaAA"
```

##### Config
This utility has the following config available:
- `length` (default: `8`) - The length of the randomly generated string.
- `charset` (default: `"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"`) - The string of where to pick the random characters from.

<!-- !SECTION -->
<!-- SECTION: String utils -->

### String utilities
#### Casing utilities
##### `camelCase(str, options?)`
Turns a string into a camel cased version of that same string.

```ts
camelCase("Some value");
// Expected output:
// "someValue"

camelCase("someValue");
// Expected output:
// "someValue"

camelCase("some_value");
// Expected output:
// "someValue"

camelCase("some 123 value");
// Expected output:
// "some123value"

camelCase("some 123 value", { groupNumbers: true });
// Expected output:
// "some123Value"

camelCase("someUPPERValue");
// Expected output:
// "someUpperValue"

camelCase("someUPPERValue", { groupUppercaseLetters: false });
// Expected output:
// "someUPPERValue"
```

> The options for this are inherited from [`customCase`](#customcasestr-options) but without the seperator and word transformer

##### Config
This utility has the following config available:
- `groupNumbers` (default: `false`) - Whether a run of digits should be split off into its own word, or seen as normal characters of the same word.
- `groupUppercaseLetters` (default: `true`) - Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time.
- `parser` (default: `undefined`) - A custom parser to parse a given string into word that are then used for changing the casing of words.

##### `capitalize(str)`
Converts the first character of string to uppercase.

```ts
capitalize("some value");
// Expected output:
// "Some value"
```

##### Config
This utility does not have any config.

##### `customCase(str, options)`
Converts a string into a custom cased version of the string, required a seperator and word transformer to work.

> NOTE:  
> This library also exports other casing utils that use this function under the hood and can (and most likely should) be used in most cases.

```ts
customCase("someValue", {
    seperator: ".",
    transform: (str) => str.toLowercase(),
});
// Expected output:
// "some.value"

customCase("someValue", {
    seperator: ".",
    transform: (str, index) => `${str.toLowercase()}${index}`,
});
// Expected output:
// "some0.value1"

customCase("someValue123", {
    seperator: ".",
    transform: (str) => str.toLowercase(),
});
// Expected output:
// "some.value123"

customCase("someValue123", {
    seperator: ".",
    transform: (str) => str.toLowercase(),
    groupNumbers: true,
});
// Expected output:
// "some.value.123"

customCase("HTTP", {
    seperator: ".",
    transform: (str) => str.toLowercase(),
});
// Expected output:
// "http"

customCase("HTTPServer", {
    seperator: ".",
    transform: (str) => str.toLowercase(),
});
// Expected output:
// "http.server"

customCase("HTTP", {
    seperator: ".",
    transform: (str) => str.toLowercase(),
    groupUppercaseLetters: false,
});
// Expected output:
// "h.t.t.p"
```

Options:
- `seperator` (required) - The seperator to use when combining the words back together
- `transform` (required) - a function that is given the current word + the index of that word and transforms it into a string that is then used for the output
- `groupNumbers` - A flag for whether numbers should be grouped into it's own word, or if it should be appended into the current word. (default `false`)
- `groupUppercaseLetters` - A flag for whether multiple consecutive uppercase letters are considered their own word, or part of the current word. Do note that if this is false then uppercase letters are still considered word terminators, closing the current word and starting a new one, turning `HTTP` into `["H", "T", "T", "P"]` for example (default `true`)
- `parser` - A function that is given the entire string and expected to parse it into the words. This is here just in case the build in parser does not satisfy your use case. If this is defined, the other options meant for parsing (`groupNumbers` and `groupUppercaseLetters`) are ignored as this function is expected to handle this behavior itself

> The default word parser uses a regex to determine the characters casing and splits the given string into words, those words are by default the entire word until a new uppercase letter or spacing character (using `/[\s-_]/` regex) is found. By default it tries to group all uppercase letters until a lowercase letter is found, if that is found then the character before that character is assumed to belong to new lowercase letter.

##### Config
This utility has the following config available:
- `groupNumbers` (default: `false`) - Whether a run of digits should be split off into its own word, or seen as normal characters of the same word.
- `groupUppercaseLetters` (default: `true`) - Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time.
- `parser` (default: `undefined`) - A custom parser to parse a given string into word that are then used for changing the casing of words.

##### `httpHeaderCase(str, options?)`
Turns a string into a http header cased version of that same string.

> This is also aliased to `trainCase`

```ts
httpHeaderCase("Some value");
// Expected output:
// "Some-Value"

httpHeaderCase("someValue");
// Expected output:
// "Some-Value"

httpHeaderCase("some_value");
// Expected output:
// "Some-Value"

httpHeaderCase("some 123 value");
// Expected output:
// "Some-123value"

httpHeaderCase("some 123 value", { groupNumbers: true });
// Expected output:
// "Some-123-Value"

httpHeaderCase("someUPPERValue");
// Expected output:
// "Some-Upper-Value"

httpHeaderCase("someUPPERValue", { groupUppercaseLetters: false });
// Expected output:
// "Some-U-P-P-E-R-Value"
```

> The options for this are inherited from [`customCase`](#customcasestr-options) but without the seperator and word transformer

##### Config
This utility has the following config available:
- `groupNumbers` (default: `false`) - Whether a run of digits should be split off into its own word, or seen as normal characters of the same word.
- `groupUppercaseLetters` (default: `true`) - Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time.
- `parser` (default: `undefined`) - A custom parser to parse a given string into word that are then used for changing the casing of words.

##### `kebabCase(str, options?)`
Turns a string into a kebab cased version of that same string.

```ts
kebabCase("Some value");
// Expected output:
// "some-value"

kebabCase("someValue");
// Expected output:
// "some-value"

kebabCase("some_value");
// Expected output:
// "some-value"

kebabCase("some 123 value");
// Expected output:
// "some-123value"

kebabCase("some 123 value", { groupNumbers: true });
// Expected output:
// "some-123-value"

kebabCase("someUPPERValue");
// Expected output:
// "some-upper-value"

kebabCase("someUPPERValue", { groupUppercaseLetters: false });
// Expected output:
// "some-u-p-p-e-r-value"
```

> The options for this are inherited from [`customCase`](#customcasestr-options) but without the seperator and word transformer

##### Config
This utility has the following config available:
- `groupNumbers` (default: `false`) - Whether a run of digits should be split off into its own word, or seen as normal characters of the same word.
- `groupUppercaseLetters` (default: `true`) - Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time.
- `parser` (default: `undefined`) - A custom parser to parse a given string into word that are then used for changing the casing of words.
- `screaming` (default: `false`) - Whether to uppercase every word instead of lowercasing them (SCREAMING-KEBAB-CASE).

##### `lowerCase(str)`
Converts a string to lowercase.

```ts
lowerCase("SOME VALUE");
// Expected output:
// "some value"
```

##### Config
This utility does not have any config.

##### `pascalCase(str, options?)`
Turns a string into a pascal cased version of that same string.

```ts
pascalCase("Some value");
// Expected output:
// "SomeValue"

pascalCase("someValue");
// Expected output:
// "SomeValue"

pascalCase("some_value");
// Expected output:
// "SomeValue"

pascalCase("some 123 value");
// Expected output:
// "Some123value"

pascalCase("some 123 value", { groupNumbers: true });
// Expected output:
// "Some123Value"

pascalCase("someUPPERValue");
// Expected output:
// "SomeUpperValue"

pascalCase("someUPPERValue", { groupUppercaseLetters: false });
// Expected output:
// "SomeUPPERValue"
```

> The options for this are inherited from [`customCase`](#customcasestr-options) but without the seperator and word transformer

##### Config
This utility has the following config available:
- `groupNumbers` (default: `false`) - Whether a run of digits should be split off into its own word, or seen as normal characters of the same word.
- `groupUppercaseLetters` (default: `true`) - Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time.
- `parser` (default: `undefined`) - A custom parser to parse a given string into word that are then used for changing the casing of words.

##### `snakeCase(str, options?)`
Turns a string into a snake cased version of that same string.

```ts
snakeCase("Some value");
// Expected output:
// "some_value"

snakeCase("someValue");
// Expected output:
// "some_value"

snakeCase("some-value");
// Expected output:
// "some_value"

snakeCase("some 123 value");
// Expected output:
// "some_123value"

snakeCase("some 123 value", { groupNumbers: true });
// Expected output:
// "some_123_value"

snakeCase("someUPPERValue");
// Expected output:
// "some_upper_value"

snakeCase("someUPPERValue", { groupUppercaseLetters: false });
// Expected output:
// "some_u_p_p_e_r_value"
```

> The options for this are inherited from [`customCase`](#customcasestr-options) but without the seperator and word transformer

##### Config
This utility has the following config available:
- `groupNumbers` (default: `false`) - Whether a run of digits should be split off into its own word, or seen as normal characters of the same word.
- `groupUppercaseLetters` (default: `true`) - Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time.
- `parser` (default: `undefined`) - A custom parser to parse a given string into word that are then used for changing the casing of words.

##### `titleCase(str, options?)`
Turns a string into a title cased version of that same string.

```ts
titleCase("Some_value");
// Expected output:
// "Some Value"

titleCase("someValue");
// Expected output:
// "Some Value"

titleCase("some_value");
// Expected output:
// "Some Value"

titleCase("some 123 value");
// Expected output:
// "Some 123value"

titleCase("some 123 value", { groupNumbers: true });
// Expected output:
// "Some 123 Value"

titleCase("someUPPERValue");
// Expected output:
// "Some Upper Value"

titleCase("someUPPERValue", { groupUppercaseLetters: false });
// Expected output:
// "Some U P P E R Value"
```

> The options for this are inherited from [`customCase`](#customcasestr-options) but without the seperator and word transformer

##### Config
This utility has the following config available:
- `groupNumbers` (default: `false`) - Whether a run of digits should be split off into its own word, or seen as normal characters of the same word.
- `groupUppercaseLetters` (default: `true`) - Whether consecutive uppercase letters should be grouped into a single word instead of being split one letter at a time.
- `parser` (default: `undefined`) - A custom parser to parse a given string into word that are then used for changing the casing of words.

##### `uncapitalize(str)`
Converts the first character of string to lowercase.

```ts
uncapitalize("Some value");
// Expected output:
// "some value"
```

##### Config
This utility does not have any config.

##### `upperCase(str)`
Converts a string to UPPERCASE.

```ts
upperCase("some value");
// Expected output:
// "SOME VALUE"
```

##### Config
This utility does not have any config.

#### `parseUrlParams(url, transform?)`
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

##### Config
This utility does not have any config.

#### `slug(text)`
Converts a string into a URL-friendly slug.

```ts
slug("Hello, World!");
// Expected output:
// "hello-world"
```

##### Config
This utility does not have any config.

#### `textDifference(oldValue, newValue, options?)`
Diffs two strings and returns either a constructed string with configurable wrapper tags around each changed part, or a list of raw diff nodes (`{ type, content, context }`).

Do note that the context for the diff nodes is always `UNKNOWN` if the `htmlAware` option isn't true.

Supports an HTML-aware mode that diffs markup structurally instead of as plain text: an element is only diffed on its content when its opening and closing tags are unchanged on both sides. The moment a tag itself differs (an attribute added/changed/removed, or a different element entirely) the whole element is treated as one insert/delete block instead of only the changed tag. This means the output can be used directly to render the diff.

```ts
textDifference("Hello world", "Hello there");
// Expected output:
// 'Hello <span data-diff="delete">world</span><span data-diff="insert">there</span>'

textDifference("Hello world", "Hello there", {
    raw: true,
});
// Expected output:
// [
//     { type: "EQUAL", content: "Hello ", context: "UNKNOWN" },
//     { type: "DELETE", content: "world", context: "UNKNOWN" },
//     { type: "INSERT", content: "there", context: "UNKNOWN" },
// ]

textDifference('<p class="a">Same text</p>', '<p class="b">Same text</p>', {
    htmlAware: true,
});
// Expected output:
// '<div data-diff="delete"><p class="a">Same text</p></div><div data-diff="insert"><p class="b">Same text</p></div>'
// (the attribute change pulls the entire element into the insert/delete block, instead of just the tag)

textDifference("Hello world", "Hello there", {
    tags: {
        insert: "**",
        delete: "~~",
    },
});
// Expected output:
// "Hello ~~world~~**there**"

textDifference("Hello world", "Hello there", {
    tags: {
        insert: ["<ins>", "</ins>"],
        delete: ["<del>", "</del>"],
    },
});
// Expected output:
// "Hello <del>world</del><ins>there</ins>"

textDifference("<div><p>Hello world</p></div>", "<div><p>Hello there</p><p>New paragraph</p></div>", {
    htmlAware: true,
    tags: {
        insert: ["<ins>", "</ins>"],
        delete: ["<del>", "</del>"],
    },
});
// Expected output:
// '<div><p>Hello <del>world</del><ins>there</ins></p><ins><p>New paragraph</p></ins></div>'

textDifference("<div><p>Hello world</p></div>", "<div><p>Hello there</p><p>New paragraph</p></div>", {
    htmlAware: true,
    tags: {
        inlineContext: {
            insert: ["<ins>", "</ins>"],
            delete: ["<del>", "</del>"],
        },
        blockContext: {
            insert: ['<div class="diff-insert">', "</div>"],
            delete: ['<div class="diff-delete">', "</div>"],
        },
    },
});
// Expected output:
// '<div><p>Hello <del>world</del><ins>there</ins></p><div class="diff-insert"><p>New paragraph</p></div></div>'
// (the inline text change uses inlineContext tags, the whole new paragraph uses blockContext tags)
```

Options:
- `htmlAware` - diffs HTML structurally instead of as plain text (default `false`)
- `raw` - when `true`, returns the raw list of diff nodes instead of a constructed string (default `false`)
- `tags` - customizes the wrapper tags used around `equal`/`insert`/`delete` content when constructing into a string. Each can be a single string (used as both the opening and closing tag) or a `[open, close]` tuple. When `htmlAware` is `true`, `tags` can instead be split into `inlineContext`/`blockContext` to use different wrappers for inline versus block-level HTML changes.  
  By default it will use no tags for `equal`.  
  for `insert` it will use `<span data-diff="insert">` for opening and `</span>` for closing (if in block context and `htmlAware` is `true` then it will use `<div data-diff="insert">` for opening and `</div>` for closing instead).  
  for `delete` it will use `<span data-diff="delete">` for opening and `</span>` for closing (if in block context and `htmlAware` is `true` then it will use `<div data-diff="delete">` for opening and `</div>` for closing instead).

##### Config
This utility has the following config available:
- `htmlAware` (default: `false`) - If the difference should be HTML aware.
- `tags` (default: `{}`) - The tags to use to mark the diff.

<!-- !SECTION -->
