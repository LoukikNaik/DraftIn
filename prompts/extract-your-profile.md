# Generate your profile ("About me") from your resume and experience

`profile/me.md` is the *who you are* half of lreachout — the facts every message
is built from. This prompt turns your resume, LinkedIn, and professional history
into a `profile/me.md` you can then refine by hand.

Paste the prompt below into ChatGPT or Claude. Give it your resume (paste the
text or attach the file) and/or let it use what it already knows about you from
past conversations. Save the result as `profile/me.md`.

---

## Copy everything below this line into ChatGPT or Claude

You are going to build a factual "About me" profile that a separate tool uses as
the source of truth when drafting outreach messages on my behalf. It must
contain only real, verifiable facts about me — never invent or inflate anything.

Step 1 — Gather what you know about me.
- Use my resume / CV and LinkedIn if I've given them to you, plus anything you
  remember about my work from past conversations.
- If you don't have enough to fill the sections below, STOP and ask me for my
  resume or a few lines about my roles, projects, and skills before continuing.

Step 2 — Extract concrete facts: employers, titles, dates, what I actually built
and the tools I used, side projects with links, education, and skills. Prefer
specific, checkable accomplishments over adjectives. Do not add anything I
haven't told you.

Step 3 — Output the profile in EXACTLY the markdown structure below, and nothing
else. Keep it factual and reach-out-type-agnostic: this is who I am, NOT how to
write a message (tone, structure, and examples live in a separate "playbook").
Omit a section only if I genuinely have nothing for it.

Output this structure:

```
# {My Name} - Outreach Context

This is the personal background a drafting tool uses to write outreach on my
behalf. Pick only the facts that make a given message specific and relevant.

## Basic Profile

- Name: {full name}
- Location: {city, region}
- Email: {email}
- LinkedIn: {handle or URL}
- Portfolio / site: {url, if any}

## Positioning

{One or two sentences: what kind of professional I am and what I'm strongest at.
Plain, concrete, no buzzwords.}

## Experience

### {Title} - {Company}, {one-line what the company does}, {stage if known}

{Location. Dates.}

- {Concrete thing I did, with the real tools/scale where it matters.}
- {Another concrete accomplishment.}
- ...

### {Earlier title} - {Company}, ...

{Location. Dates.}

- ...

## Side Projects (things I build outside work)

- {Project} ({link}) - {one line on what it does}.
- ...

## Education

- {Degree, institution, year, notable detail}.

## Technical Skills

{Group by area — languages, backend/infra, ML/AI, etc. Only list what I've
actually used.}
```

Return only the filled-in profile, ready to save as `profile/me.md`. After you
return it, suggest 2-3 specific questions whose answers would make the profile
sharper, so I can refine it.
