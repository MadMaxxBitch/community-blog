import { useEffect, useMemo, useState } from "react";
import { categories, createComment, createPost, getPost, seededComments, seededPosts } from "./content";
import "./styles.css";

const storageKey = "neighbourhood-notes-posts";
const commentsStorageKey = "neighbourhood-notes-comments";

const readStoredPosts = () => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? [...JSON.parse(saved), ...seededPosts] : seededPosts;
  } catch {
    return seededPosts;
  }
};

const byDate = (posts) => [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

const readStoredComments = () => {
  try {
    const saved = localStorage.getItem(commentsStorageKey);
    return saved ? { ...seededComments, ...JSON.parse(saved) } : seededComments;
  } catch {
    return seededComments;
  }
};

function Wordmark({ onHome }) {
  return <button className="wordmark" onClick={onHome} aria-label="Neighbourhood Notes home"><span>n</span>notes</button>;
}

function PostArt({ post, large = false }) {
  return <div className={`post-art art-${post.image} art-${post.color} ${large ? "art-large" : ""}`} aria-hidden="true">
    <i /><b /><em />
  </div>;
}

function Byline({ post, detail = false }) {
  return <div className="byline">
    <span className={`avatar avatar-${post.color}`}>{post.initials}</span>
    <span>{detail ? <>Written by <strong>{post.author}</strong></> : post.author}</span>
    <span className="dot">·</span><span>{post.date}</span><span className="dot">·</span><span>{post.minutes} min read</span>
  </div>;
}

function Home({ posts, openPost, openWrite }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All stories");
  const visiblePosts = useMemo(() => byDate(posts).filter((post) => {
    const matchesCategory = category === "All stories" || post.category === category;
    const haystack = `${post.title} ${post.dek} ${post.author} ${post.category}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [posts, query, category]);
  const featured = visiblePosts[0] ?? posts[0];

  return <main>
    <section className="hero">
      <div className="hero-copy">
        <p className="hero-note">A living journal of local things</p>
        <h1>Stories worth taking the long way home for.</h1>
        <p className="hero-intro">Neighbourhood Notes is where curious locals swap the small, wonderful details that make a place feel like yours.</p>
        <button className="button button-light" onClick={openWrite}>Share a story <span>↗</span></button>
      </div>
      <button className="feature-card" onClick={() => openPost(featured.id)}>
        <PostArt post={featured} large />
        <div className="feature-card-copy"><span>{featured.category}</span><h2>{featured.title}</h2><p>{featured.dek}</p><Byline post={featured} /></div>
      </button>
    </section>

    <section className="discovery" aria-labelledby="latest-title">
      <div className="section-heading"><div><h2 id="latest-title">Find your next local favourite</h2><p>Fresh notes from people who notice things.</p></div><span>{visiblePosts.length} stories</span></div>
      <div className="filters">
        <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, places, ideas" aria-label="Search stories" /></label>
        <div className="category-list" aria-label="Filter stories by category">
          {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </div>
      {visiblePosts.length ? <div className="post-grid">
        {visiblePosts.map((post) => <article className="post-card" key={post.id}>
          <button className="art-button" onClick={() => openPost(post.id)} aria-label={`Read ${post.title}`}><PostArt post={post} /></button>
          <span className="category">{post.category}</span>
          <h3><button onClick={() => openPost(post.id)}>{post.title}</button></h3>
          <p>{post.dek}</p><Byline post={post} />
        </article>)}
      </div> : <div className="empty-state"><span>⌘</span><h3>No stories match that search.</h3><p>Try another term or browse all stories.</p><button onClick={() => { setQuery(""); setCategory("All stories"); }}>Clear filters</button></div>}
    </section>
  </main>;
}

function Comments({ comments, submitComment }) {
  const [form, setForm] = useState({ name: "", body: "" });
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const body = form.body.trim();
    if (name.length < 2 || body.length < 3) return setError("Add your name and a thoughtful comment before posting.");
    submitComment(createComment({ name, body }));
    setForm({ name: "", body: "" });
    setError("");
  };
  return <section className="comments" aria-labelledby="comments-title">
    <div className="comments-heading"><h2 id="comments-title">Neighbourhood notes</h2><span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span></div>
    <form className="comment-form" onSubmit={submit}>
      <label>Your name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="How should neighbours know you?" /></label>
      <label>Add to the conversation<textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} placeholder="Leave a generous, useful note." rows="3" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark" type="submit">Post comment <span>↗</span></button>
    </form>
    <div className="comment-list">
      {comments.length ? comments.map((comment) => <article className="comment" key={comment.id}><div className="comment-mark">{comment.name.slice(0, 1).toUpperCase()}</div><div><div className="comment-meta"><strong>{comment.name}</strong><span>{comment.date}</span></div><p>{comment.body}</p></div></article>) : <p className="no-comments">Be the first to add a useful local detail.</p>}
    </div>
  </section>;
}

function PostDetail({ post, comments, openHome, openWrite, submitComment }) {
  return <main className="article">
    <button className="back-link" onClick={openHome}>← All stories</button>
    <header className="article-header"><span className="category">{post.category}</span><h1>{post.title}</h1><p>{post.dek}</p><Byline post={post} detail /></header>
    <PostArt post={post} large />
    <div className="article-body">{post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    <aside className="article-end"><p>Have a local story worth keeping?</p><button className="button button-dark" onClick={openWrite}>Write a note <span>↗</span></button></aside>
    <Comments comments={comments} submitComment={submitComment} />
  </main>;
}

function Write({ openHome, publish }) {
  const [form, setForm] = useState({ title: "", category: "City life", excerpt: "", body: "" });
  const [error, setError] = useState("");
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.body.trim()) return setError("Add a title, a short introduction, and your story before publishing.");
    publish(createPost(form));
  };
  return <main className="write-page">
    <button className="back-link" onClick={openHome}>← Back to stories</button>
    <div className="write-heading"><h1>Leave a note for your neighbours.</h1><p>Share the walk, the person, the recipe, or the small discovery worth passing on.</p></div>
    <form onSubmit={submit} className="write-form">
      <label>Story title<input value={form.title} onChange={update("title")} placeholder="Give your story a memorable name" /></label>
      <label>Where does it belong?<select value={form.category} onChange={update("category")}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Short introduction<textarea value={form.excerpt} onChange={update("excerpt")} placeholder="Give readers a reason to lean in." rows="3" /></label>
      <label>Your story<textarea value={form.body} onChange={update("body")} placeholder="Write like you're telling a friend on the walk home. Separate paragraphs with a blank line." rows="10" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><p>Your story is saved in this browser after you publish.</p><button className="button button-dark" type="submit">Publish story <span>↗</span></button></div>
    </form>
  </main>;
}

export default function App() {
  const [posts, setPosts] = useState(readStoredPosts);
  const [commentsByPost, setCommentsByPost] = useState(readStoredComments);
  const [screen, setScreen] = useState({ name: "home" });
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(posts.filter((post) => post.author === "You"))); }, [posts]);
  useEffect(() => { localStorage.setItem(commentsStorageKey, JSON.stringify(commentsByPost)); }, [commentsByPost]);
  const openHome = () => setScreen({ name: "home" });
  const publish = (post) => { setPosts((current) => [post, ...current]); setCommentsByPost((current) => ({ ...current, [post.id]: [] })); setScreen({ name: "post", id: post.id }); };
  const post = screen.name === "post" ? getPost(posts, screen.id) : null;
  return <div className="app-shell">
    <header className="site-header"><Wordmark onHome={openHome} /><nav><button onClick={openHome}>Read</button><button onClick={() => setScreen({ name: "write" })}>Write</button></nav><button className="write-tab" onClick={() => setScreen({ name: "write" })}>Write a story <span>↗</span></button></header>
    {screen.name === "home" && <Home posts={posts} openPost={(id) => setScreen({ name: "post", id })} openWrite={() => setScreen({ name: "write" })} />}
    {screen.name === "write" && <Write openHome={openHome} publish={publish} />}
    {post && <PostDetail post={post} comments={commentsByPost[post.id] ?? []} openHome={openHome} openWrite={() => setScreen({ name: "write" })} submitComment={(comment) => setCommentsByPost((current) => ({ ...current, [post.id]: [comment, ...(current[post.id] ?? [])] }))} />}
    <footer><Wordmark onHome={openHome} /><p>Built from the details that make a place feel shared.</p><span>© 2026</span></footer>
  </div>;
}
