---
name: telegram-notify
description: Use when the user asks to use their Telegram bot for notifications, says "use bot for notifying", or requests Telegram delivery for task results, failures, alerts, or reminders.
---

# Telegram notifications

Use the owner's bot and destination from `~/.agents/mitya-skills/.env`.
The repository's `.env.example` documents `TELEGRAM_BOT_TOKEN` and
`TELEGRAM_CHAT_ID`. A token alone cannot identify the recipient.

## Send when relevant

- A request such as "use the bot to notify me when done" authorizes that
  notification; do not ask again before sending it. Follow the requested event
  and frequency. Mention the task, outcome, and any action needed in a concise
  message. Notify failures or blockers when requested; do not claim success early.
- This skill supplies delivery, not a running monitor. For a future or recurring
  event, arrange the explicitly requested scheduler and invoke this sender from
  it. Follow the project's hosting rules; in site-root use hosted sitectl cron.
  Ensure that runtime has its own securely configured env file and script.
  Never claim a reminder is scheduled merely because this skill exists.
- Do not send a test notification merely to validate configuration, start bot
  polling, call getUpdates, or change webhooks. Sending needs no bot process.

## Use the bundled sender

Resolve `scripts/send_telegram.py` relative to this SKILL.md; do not assume the
current project contains it. It uses Python 3's standard library.

```sh
python3 <skill-directory>/scripts/send_telegram.py --check
python3 <skill-directory>/scripts/send_telegram.py <<'MESSAGE'
Task finished: <result>. Next step: <action, if any>.
MESSAGE
```

`--check` validates local configuration without making a request. The default
env path is `~/.agents/mitya-skills/.env`; `--env-file /absolute/path/.env` selects
an explicitly configured runtime or bot. Never silently fall back to credentials
from another project. If configuration is missing, tell the owner which variable
to fill in locally using `.env.example`; never ask them to paste a token in chat.

The sender reads `.env` as data, sends plain text, and prints only a success ID
or a safe failure category. Keep credentials out of prompts, command arguments,
logs, committed files, and notification text. Do not `cat` or shell-source `.env`.

Only report delivery after a successful API response. On `delivery_unknown`,
report uncertainty and stop; do not retry automatically. For rejection, explain
the category and fix configuration before another attempt. For rate limiting,
respect the reported delay before an authorized retry.

API reference: [Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage).
