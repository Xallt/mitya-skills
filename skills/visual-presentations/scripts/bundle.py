#!/usr/bin/env python3
"""Bundle an explicit local HTML dependency graph into one offline file."""
import argparse
import base64
import html
from html.parser import HTMLParser
import mimetypes
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


class Bundler(HTMLParser):
    def __init__(self, root, inline_preview=False):
        super().__init__(convert_charrefs=False)
        self.root = root.resolve()
        self.inline_preview = inline_preview
        self.parts = []
        self.skip_script = False
        self.in_style = False

    def asset(self, reference, parent=None):
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            raise ValueError(f'Remote or unsupported asset: {reference}')
        path = ((parent or self.root) / unquote(url.path)).resolve()
        if not path.is_relative_to(self.root):
            raise ValueError(f'Asset outside deck directory: {reference}')
        if not path.is_file():
            raise ValueError(f'Missing asset: {reference}')
        return path

    def data_uri(self, reference, parent=None):
        if reference.startswith(('data:', '#')):
            return reference
        path = self.asset(reference, parent)
        mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
        return f'data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}'

    def css(self, path):
        return self.css_text(path.read_text(), path.parent)

    def css_text(self, content, parent):
        if re.search(r'@import\b', re.sub(r'/\*.*?\*/', '', content, flags=re.S), flags=re.I):
            raise ValueError('CSS imports are unsupported; use explicit local stylesheet links')
        pattern = r"url\(\s*(?:\"([^\"]*)\"|'([^']*)'|([^\)\s]+))\s*\)"
        content = re.sub(pattern, lambda m: 'url("' + self.data_uri(next(g for g in m.groups() if g is not None), parent) + '")', content)
        if self.inline_preview:
            content = re.sub(r'html\.reveal-full-page\{[^}]*\}', '', content)
            content = re.sub(r'(\d+(?:\.\d+)?)(?:dvh|svh|lvh|vh)\b',
                             lambda m: str(float(m[1]) * 9) + 'px', content)
        return content.replace('</style', '<\\/style')

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'style':
            self.in_style = True
        if 'srcset' in values or tag == 'iframe':
            raise ValueError('srcset and iframes are unsupported; inline the HTML view or use a local src')
        if tag == 'link' and values.get('rel') == 'stylesheet':
            self.parts.append('<style>' + self.css(self.asset(values['href'])) + '</style>')
            return
        if tag == 'script' and values.get('src'):
            if values.get('type') == 'module':
                raise ValueError('Bundle module imports before embedding; use a local classic script')
            code = self.asset(values['src']).read_text().replace('</script', '<\\/script')
            self.parts.append('<script>' + code + '</script>')
            self.skip_script = True
            return
        changed = False
        if values.get('style'):
            values['style'] = self.css_text(values['style'], self.root)
            changed = True
        if tag in ('img', 'source', 'video', 'audio', 'image'):
            for attr in ('src', 'poster', 'href', 'xlink:href'):
                if values.get(attr):
                    values[attr] = self.data_uri(values[attr])
            changed = True
        if changed:
            attrs = [(key, values[key]) for key, _ in attrs]
            self.parts.append('<' + tag + ''.join(' ' + key + ('' if value is None else '="' + html.escape(value, quote=True) + '"') for key, value in attrs) + '>')
        else:
            self.parts.append(self.get_starttag_text())

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in ('img', 'source', 'link', 'meta', 'br', 'hr', 'input'):
            self.parts.append(f'</{tag}>')

    def handle_endtag(self, tag):
        if tag == 'style':
            self.in_style = False
        if tag == 'script' and self.skip_script:
            self.skip_script = False
        else:
            self.parts.append(f'</{tag}>')

    def handle_data(self, data):
        if not self.skip_script:
            self.parts.append(self.css_text(data, self.root) if self.in_style else data)

    def handle_entityref(self, name): self.parts.append(f'&{name};')
    def handle_charref(self, name): self.parts.append(f'&#{name};')
    def handle_comment(self, data): self.parts.append('<!--' + data + '-->')
    def handle_decl(self, decl): self.parts.append('<!' + decl + '>')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--inline-preview', action='store_true')
    args = parser.parse_args()
    if args.source.resolve() == args.out.resolve():
        raise ValueError('Source and output must be different files')
    bundler = Bundler(args.source.parent, args.inline_preview)
    bundler.feed(args.source.read_text())
    bundler.close()
    output = ''.join(bundler.parts)
    if args.inline_preview:
        sizing = '<style>body{overflow:visible;background:transparent}.reveal{position:relative;inset:auto;width:100%;height:auto;aspect-ratio:16/9}</style>'
        output = output.replace('</head>', sizing + '</head>', 1)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(output)
    print(f'Wrote {args.out} ({len(output.encode()):,} bytes)')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError) as error:
        print(f'Cannot bundle: {error}', file=sys.stderr)
        sys.exit(1)
