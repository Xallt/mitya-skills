"""labelkit server (active-labeling skill). Disk is the shared state; the browser never holds the only copy.

usage: python server.py PROJECT_DIR [PORT]
Run it as a systemd user service so it outlives the agent session:
  systemd-run --user --unit=<name> -p Restart=on-failure -p MemoryMax=300M <python> <kit>/server.py <project> <port>

PROJECT_DIR holds
  page.js      project config + item renderer: LK.start({...}) (see README.md)
  items.json   {id: item payload}                                   written by the agent
  queue.json   {order: [{id, why}], messages: [{at, text}], busy}   written by the agent, append-only
  labels.json  {id: {verdict, note, at, client_at}}                 written here, atomically
  items/       per-item assets (images, geometry json, ...)

GET  /                      kit page (index.html)
GET  /kit/<file>            kit static files
GET  /page.js, /items/...   project files
GET  /api/state             {queue, items, labels}; ETag, 304 when nothing changed (cheap polling)
POST /api/label             {id, verdict, note, client_at}; the newest client_at wins, so a retried or reordered
                            save never overwrites a newer label
"""
import hashlib
import json
import os
import sys
import tempfile
import threading
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

KIT = Path(__file__).resolve().parent
LOCK = threading.Lock()
STATE_FILES = ('items.json', 'queue.json', 'labels.json')
_cache = {}


def read(d, name, default):
    """JSON file, cached by (mtime, size)."""
    p = d / name
    try:
        st = p.stat()
    except FileNotFoundError:
        return default
    key = (st.st_mtime_ns, st.st_size)
    hit = _cache.get(p)
    if hit and hit[0] == key:
        return hit[1]
    try:
        obj = json.loads(p.read_text())
    except json.JSONDecodeError:
        return hit[1] if hit else default
    _cache[p] = (key, obj)
    return obj


def write_atomic(d, name, obj):
    fd, tmp = tempfile.mkstemp(dir=d, prefix=f'.{name}.')
    with os.fdopen(fd, 'w') as f:
        json.dump(obj, f, indent=1)
    os.replace(tmp, d / name)


class H(SimpleHTTPRequestHandler):
    project = None

    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(self.project), **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        p = urlsplit(self.path).path
        if self.command == 'GET' and not p.startswith('/api/'):
            # item assets never change under the same name; page/kit files must update on reload
            self.send_header('Cache-Control', 'max-age=3600' if p.startswith('/items/') else 'no-cache')
        super().end_headers()

    def _json(self, obj, code=200, etag=None):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        if etag:
            self.send_header('ETag', etag)
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _file(self, f):
        b = f.read_bytes()
        ctype = self.guess_type(str(f))
        if ctype.startswith('text/') or ctype.endswith('javascript'):
            ctype += '; charset=utf-8'
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _version(self):
        parts = []
        for n in STATE_FILES:
            try:
                st = (self.project / n).stat()
                parts.append(f'{st.st_mtime_ns}:{st.st_size}')
            except FileNotFoundError:
                parts.append('-')
        return '"' + hashlib.md5('|'.join(parts).encode()).hexdigest()[:16] + '"'

    def do_GET(self):
        p = urlsplit(self.path).path
        if p == '/api/state':
            v = self._version()
            if self.headers.get('If-None-Match') == v:
                self.send_response(304)
                self.send_header('ETag', v)
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                return
            d = self.project
            return self._json(dict(queue=read(d, 'queue.json', {'order': [], 'messages': []}),
                                   items=read(d, 'items.json', {}), labels=read(d, 'labels.json', {})), etag=v)
        if p in ('/', '/index.html'):
            return self._file(KIT / 'index.html')
        if p.startswith('/kit/'):
            f = (KIT / p[5:]).resolve()
            if KIT not in f.parents or not f.is_file() or f.suffix == '.py':
                return self._json({'error': 'not found'}, 404)
            return self._file(f)
        if p.endswith(('.json', '.py')) and not p.startswith('/items/'):
            return self._json({'error': 'forbidden'}, 403)
        return super().do_GET()

    def do_POST(self):
        if urlsplit(self.path).path != '/api/label':
            return self._json({'error': 'not found'}, 404)
        try:
            body = json.loads(self.rfile.read(int(self.headers.get('Content-Length') or 0)) or b'{}')
        except json.JSONDecodeError:
            return self._json({'error': 'bad json'}, 400)
        iid = body.get('id')
        d = self.project
        with LOCK:
            if iid not in read(d, 'items.json', {}):
                return self._json({'error': 'unknown id'}, 400)
            labels = dict(read(d, 'labels.json', {}))
            old = labels.get(iid) or {}
            ca = body.get('client_at') or ''
            if old.get('client_at') and ca and ca < old['client_at']:
                return self._json({'ok': True, 'stale': True})
            labels[iid] = dict(verdict=body.get('verdict'), note=(body.get('note') or '').strip(),
                               at=datetime.now(timezone.utc).isoformat(), client_at=ca)
            write_atomic(d, 'labels.json', labels)
        return self._json({'ok': True})


if __name__ == '__main__':
    H.project = Path(sys.argv[1]).resolve()
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8850
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
