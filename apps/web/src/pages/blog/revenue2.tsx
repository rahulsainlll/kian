/*
 * "How our agents run a whole revenue engine together", part two: the rest
 * of the stack, traction, what broke, building by voice with Wispr Flow,
 * impact, what's next, questions, how to try it and the sources.
 */
import { C, Fig, Out, Table } from './parts'

const GH = 'https://github.com/rahulsainlll/kian'

export function RevenuePartTwo() {
  return (
    <>
      <h3>6.3 The rest of the stack</h3>
      <Table
        rows={[
          ['Piece', 'Built with', 'Its one job'],
          ['The toolkit', 'Python, about 800 lines', <><C>brief</C>, <C>deal</C>, <C>meetings</C>, <C>draft</C>, <C>row</C>. The agents’ only way into Google</>],
          ['Desktop app', 'Electron, TypeScript', 'The widget and the hub for Mac and Windows, released as a dmg and an NSIS installer by GitHub Actions'],
          ['Website', 'Vite on Vercel', 'The product page with a self-playing demo of the morning'],
          ['Shared UI', <C>@kian/ui</C>, 'The same widget components on the website and in the desktop app'],
        ]}
      />
      <p>Two of us built it across the Switch side, the toolkit, the app and the site, in one monorepo, with 50 commits.</p>
      <h3>6.4 Three choices worth a sentence each</h3>
      <p>
        <b>The safety rules are in code, not just in the prompt.</b> The toolkit has no send command and a test checks
        that none exists. <C>row apply</C> refuses to run without <C>--approved-by</C>, so a sheet write always carries
        the name of the person who said yes. Nine tests cover the ranking and the safety rules.
      </p>
      <p>
        <b>The widget is a mouthpiece, not a second app.</b> It signs in to Mattermost as the person and shows one agent
        message at a time. Every button posts an ordinary reply to the room, exactly as if they had typed it. If the
        widget disappeared tomorrow, the rooms would hold the same history.
      </p>
      <p>
        <b>We picked Electron over Tauri.</b> It is one engine on both Mac and Windows, and with a day left we could not
        afford two webviews behaving differently.
      </p>

      <h2>7. Live traction: what founders told us</h2>
      <p>
        A workflow is only practical if someone other than its builders will use it. So before we wrote this up, we
        took the prototype to the people who feel this problem most: founders who run their own sales and marketing.
      </p>
      <h3>7.1 What we did</h3>
      <p>We have a network of founders. We asked them to use the Kian prototype and tell us what they thought.</p>
      <Table
        rows={[
          ['Response', 'Founders'],
          ['Positive feedback', <b>20</b>],
          ['Feedback with things to improve', <b>3</b>],
        ]}
      />
      <p>
        Twenty founders gave us positive feedback, and three gave us more to improve. We read the three as the most
        useful part of the exercise. A founder who tells you what to fix has used the thing closely enough to have an
        opinion about it.
      </p>
      <h3>7.2 What else is live today</h3>
      <p>Founder feedback is one signal. The rest is checkable by anyone:</p>
      <ul>
        <li><b>The site is public,</b> with a demo that plays a whole morning and needs no login, at <a href="/">kiandesk.vercel.app</a>.</li>
        <li><b>The desktop app is downloadable</b> for Mac and Windows from the <Out href={`${GH}/releases/latest`}>releases page</Out>, with <a href="/guide">install guides</a> that show every screen.</li>
        <li><b>The toolkit runs on its own.</b> Clone the repo, run <C>python3 kian_tools.py brief</C>, and you get the morning from the demo data in seconds.</li>
        <li><b>The setup is reproducible.</b> One template creates the agents, rooms and links, and nine tests pass with no network.</li>
      </ul>

      <h2>8. What broke, and what it taught us</h2>
      <p>
        Most of Kian worked roughly as planned. The parts worth telling you about are the moments the platform or the
        computer told us we were wrong.
      </p>
      <h3>8.1 We pitched features Switch doesn’t have</h3>
      <p>
        Our plan said deal rooms would hold next steps as Switch <b>tasks</b> and approvals as Switch <b>decisions</b>.
        It read beautifully. Then we went to wire it up and found that tasks and decisions aren’t objects Switch
        exposes. We had designed around a guess.
      </p>
      <p>
        The fix turned out better than the plan. Switch has <b>room documents</b>, and only the agent that creates a
        document can change it. So kian-scribe keeps a “Deal summary” in every deal room, and kian keeps a “Decisions”
        document in approvals, one line per yes or no with a name and a date. Because only the owning agent can edit it,
        nobody can quietly rewrite the record. One of our commits is literally called “Say only what Switch does”, and
        we went back through the README and the site to make every claim match.
      </p>
      <h3>8.2 A private room with nobody in it</h3>
      <p>
        The first time kian opened a deal room on its own, the room appeared and it was empty. No rep, no sales lead.
        Private rooms an agent creates only get people if the Mattermost connection has a <b>Default Member</b> set. It
        is one setting in Switch Console, and it is now step 2 of our setup guide so nobody else finds kian talking to
        itself.
      </p>
      <h3>8.3 Telegram is a second desk, not a mirror</h3>
      <p>
        We wanted the morning on a phone, and we assumed we could bridge the desk to Telegram and see the same room in
        both apps. That isn’t how it works: a Switch room lives on one messaging app, and Telegram bots can’t create
        groups, so that step is by hand. Telegram became a second desk, a group with kian invited, where saying
        “morning” gets the same brief. It does what we needed, and we describe it exactly that way.
      </p>
      <h3>8.4 macOS said our app was damaged</h3>
      <p>
        Our first Mac build downloaded fine and then refused to open, with macOS calling it damaged. Unsigned Electron
        apps get that treatment. We added ad hoc signing so macOS shows the normal “unidentified developer” prompt, made
        Developer ID notarisation optional for when we have the certificate, and wrote install guides for Mac and
        Windows with a picture of every screen, including the Open Anyway step.
      </p>
      <h3>8.5 The website only had a homepage</h3>
      <p>
        The site looked done locally. On Vercel, every page except the homepage returned a 404, because a single-page
        app needs its routes sent back to <C>index.html</C>. We caught it by clicking our own nav links like a judge
        would. It is a one-line fix, and the most useful lesson of the week: test the thing you submit, from the
        outside.
      </p>
      <h3>8.6 What we would tell ourselves on day one</h3>
      <p>
        <b>Put the rule in the code, not only in the prompt.</b> “Never send” in an agent’s instructions is a promise. No
        send command in the toolkit is a guarantee. Where a rule protects a customer, make the unsafe action impossible,
        then write a test that keeps it that way.
      </p>
      <p>
        <b>Make every question answerable in one word.</b> The answer line did more for the experience than anything
        else we built. When an agent ends with <C>→ done · skip · draft</C>, nobody has to think about how to reply, and
        the widget can turn the same line into buttons without guessing.
      </p>
      <p>
        <b>A room is a better memory than a database.</b> We didn’t build a single table. Every reply, draft, transcript
        and decision about a deal sits in one room, and anyone added later sees the whole trail.
      </p>
      <p>
        <b>Read the platform before you pitch it.</b> Our worst moment was designing around Switch features that didn’t
        exist. Saying only what the platform actually does made the product more honest and, in the end, better.
      </p>

      <h2>9. Built by voice with Wispr Flow</h2>
      <p>
        Kian is built for talking, and we built it by talking. Prompts, agent instructions, the README and this post
        were dictated with <Out href="https://wisprflow.ai/">Wispr Flow</Out> during the event.
      </p>
      <p>
        It shows up in the product too. The widget’s type bar is made for dictation, so you can talk to Kian through
        Wispr Flow from any app. And kian-studio’s four content questions are meant to be answered out loud: spoken
        answers turned out to be better raw material for a LinkedIn post than anything typed.
      </p>
      <Fig src="/blog/wispr.webp" alt="Kian settings with Wispr Flow chosen as the voice engine" w={1280} h={800} />

      <h2>10. Impact: what changes for the people in the workflow</h2>
      <Table
        rows={[
          ['Who', 'Before', 'With Kian'],
          [<b>The employees</b>, 'All tabs, sorted by hand, before anything gets sold', 'A ranked morning, answered one word at a time, with the busywork already drafted'],
          [<b>The sales lead</b>, 'Client messages and updates arrive in scattered messages and are agreed in passing', 'One private room, with the deal, the ask and a press-and-hold, and every answer on the record with a name and a date'],
          [<b>The founder</b>, 'Deal context lives in one person’s head and walks out with them', 'Every deal has a room, and handing over an account means adding a person to it'],
          [<b>The customer</b>, 'Replies arrive late, from someone who had to re-read the thread first', 'A reply written from the full trail, reviewed and sent by a person'],
        ]}
      />
      <p>
        What stays human is the part that needs judgment: reading the draft, deciding to send it, and saying yes to a
        price. For a go-to-market team, that is the point. The agents take the triage, the memory and the first draft,
        and the people keep the relationships.
      </p>
      <p>
        If Salesforce’s numbers hold for your team,{' '}
        <Out href="https://www.landbase.com/blog/sales-reps-30-percent-time-selling-2026">only about 30% of a rep’s week is spent selling</Out>.
        The rest is the work Kian is built to take on.
      </p>

      <h2>11. Appendices</h2>
      <h3>11.1 What’s next</h3>
      <p>
        The hackathon got us the full loop: a morning in, a ranked brief, a reply drafted in the right room, a price
        approved on the record, and a person pressing send. Here is what comes next:
      </p>
      <ul>
        <li><b>A month with a real team.</b> Founders have tried the prototype. The next step is a sales team using it every day, with a real inbox.</li>
        <li><b>Live call capture from the widget,</b> straight into the deal room, instead of pasting a transcript.</li>
        <li><b>A scheduled brief</b> that is waiting at 9:00 without the greeting, for reps who would rather not ask.</li>
        <li><b>A weekly pipeline summary</b> for the sales lead in the approvals room.</li>
        <li><b>Slack and Teams desks</b> for teams that live there, using the same Switch rooms.</li>
      </ul>
      <h3>11.2 Questions people ask us</h3>
      <p>
        <b>Does Kian ever email a customer?</b> No. The toolkit can read mail, save drafts and update the lead sheet
        after a named yes. There is no send command for an agent to call, and a test checks that it stays that way, but
        we can build that in the future.
      </p>
      <p>
        <b>Why a widget if everything lives in chat?</b> Chat is where the work is recorded. The widget is the fast way
        in: talk instead of typing, and get tapped on the shoulder when a room needs you. Every button it shows posts an
        ordinary message to the room.
      </p>
      <p>
        <b>What can the agents actually decide?</b> What to rank first and how to word a draft. They can’t send, can’t
        approve a price and can’t write the lead sheet without a person.
      </p>
      <p>
        <b>What does it run on?</b> Switch runs the agents and rooms on your own machine; the agents are Claude, the
        website is a free Vercel deployment, and your mail and lead sheet stay in your own Google account. There is no
        database.
      </p>
      <h3>11.3 Try it</h3>
      <ul>
        <li>Watch a whole morning play out on <a href="/">kiandesk.vercel.app</a>, or open the <a href="/dashboard">demo dashboard</a>. No login needed.</li>
        <li>Download the app for <Out href={`${GH}/releases/latest`}>Mac or Windows</Out>, with the <a href="/guide">install guide</a>.</li>
        <li>Run the desk yourself: install Switch Console, import <C>switch/kian.template.yaml</C>, and say “morning” in the desk. Every step is in the <Out href={`${GH}/blob/main/switch/README.md`}>setup guide</Out>.</li>
        <li>Try the toolkit without Switch at all:</li>
      </ul>
      <pre>
        <code>{`git clone https://github.com/rahulsainlll/kian
cd kian/switch/toolkit
python3 kian_tools.py brief      # the demo morning
python3 -m unittest -v           # ranking and safety rules`}</code>
      </pre>
      <ul>
        <li>Read <Out href={GH}>the code on GitHub</Out>.</li>
      </ul>
      <h3>11.4 Sources</h3>
      <ul>
        <li><Out href="https://www.wemakedevs.org/hackathons/switch">Flip the Switch hackathon</Out>, WeMakeDevs, DevTools Academy and Switch</li>
        <li><Out href="https://github.com/sandbox-quantum/switch">Switch on GitHub</Out>, SandboxAQ’s Flint AI team</li>
        <li><Out href="https://salesforce.com/ca/resources/research-reports/state-of-sales">State of Sales</Out>, Salesforce</li>
        <li><Out href="https://www.crn.in/?p=56033">Sales reps in India spend just 27% of time selling</Out>, CRN India, reporting Salesforce’s research</li>
        <li><Out href="https://www.landbase.com/blog/sales-reps-30-percent-time-selling-2026">Why sales reps spend less than 30% of their time selling</Out>, Landbase, summarising Salesforce’s research</li>
        <li><Out href="https://wisprflow.ai/">Wispr Flow</Out></li>
      </ul>
    </>
  )
}
