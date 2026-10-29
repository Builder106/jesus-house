"""Pew scene: inside the meetinghouse, morning light across an empty seat.

Writes art-src/audience-scene-art.svg (1440x900 viewBox). The Bible from the
car now lies open on the red cushion; its left page carries a small picture of
the sanctuary's stained-glass window. That picture is the camera target, so the
dive lands on the window the sanctuary scene opens with.
"""

from svgkit import Svg

W, H = 1440, 900
BOOK = (964, 566)
# The picture on the Bible's left page.
TARGET = (BOOK[0] - 24, BOOK[1] - 1)
# The close-up is what a camera at this zoom sees (the art dives to 14x).
CLOSE_ZOOM = 7

PAL = {
    'wall': '#f6efe2',
    'wall_shade': '#ebe1cf',
    'trim': '#e2d5bd',
    'trim_dark': '#d2c2a4',
    'floor': '#c99a63',
    'floor_dark': '#b5854f',
    'wood': '#c38a52',
    'wood_light': '#d9a56b',
    'wood_dark': '#9a6638',
    'red': '#da251d',
    'red_dark': '#a51a14',
    'navy': '#28166f',
    'gold': '#c9a227',
    'brass': '#c79a3a',
    'page': '#fbf5e6',
    'page_shade': '#efe5cd',
    'glass_hi': '#fdf3d1',
    'glass_lo': '#f1d48a',
    'ink': '#221e3a',
}


def room(s: Svg) -> None:
    s.linear('wall', [(0, '#f9f3e8'), (1, PAL['wall'])])
    s.rect(0, 0, W, 610, fill='url(#wall)')
    # cornice
    s.rect(0, 0, W, 34, fill=PAL['trim'])
    s.rect(0, 34, W, 6, fill=PAL['trim_dark'])
    # wainscot with raised panels
    s.rect(0, 430, W, 180, fill=PAL['wall_shade'])
    s.rect(0, 424, W, 10, fill=PAL['trim'])
    for i in range(10):
        x = 24 + i * 144
        s.rect(x, 452, 120, 136, rx=4, fill='none', stroke=PAL['trim_dark'], stroke_width=3)
    s.rect(0, 602, W, 10, fill=PAL['trim_dark'])
    # floor boards
    s.linear('floor', [(0, PAL['floor_dark']), (0.35, PAL['floor']), (1, '#b07c48')])
    s.rect(0, 610, W, 290, fill='url(#floor)')
    for i, y in enumerate([640, 676, 718, 766, 822, 886]):
        s.line(0, y, W, y, stroke=PAL['floor_dark'], stroke_width=2, opacity=0.6)
        for j in range(8):
            x = (j * 211 + i * 97) % W
            s.line(x, y, x, y + (36 + i * 8), stroke=PAL['floor_dark'], stroke_width=2, opacity=0.4)


def window(s: Svg, x: float, y: float, w: float, h: float) -> None:
    s.linear('glass', [(0, PAL['glass_hi']), (1, PAL['glass_lo'])])
    r = w / 2
    frame = f'M{x} {y + h} V{y + r} a{r} {r} 0 0 1 {w} 0 V{y + h} Z'
    s.path(f'M{x - 14} {y + h + 14} V{y + r} a{r + 14} {r + 14} 0 0 1 {w + 28} 0 V{y + h + 14} Z', fill=PAL['trim'])
    s.path(frame, fill='url(#glass)')
    # muntins
    for i in (1, 2):
        s.line(x + w * i / 3, y + r * 0.3, x + w * i / 3, y + h, stroke='#ffffff', stroke_width=4)
    for j in range(1, 5):
        s.line(x, y + r + (h - r) * j / 5, x + w, y + r + (h - r) * j / 5, stroke='#ffffff', stroke_width=4)
    s.path(f'M{x + w / 2} {y} V{y + r}', stroke='#ffffff', stroke_width=4)
    s.rect(x - 22, y + h + 10, w + 44, 12, fill=PAL['trim_dark'])


def light(s: Svg) -> None:
    # morning light falling from the left window across the pew and floor
    s.polygon([(150, 120), (330, 120), (1020, 900), (520, 900)], fill='#fff8e2', opacity=0.28)
    s.polygon([(190, 140), (290, 140), (820, 900), (640, 900)], fill='#fff8e2', opacity=0.22)
    s.radial('glow', [(0, '#fff3cc', 0.75), (1, '#fff3cc', 0)])
    s.ellipse(BOOK[0], BOOK[1] - 6, 190, 90, fill='url(#glow)')


def lamp(s: Svg, x: float) -> None:
    """Hanging lamp. Not in the bitmap: it sways in the idle overlay (idle.py)."""
    s.line(x, 40, x, 168, stroke=PAL['brass'], stroke_width=3)
    s.path(f'M{x - 34} 196 L{x - 18} 168 L{x + 18} 168 L{x + 34} 196 Z', fill=PAL['brass'])
    s.ellipse(x, 200, 22, 8, fill='#fff1c2')
    s.radial('lamp-glow', [(0, '#fff1c2', 0.6), (1, '#fff1c2', 0)])
    s.circle(x, 206, 70, fill='url(#lamp-glow)')


def pew_behind(s: Svg) -> None:
    # the next row back, only its top rail and a sliver of backrest visible
    s.rect(300, 382, 840, 16, rx=8, fill=PAL['wood_dark'])
    s.rect(316, 396, 808, 30, fill='#a87346')


