"""Sanctuary scene: the aisle, the chancel, and the great stained-glass window.

Writes art-src/values-scene-art.svg (1440x900 viewBox). The window is the full
size version of the picture on the Bible's page in the pew scene. The camera
target is its cross; the window's deep navy glass becomes the ground of the
cathedral section that follows.
"""

import people
from svgkit import Svg

W, H = 1440, 900
TARGET = (720, 300)
# The close-up is what a camera at this zoom sees (the art dives to 8x).
CLOSE_ZOOM = 4

PAL = {
    'wall': '#f6efe2',
    'wall_shade': '#ece2cf',
    'trim': '#e2d5bd',
    'trim_dark': '#d0bf9f',
    'floor': '#c79862',
    'floor_dark': '#a97a46',
    'wood': '#c38a52',
    'wood_light': '#d9a56b',
    'wood_dark': '#93613a',
    'red': '#da251d',
    'red_dark': '#a51a14',
    'navy': '#28166f',
    'navy_deep': '#1a0e4f',
    'navy_mid': '#3a2a8a',
    'violet': '#4b3a9e',
    'gold': '#c9a227',
    'gold_light': '#e6c45a',
    'brass': '#c79a3a',
    'cloth': '#fbf6ea',
    'glass_hi': '#fdf3d1',
    'glass_lo': '#f1d48a',
    'ink': '#221e3a',
}

ARCH = (600, 108, 240, 420)  # x, y, width, height of the great window glass


def room(s: Svg) -> None:
    s.linear('wall', [(0, '#f9f4ea'), (1, PAL['wall'])])
    s.rect(0, 0, W, 600, fill='url(#wall)')
    s.rect(0, 0, W, 30, fill=PAL['trim'])
    s.rect(0, 30, W, 6, fill=PAL['trim_dark'])
    # the chancel apse: a shallow recess behind the window
    x, y, w, h = ARCH
    s.path(f'M{x - 110} 600 V{y + 150} a{w / 2 + 110} {w / 2 + 110} 0 0 1 {w + 220} 0 V600 Z', fill=PAL['wall_shade'])
    # pilasters
    for px in (110, 400, 1000, 1290):
        s.rect(px, 60, 40, 520, fill=PAL['wall_shade'])
        s.rect(px - 8, 52, 56, 14, fill=PAL['trim'])
        s.rect(px - 8, 572, 56, 14, fill=PAL['trim'])
        s.line(px + 13, 70, px + 13, 570, stroke=PAL['trim_dark'], stroke_width=2)
        s.line(px + 27, 70, px + 27, 570, stroke=PAL['trim_dark'], stroke_width=2)


def side_window(s: Svg, x: float) -> None:
    w, h, y = 110, 250, 170
    r = w / 2
    s.linear('side-glass', [(0, PAL['glass_hi']), (1, PAL['glass_lo'])])
    s.path(f'M{x - 12} {y + h + 12} V{y + r} a{r + 12} {r + 12} 0 0 1 {w + 24} 0 V{y + h + 12} Z', fill=PAL['trim'])
    s.path(f'M{x} {y + h} V{y + r} a{r} {r} 0 0 1 {w} 0 V{y + h} Z', fill='url(#side-glass)')
    s.line(x + r, y, x + r, y + h, stroke='#ffffff', stroke_width=4)
    for j in range(1, 4):
        s.line(x, y + r + (h - r) * j / 4, x + w, y + r + (h - r) * j / 4, stroke='#ffffff', stroke_width=4)
    s.rect(x - 18, y + h + 8, w + 36, 10, fill=PAL['trim_dark'])


