const createPostRecord = (id, input, now) => {
  const title = (input.title || '').trim();
  const content = (input.content || '').trim();

  if (!title || !content) {
    throw new Error('title and content are required');
  }

  const codeSnippet = typeof input.codeSnippet === 'string' && input.codeSnippet.trim()
    ? input.codeSnippet
    : null;

  return {
    id,
    title,
    content,
    author: (input.author || 'anonymous').trim() || 'anonymous',
    createdAt: now(),
    codeSnippet,
    codeTestStatus: codeSnippet ? 'pending' : 'not_requested',
    codeTestMessage: null,
  };
};

const addPost = (posts, input, now = () => new Date().toISOString()) => {
  const nextId = String(posts.length + 1);
  const post = createPostRecord(nextId, input, now);
  return [[...posts, post], post];
};

const listPosts = (posts) => posts.map((post) => ({ ...post }));

const getPostById = (posts, id) => posts.find((post) => post.id === String(id)) || null;

const getPendingCodePosts = (posts) => posts.filter((post) => post.codeTestStatus === 'pending');

const updateCodeTestResult = (posts, id, result) =>
  posts.map((post) => {
    if (post.id !== String(id)) {
      return post;
    }

    return {
      ...post,
      codeTestStatus: result.passed ? 'passed' : 'failed',
      codeTestMessage: result.message || null,
    };
  });

module.exports = {
  addPost,
  getPendingCodePosts,
  getPostById,
  listPosts,
  updateCodeTestResult,
};
