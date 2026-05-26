# Playbooks

A **playbook** defines *what kind of message* lreachout writes: the shape, the
examples, the tone, the phrases to avoid. It is separate from `profile/me.md`,
which defines *who the message is from*.

The server injects the playbook into the prompt under a `## How to write this
message` heading, alongside your profile and the screenshots. Everything that
is specific to a campaign — a hiring note, a sales intro, a podcast-guest
invite, a fundraising ask — lives in the playbook, not in code.

## Using a playbook

```bash
# default
LREACHOUT_PLAYBOOK_PATH=prompts/hiring.md node server/src/index.js

# your own
LREACHOUT_PLAYBOOK_PATH=prompts/sales.md  node server/src/index.js
```

## Fastest start: generate one from your past messages

If you've used ChatGPT or Claude to draft outreach before, your voice is
already in their memory. Open `extract-your-playbook.md`, paste its prompt into
ChatGPT or Claude, and save the result as `prompts/<your-name>.md`. It
reverse-engineers your opener, structure, tone, and banned phrases — using your
real past messages as the examples — and emits a playbook in the format below.

## Writing your own by hand

1. Copy `hiring.md` to `prompts/<your-campaign>.md`.
2. Rewrite it for the new reach-out. A good playbook covers:
   - **What it is** — one line framing the message and who it's going to.
   - **Facts to extract** from the screenshots before drafting.
   - **The output shape** — opener, body, closer, with `{placeholders}`.
   - **How to write each part** — length, voice, what to lean on.
   - **Tone and formatting** — punctuation, length budget, what to avoid.
   - **Banned phrases** — anything that reads as templated.
   - **Two or three full example messages** — the strongest lever on quality.
3. Point `LREACHOUT_PLAYBOOK_PATH` at it and restart the server.

The scaffold in `server/src/prompt-builder.js` already handles the universal
parts for you — output-only/no-images, reading the screenshots in order, and
searching the web for an unfamiliar company — so the playbook only needs to
describe the message itself.

Tips:
- The examples carry most of the weight. Make them real and on-voice.
- Reference `About me` for facts; tell the model never to invent any.
- Keep the profile generic enough to serve every playbook, or maintain a
  profile per campaign and swap both env vars together.