def great_window(s: Svg) -> None:
    x, y, w, h = ARCH
    r = w / 2
    cx = x + r
    glass = f'M{x} {y + h} V{y + r} a{r} {r} 0 0 1 {w} 0 V{y + h} Z'
    s.radial('glass-glow', [(0, PAL['violet']), (0.55, PAL['navy']), (1, PAL['navy_deep'])], cy=0.45, r=0.7)
    # stone and gold surrounds
    s.path(f'M{x - 26} {y + h + 18} V{y + r} a{r + 26} {r + 26} 0 0 1 {w + 52} 0 V{y + h + 18} Z', fill=PAL['trim'])
    s.path(f'M{x - 12} {y + h + 6} V{y + r} a{r + 12} {r + 12} 0 0 1 {w + 24} 0 V{y + h + 6} Z', fill=PAL['gold'])
    s.path(glass, fill='url(#glass-glow)')
    s.clip('glass', glass)
    g = s.group(clip='glass')
    # leaded quarries: a diamond lattice in alternating deep tones
    step = 30
    for i in range(-2, 12):
        for j in range(-2, 18):
            qx = x + i * step + (j % 2) * step / 2
            qy = y + j * step / 2
            tone = (PAL['navy_mid'], PAL['navy'], PAL['navy_deep'])[(i * 7 + j * 3) % 3]
            g.polygon([(qx, qy - step / 2), (qx + step / 2, qy), (qx, qy + step / 2), (qx - step / 2, qy)], fill=tone, opacity=0.55)
    for i in range(-6, 14):
        g.line(x + i * step - 240, y + h, x + i * step + 240, y - 20, stroke='#120a3a', stroke_width=1.6, opacity=0.6)
        g.line(x + i * step - 240, y - 20, x + i * step + 240, y + h, stroke='#120a3a', stroke_width=1.6, opacity=0.6)
    # small gold jewels at lattice crossings near the cross
    for dx, dy in [(-60, -40), (60, -40), (-75, 40), (75, 40), (-45, 120), (45, 120), (0, -120)]:
        g.polygon([(cx + dx, y + 190 + dy - 6), (cx + dx + 6, y + 190 + dy), (cx + dx, y + 190 + dy + 6), (cx + dx - 6, y + 190 + dy)], fill=PAL['gold_light'])
    # the two red panels flanking the cross's foot
    for px in (cx - 76, cx + 34):
        g.rect(px, y + 300, 42, 92, fill=PAL['red'])
        g.rect(px, y + 300, 42, 92, fill='none', stroke='#120a3a', stroke_width=3)
        g.line(px + 21, y + 300, px + 21, y + 392, stroke='#120a3a', stroke_width=2)
        g.rect(px + 4, y + 304, 12, 84, fill='#ffffff', opacity=0.12)
    # the gold cross with the ring at its head, at TARGET
    tx, ty = TARGET
    g.circle(tx, ty - 132, 26, fill='none', stroke=PAL['gold'], stroke_width=9)
    g.circle(tx, ty - 132, 26, fill='none', stroke='#120a3a', stroke_width=1.6)
    g.rect(tx - 9, ty - 110, 18, 300, fill=PAL['gold'])
    g.rect(tx - 58, ty - 40, 116, 18, fill=PAL['gold'])
    g.rect(tx - 9, ty - 110, 6, 300, fill=PAL['gold_light'])
    g.rect(tx - 58, ty - 40, 116, 6, fill=PAL['gold_light'])
    g.rect(tx - 9, ty - 110, 18, 300, fill='none', stroke='#120a3a', stroke_width=2)
    g.rect(tx - 58, ty - 40, 116, 18, fill='none', stroke='#120a3a', stroke_width=2)
    # mullion bars
    g.rect(x, y + 280, w, 4, fill='#120a3a', opacity=0.8)
    s.path(glass, fill='none', stroke='#120a3a', stroke_width=4)
    # light the window throws into the room
    s.radial('window-light', [(0, '#e9dcff', 0.35), (1, '#e9dcff', 0)])
    s.ellipse(cx, y + h + 120, 360, 120, fill='url(#window-light)')


