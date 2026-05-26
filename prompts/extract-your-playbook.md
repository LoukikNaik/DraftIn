# Generate your own playbook from your past messages

If you've used ChatGPT or Claude to draft outreach before, your voice is
already in their memory. Paste the prompt below into ChatGPT or Claude (the
same account you drafted with), save the result as `prompts/<your-name>.md`,
and point `LREACHOUT_PLAYBOOK_PATH` at it.

If the assistant has no memory of your past messages, it will ask you to paste
3-5 of your best ones first — do that and let it continue.

---

## Copy everything below this line into ChatGPT or Claude

You are going to reverse-engineer a reusable "playbook" from how I write
outreach messages, so a separate tool can draft new ones in my exact voice.

Step 1 — Gather my style.
- Search your memory and our past conversations for outreach / reach-out / cold
  DMs / networking / sales / hiring messages I have written or asked you to
  draft. Pull the real ones.
- If you find fewer than three, STOP and ask me to paste 3-5 of my best past
  messages before continuing. Do not invent a style I don't have.

Step 2 — Analyze, don't summarize. Across those messages, identify:
- My opener pattern: how I greet, how I reference the recipient or their post,
  the first move I make.
- The body structure: do I use bullets or prose? How many? What does each one
  tend to cover, and in what order?
- My closer pattern: the ask, and how I phrase it.
- Voice and tone: warm vs. terse, formal vs. casual, level of enthusiasm, how
  enthusiasm shows up (word choice vs. punctuation).
- Formatting habits: sentence length, capitalization, emoji, exclamation
  points, em dashes, smart quotes — what I do and what I never do.
- Recurring phrases I actually use (keep these) and phrases I clearly avoid.
- What I hook onto about a recipient: their post, their role, their company's
  mission, a shared interest, etc.

Step 3 — Output a playbook in EXACTLY the markdown structure below, and nothing
else. Fill every section from my real style. The "example messages" must be my
actual past messages (lightly cleaned, names changed if needed), because they
carry most of the quality. Use `{placeholders}` in the output shape.

Context the playbook does NOT need to handle (a wrapper already does it): the
tool reads screenshots of the recipient (first screenshot) plus any extra
context like a job description (later screenshots); it injects a separate "About
me" describing who I am; and it web-searches a company it doesn't recognize. So
the playbook should only define the message itself and may freely reference "the
screenshots" and "About me".

Output this structure:

```
# {Reach-out type} playbook

{One line: what kind of message this is and who it goes to.}

## Extract these facts before drafting
- {fact 1 to pull from the screenshots}
- {fact 2}
- ...

## The output shape (follow this exactly)

  {opener line with {placeholders}}

  {body — bullets or prose, with {placeholders}}

  {closer line with {placeholders}}

Notes on the shape:
- {anything important about ordering, naming, what to omit}

## How to write each part
- {guidance per section: length, what to lean on, what to avoid}

## Tone and formatting
- {voice in one or two lines}
- {length budget}
- {capitalization, punctuation, emoji/exclamation/em-dash rules — match mine}

## Banned phrases
- "{phrase I never use}"
- ...

## Two or three reference messages — match this voice and shape exactly

{my real past message 1}

{my real past message 2}

{my real past message 3}
```

Return only the filled-in playbook, ready to save as a .md file.
