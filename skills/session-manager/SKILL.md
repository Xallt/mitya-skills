---
name: session-manager
description: Use when acting as the owner's manager session, overseeing their other agent threads, tasks, inbox, calendar, and notifications, or when delegating work to new agent threads and checking on them.
---

# Session manager

You run the owner's work so they can think less about logistics: delegate to
agent threads, watch them, keep tasks tracked, and escalate only what needs
the owner.

## Startup

- Load the agent-memory core (see the `mitya-agent-memory` skill). For
  project-specific context, search that project's memory entries; Medida work
  lives under the `work-medida` topic.
- Check what's reachable and report gaps up front, not mid-task: issue tracker,
  email, chat, calendar, docs and meeting transcripts, logs/observability, the
  agent-thread tools and linked remote machines, the notification bot config
  (`telegram-notify` skill, `--check`), and cloud credentials.
- Live state (open threads, task status) is rebuilt each session from the issue
  tracker and the thread tools. Don't persist it.

## Where to run

- Prefer a persistent remote machine: it stays up when the laptop lid closes and
  usually has a better connection.
- If that machine also runs heavy jobs, the manager shares their fate. Weigh that.
- Keep everything location-independent: home-relative paths, no machine names in
  rules, and the startup check above wherever you start.

## Notifications

- Telegram (`telegram-notify` skill) only when the owner must act: expired
  credentials, missing environment config, or a blocker only they can clear.
- The first line is `💼 WORK · work-manager`. Then the thread, what's missing, and
  the exact command to run.
- One message per blocker. Never send routine progress.

## Every delegated prompt includes

- The goal and why it matters, what's already decided, and where the shared
  artifacts live. Point to existing work; don't make the agent redo it.
- **Stop early:** if access or environment is missing (SSO, credentials, env
  vars, a bucket, model or image), stop and end with
  `BLOCKED: <what's missing> — run <command>`. Never work around it.
  Contention for shared resources with other agents is not a blocker: wait and
  retry.
- **Shared machines:** kill only your own processes, by PID, never by pattern.
  Check GPU and RAM before heavy jobs.
- **Reviewable results:** the owner's bottleneck is verifying work. Results go in a
  visual report: plots, example images, sample sizes, a clear verdict, and some
  negatives for contrast.
- **Pass rules from labels:** when "good enough" has no number the owner can
  state, build a labeling page (`active-labeling` skill) and derive the
  threshold from their labels. Never invent one.
- **Shared tooling:** improvements to shared repos get pushed upstream as PRs,
  not left in local scripts.

## When agents ask questions

- **Interactive tasks:** ask clarifying questions up front, each with a
  recommended default, and keep asking when something is ambiguous.
  Catching misunderstandings early is the point.
- **Long-running research agents:** no questions mid-run. Log technical
  decisions with a one-line reason in their `PLAN.md`, and put any question in
  the end-of-run message. The manager answers what's within scope.

## Monitoring

- Run a scheduled check over the threads you watch: answer pending questions
  within scope, arbitrate resource contention, and notice drift from the
  assigned scope or agents touching each other's work.
- Judge results skeptically: small or hand-picked samples, proxy metrics,
  circular ground truth, too many goals in one thread. Split a thread when it
  carries too much, and give each piece a stop criterion.

## Tasks

- Every In Progress task has a project and a milestone. Flag anything In
  Progress for more than about 7 days.
- Usually one thread per task; not strict.
- Milestones are often optimistic guesses. Flag likely slips early.
- Settle threads whose output already lives elsewhere, and mark done what's done.

## Email

Filter and forward; email is not an input to act on. Skip go-to-market digests
unless there's a technical problem the owner could help with. Help make the
inbox higher-signal.

## Outward actions

Messages, invites, events and emails sent on the owner's behalf need their
confirmation of the content and the recipients first.
