# community-blog

A community platform for reading and publishing blog posts.

## Run

```bash
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
