#!/usr/bin/env python3
"""Send one plain-text notification without exposing credentials or API bodies."""

import argparse
from http.client import HTTPException
import json
from pathlib import Path
import re
import sys
from urllib import error, request


class NotificationError(Exception):
    pass


def load_config(path: Path) -> tuple[str, str]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except (OSError, UnicodeError):
        raise NotificationError("config_unavailable: provide a readable .env file") from None
    values: dict[str, str] = {}
    for line in lines:
        key, separator, value = line.strip().partition("=")
        if not separator or key not in ("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"):
            continue
        value = value.strip()
        if value.startswith(("'", '"')):
            quote = value[0]
            end = value.find(quote, 1)
            if end < 0 or (value[end + 1:].strip() and not value[end + 1:].strip().startswith("#")):
                raise NotificationError(f"config_invalid: check {key}")
            value = value[1:end]
        else:
            value = re.split(r"\s+#", value, maxsplit=1)[0].strip()
        if key in values:
            raise NotificationError(f"config_invalid: duplicate {key}")
        values[key] = value
    for key in ("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"):
        if not values.get(key):
            raise NotificationError(f"config_missing: set {key} in .env")
    token = values["TELEGRAM_BOT_TOKEN"]
    chat = values["TELEGRAM_CHAT_ID"]
    if not re.fullmatch(r"[0-9]+:[A-Za-z0-9_-]+", token):
        raise NotificationError("config_invalid: check TELEGRAM_BOT_TOKEN")
    if not re.fullmatch(r"-?[1-9][0-9]*", chat):
        raise NotificationError("config_invalid: TELEGRAM_CHAT_ID must be a numeric chat ID")
    return token, chat


def rejection(code: int, body: object) -> NotificationError:
    categories = {400: "bad_request: check destination and message", 401: "unauthorized: check bot token",
                  403: "forbidden: start or unblock the bot; check chat access"}
    if code == 429:
        parameters = body.get("parameters") if isinstance(body, dict) else None
        delay = parameters.get("retry_after") if isinstance(parameters, dict) else None
        suffix = f"; retry after {delay} seconds" if type(delay) is int and delay > 0 else ""
        return NotificationError("rate_limited" + suffix)
    if code >= 500:
        return NotificationError("delivery_unknown: Telegram server error; do not retry automatically")
    return NotificationError(categories.get(code, "rejected: Telegram did not accept the message"))


def decode_body(raw: bytes) -> object:
    try:
        return json.loads(raw)
    except (ValueError, UnicodeError):
        return None


def send(token: str, chat: str, message: str) -> int:
    if not message.strip() or len(message.encode("utf-16-le")) // 2 > 4096:
        raise NotificationError("message_invalid: provide 1–4096 characters of plain text")
    if token in message:
        raise NotificationError("message_invalid: message contains the bot token")
    payload = json.dumps({"chat_id": chat, "text": message,
                          "link_preview_options": {"is_disabled": True}}).encode("utf-8")
    req = request.Request(f"https://api.telegram.org/bot{token}/sendMessage", data=payload,
                          headers={"Content-Type": "application/json"}, method="POST")
    # A redirect could expose the credential-bearing URL or change the request.
    class NoRedirect(request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    try:
        with request.build_opener(NoRedirect).open(req, timeout=30) as response:
            body = decode_body(response.read())
    except error.HTTPError as exc:
        try:
            body = decode_body(exc.read())
        except (OSError, HTTPException):
            body = None
        raise rejection(exc.code, body) from None
    except (OSError, error.URLError, ValueError, HTTPException):
        raise NotificationError("delivery_unknown: network failure; do not retry automatically") from None
    if not isinstance(body, dict):
        raise NotificationError("delivery_unknown: invalid API response; do not retry automatically")
    if body.get("ok") is not True:
        code = body.get("error_code")
        raise rejection(code if type(code) is int else 0, body)
    result = body.get("result")
    message_id = result.get("message_id") if isinstance(result, dict) else None
    if type(message_id) is not int:
        raise NotificationError("delivery_unknown: missing receipt; do not retry automatically")
    return message_id


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path,
                        default=Path.home() / ".agents/mitya-skills/.env")
    parser.add_argument("--check", action="store_true", help="Validate config without sending")
    args = parser.parse_args()
    try:
        token, chat = load_config(args.env_file)
        if args.check:
            print("configuration_ok: no message sent")
        else:
            message = sys.stdin.read().rstrip("\n")
            print(f"sent: message_id={send(token, chat, message)}")
    except NotificationError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    except (OSError, UnicodeError):
        print("input_error: could not read message", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
