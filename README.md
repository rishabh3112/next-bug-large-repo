# Next Build Bug

## Reproduction Steps

```
npm install
npm run build
```

## Issue

When run above step we get following error:

```
thread '<unnamed>' panicked at <HOME_DIR>/.cargo/registry/src/index.crates.io-6f17d22bba15001f/swc_common-0.33.9/src/input.rs:31:9:
assertion failed: start <= end
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

## Investigations

This happens because `end_pos` gets overflowed here https://github.com/swc-project/swc/blob/eebf14fbef1be34c98db736ad549b1f11d5d8a98/common/src/syntax_pos/mod.rs#L688

This Happens because there is static instance of SWC Compiler which is cloned and used for transform and minify.

The SWC Compiler has `cm` field which is `Arc<SourceMap>`, making the same sourcemap to be shared among every clone of compiler.

The SourceMap has `start_pos` field which calculates the `start_pos` of next `SourceFile` it needs to create. Which means this is effectively storing the count of every character present in sourcemap.

`SourceMap.start_pos` may be a `AtomicUsize`, but it's value gets stored in `BytePos` as a `u32` via `Pos` trait implementation of it.

The `end_pos` calculated in `SourceFile::new` adds the file's length into the `start_pos` and stores it as a `BytePos`, i.e. a `u32`.

Because in `Pos` trait implementation of `BytePos`, we are using `as u32`, this result in integer overflow get un-noticed.

This gets detected later-on when in `swc_common::StringInput` we assert start and end positions.

## Possible Solutions

1. Increase the size of BytePos to u64
2. Not share SourceMap instance across both transform and minify routines
