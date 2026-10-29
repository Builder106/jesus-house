"""Idle overlays for the home scenes: the motion that plays while a scene rests.

Writes the static sprites to public/art/idle/ and the template of the
jh-scene-idle component (src/app/shared/ui/scene-idle/scene-idle.html). The
shape-changing sprites (bird, page, flame) come from glax_sprites.py.

Every element is placed in the scene's own 1440x900 coordinates, as
percentages of a frame that covers the stage exactly like the art does, so the
motion lines up with the bitmap underneath. Each scene has two layers: `back`
sits under the copy panel, `front` floats light things (leaves on the wind,
dust, sparkles) over it. The animations live in the component's styles.

Each scene has one signature motion: the car drives (wheels spin, the body
rides the road, the centre line streams past), a page of the Bible turns, and
coloured light from the stained glass moves across the aisle.

The sanctuary also holds its people (people.py). The near rows sway in their
pews, and each beat of the bulletin has actors whose gesture sprites
(glax_sprites.py) show only while the bulletin is on that beat: the
component sets data-beat on its host, and the idle-act--beatN classes key off
it.
"""

import pathlib

import people
import pew
import road
import sanctuary
from svgkit import Svg

ROOT = pathlib.Path(__file__).resolve().parents[2]
SPRITES = ROOT / 'public/art/idle'
W, H = 1440, 900


# ── sprites ──────────────────────────────────────────────────────────────


def sprite(name: str, s: Svg, view_box: str) -> None:
    SPRITES.mkdir(parents=True, exist_ok=True)
    svg = s.render(view_box=view_box)
    svg = svg.replace(f' width="{s.width}" height="{s.height}" preserveAspectRatio="xMidYMid slice"', '')
    (SPRITES / f'{name}.svg').write_text(svg)


CAR_BOX = (580, 570, 450, 166)
LAMP_PEW_BOX = (640, 36, 160, 244)
LAMP_SANCTUARY_W = 160
SIT_TOP = 1.2  # a seated sprite's height above the backrest, in shoulder widths


def sprites() -> None:
    for i, (_, _, w, o) in enumerate(road.CLOUDS):
        s = Svg(1, 1)
        s.path(road.cloud_path(w), fill='#ffffff', fill_opacity=o)
        sprite(f'cloud-{i}', s, f'{-0.02 * w:g} {-0.2 * w:g} {w:g} {0.32 * w:g}')
    for name, color in [('leaf-red', '#c8432f'), ('leaf-orange', '#e0803a'), ('leaf-gold', '#e6b84a')]:
        s = Svg(1, 1)
        s.path('M1 5 C4 0 12 0 15 5 C12 10 4 10 1 5 Z', fill=color)
        s.path('M1 5 L15 5', stroke='#000000', stroke_opacity=0.18, stroke_width=0.8)
        sprite(name, s, '0 0 16 10')
    s = Svg(1, 1)
    s.radial('puff', [(0, '#f4f2f8', 0.9), (1, '#f4f2f8', 0)])
    s.circle(10, 10, 10, fill='url(#puff)')
    sprite('puff', s, '0 0 20 20')
    s = Svg(1, 1)
    s.path('M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z', fill='#fff3c4')
    sprite('sparkle', s, '0 0 20 20')
    # the car without its wheels, and one wheel to spin
    s = Svg(W, H)
    road.car(s, wheels=False)
    x, y, w, h = CAR_BOX
    sprite('car-body', s, f'{x} {y} {w} {h}')
    s = Svg(1, 1)
    road.wheel(s, 0, 0)
    sprite('car-wheel', s, '-31 -31 62 62')
    # hanging lamps that sway
    s = Svg(W, H)
    pew.lamp(s, 720)
    x, y, w, h = LAMP_PEW_BOX
    sprite('lamp-pew', s, f'{x} {y} {w} {h}')
    s = Svg(W, H)
    sanctuary.lamp(s, 300)
    sprite('lamp-sanctuary', s, f'{300 - LAMP_SANCTUARY_W / 2} 30 {LAMP_SANCTUARY_W} 230')
    # the near rows of the congregation, each cut at the top of their backrest
    for p in people.SWAYING:
        s = Svg(W, H)
        people.seated(s, p)
        sprite(f'sit-{p.pid}', s, '{:g} {:g} {:g} {:g}'.format(*p.box(top=SIT_TOP)))


# ── placement helpers ────────────────────────────────────────────────────


def pct(value: float, total: float) -> str:
    return f'{value / total * 100:.3f}%'


def place(x: float, y: float, w: float, h: float | None = None) -> str:
    """Inline position for an element whose top-left is (x, y), w units wide."""
    out = f'left: {pct(x, W)}; top: {pct(y, H)}; width: {pct(w, W)}'
    if h is not None:
        out += f'; height: {pct(h, H)}'
    return out


def delay(seconds: float) -> str:
    return f'animation-delay: {seconds:g}s'


def img(name: str, x: float, y: float, w: float, cls: str, d: float = 0, extra: str = '') -> str:
    return (
        f'<img class="idle-sprite {cls}" src="/art/idle/{name}.svg" alt="" '
        f'style="{place(x, y, w)}; {delay(d)}{extra}" />'
    )


