"""Visit page route plate: from the Wesleyan pickup spots to the red doors.

Writes src/app/features/visit/route-map.html, an inline SVG the visit page
includes (inline so the labels use the page's Fraunces and Mulish). It is a
schematic, not a survey map: north is up, campus sits south-west of
Washington Street, and the meetinghouse stands on Washington Street.
"""

import pathlib

from svgkit import Svg

ROOT = pathlib.Path(__file__).resolve().parents[2]
W, H = 480, 360

PAL = {
    'paper': '#f4eedc',
    'block': '#ebe2c9',
    'grass': '#cddcb0',
    'grass_dark': '#b4c993',
    'road': '#ffffff',
    'road_edge': '#d9cfb6',
    'route': '#c9a227',
    'navy': '#28166f',
    'red': '#da251d',
    'red_dark': '#a51a14',
    'brick': '#b55a42',
    'roof': '#5d6283',
    'clap': '#fdfaf3',
    'maple_red': '#c8432f',
    'maple_orange': '#e0803a',
    'maple_gold': '#e6b84a',
    'pine': '#3f6650',
    'ink': '#221e3a',
}

PICKUPS = [('Usdan', 200, 214), ('Foss Hill', 150, 252), ('Exley', 92, 286), ('Sci-Li', 128, 314)]
CHURCH = (392, 70)


def ground(s: Svg) -> None:
    s.rect(0, 0, W, H, fill=PAL['paper'])
    for x, y, w, h in [(16, 120, 70, 60), (250, 130, 90, 70), (360, 150, 104, 80), (300, 250, 160, 90), (20, 20, 120, 70), (180, 18, 130, 46)]:
        s.rect(x, y, w, h, rx=8, fill=PAL['block'])
    # the campus green with Foss Hill's contours
    s.path('M20 196 C60 176 180 180 236 196 C262 206 262 300 238 330 C200 350 60 352 28 336 C10 320 8 214 20 196 Z', fill=PAL['grass'])
    for r, o in [(46, 0.5), (32, 0.7), (18, 0.9)]:
        s.ellipse(150, 256, r * 1.3, r * 0.8, fill=PAL['grass_dark'], opacity=o)


def streets(s: Svg) -> None:
    def street(d: str, w: float) -> None:
        s.path(d, fill='none', stroke=PAL['road_edge'], stroke_width=w + 4, stroke_linecap='round')
        s.path(d, fill='none', stroke=PAL['road'], stroke_width=w, stroke_linecap='round')

    street('M-10 104 L490 96', 16)  # Washington Street
    street('M268 -10 C266 120 270 240 262 370', 12)  # the cross street up from campus
    street('M-10 186 C120 172 220 176 300 182 L490 192', 9)
    street('M150 -10 L156 104', 8)
    street('M444 100 L452 370', 8)


def buildings(s: Svg) -> None:
    # campus halls: brick and white with slate roofs
    for x, y, w, h, c in [(176, 198, 46, 22, PAL['brick']), (60, 270, 50, 26, PAL['clap']), (104, 302, 44, 22, PAL['brick']),
                          (40, 214, 34, 22, PAL['clap']), (196, 298, 40, 24, PAL['clap'])]:
        s.rect(x + 3, y + 4, w, h, rx=3, fill=PAL['ink'], opacity=0.12)
        s.rect(x, y, w, h, rx=3, fill=c)
        s.rect(x, y, w, 6, rx=3, fill=PAL['roof'])
    # houses along Washington Street
    for x in (24, 62, 100, 196, 232, 300):
        s.rect(x, 64, 26, 20, rx=2, fill=PAL['clap'])
        s.polygon([(x - 3, 66), (x + 13, 54), (x + 29, 66)], fill=PAL['roof'])


def trees(s: Svg) -> None:
    spots = [(30, 160, 'maple_red'), (84, 150, 'maple_gold'), (238, 160, 'pine'), (300, 222, 'maple_orange'), (330, 300, 'maple_red'),
             (420, 280, 'maple_gold'), (450, 150, 'pine'), (24, 300, 'maple_orange'), (232, 250, 'maple_gold'), (346, 52, 'maple_red'),
             (180, 40, 'pine'), (128, 82, 'maple_orange'), (410, 220, 'pine')]
    for x, y, c in spots:
        s.circle(x + 2, y + 3, 9, fill=PAL['ink'], opacity=0.12)
        s.circle(x, y, 9, fill=PAL[c])


ROUTE = 'M200 214 C230 210 262 206 266 180 C268 150 266 120 290 104 C320 98 350 98 374 98 C386 98 392 94 392 86'