def chancel(s: Svg) -> None:
    # steps
    s.rect(420, 560, 600, 22, fill=PAL['trim'])
    s.rect(380, 580, 680, 22, fill=PAL['trim_dark'])
    s.rect(340, 600, 760, 16, fill='#c4b192')
    # communion table with white cloth and a gold cross
    s.rect(616, 486, 208, 76, fill=PAL['wood'])
    s.rect(604, 472, 232, 20, fill=PAL['cloth'])
    s.path('M612 490 L604 540 L620 540 L626 490 Z M828 490 L836 540 L820 540 L814 490 Z', fill=PAL['cloth'])
    s.rect(700, 490, 40, 70, fill=PAL['red'])
    s.rect(717, 500, 6, 34, fill=PAL['gold'])
    s.rect(707, 510, 26, 6, fill=PAL['gold'])
    # candlesticks
    for cx in (640, 800):
        s.rect(cx - 3, 440, 6, 34, fill=PAL['brass'])
        s.ellipse(cx, 474, 10, 3, fill=PAL['brass'])
        s.rect(cx - 4, 418, 8, 24, fill=PAL['cloth'])
        s.path(f'M{cx} 404 C{cx + 4} 410 {cx + 4} 416 {cx} 418 C{cx - 4} 416 {cx - 4} 410 {cx} 404 Z', fill='#f6b73c')
    # lectern (left) with the Bible and red marker
    s.polygon([(470, 470), (540, 470), (530, 560), (480, 560)], fill=PAL['wood'])
    s.polygon([(458, 452), (552, 452), (544, 474), (466, 474)], fill=PAL['wood_dark'])
    s.polygon([(470, 446), (540, 446), (548, 456), (462, 456)], fill=PAL['navy'])
    s.rect(503, 456, 4, 26, fill=PAL['red'])
    # pulpit (right)
    s.path('M900 560 V470 Q900 456 914 456 H986 Q1000 456 1000 470 V560 Z', fill=PAL['wood'])
    s.rect(894, 448, 112, 14, rx=4, fill=PAL['wood_dark'])
    s.rect(936, 484, 28, 44, rx=3, fill='none', stroke=PAL['wood_dark'], stroke_width=3)
    s.rect(948, 490, 4, 32, fill=PAL['gold'])
    s.rect(940, 500, 20, 4, fill=PAL['gold'])


def floor_and_pews(s: Svg) -> None:
    s.linear('floor', [(0, PAL['floor_dark']), (0.3, PAL['floor']), (1, '#b07c48')])
    s.rect(0, 600, W, 300, fill='url(#floor)')
    # the red runner, widening toward the viewer
    s.polygon([(672, 616), (768, 616), (900, 900), (540, 900)], fill=PAL['red'])
    s.polygon([(672, 616), (768, 616), (774, 630), (666, 630)], fill=PAL['red_dark'])
    s.polygon([(682, 616), (690, 616), (580, 900), (566, 900)], fill=PAL['gold'], opacity=0.5)
    s.polygon([(750, 616), (758, 616), (874, 900), (860, 900)], fill=PAL['gold'], opacity=0.5)
    # pews in rows, nearer rows lower, taller, and wider; each row's people sit
    # behind its backrest, and the usher stands in the aisle before the front row
    for row, (y, k) in enumerate(people.ROWS):
        if row == len(people.ROWS) - 1:
            people.usher(s)
        for person in people.row_people(row):
            people.seated(s, person)
        depth = 1 - k / 1.4
        for side in (-1, 1):
            inner = 720 + side * (60 + 90 * k)
            outer = 720 + side * (430 + 520 * k)
            x0, x1 = sorted((inner, outer))
            back_h = 46 * k
            s.rect(x0, y - back_h, x1 - x0, back_h, fill=PAL['wood'])
            s.rect(x0, y - back_h, x1 - x0, 8 * k, fill=PAL['wood_light'])
            s.rect(x0, y - back_h * 0.35, x1 - x0, back_h * 0.35, fill=PAL['wood_dark'], opacity=0.45)
            end = x0 if side > 0 else x1 - 16 * k
            s.rect(end, y - back_h - 10 * k, 16 * k, back_h + 10 * k, rx=6 * k, fill=PAL['wood_dark'])
            s.rect(x0, y - back_h, x1 - x0, back_h, fill='#f6efe2', opacity=depth * 0.25)


def lamp(s: Svg, x: float) -> None:
    """Hanging lamp. Not in the bitmap: it sways in the idle overlay (idle.py)."""
    s.radial('lamp-glow', [(0, '#fff1c2', 0.55), (1, '#fff1c2', 0)])
    s.line(x, 36, x, 150, stroke=PAL['brass'], stroke_width=3)
    s.path(f'M{x - 30} 176 L{x - 16} 150 L{x + 16} 150 L{x + 30} 176 Z', fill=PAL['brass'])
    s.ellipse(x, 180, 20, 7, fill='#fff1c2')
    s.circle(x, 186, 64, fill='url(#lamp-glow)')


def build() -> Svg:
    s = Svg(W, H)
    room(s)
    side_window(s, 206)
    side_window(s, 1124)
    great_window(s)
    chancel(s)
    people.pastor(s)
    floor_and_pews(s)
    return s
