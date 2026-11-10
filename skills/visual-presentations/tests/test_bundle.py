"""Run with python3 -m unittest discover -s tests from the skill directory."""
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/'scripts/bundle.py'

class BundleTests(unittest.TestCase):
    def run_bundle(self, directory):
        return subprocess.run(['python3',str(SCRIPT),str(directory/'index.html'),'--out',str(directory/'deck.html')],capture_output=True,text=True)

    def test_embeds_local_dependencies_and_preserves_script_text(self):
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp)
            (p/'index.html').write_text('<!doctype html><link rel="stylesheet" href="theme.css"><img src="asset.svg"><script src="deck.js"></script>')
            (p/'theme.css').write_text('.a{background:url(asset.svg)}')
            (p/'asset.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
            (p/'deck.js').write_text('window.example="<div>literal</div>";')
            result=self.run_bundle(p)
            self.assertEqual(result.returncode,0,result.stderr)
            html=(p/'deck.html').read_text()
            self.assertIn('data:image/svg+xml;base64,',html)
            self.assertIn('window.example="<div>literal</div>";',html)
            self.assertNotIn('src="deck.js"',html)
            self.assertNotIn('href="theme.css"',html)

    def test_embeds_inline_css_and_quoted_asset_with_spaces(self):
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp)
            (p/'asset 1.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
            (p/'index.html').write_text('<style>.a{background:url("asset 1.svg")}</style>')
            result=self.run_bundle(p)
            self.assertEqual(result.returncode,0,result.stderr)
            output=(p/'deck.html').read_text()
            self.assertIn('data:image/svg+xml;base64,',output)
            self.assertNotIn('asset 1.svg',output)

    def test_embeds_style_attribute_asset(self):
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp)
            (p/'asset.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
            (p/'index.html').write_text('<div style="background:url(asset.svg)"></div>')
            result=self.run_bundle(p)
            self.assertEqual(result.returncode,0,result.stderr)
            self.assertIn('data:image/svg+xml;base64,',(p/'deck.html').read_text())

    def test_fails_on_remote_or_missing_asset(self):
        for source in ('https://example.com/a.png','missing.png'):
            with self.subTest(source=source), tempfile.TemporaryDirectory() as temp:
                p=Path(temp);(p/'index.html').write_text(f'<img src="{source}">')
                result=self.run_bundle(p)
                self.assertNotEqual(result.returncode,0)
                self.assertIn('Cannot bundle:',result.stderr)
                self.assertFalse((p/'deck.html').exists())

    def test_rejects_asset_outside_deck(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);p=root/'deck';p.mkdir()
            (root/'private.txt').write_text('private')
            (p/'index.html').write_text('<script src="../private.txt"></script>')
            result=self.run_bundle(p)
            self.assertNotEqual(result.returncode,0)
            self.assertIn('Asset outside deck directory',result.stderr)
            self.assertFalse((p/'deck.html').exists())

    def test_does_not_overwrite_source(self):
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp);source=p/'index.html';source.write_text('<p>Keep</p>')
            result=subprocess.run(['python3',str(SCRIPT),str(source),'--out',str(source)],capture_output=True)
            self.assertNotEqual(result.returncode,0)
            self.assertIn(b'Source and output must be different',result.stderr)
            self.assertEqual(source.read_text(),'<p>Keep</p>')

if __name__=='__main__':unittest.main()