def span(cls: str, x: float, y: float, w: float, h: float | None = None, d: float = 0, inner: str = '', extra: str = '') -> str:
    return f'<span class="idle-sprite {cls}" style="{place(x, y, w, h)}; {delay(d)}{extra}">{inner}</span>'


def glow(cx: float, cy: float, size: float, cls: str = 'idle-glow', d: float = 0) -> str:
    return span(cls, cx - size / 2, cy - size / 2, size, d=d)


# ── the road ─────────────────────────────────────────────────────────────


def ride_back() -> list[str]:
    out = [span('idle-rays', 250 - 330, 190 - 330, 660), glow(250, 190, 360, 'idle-glow idle-glow--sun')]
    for i, (x, y, w, _) in enumerate(road.CLOUDS):
        out.append(img(f'cloud-{i}', x - 0.02 * w, y - 0.2 * w, w, 'idle-drift', -i * 6))
    # a flock in a V, crossing the whole sky
    birds = [(0, 30, 1), (14, 18, 0.9), (14, 42, 0.9), (28, 6, 0.8), (28, 54, 0.8)]
    inner = ''.join(
        f'<img class="idle-bird" src="/art/idle/bird-flap.svg" alt="" '
        f'style="left: {bx:g}%; top: {by:g}%; width: {16 * k:g}%" />'
        for bx, by, k in birds
    )
    out.append(span('idle-flock', 1240, 170, 200, 120, inner=inner))
    # the centre line streaming past behind the car (the ground moves right)
    x0, x1 = 1030, 1440
    y0 = 722 + 18 * (x0 - 620) / 820
    out.append(span('idle-lane', x0, y0 - 7, x1 - x0 + 40, 14, inner='<span class="idle-lane__dashes"></span>'))
    # exhaust from the tailpipe
    for i in range(5):
        out.append(img('puff', 1000, 664, 40, 'idle-puff', -i * 0.56))
    # the car: body rides the road, wheels spin
    x, y, w, _ = CAR_BOX
    out.append(img('car-body', x, y, w, 'idle-ride'))
    for wx in road.WHEELS:
        out.append(img('car-wheel', wx - 31, road.WHEEL_Y - 31, 62, 'idle-spin'))
    # leaves letting go of the maples
    leaves = [(110, 600, 'red', 0), (200, 560, 'gold', 2.1), (60, 650, 'orange', 4.4), (250, 620, 'red', 5.8),
              (1170, 500, 'gold', 1.3), (1205, 470, 'orange', 3.6), (150, 540, 'gold', 6.6)]
    for x, y, color, d in leaves:
        out.append(img(f'leaf-{color}', x, y, 22, 'idle-fall', -d))
    return out


def ride_front() -> list[str]:
    # a gust: a scatter of leaves blown across the whole frame every 11s
    gust = [(-40, 330, 'red', 0.0), (-80, 420, 'gold', 0.25), (-30, 520, 'orange', 0.5), (-90, 600, 'red', 0.7),
            (-60, 260, 'gold', 0.9), (-20, 460, 'orange', 1.1), (-70, 680, 'gold', 1.3), (-50, 380, 'red', 1.5)]
    return [img(f'leaf-{c}', x, y, 26, 'idle-gust', -11 + d) for x, y, c, d in gust]


# ── the pew ──────────────────────────────────────────────────────────────


def beam(points: list[tuple[float, float]], cls: str, d: float = 0) -> str:
    poly = ', '.join(f'{pct(x, W)} {pct(y, H)}' for x, y in points)
    return f'<span class="idle-sprite {cls}" style="inset: 0; clip-path: polygon({poly}); {delay(d)}"></span>'


def audience_back() -> list[str]:
    x, y, w, _ = LAMP_PEW_BOX
    out = [
        beam([(150, 120), (330, 120), (1020, 900), (520, 900)], 'idle-beam'),
        beam([(190, 140), (290, 140), (820, 900), (640, 900)], 'idle-beam', -3.5),
        img('lamp-pew', x, y, w, 'idle-sway'),
        glow(1290, 402, 150, 'idle-glow idle-glow--candle'),
        img('flame-morph', 1282, 386, 16, 'idle-flame'),
        glow(964, 560, 220, 'idle-glow idle-glow--page', -1),
        img('page-turn', 904, 508, 124, 'idle-page'),
    ]
    return out


def audience_front() -> list[str]:
    motes = [(260, 860, 7), (340, 900, 5), (420, 880, 9), (500, 900, 6), (580, 870, 8), (660, 900, 5), (300, 900, 6),
             (460, 860, 5), (540, 890, 7), (720, 880, 6), (380, 870, 8), (620, 860, 5)]
    return [span('idle-mote', x, y, size, d=-i * 1.25) for i, (x, y, size) in enumerate(motes)]


# ── the sanctuary ────────────────────────────────────────────────────────


def boxed(name: str, box: tuple[float, float, float, float], cls: str, d: float = 0) -> str:
    x, y, w, _ = box
    return img(name, x, y, w, cls, d)


