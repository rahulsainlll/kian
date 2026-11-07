/*
 * "How our agents run a whole revenue engine together", part one: the
 * opening, the problem, who Kian is for, one email's journey, interfaces,
 * the promises underneath, and how it is built on Switch. First published
 * by Yukti on AWS Builder Center.
 */
import { C, Fig, Out, Table } from './parts'

export function RevenuePartOne() {
  return (
    <>
      <p>
        <b>
          Every morning starts the same way: Gmail, the calendar and the lead sheet, three tabs, sorted by hand. By the
          time you know who replied, who is waiting and which call is first, the best hour of the day is gone. And the
          fix everyone reaches for, an AI that does it for you, comes with a catch: the tool that drafts the email is
          usually the tool that sends it.
        </b>
      </p>
      <p>
        That tension became Kian. We built it as one workflow that runs from the first reply to the signed deal, shared
        between people and agents, in the chat apps a team already uses. The site is at{' '}
        <a href="/">kiandesk.vercel.app</a>, the code is <Out href="https://github.com/rahulsainlll/kian">on GitHub</Out>.
      </p>

      <h2>1. Introduction: why distribution is the part that breaks</h2>
      <h3>1.1 Purpose: the problem we kept seeing</h3>
      <p>
        The numbers stopped us first. Salesforce’s research says sellers spend{' '}
        <Out href="https://salesforce.com/ca/resources/research-reports/state-of-sales">70% of their time on non-selling tasks</Out>,
        a share that has barely moved between reports. In India, reps estimate they spend only{' '}
        <Out href="https://www.crn.in/?p=56033">27% of the week actually selling</Out>. More tools haven’t fixed it. They
        mostly added tabs.
      </p>
      <p>When we looked at where a founder’s or rep’s go-to-market time actually goes, it fell into three buckets:</p>
      <Table
        rows={[
          ['', 'What happens today', 'What it costs'],
          [<b>Triage</b>, 'The day starts in the inbox, the calendar and the lead sheet, sorted by hand', 'The first hour goes to working out what to do, not doing it'],
          [<b>Memory</b>, 'A customer’s context is split across email threads, notes docs and one person’s head', 'Handovers lose half of it, and every follow-up starts with re-reading'],
          [<b>Trust</b>, 'AI tools that write for you also send for you', 'One wrong price in a customer’s inbox and the whole team turns the tool off'],
        ]}
      />
      <p>
        The third row is the one nobody talks about. Drafting a follow-up is easy for a model now. The reason people
        don’t let a tool do it is that the tool that drafts is usually the tool that sends.
      </p>
      <h3>1.2 Why a CRM doesn’t fix it</h3>
      <p>
        A CRM is a place you report to. It doesn’t read your inbox at 7 AM, it doesn’t notice that a proposal has been
        quiet for six days, and it doesn’t write the reply. It waits for you to type into it. What a go-to-market team
        needs is the opposite: something that comes to them with the day already sorted, in the chat app they are
        already in, that does the busywork and never the part that needs judgment.
      </p>
      <h3>1.3 Scope</h3>
      <p>
        Kian does four things for every deal: it ranks the day, drafts replies and follow-ups, turns a call transcript
        into notes and next steps, and writes this week’s LinkedIn and X posts from four spoken answers.
      </p>
      <Fig src="/blog/scope.webp" alt="The three Kian agents: kian the coordinator, kian-scribe the writer and kian-studio the storyteller" w={1746} h={710} />
      <p>
        What it doesn’t do: it never emails or messages a customer, never changes a price without the sales lead, and
        never edits the lead sheet without a yes.
      </p>
      <h3>1.4 Definitions</h3>
      <ul>
        <li><b>Switch:</b> an open-source platform that puts AI agents into the chat apps a team already uses, as teammates in shared rooms.</li>
        <li><b>Room:</b> a chat channel that people and agents share, with one history everyone can see.</li>
        <li><b>Desk:</b> the room where Kian posts the morning.</li>
        <li><b>Deal room:</b> one private room per customer, opened by kian.</li>
        <li><b>Answer line:</b> the last line of any agent message that needs a person, like <C>→ done · skip · draft</C>.</li>
        <li><b>Decisions document:</b> the log in the approvals room, one line per yes or no, with a name and a date.</li>
      </ul>

      <h2>2. Overall description: who it’s for and where it sits</h2>
      <h3>2.1 Where Kian sits</h3>
      <p>
        Kian doesn’t replace the tools a team already has. It sits in the gap between them: the inbox where customers
        write, the calendar where calls live, the lead sheet where the pipeline is kept, and the chat app where the team
        talks. Today nothing connects “Priya replied overnight” to “draft the answer, get the discount approved and
        update the row.” That connection is the product.
      </p>
      <h3>2.2 The three people we built for</h3>
      <p>Writing down who the users actually are changed what we built. There are three, and they want different things.</p>
      <p><b>The rep wants a finished morning.</b> Their whole experience is:</p>
      <ul>
        <li>Say “morning, Kian” in the desk, or press the hotkey and say it.</li>
        <li>Get the day one item at a time, each ending with an answer line.</li>
        <li>Reply <C>done</C>, <C>skip</C> or <C>draft</C>, in a word, by typing, voice or button.</li>
        <li>Read the drafts that appear, and send the ones they like from Gmail.</li>
      </ul>
      <p>
        <b>The sales lead wants to be asked once, properly.</b> Every discount arrives in one private room with the
        deal, the ask and a press-and-hold to approve. Every answer is recorded with a name and a date.
      </p>
      <p>
        <b>The founder or team owner wants no more context trapped in one head.</b> Every deal has a room, and the room
        has the whole trail. Handing over an account means adding a person to a room.
      </p>
      <h3>2.3 Operating environment</h3>
      <Fig src="/blog/environment.webp" alt="How Kian works in five steps: you ask your agent, it asks theirs, they check with their person, the answer pops up, a teammate reviews" w={1280} h={900} />
      <p>
        The agents and rooms run through Switch Console on one always-on machine, with a local Mattermost that Switch
        starts for you. Telegram connects as a second desk for the phone. The agents are Claude, and they reach Google
        only through one small Python toolkit.
      </p>
      <p>
        A desktop app for Mac and Windows and a public website are clients of the same rooms. Nothing runs in a
        database of our own.
      </p>
      <h3>2.4 Constraints</h3>
      <ul>
        <li><b>Agents never send.</b> The toolkit has no send command.</li>
        <li><b>Prices need a recorded decision</b> from the sales lead before they go in any draft.</li>
        <li><b>Every write to the lead sheet shows its change first</b> and waits for a named yes.</li>
        <li><b>Say only what Switch does.</b> We design around the features Switch actually exposes.</li>
        <li><b>Demo data is synthetic.</b> Every person, company, email and meeting in the demo is made up. No real customer data is in the repo.</li>
      </ul>
      <h3>2.5 Assumptions and dependencies</h3>
      <p>
        We assume the team lives in Gmail, Google Calendar and a Google Sheet, and has Docker and Switch Console running
        on one machine. We depend on Switch for rooms, agent hand-offs and room documents, on Claude Code for the agents,
        and on the Gmail, Calendar and Sheets APIs for data.
      </p>

      <h2>3. Functional requirements: one email’s journey</h2>
      <p>
        The clearest way we know to explain what Kian must do is to follow one email. Priya at Lumen Health writes late
        at night: can we move Thursday’s call to Tuesday, and if they went annual, could we do 15% off? Each step below
        is a requirement.
      </p>
      <Fig src="/blog/journey.webp" alt="From first reply to a sent answer: nine steps, one person presses send" w={2148} h={1302} />
      <p>
        That last line is the <b>answer line</b>. Every agent message that needs a person ends with one. In Mattermost,
        it is text to reply to. In the desktop widget, the same line becomes buttons. The agents decide what can be
        answered, and every client shows the same choices.
      </p>

      <h2>4. External interfaces: how work comes in, and how people answer</h2>
      <h3>4.1 What Kian reads and writes</h3>
      <p>One constraint shaped this section: the agents get one door into the outside world, and it is small.</p>
      <Table
        rows={[
          ['Source', 'What Kian does with it', 'How'],
          ['Gmail', 'Reads replies, saves drafts. Never sends', 'Read and compose scopes only. The code never calls send'],
          ['Google Calendar', 'Reads today’s meetings', 'Read-only'],
          ['Lead sheet', 'Reads the pipeline, and writes one cell after a named yes', <><C>row propose</C>, then <C>row apply --approved-by</C></>],
          ['Demo data', 'Serves 7 leads, 6 emails and 2 meetings, so the desk runs with no Google account', <C>fixtures.json</C>],
        ]}
      />
      <p>
        All of it goes through <C>kian_tools.py</C>, with five commands: <C>brief</C>, <C>deal</C>, <C>meetings</C>,{' '}
        <C>draft</C> and <C>row</C>.
      </p>
      <h3>4.2 How people answer</h3>
      <p>A person can reply to Kian from any of these, and all of them post the same message into the same room:</p>
      <ul>
        <li><b>Mattermost,</b> the rooms’ home, started by Switch Console. Typing a reply in the thread works the same as pressing a button.</li>
        <li><b>Telegram,</b> as a second desk. Telegram bots can’t create groups, so you make one by hand, add the bot and send <C>!invite-agent @kian</C>. Saying “morning” there gets the same brief on a phone.</li>
        <li><b>The desktop widget,</b> a small pill on Mac and Windows. One card at a time, with the answer line turned into buttons, and voice in and out.</li>
        <li><b>The website,</b> at kiandesk.vercel.app, with a self-playing demo of a whole morning that needs no login.</li>
      </ul>

      <h2>5. Non-functional requirements: the promises underneath</h2>
      <p>These requirements ended up deciding the architecture.</p>
      <p><b>NFR-1: Nothing reaches a customer without a person.</b> The toolkit enforces this, not just the agents’ instructions. A test checks that no send command exists.</p>
      <p><b>NFR-2: Every decision is on the record.</b> Approvals live in a Decisions document with a name and a date on every yes or no. Each agent owns the document it created, so the record cannot be rewritten by anyone else.</p>
      <p><b>NFR-3: Say only what the platform does.</b> We design with the Switch features that exist. Where Switch has no task or decision objects, we use room documents and say so.</p>
      <p><b>NFR-4: Cheap to run, nothing to host.</b> There is no database. Mail, calendar and the lead list stay in the team’s Google account, and deal history stays in their own Switch rooms. The website runs on a free Vercel deployment, and the desktop app is a free download.</p>
      <p><b>NFR-5: Mac and Windows.</b> The desktop app ships as a dmg and an NSIS installer from the same codebase, and the toolkit is plain Python that runs on both.</p>
      <p><b>NFR-6: Honest data.</b> Every person, company, email and meeting in the demo is synthetic and labelled that way. Nobody can mistake the demo for a customer.</p>
      <p><b>NFR-7: Reproducible.</b> One template creates the agents, the rooms and their links. The toolkit runs with two commands. Nine tests run with no network and pass.</p>

      <h2>6. How we built it on Switch</h2>
      <h3>6.1 Switch in one minute</h3>
      <Fig src="/blog/switch.webp" alt="Kian agents working together in Switch rooms on Mattermost" w={1024} h={580} />
      <p>
        Switch isn’t an AI. It ships no agents and no models. It is the office building, and the agents are teammates
        you bring in: Claude Code on your laptop, anything else that speaks its protocol. It turns each chat channel
        into a <b>room</b> that people and agents share, in the apps a team already uses: Slack, Teams, Discord,
        Telegram or Mattermost. Similarly in Kian, we have Kian as a personal assistant for every employee and all their
        agents interact together as shown in the image.
      </p>
      <p>Three ideas made it click for us:</p>
      <ul>
        <li><b>Rooms live in a database, not in the chat app.</b> Mattermost is just a window onto them, which is why an agent added tomorrow can read everything said today.</li>
        <li><b>Agents are given jobs.</b> Each has a role, instructions, tools and a rule for who can talk to it, and each only sees the rooms it belongs to.</li>
        <li><b>Templates set up a whole team at once.</b> One YAML file creates every agent, every room, the links between them and a kickoff message that wakes each agent.</li>
      </ul>
      <h3>6.2 How Kian uses each piece</h3>
      <Table
        rows={[
          ['Switch feature', 'What Kian does with it'],
          [<b>Group template, links and kickoffs</b>, <>One import of <C>kian.template.yaml</C> creates the three agents, the room group and its links. Each room’s kickoff wakes its agent, which says hello and checks which sources it can reach</>],
          [<b>Room instructions</b>, 'The four rules sit on the rooms themselves, so they hold for every agent and person there'],
          [<b>Agents opening rooms</b>, <>kian calls <C>create_room</C> for each new customer, with kian-scribe and the rep already in it</>],
          [<b>Agents addressing agents</b>, <>kian hands work to kian-scribe with <C>send_targeted_message</C>, in the deal room where everyone can see the hand-off</>],
          [<b>Addressing rules</b>, <>kian-scribe is <C>owner-agents</C>: only the rep and their agents can brief it, so nobody else can get it to write to a customer</>],
          [<b>Room documents</b>, 'A “Deal summary” in every deal room and a “Decisions” log in approvals. Only the agent that created a document can change it'],
          [<b>Bridges</b>, 'The rooms live on Mattermost, and kian also answers in a Telegram group, so the morning reaches a phone'],
        ]}
      />
      <p>
        Kian has no backend of its own for the work.{' '}
        <b>The rooms are the interface, room history is the memory, and room documents are the audit trail.</b> Take
        Switch away and there is no product left.
      </p>
    </>
  )
}
