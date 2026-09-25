# community-blog

A community platform for reading and publishing blog posts.

## Requirements

- Node `20.x`, `22.x`, or `24.x` for installing/building the frontend toolchain and any Vitest-based frontend tests (`npm test` still uses `node --test`, and `vitest@4.1.11` does not support Node 23)

## Run

```bash
npm ci
npm start
```

Server routes:

- `GET /posts` - list posts
- `GET /posts/:id` - read one post
- `POST /posts` - publish a post (`title`, `content`, optional `author`, optional `codeSnippet`)

If a post includes `codeSnippet`, it is queued and tested in the background for syntax validity.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```