def route(s: Svg) -> None:
    s.path(ROUTE, fill='none', stroke=PAL['route'], stroke_width=4, stroke_linecap='round', stroke_dasharray='2 9')


def car() -> str:
    """The car, drawn around the origin facing along +x, driving the route.

    It runs from Usdan to just short of the doors in 7.2s, waits there, and
    loops. SMIL, so it runs inside the inline SVG; the component pauses it
    under prefers-reduced-motion (RouteMap) with the car parked at the doors.
    """
    c = Svg(1, 1)
    c.ellipse(0, 7, 18, 2.5, fill=PAL['ink'], opacity=0.2)
    c.path('M-17 4 C-17 -1 -14 -3 -9 -4 L-5 -9 L7 -9 L11 -4 L15 -3 C18 -2 18 1 18 4 Z', fill=PAL['red'])
    c.path('M-4 -7.5 L6 -7.5 L9 -4 L-7 -4 Z', fill='#e6e9f6')
    for wx in (-9, 10):
        c.circle(wx, 4, 3.4, fill=PAL['ink'])
        c.circle(wx, 4, 1.3, fill='#d9d6e4')
    motion = (
        f'<animateMotion class="route-map__drive" dur="9s" repeatCount="indefinite" rotate="auto" '
        f'calcMode="linear" keyPoints="0;0.93;0.93" keyTimes="0;0.8;1" path="{ROUTE}"/>'
    )
    return '<g class="route-map__car">' + ''.join(c.items) + motion + '</g>'


def church(s: Svg) -> None:
    x, y = CHURCH
    s.circle(x, y + 8, 30, fill=PAL['red'], opacity=0.12)
    s.rect(x - 16, y - 8, 32, 24, fill=PAL['clap'])
    s.rect(x + 8, y - 8, 8, 24, fill='#e4ddd0')
    s.polygon([(x - 19, y - 7), (x, y - 20), (x + 19, y - 7)], fill=PAL['roof'])
    s.rect(x - 4, y - 32, 8, 14, fill=PAL['clap'])
    s.polygon([(x - 5, y - 32), (x, y - 46), (x + 5, y - 32)], fill=PAL['navy'])
    s.rect(x - 4, y + 4, 8, 12, fill=PAL['red'])
    s.path(f'M{x - 4} {y + 4} a4 4 0 0 1 8 0 Z', fill=PAL['route'])


def pins(s: Svg) -> list[str]:
    labels = []
    for name, x, y in PICKUPS:
        s.ellipse(x, y + 1, 5, 2, fill=PAL['ink'], opacity=0.25)
        s.path(f'M{x} {y} C{x - 3} {y - 5} {x - 7} {y - 9} {x - 7} {y - 13} a7 7 0 0 1 14 0 C{x + 7} {y - 9} {x + 3} {y - 5} {x} {y} Z', fill=PAL['navy'])
        s.circle(x, y - 13, 2.6, fill='#ffffff')
        anchor = 'start' if x < 180 else 'end'
        dx = 10 if anchor == 'start' else -10
        labels.append(f'<text x="{x + dx}" y="{y - 9}" text-anchor="{anchor}" class="route-map__pin">{name}</text>')
    return labels


def build() -> str:
    s = Svg(W, H)
    ground(s)
    streets(s)
    buildings(s)
    trees(s)
    route(s)
    church(s)
    labels = pins(s)
    x, y = CHURCH
    labels += [
        f'<text x="{x}" y="{y + 60}" text-anchor="middle" class="route-map__place">Jesus House</text>',
        f'<text x="{x}" y="{y + 72}" text-anchor="middle" class="route-map__street">120 Washington St</text>',
        '<text x="40" y="350" class="route-map__area">Wesleyan campus</text>',
        '<text x="14" y="122" class="route-map__street">Washington Street</text>',
    ]
    svg = s.render()
    svg = svg.replace('preserveAspectRatio="xMidYMid slice"', 'preserveAspectRatio="xMidYMid meet" class="route-map" aria-hidden="true" focusable="false"')
    svg = svg.replace(f' width="{W}" height="{H}"', '', 1)
    return svg.replace('</svg>', car() + ''.join(labels) + '</svg>')


if __name__ == '__main__':
    header = (
        '<!-- Generated by art-src/scenes/route.py: edit the generator, then run\n'
        '     python3 art-src/scenes/route.py. A schematic of the Sunday pickup run,\n'
        '     decorative (the copy beside it carries the facts). -->\n'
    )
    out = ROOT / 'src/app/features/visit/route-map.html'
    out.write_text(header + build())
    print(f'wrote {out.relative_to(ROOT)}')
