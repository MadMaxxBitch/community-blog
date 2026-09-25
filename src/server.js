const http = require('http');
const { addPost, getPostById, listPosts } = require('./posts');
const {
  createBackgroundCodeTester,
  runCodeTestsOnce,
  validateCodeSyntax,
} = require('./backgroundCodeTester');

const createJsonResponse = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const MAX_BODY_BYTES = 1_000_000;
const CLIENT_ERROR_MESSAGES = new Set([
  'invalid JSON body',
  'request body too large',
  'title and content are required',
]);

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    let hasEnded = false;
    req.on('data', (chunk) => {
      if (hasEnded) {
        return;
      }
      if (body.length + chunk.length > MAX_BODY_BYTES) {
        hasEnded = true;
        req.pause();
        reject(new Error('request body too large'));
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      if (hasEnded) {
        return;
      }
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('invalid JSON body'));
      }
    });
    req.on('error', reject);
  });

const createApp = ({ initialPosts = [], validateCode = validateCodeSyntax, now } = {}) => {
  let posts = [...initialPosts];

  const backgroundTester = createBackgroundCodeTester({
    getPosts: () => posts,
    setPosts: (nextPosts) => {
      posts = nextPosts;
    },
    validateCode,
  });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/posts') {
      createJsonResponse(res, 200, { posts: listPosts(posts) });
      return;
    }

    if (req.method === 'GET' && /^\/posts\/[^/]+$/.test(url.pathname)) {
      const id = url.pathname.slice('/posts/'.length);
      const post = getPostById(posts, id);
      if (!post) {
        createJsonResponse(res, 404, { error: 'post not found' });
        return;
      }
      createJsonResponse(res, 200, { post });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/posts') {
      try {
        const body = await readJsonBody(req);
        const [nextPosts, post] = addPost(posts, body, now);
        posts = nextPosts;
        createJsonResponse(res, 201, { post });
      } catch (error) {
        const statusCode = CLIENT_ERROR_MESSAGES.has(error.message) ? 400 : 500;
        const message = statusCode === 500 ? 'internal server error' : error.message;
        createJsonResponse(res, statusCode, { error: message });
      }
      return;
    }

    createJsonResponse(res, 404, { error: 'route not found' });
  });

  return {
    start: (port = 3000) =>
      new Promise((resolve) => {
        server.listen(port, () => {
          backgroundTester.start();
          resolve(server.address().port);
        });
      }),
    stop: () =>
      new Promise((resolve, reject) => {
        backgroundTester.stop();
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
    runCodeTestsNow: () => {
      posts = runCodeTestsOnce(posts, validateCode);
      return listPosts(posts);
    },
    getPosts: () => listPosts(posts),
  };
};

if (require.main === module) {
  const app = createApp();
  app.start(Number(process.env.PORT) || 3000).then((port) => {
    // eslint-disable-next-line no-console
    console.log(`community blog server listening on ${port}`);
  }).catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { createApp };
