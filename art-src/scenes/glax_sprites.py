"""Shape-changing idle sprites, animated by Glaxnimate.

Writes CSS-animated SVGs to public/art/idle/: a bird whose wings beat (for
the flock over the road), the Bible page that lifts and turns on the pew, and
a candle flame that leans and stretches. Glaxnimate turns the keyframes into
CSS `d` path morphs inside each SVG and adds its own reduced-motion rule, so
the sprites run as plain <img> files.

Run with the glaxnimate-mcp-server environment, from the repository root:
  <glaxnimate-mcp-server>/.venv/bin/python art-src/scenes/glax_sprites.py
"""

import pathlib

from glaxnimate_mcp.css import export_css

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/art/idle'
EASE = [0.45, 0, 0.55, 1]
LOOP = {'trigger': 'load', 'iterations': 0}


def write(name: str, svg: str, animations: list[dict], playback: dict = LOOP) -> None:
    result = export_css(svg, animations, playback)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f'{name}.svg').write_text(result['animated_svg'])
    print(f'wrote public/art/idle/{name}.svg')


def bird() -> None:
    up = 'M1 9 Q7 1 14 8 Q21 1 27 9'
    down = 'M1 5 Q7 12 14 8 Q21 12 27 5'
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 14">'
        f'<path id="wings" d="{up}" fill="none" stroke="#221e3a" stroke-width="2.2" '
        'stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.6"/></svg>'
    )
    write('bird-flap', svg, [{
        'target_id': 'wings', 'property': 'path', 'values': [up, down, up],
        'duration_ms': 760, 'key_times': [0, 0.5, 1], 'calc_mode': 'spline',
        'key_splines': [EASE, EASE], 'fill_mode': 'freeze',
    }])


def page() -> None:
    """The Bible's right page lifts over the spine and lands on the left.

    Scene coordinates (pew.py BOOK = 964, 566); playback alternates, so it
    turns back again and the rest pose is always the page lying on the right.
    """
    right = 'M966 543 C980 544 996 544 1014 546 L1018 587 C1000 584 984 583 966 583 Z'
    lifted = 'M966 543 C968 530 971 522 975 515 L977 551 C974 564 970 574 966 583 Z'
    left = 'M966 543 C952 544 936 544 918 546 L914 587 C932 584 948 583 966 583 Z'
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="904 508 124 84">'
        f'<path id="page" d="{right}" fill="#f6eedb" stroke="#d6c8a6" stroke-width="1.2"/></svg>'
    )
    write('page-turn', svg, [{
        'target_id': 'page', 'property': 'path', 'values': [right, right, lifted, left, left],
        'duration_ms': 4400, 'key_times': [0, 0.42, 0.56, 0.68, 1], 'calc_mode': 'spline',
        'key_splines': [EASE, [0.5, 0, 0.9, 0.6], [0.1, 0.4, 0.5, 1], EASE], 'fill_mode': 'freeze',
    }], {'trigger': 'load', 'iterations': 0, 'alternate': True})


def flame() -> None:
    shapes = [
        ('M8 1 C12 9 14 17 8 29 C2 17 4 9 8 1 Z', 'M8 11 C10 15 10.5 20 8 26 C5.5 20 6 15 8 11 Z'),
        ('M6 2 C12 9 14 18 8 29 C2 18 2 10 6 2 Z', 'M7 12 C10 16 10.5 21 8 26 C5.5 21 5.5 16 7 12 Z'),
        ('M8 5 C13 11 14 18 8 29 C2 18 3 11 8 5 Z', 'M8 14 C10 17 10.5 21 8 26 C5.5 21 6 17 8 14 Z'),
        ('M10 1 C14 10 14 18 8 29 C2 18 4 9 10 1 Z', 'M9 11 C10.5 16 10.5 21 8 26 C5.5 21 6.5 15 9 11 Z'),
    ]
    outer = [o for o, _ in shapes] + [shapes[0][0]]
    inner = [i for _, i in shapes] + [shapes[0][1]]
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 30">'
        f'<path id="outer" d="{outer[0]}" fill="#f6b73c"/>'
        f'<path id="inner" d="{inner[0]}" fill="#fff1c2"/></svg>'
    )
    times = [0, 0.27, 0.5, 0.76, 1]
    write('flame-morph', svg, [
        {'target_id': 'outer', 'property': 'path', 'values': outer, 'duration_ms': 1500, 'key_times': times, 'fill_mode': 'freeze'},
        {'target_id': 'inner', 'property': 'path', 'values': inner, 'duration_ms': 1500, 'key_times': times, 'fill_mode': 'freeze'},
    ])


if __name__ == '__main__':
    bird()
    page()
    flame()
