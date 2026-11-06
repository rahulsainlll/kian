import { CAST, Mascot, type Mood } from '@kian/ui'
import type { ReactNode } from 'react'
import { Nav, SiteFooter } from '../Chrome'

interface Post {
  slug: string
  title: string
  dek: string
  date: string
  who: keyof typeof CAST
  mood: Mood
  tone: string
  body: ReactNode
}

const POSTS: Post[] = [
  {
    slug: 'building-kian-on-switch',
    title: 'Building a sales desk on Switch in four days',
    dek: 'Three agents, five rooms and one rule: agents draft, people send. A walkthrough for your first Switch project.',
    date: 'November 7, 2026',
    who: 'kian',
    mood: 'happy',
    tone: '#cfe0ff',
    body: (
      <>
        <p>
          Every example in the Switch repo is an engineering team fixing an incident. We wanted to see what a sales team
          looks like on the same rooms. This is how Kian came together, step by step, so you can build your own.
        </p>
        <h2>1. Get one agent answering you</h2>
        <p>
          Install Docker Desktop and Switch Console, then run the quickstart until a Claude agent replies in Mattermost.
          Console starts a local Mattermost for you and shows the sign in under Messaging apps. On Windows, give Docker
          its WSL 2 setup and a restart before anything else.
        </p>
        <h2>2. Give each agent one job</h2>
        <p>
          Kian has three agents. <b>kian</b> reads the inbox and calendar and ranks the day. <b>kian-scribe</b> writes
          drafts and meeting notes. <b>kian-studio</b> turns four spoken answers into posts. One job each means you can
          always tell who did what from the name in the room.
        </p>
        <h2>3. Make the rooms do the remembering</h2>
        <p>
          Every active deal gets its own room, opened by kian. The room history replaces the client folder: when
          kian-scribe drafts for a customer, it reads that customer’s room first. Hand a deal to a colleague by adding
          them to the room.
        </p>
        <h2>4. Leave out the send button</h2>
        <p>
          The agents reach Google through a small Python toolkit with four commands: brief, deal, draft and update-row.
          There is no send command, so an agent cannot email a customer even if it wanted to. Prices go to an approvals
          room, and the sales lead’s answer becomes a room decision.
        </p>
        <h2>5. Capture it as a template</h2>
        <p>
          Once it works, put every agent and room into one template file. Anyone can import it in Console and get the
          same desk in a minute, which is also how judges reproduce your project.
        </p>
        <h2>6. Add a way in</h2>
        <p>
          Chat is where the work is recorded, but you don’t always want Mattermost open. The Kian widget signs in to the
          same Mattermost as you, posts what you say into #kian-desk, and shows one agent message at a time. It is one
          more client of the same rooms, nothing more.
        </p>
      </>
    ),
  },
  {
    slug: 'why-our-agents-cant-send',
    title: 'Why our agents can’t hit send',
    dek: 'A careful agent is more impressive than a reckless one. The case for drafts, approvals and a toolkit with a missing command.',
    date: 'November 6, 2026',
    who: 'kian-scribe',
    mood: 'wink',
    tone: '#c9f0d9',
    body: (
      <>
        <p>
          Most sales tools that write for you also send for you. It only takes one wrong price or one wrong name in a
          customer’s inbox for a team to switch the whole thing off.
        </p>
        <p>
          So Kian draws the line in code, not in a prompt. The toolkit the agents run has no send command. Drafts land in
          Gmail and wait. A discount waits in #approvals until the sales lead holds to approve. A change to the lead list
          is posted first, with the old and new value, and waits for a yes.
        </p>
        <p>The result is slower by one tap, and trusted by the whole team. We think that trade is the product.</p>
      </>
    ),
  },
]

export function Blog({ slug }: { slug?: string }) {
  const post = slug ? POSTS.find((p) => p.slug === slug) : undefined

  return (
    <div className="home">
      <div className="page">
        <Nav active="blog" />
      </div>
      <main className="page blog">
        {post ? (
          <article className="post">
            <a className="post__back" href="/blog">
              All posts
            </a>
            <div className="post__hero" style={{ background: post.tone }}>
              <Mascot size={120} shape={CAST[post.who].shape} color={CAST[post.who].color} mood={post.mood} />
            </div>
            <p className="post__date">{post.date}</p>
            <h1 className="post__title">{post.title}</h1>
            <p className="post__dek">{post.dek}</p>
            <div className="post__body">{post.body}</div>
          </article>
        ) : (
          <>
            <header className="blog__head">
              <p className="eyebrow">Blog</p>
              <h1 className="block__title">Notes from building Kian</h1>
            </header>
            <div className="blog__grid">
              {POSTS.map((p) => (
                <a className="blog__card" href={`/blog/${p.slug}`} key={p.slug}>
                  <div className="blog__art" style={{ background: p.tone }}>
                    <Mascot size={96} shape={CAST[p.who].shape} color={CAST[p.who].color} mood={p.mood} />
                  </div>
                  <div className="blog__date">{p.date}</div>
                  <div className="blog__title">{p.title}</div>
                  <p className="blog__dek">{p.dek}</p>
                </a>
              ))}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
