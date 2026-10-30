"""Hardware for the roadside church sign in the ride scene.

Writes public/art/ui/: the sign's shingled roof cap with its cross, a wooden
post, and a grass tuft for the post's foot. The board itself, its letters,
the hanging plates, and the street blades are HTML, so the text stays real
text; these pieces dress it as the sign at the edge of the road.

Run from anywhere: python3 art-src/scenes/signs.py
"""

import pathlib

from svgkit import Svg

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/art/ui'

WOOD = '#7a5236'
WOOD_LIGHT = '#9a6c48'
WOOD_DARK = '#5a3a26'
SHINGLE = '#4a2f3a'
SHINGLE_DARK = '#36202b'
GOLD = '#c9a227'
GRASS = ['#6f8f4e', '#86a85c', '#5c7a40']


def write(name: str, s: Svg, preserve: str = 'xMidYMid meet') -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    svg = s.render().replace(f'width="{s.width}" height="{s.height}" preserveAspectRatio="xMidYMid slice"',
                             f'preserveAspectRatio="{preserve}"')
    (OUT / f'{name}.svg').write_text(svg)
    print(f'wrote public/art/ui/{name}.svg')


def roof() -> None:
    """A shallow gable over the board, shingled, with a small gold cross."""
    s = Svg(400, 96)
    s.linear('eave', [(0, WOOD_LIGHT), (1, WOOD_DARK)])
    # the cross stands on the ridge
    s.rect(196, 4, 8, 40, fill=GOLD)
    s.rect(186, 14, 28, 7, fill=GOLD)
    s.rect(196, 4, 3, 40, fill='#e6c45a')
    # roof face and shingle courses
    s.polygon([(4, 86), (200, 38), (396, 86)], fill=SHINGLE)
    for i in range(1, 5):
        t = i / 5
        y = 38 + 48 * t
        s.line(200 - 196 * t, y, 200 + 196 * t, y, stroke=SHINGLE_DARK, stroke_width=2)
        for j in range(-8, 9):
            x = 200 + j * 24 + (i % 2) * 12
            if abs(x - 200) < 196 * t:
                s.line(x, y - 9.6, x, y, stroke=SHINGLE_DARK, stroke_width=1.5, opacity=0.7)
    s.polygon([(200, 34), (210, 40), (200, 44), (190, 40)], fill=SHINGLE_DARK)
    # fascia board under the eaves
    s.rect(0, 84, 400, 12, rx=3, fill='url(#eave)')
    write('sign-roof', s)


def post() -> None:
    """A square post, stretched to whatever height the sign stands at."""
    s = Svg(30, 300)
    s.linear('post', [(0, WOOD_DARK), (0.35, WOOD_LIGHT), (1, WOOD)], x2=1, y2=0)
    s.rect(3, 0, 24, 300, fill='url(#post)')
    for x, y0, y1 in [(10, 20, 140), (18, 90, 260), (13, 170, 290), (21, 10, 70)]:
        s.line(x, y0, x, y1, stroke=WOOD_DARK, stroke_width=1, opacity=0.5)
    s.rect(3, 0, 24, 300, fill='none', stroke=WOOD_DARK, stroke_width=1.5)
    write('sign-post', s, 'none')


def tuft() -> None:
    """Grass around the post's foot, so the sign stands in the verge."""
    s = Svg(120, 40)
    blades = [(8, 40, 14, 12), (20, 40, 22, 4), (30, 40, 36, 14), (44, 40, 40, 2), (56, 40, 62, 10),
              (68, 40, 66, 0), (80, 40, 88, 8), (92, 40, 96, 14), (104, 40, 110, 6), (114, 40, 112, 18)]
    for i, (x0, y0, x1, y1) in enumerate(blades):
        s.path(f'M{x0 - 5} {y0} Q{(x0 + x1) / 2} {(y0 + y1) / 2 - 4} {x1} {y1} Q{(x0 + x1) / 2 + 2} {(y0 + y1) / 2} {x0 + 5} {y0} Z',
               fill=GRASS[i % 3])
    write('sign-tuft', s)


if __name__ == '__main__':
    roof()
    post()
    tuft()
