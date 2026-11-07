/*
 * /guide/switch: how to connect Kian to Switch, step by step, the way we set
 * it up ourselves. From installing Switch Console to an agent per teammate,
 * each person's Google account, the desktop app signed in to the rooms, and
 * the things that tripped us up. Mirrors switch/TEAM.md in the repo.
 */
import type { ReactNode } from 'react'
import { Table } from '../blog/parts'

const GH = 'https://github.com/rahulsainlll/kian'

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="sg-step" id={`step-${n}`}>
      <h2>
        <span className="sg-step__n">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

const Code = ({ children }: { children: string }) => (
  <pre>
    <code>{children}</code>
  </pre>
)

export function SwitchGuide() {
  return (
    <div className="post__body sg">
      <p className="sg__lede">
        By the end, every person on your team has their own agent in Switch, a private desk room to talk to it, and one
        shared room where the agents ask each other for updates and reminders. The Kian app on your desktop is signed in
        to those rooms, so answers pop up as cards. It takes about 30 minutes, and this is exactly how we run it.
      </p>

      <div className="sg__map">
        <pre>{`  Rahul ── #rahul-desk ── Rahul's agent ──┐
  Mayank ─ #mayank-desk ─ Mayank's agent ─┼── #kian-team  (agents talk, people watch)
  Yukti ── #yukti-desk ── Yukti's agent ──┘
                 │
                 └─ each agent works only in its own person's Gmail, Calendar and Tasks`}</pre>
      </div>

      <h2>What you need</h2>
      <ul>
        <li>One Mac or Windows computer that stays on. Switch runs the agents and the rooms there.</li>
        <li>Docker Desktop, Python 3 and git.</li>
        <li>Claude Code, signed in. Switch’s agents are Claude Code sessions.</li>
        <li>A Google account for each person, if you want real mail and calendars. Without one, the agents use demo data.</li>
      </ul>

      <Step n={1} title="Install Switch">
        <p>
          Install <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener">Docker Desktop</a> and{' '}
          <a href="https://github.com/sandbox-quantum/switch/releases/latest" target="_blank" rel="noopener">Switch Console</a>.
          Open Console and finish the first run until switch-buddy answers you in Mattermost.
        </p>
        <p>
          Console starts its own Mattermost for you. Its address is under <b>Messaging apps</b>; ours is{' '}
          <code>http://localhost:52905</code>. You will need it in step 6. On Windows, let Docker set up WSL 2 and restart
          before anything else.
        </p>
      </Step>

      <Step n={2} title="Add your team to Mattermost">
        <p>
          Sign in to that Mattermost and create an account for each teammate, or send them the invite link from the team
          menu. Teammates on the same network open it at <code>http://&lt;your computer’s IP&gt;:&lt;port&gt;</code>.
        </p>
        <p>
          Then in Console, open the Mattermost connection under <b>Messaging apps</b> and set <b>Default Member</b> to
          yourself. Without it, a private room an agent creates has no people in it.
        </p>
      </Step>

      <Step n={3} title="Get the agents’ toolkit">
        <p>The agents reach email, calendars and tasks only through a small Python toolkit. Clone it on the Switch computer:</p>
        <Code>{`git clone ${GH} ~/kian
cd ~/kian/switch/toolkit
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
python3 kian_tools.py --profile rahul agenda    # works right away on demo data`}</Code>
        <p>
          <code>kian_tools.py</code> uses the <code>.venv</code> by itself, so the agents never have to activate it.
        </p>
      </Step>

      <Step n={4} title="Connect each person’s Google account (optional)">
        <ol>
          <li>In Google Cloud Console, create a project and enable the <b>Gmail</b>, <b>Calendar</b> and <b>Tasks</b> APIs.</li>
          <li>Create an OAuth client of type <b>Desktop app</b> and save it as <code>switch/toolkit/credentials.json</code>.</li>
          <li>On the <b>OAuth consent screen</b>, add every teammate’s Gmail address under <b>Test users</b>, or their sign-in fails.</li>
          <li>On the Switch computer, each person signs in once in the browser that opens:</li>
        </ol>
        <Code>{`python3 kian_tools.py --profile rahul login
python3 kian_tools.py --profile mayank login
python3 kian_tools.py --profile yukti login`}</Code>
        <p>
          Each sign-in makes <code>token-&lt;name&gt;.json</code>, which stays on that computer and out of git. An agent
          only ever uses its own person’s profile.
        </p>
      </Step>

      <Step n={5} title="Create the agents and rooms from the template">
        <p>
          In Switch Console, open <b>Templates</b>, choose <b>Import template</b> and pick{' '}
          <a href={`${GH}/blob/main/switch/team.template.yaml`} target="_blank" rel="noopener">
            switch/team.template.yaml
          </a>
          . Run it and fill in:
        </p>
        <Table
          rows={[
            ['Field', 'What to put'],
            ['Team name', <code>kian</code>],
            ['First, second, third person’s name', <>Lowercase names, like <code>rahul</code>, <code>mayank</code>, <code>yukti</code></>],
            ['Their Mattermost usernames', 'The accounts from step 2'],
            ['Toolkit folder (advanced)', <>Where you cloned it; the default is <code>~/kian/switch/toolkit</code></>],
          ]}
        />
        <p>
          One run creates three agents (<code>rahul-kian</code>, <code>mayank-kian</code>, <code>yukti-kian</code>), a desk
          room for each person and <code>#kian-team</code>. Each agent says hello in its desk with today’s agenda and
          introduces itself in the team room.
        </p>
      </Step>

      <Step n={6} title="Sign in from the Kian app">
        <p>
          <a href="/guide">Install the app</a> on each person’s computer, open it from the menu bar icon and go to{' '}
          <b>Settings</b>:
        </p>
        <ul>
          <li><b>Connectors → Rooms:</b> switch from Demo to <b>Switch</b>. Enter the Mattermost URL from step 1, leave Team empty, and sign in with your username and password. Press <b>Test connection</b>.</li>
          <li><b>Team:</b> set <b>Desk room</b> to your desk, like <code>rahul-desk</code>, and <b>Agents</b> to <code>rahul-kian, mayank-kian, yukti-kian</code>.</li>
          <li><b>Agents → Voice engine:</b> keep <b>Wispr Flow</b>. Hold fn, talk, and your words land in Kian’s type bar.</li>
        </ul>
        <p>Your password is kept in the system keychain. Your agent’s questions now arrive as cards above the flower.</p>
      </Step>

      <Step n={7} title="Try it">
        <Table
          rows={[
            ['In', 'Say', 'What happens'],
            [<code>rahul-desk</code>, 'take an update from Mayank on the Avenish email', 'Rahul’s agent asks Mayank’s in #kian-team, Mayank’s agent checks his tasks or asks him, and the answer pops up for Rahul'],
            [<code>rahul-desk</code>, 'remind Yukti to send the deck by Friday 5pm', 'Yukti’s agent adds it to her tasks and calendar, tells her who asked, and confirms'],
            [<code>mayank-desk</code>, 'paste meeting notes', 'A summary, Mayank’s action items in his tasks, and teammates’ items sent to their agents'],
            [<code>yukti-desk</code>, 'reply to Priya that Tuesday works', 'A draft with → send · edit. It goes out only after Yukti says send'],
          ]}
        />
      </Step>

      <h2>What tripped us up</h2>
      <ul>
        <li><b>An agent opened a room and nobody was in it.</b> Set Default Member on the Mattermost connection (step 2).</li>
        <li>
          <b>The answer never came back.</b> An agent has to answer another agent with <code>send_targeted_message</code>,
          or the asking agent never wakes up. The template says so; if an agent forgets, post the rule in #kian-team.
        </li>
        <li><b>Google sign-in said access blocked.</b> Add that person under Test users on the consent screen.</li>
        <li><b>pip said “externally managed environment”.</b> Use the <code>.venv</code> from step 3 instead of installing globally.</li>
        <li><b>macOS said the app is damaged.</b> Follow the <a href="/guide/mac">Mac install guide</a>; it’s one command.</li>
      </ul>

      <h2>The rules every agent follows</h2>
      <ol>
        <li>An agent acts only with its own person’s account. For anyone else, it asks their agent.</li>
        <li>Email goes out only after its person says send; the toolkit refuses to send without <code>--approved-by</code>.</li>
        <li>Every request between agents is a thread in #kian-team, so everyone can see who asked what.</li>
      </ol>
      <p>
        The full reference, with the sales desk template too, is in{' '}
        <a href={`${GH}/blob/main/switch/TEAM.md`} target="_blank" rel="noopener">switch/TEAM.md</a> and{' '}
        <a href={`${GH}/blob/main/switch/README.md`} target="_blank" rel="noopener">switch/README.md</a>.
      </p>
    </div>
  )
}