def congregation() -> list[str]:
    """The people, back to front, under the light that falls on them."""
    out = [boxed('pastor-preach', people.pastor_box(), 'idle-act idle-act--beat1')]
    for row in (1, 2, 3, 4):
        if row == 4:
            out.append(boxed('usher-offer', people.usher_box(), 'idle-act idle-act--beat0'))
            out.append(boxed('usher-wave', people.usher_box(), 'idle-act idle-act--beat3'))
        for i, p in enumerate(people.row_people(row)):
            beat = {'worship': 2, 'wave': 3}.get(p.act)
            if p in people.SWAYING:
                sit = 'idle-sit' + (f' idle-sit--beat{beat}' if beat else '')
                out.append(boxed(f'sit-{p.pid}', p.box(top=SIT_TOP), sit, -(row * 2.3 + i * 1.7)))
            if p.act == 'worship':
                out.append(boxed(f'worship-{p.pid}', p.box(top=1.5, half=0.9), 'idle-act idle-act--beat2 idle-raise', -i * 0.5))
            elif p.act == 'wave':
                out.append(boxed(f'wave-{p.pid}', p.box(top=1.25, half=1.0), 'idle-act idle-act--beat3'))
    return out


def newcomer() -> str:
    """Walks in from behind the viewer (starting below the frame), up the aisle
    past the usher. Painted over the window's light so it stays crisp."""
    h = people.WALKER_H
    return img('walker', 690 - 0.2 * h, 1100 - h, 0.4 * h, 'idle-walker idle-act idle-act--beat0')


def values_back() -> list[str]:
    gx, gy, gw, gh = sanctuary.ARCH
    lw = LAMP_SANCTUARY_W
    out = [
        *congregation(),
        span('idle-glow idle-glow--window', 360, 540, 720, 240),
        # shafts of coloured light falling from the glass to the floor
        beam([(612, 528), (680, 528), (520, 900), (330, 900)], 'idle-beam idle-shaft idle-shaft--violet'),
        beam([(684, 528), (756, 528), (830, 900), (610, 900)], 'idle-beam idle-shaft idle-shaft--gold', -2.7),
        beam([(760, 528), (828, 528), (1110, 900), (900, 900)], 'idle-beam idle-shaft idle-shaft--red', -5.4),
        # and the colour it leaves lying on the pews and floor
        span('idle-pool idle-pool--navy', 360, 700, 260, 90, d=0),
        span('idle-pool idle-pool--gold', 590, 770, 260, 90, d=-5),
        span('idle-pool idle-pool--red', 900, 720, 240, 84, d=-2.5),
        span('idle-pool idle-pool--navy', 960, 820, 260, 90, d=-7.5),
        span('idle-pool idle-pool--gold', 300, 830, 220, 80, d=-3.8),
        # a sheen crossing the glass
        span('idle-sheen', gx, gy, gw, gh, inner='<span class="idle-sheen__band"></span>'),
        img('lamp-sanctuary', 300 - lw / 2, 30, lw, 'idle-sway'),
        img('lamp-sanctuary', 1140 - lw / 2, 30, lw, 'idle-sway', -2.2),
    ]
    for cx in (640, 800):
        out.append(img('flame-morph', cx - 6, 398, 12, 'idle-flame', -cx / 1000))
    out.append(newcomer())
    jewels = [(-60, -40), (60, -40), (-75, 40), (75, 40), (-45, 120), (45, 120), (0, -120)]
    for i, (dx, dy) in enumerate(jewels):
        out.append(img('sparkle', 720 + dx - 16, 298 + dy - 16, 32, 'idle-twinkle', -i * 0.9))
    return out


def values_front() -> list[str]:
    rising = [(560, 600, 18), (640, 640, 14), (700, 560, 20), (760, 620, 16), (840, 580, 14), (600, 520, 12), (800, 500, 18), (680, 660, 12)]
    return [img('sparkle', x, y, size, 'idle-rise', -i * 1.4) for i, (x, y, size) in enumerate(rising)]


# ── template ─────────────────────────────────────────────────────────────


def template() -> str:
    cases = [
        ('ride-back', ride_back()), ('ride-front', ride_front()),
        ('audience-back', audience_back()), ('audience-front', audience_front()),
        ('values-back', values_back()), ('values-front', values_front()),
    ]
    body = '\n'.join(
        f"  @case ('{name}') {{\n    <div class=\"idle-frame\">\n      " + '\n      '.join(items) + '\n    </div>\n  }'
        for name, items in cases
    )
    header = (
        '<!-- Generated by art-src/scenes/idle.py: edit the generator, then run\n'
        '     python3 art-src/scenes/idle.py. Decorative motion over the scene art. -->\n'
    )
    return header + '@switch (scene() + \'-\' + layer()) {\n' + body + '\n}\n'


if __name__ == '__main__':
    sprites()
    out = ROOT / 'src/app/shared/ui/scene-idle/scene-idle.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(template())
    print(f'wrote {out.relative_to(ROOT)} and {len(list(SPRITES.iterdir()))} sprites')
