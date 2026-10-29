"""Render the home scene art to the WebP files the site ships.

For each scene module this writes, under public/art/:
  <name>-scene.webp   the full 1440x900 frame at 2880x1800
  <name>-close.webp   the camera's close-up: the same artwork cropped around the
                      zoom target at CLOSE_ZOOM, also at 2880x1800, so the end of
                      the dive stays sharp (see the .scene__close layer)

and the SVG source itself to art-src/<file>.svg. Needs rsvg-convert and cwebp.
Run from anywhere: python3 art-src/scenes/build.py
"""

import importlib
import pathlib
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))

import svgkit  # noqa: E402

# module name -> (public/art basename, art-src file)
SCENES = {
    'road': ('ride', 'ride-scene-art.svg'),
    'pew': ('audience', 'audience-scene-art.svg'),
    'sanctuary': ('values', 'values-scene-art.svg'),
}


def to_webp(svg_text: str, out: pathlib.Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        svg = pathlib.Path(tmp) / 'frame.svg'
        png = pathlib.Path(tmp) / 'frame.png'
        svg.write_text(svg_text)
        subprocess.run(['rsvg-convert', '-w', '2880', '-h', '1800', str(svg), '-o', str(png)], check=True)
        subprocess.run(['cwebp', '-quiet', '-q', '82', str(png), '-o', str(out)], check=True)
    print(f'wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)')


def main(names: list[str]) -> None:
    for name in names or SCENES:
        module = importlib.import_module(name)
        base, source = SCENES[name]
        art = module.build()
        svgkit.write(art, source)
        to_webp(art.render(), ROOT / 'public/art' / f'{base}-scene.webp')
        to_webp(svgkit.crop(art, *module.TARGET, module.CLOSE_ZOOM), ROOT / 'public/art' / f'{base}-close.webp')


if __name__ == '__main__':
    main(sys.argv[1:])
