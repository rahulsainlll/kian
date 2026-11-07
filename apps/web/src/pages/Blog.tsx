/*
 * The blog: one post, "How our agents run a whole revenue engine together",
 * first published by Yukti on AWS Builder Center. /blog lists it and
 * /blog/<slug> shows it, with links to the original, the code and the app.
 */
import { Nav, SiteFooter } from '../Chrome'
import { useSeo } from '../seo'
import { Note } from './blog/parts'
import { RevenuePartOne } from './blog/revenue1'
import { RevenuePartTwo } from './blog/revenue2'

const POST = {
  slug: 'how-our-agents-run-a-revenue-engine',
  title: 'How our agents run a whole revenue engine together',
  dek: 'Great products don’t lose on features. They lose on distribution. Kian is a go-to-market workflow where a team and its AI agents work together in shared Switch rooms, and nothing reaches a customer until a person says yes.',
  cover: '/blog/cover.webp',
  author: 'Yukti',
  role: 'GTM Engineer',
  aws: 'https://builder.aws.com/content/3Lmgdiwrm1pEJaiGb1RfLm6GtJt/how-my-agents-run-a-whole-revenue-engine-together',
}
const GH = 'https://github.com/rahulsainlll/kian'
const PATH = `/blog/${POST.slug}`

function Links() {
  return (
    <div className="post__links">
      <a className="post__link post__link--dark" href={GH} target="_blank" rel="noopener">
        Code on GitHub
      </a>
      <a className="post__link" href="/#download">
        Download for Mac and Windows
      </a>
      <a className="post__link" href={POST.aws} target="_blank" rel="noopener">
        Read on AWS Builder Center
      </a>
    </div>
  )
}

export function Blog({ slug }: { slug?: string }) {
  const open = slug === POST.slug
  useSeo(
    open
      ? {
          title: `${POST.title} | Kian`,
          description: POST.dek,
          path: PATH,
          image: '/blog/cover.jpg',
          type: 'article',
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: POST.title,
            description: POST.dek,
            image: 'https://kiandesk.vercel.app/blog/cover.jpg',
            author: { '@type': 'Person', name: POST.author, jobTitle: POST.role },
            publisher: { '@type': 'Organization', name: 'Kian', url: 'https://kiandesk.vercel.app' },
            mainEntityOfPage: `https://kiandesk.vercel.app${PATH}`,
            sameAs: POST.aws,
          },
        }
      : {
          title: 'Blog | Kian',
          description: 'How we built Kian: an AI agent for everyone on your team, working together in Switch rooms.',
          path: '/blog',
        },
  )

  return (
    <div className="home">
      <div className="page">
        <Nav active="blog" />
      </div>
      <main className="page blog">
        {open ? (
          <article className="post post--long">
            <a className="post__back" href="/blog">
              All posts
            </a>
            <img className="post__cover" src={POST.cover} alt="Kian: the workflow that runs our whole GTM" width={2400} height={1260} />
            <h1 className="post__title">{POST.title}</h1>
            <p className="post__dek">{POST.dek}</p>
            <p className="post__by">
              By <b>{POST.author}</b>, {POST.role}, with Rahul and Mayank
            </p>
            <Links />
            <Note>
              <b>Where Kian is now.</b> Since this was written, Kian gives every person on the team their own agent, and
              the agents ask each other for updates, reminders and reviews in one shared Switch room. The ideas below
              still hold: agents draft, people say yes.
            </Note>
            <div className="post__body">
              <RevenuePartOne />
              <RevenuePartTwo />
            </div>
            <p className="post__origin">
              First published on{' '}
              <a href={POST.aws} target="_blank" rel="noopener">
                AWS Builder Center
              </a>
              .
            </p>
            <Links />
          </article>
        ) : (
          <>
            <header className="blog__head">
              <p className="eyebrow">Blog</p>
              <h1 className="block__title">Notes from building Kian</h1>
            </header>
            <a className="blog__feature" href={PATH}>
              <img src={POST.cover} alt="" width={2400} height={1260} />
              <span>
                <b className="blog__title">{POST.title}</b>
                <span className="blog__dek">{POST.dek}</span>
                <small>
                  By {POST.author}, {POST.role}
                </small>
              </span>
            </a>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
