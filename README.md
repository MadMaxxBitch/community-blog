# community-blog

A community platform for reading and publishing blog posts.

## Requirements

- Node `^20.0.0 || ^22.0.0 || >=24.0.0` for the frontend build/test toolchain (`vitest@4.1.11` does not support Node 23)

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
