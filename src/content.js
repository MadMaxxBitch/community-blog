export const categories = ["All stories", "Food & drink", "City life", "Outdoors", "People", "Making"];

export const seededPosts = [
  {
    id: "cliff-walks",
    title: "The cliff walks that make a city feel larger",
    dek: "Three generous detours between the last tram stop and the open water.",
    category: "Outdoors",
    author: "Mira Bennett",
    initials: "MB",
    date: "Sep 18, 2026",
    minutes: 6,
    reads: 248,
    color: "coral",
    image: "walk",
    body: [
      "Every city has an edge where the errands stop and the horizon begins. Ours happens to be a set of windswept paths behind the old signal station.",
      "I started walking them after work in winter, when the beach was empty and the sea was the color of tin. Now I keep a small list of turn-offs: the stairs with wild fennel, the bench that catches late light, the narrow path past the community garden.",
      "None of these are secrets. That is the point. A good local route is not something to protect. It is something to pass on, with enough detail that a stranger can become a regular."
    ]
  },
  {
    id: "sunday-noodles",
    title: "A Sunday bowl, a borrowed recipe, and a very good queue",
    dek: "The tiny noodle room that turns waiting into part of the ritual.",
    category: "Food & drink",
    author: "June Park",
    initials: "JP",
    date: "Sep 14, 2026",
    minutes: 4,
    reads: 186,
    color: "yellow",
    image: "noodles",
    body: [
      "At 11:42 each Sunday, the first three people line up outside Little Lantern. By noon, the queue curls around the florist and somebody is always offering recommendations.",
      "I go for the hand-cut noodles, but stay for the gentle choreography of the room: chopsticks stacked in jars, bowls passed over the counter, the owner asking every table where they walked from.",
      "Ask for the chilli oil on the side. Then ask the person next to you what they ordered. That is the local special."
    ]
  },
  {
    id: "library-roof",
    title: "The library roof is quietly becoming our town square",
    dek: "On small rituals, public space, and Tuesday night chess.",
    category: "City life",
    author: "Aisha Singh",
    initials: "AS",
    date: "Sep 9, 2026",
    minutes: 5,
    reads: 319,
    color: "blue",
    image: "library",
    body: [
      "The library roof was designed as a reading terrace, but the neighbourhood had other plans. Someone brought a chess board. Someone else brought speakers and a thermos.",
      "By eight o'clock on Tuesdays, it has turned into the kind of place where people can belong without buying anything.",
      "Public space gets more useful when we let it collect habits. The roof has done exactly that."
    ]
  },
  {
    id: "repair-club",
    title: "The repair club where nothing is too broken to bring in",
    dek: "A room full of tools, patient neighbours, and one revived rice cooker.",
    category: "Making",
    author: "Theo Ward",
    initials: "TW",
    date: "Sep 4, 2026",
    minutes: 7,
    reads: 141,
    color: "mint",
    image: "repair",
    body: [
      "There is a particular optimism in a room where people arrive carrying broken things. A lamp. A zip. A radio. A rice cooker that has not clicked in years.",
      "At the repair club, no one promises a fix. They promise a look. That small shift changes the whole room.",
      "Last week, the rice cooker clicked. Everybody applauded like it had made a speech."
    ]
  }
];

export const getPost = (posts, id) => posts.find((post) => post.id === id);

export const seededComments = {
  "cliff-walks": [
    { id: "c1", name: "Leo", body: "The fennel steps are my favourite part of this route. Thank you for putting it into words.", date: "Yesterday" },
    { id: "c2", name: "Nadia", body: "Taking this route home tonight. The details are exactly what I needed.", date: "2 days ago" }
  ],
  "sunday-noodles": [
    { id: "c3", name: "Ellis", body: "The queue really is part of it. I have met two neighbours there already.", date: "3 days ago" }
  ]
};

export const createComment = ({ name, body }) => ({
  id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
  name,
  body,
  date: "Just now"
});

export const createPost = ({ title, category, excerpt, body }) => {
  const now = new Date();
  const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${now.getTime()}`;
  return {
    id,
    title,
    dek: excerpt,
    category,
    author: "You",
    initials: "YO",
    date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    minutes: Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 200)),
    reads: 0,
    color: "mint",
    image: "note",
    body: body.split(/\n\s*\n/).filter(Boolean)
  };
};