def pew(s: Svg) -> None:
    s.linear('rail', [(0, PAL['wood_light']), (1, PAL['wood_dark'])])
    s.linear('back', [(0, PAL['wood']), (1, '#ad7644')])
    s.linear('cushion', [(0, '#ea4237'), (1, PAL['red'])])
    s.ellipse(720, 716, 520, 20, fill=PAL['ink'], opacity=0.2)
    # backrest with inset panels
    s.rect(262, 452, 916, 120, fill='url(#back)')
    for i in range(6):
        s.rect(282 + i * 150, 468, 130, 88, rx=5, fill='none', stroke=PAL['wood_dark'], stroke_width=3, opacity=0.6)
    s.rect(248, 438, 944, 20, rx=10, fill='url(#rail)')
    # seat: red cushion on a wooden base
    s.rect(262, 566, 916, 30, rx=6, fill='url(#cushion)')
    s.rect(262, 590, 916, 10, fill=PAL['red_dark'])
    s.rect(262, 566, 916, 4, fill='#ffffff', opacity=0.25)
    s.rect(256, 600, 928, 26, fill=PAL['wood'])
    s.rect(256, 622, 928, 6, fill=PAL['wood_dark'])
    # scroll-topped end panels
    for x, flip in ((226, 1), (1178, -1)):
        s.path(
            f'M{x} 710 V470 C{x} 430 {x + 18 * flip if flip > 0 else x} 414 {x + 22} 414 '
            f'C{x + 34} 414 {x + 40} 426 {x + 40} 440 V710 Z',
            fill=PAL['wood'],
        )
        s.circle(x + 20, 434, 12, fill=PAL['wood_light'])
        s.circle(x + 20, 434, 5, fill=PAL['wood_dark'])
        s.rect(x + 6, 470, 28, 220, rx=4, fill='none', stroke=PAL['wood_dark'], stroke_width=2, opacity=0.6)


def bible(s: Svg) -> None:
    """Open Bible on the cushion; the left page pictures the stained glass."""
    tx, ty = BOOK
    # cover just visible around the pages
    s.polygon([(tx - 50, ty - 22), (tx + 2, ty - 25), (tx + 54, ty - 22), (tx + 58, ty + 24), (tx + 2, ty + 20), (tx - 54, ty + 24)], fill=PAL['navy'])
    s.polygon([(tx - 46, ty - 20), (tx, ty - 23), (tx, ty + 17), (tx - 50, ty + 21)], fill=PAL['page'])
    s.polygon([(tx + 4, ty - 23), (tx + 50, ty - 20), (tx + 54, ty + 21), (tx + 4, ty + 17)], fill=PAL['page_shade'])
    s.line(tx + 2, ty - 24, tx + 2, ty + 18, stroke='#d9cba9', stroke_width=1.5)
    # text lines on the right page
    for i in range(7):
        y = ty - 15 + i * 4.6
        s.line(tx + 10, y, tx + 46 - (8 if i == 6 else 0), y + 0.3, stroke='#8f8577', stroke_width=1.1)
    # the picture: an arched window, navy glass, gold cross, red panels
    px, py = tx - 24, ty - 1
    s.path(f'M{px - 11} {py + 14} V{py - 6} a11 11 0 0 1 22 0 V{py + 14} Z', fill=PAL['gold'])
    s.path(f'M{px - 9} {py + 13} V{py - 6} a9 9 0 0 1 18 0 V{py + 13} Z', fill=PAL['navy'])
    s.rect(px - 7, py + 2, 4, 9, fill=PAL['red'])
    s.rect(px + 3, py + 2, 4, 9, fill=PAL['red'])
    s.rect(px - 0.9, py - 10, 1.8, 21, fill=PAL['gold'])
    s.rect(px - 5, py - 5, 10, 1.8, fill=PAL['gold'])
    s.circle(px, py - 10, 2.6, fill='none', stroke=PAL['gold'], stroke_width=1)
    # ribbon bookmark over the cushion edge
    s.path(f'M{tx + 2} {ty + 17} C{tx + 4} {ty + 28} {tx - 2} {ty + 36} {tx + 4} {ty + 46}', fill='none', stroke=PAL['gold'], stroke_width=2.4)


def candle(s: Svg, x: float) -> None:
    s.rect(x - 4, 470, 8, 236, fill=PAL['brass'])
    s.ellipse(x, 708, 26, 7, fill=PAL['brass'])
    s.rect(x - 12, 462, 24, 10, rx=3, fill=PAL['brass'])
    s.rect(x - 6, 412, 12, 52, rx=2, fill='#fdf8ec')
    s.path(f'M{x} 392 C{x + 6} 400 {x + 5} 410 {x} 412 C{x - 5} 410 {x - 6} 400 {x} 392 Z', fill='#f6b73c')
    s.radial('flame', [(0, '#fff1c2', 0.7), (1, '#fff1c2', 0)])
    s.circle(x, 402, 46, fill='url(#flame)')


def build() -> Svg:
    s = Svg(W, H)
    room(s)
    window(s, 168, 92, 150, 330)
    window(s, 1122, 92, 150, 330)
    pew_behind(s)
    light(s)
    pew(s)
    bible(s)
    candle(s, 1290)
    return s
