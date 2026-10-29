"""RCF week vignettes: Friday Fellowship, Saturday Study, Sunday Service.

Writes src/app/features/rcf/rcf-vignette.html, the template of the
jh-rcf-vignette component: one inline SVG per gathering behind an @switch on
the `art` input. Facts drawn from the RCF page: Friday 4 to 5 PM in Rehearsal
Hall 109 (worship, prayer, Bible games, ice cream); Saturday 5 to 7 PM in
PAC 333 (Bible study, prayer, snacks); Sunday 9:00 AM at Jesus House, with a
ride from campus. No people are drawn.
"""

import pathlib

from svgkit import Svg

ROOT = pathlib.Path(__file__).resolve().parents[2]
W, H = 440, 320

PAL = {
    'green_night': '#0c3b29',
    'green_wall': '#174d36',
    'green_wall_lo': '#123f2c',
    'green': '#00923f',
    'green_lamp': '#1f7a4c',
    'gold': '#c9a227',
    'gold_light': '#f2cf6b',
    'bulb': '#ffd877',
    'glass_hi': '#ffe9ad',
    'glass_lo': '#efb648',
    'floor': '#b9844e',
    'floor_dark': '#9c6a3c',
    'wood': '#c38a52',
    'wood_dark': '#93613a',
    'cream': '#fbf5e6',
    'page': '#fbf5e6',
    'navy': '#28166f',
    'red': '#da251d',
    'red_dark': '#a51a14',
    'ink': '#221e3a',
    'clap': '#fdfaf3',
    'clap_shade': '#e4ddd0',
    'roof': '#5d6283',
}


def frame(s: Svg, prefix: str) -> object:
    s.clip(f'{prefix}-frame', f'M18 0 H{W - 18} a18 18 0 0 1 18 18 V{H - 18} a18 18 0 0 1 -18 18 H18 a18 18 0 0 1 -18 -18 V18 a18 18 0 0 1 18 -18 Z')
    return s.group(clip=f'{prefix}-frame')


def friday() -> Svg:
    s = Svg(W, H)
    s.linear('rv-fri-win', [(0, PAL['glass_hi']), (1, PAL['glass_lo'])])
    s.linear('rv-fri-floor', [(0, PAL['floor_dark']), (1, PAL['floor'])])
    s.radial('rv-fri-glow', [(0, '#ffe9ad', 0.55), (1, '#ffe9ad', 0)])
    g = frame(s, 'rv-fri')
    g.rect(0, 0, W, H, fill=PAL['green_wall'])
    g.rect(0, 150, W, 70, fill=PAL['green_wall_lo'])
    g.rect(0, 216, W, 104, fill='url(#rv-fri-floor)')
    for y in (236, 262, 296):
        g.line(0, y, W, y, stroke=PAL['floor_dark'], stroke_width=1.5, opacity=0.6)
    # big window, late-afternoon gold
    g.rect(150, 38, 140, 132, rx=6, fill='#0a3526')
    g.rect(158, 46, 124, 116, rx=3, fill='url(#rv-fri-win)')
    g.line(220, 46, 220, 162, stroke='#0a3526', stroke_width=5)
    g.line(158, 104, 282, 104, stroke='#0a3526', stroke_width=5)
    g.polygon([(158, 162), (282, 162), (350, 300), (120, 300)], fill='#ffe9ad', opacity=0.16)
    # string lights
    g.path('M10 28 Q120 70 220 40 Q320 12 430 54', fill='none', stroke='#0a2a1d', stroke_width=2)
    for i, (x, y) in enumerate([(40, 38), (80, 52), (120, 58), (160, 54), (200, 44), (240, 36), (280, 30), (320, 30), (360, 36), (400, 44)]):
        delay = f'animation-delay: {-(i * 7 % 10) * 0.37:.2f}s'
        g.circle(x, y + 6, 9, fill='url(#rv-fri-glow)', cls='rv-twinkle', style=delay)
        g.circle(x, y + 6, 3.6, fill=PAL['bulb'], cls='rv-twinkle', style=delay)
    # chairs in a loose circle
    for x, y, k in [(60, 214, 1), (112, 232, 1.1), (330, 232, 1.1), (382, 214, 1)]:
        g.rect(x - 16 * k, y - 50 * k, 32 * k, 30 * k, rx=4, fill=PAL['wood_dark'])
        g.rect(x - 18 * k, y - 22 * k, 36 * k, 8 * k, rx=3, fill=PAL['wood'])
        g.rect(x - 15 * k, y - 14 * k, 4 * k, 26 * k, fill=PAL['wood_dark'])
        g.rect(x + 11 * k, y - 14 * k, 4 * k, 26 * k, fill=PAL['wood_dark'])
    # acoustic guitar on a stand
    gx, gy = 392, 150
    g.ellipse(gx, gy + 34, 20, 24, fill='#c8813f')
    g.ellipse(gx, gy + 8, 15, 17, fill='#c8813f')
    g.circle(gx, gy + 22, 6, fill='#4a2e1a')
    g.rect(gx - 3, gy - 46, 6, 50, fill='#5a3a22')
    g.rect(gx - 5, gy - 58, 10, 14, rx=2, fill='#3b2616')
    g.line(gx - 12, gy + 62, gx + 12, gy + 62, stroke='#2a2a2a', stroke_width=3)
    # low table: open Bible and three cups of ice cream
    g.ellipse(220, 288, 92, 8, fill=PAL['ink'], opacity=0.25)
    g.rect(140, 246, 160, 12, rx=4, fill=PAL['wood'])
    g.rect(150, 258, 8, 28, fill=PAL['wood_dark'])
    g.rect(282, 258, 8, 28, fill=PAL['wood_dark'])
    g.polygon([(158, 244), (196, 240), (196, 248), (156, 250)], fill=PAL['page'])
    g.polygon([(198, 240), (236, 244), (238, 250), (198, 248)], fill='#efe5cd')
    for i, (x, scoop) in enumerate([(254, '#f6b3c4'), (272, '#fdf1d6'), (290, '#8a5a3c')]):
        g.polygon([(x - 7, 234), (x + 7, 234), (x + 5, 246), (x - 5, 246)], fill='#ffffff')
        g.circle(x, 232, 7, fill=scoop)
        g.circle(x - 2, 229, 2, fill='#ffffff', opacity=0.5)
    # music in the air
    for i, (x, y) in enumerate([(96, 120), (116, 100), (330, 110)]):
        delay = f'animation-delay: {-i * 1.6:g}s'
        g.ellipse(x, y, 5, 3.6, fill=PAL['gold_light'], opacity=0.8, cls='rv-float', style=delay)
        g.rect(x + 3.4, y - 18, 1.8, 18, fill=PAL['gold_light'], opacity=0.8, cls='rv-float', style=delay)
    return s


def saturday() -> Svg:
    s = Svg(W, H)
    s.linear('rv-sat-sky', [(0, '#5b4a8f'), (0.55, '#e0855a'), (1, '#f6c56f')])
    s.radial('rv-sat-lamp', [(0, '#fff1c2', 0.75), (1, '#fff1c2', 0)])
    g = frame(s, 'rv-sat')
    g.rect(0, 0, W, H, fill='#f3ead8')
    # dusk window
    g.rect(28, 34, 150, 120, rx=6, fill='#e2d4b8')
    g.rect(36, 42, 134, 104, rx=3, fill='url(#rv-sat-sky)')
    g.circle(132, 118, 12, fill='#ffd877', opacity=0.9)
    g.line(103, 42, 103, 146, stroke='#e2d4b8', stroke_width=5)
    # bookshelf
    g.rect(250, 26, 160, 140, rx=4, fill=PAL['wood_dark'])
    for row, y in enumerate((36, 82, 128)):
        g.rect(258, y + 36, 144, 6, fill=PAL['wood'])
        x = 262
        for i in range(9):
            w = 10 + (i * 7 + row * 3) % 8
            h = 26 + (i * 5 + row) % 10
            c = [PAL['green'], PAL['navy'], PAL['red'], PAL['gold'], '#3f6650', '#8a5a3c'][(i + row * 2) % 6]
            g.rect(x, y + 36 - h, w, h, fill=c)
            x += w + 2
    # the study table
    g.rect(0, 196, W, 124, fill=PAL['wood'])
    g.rect(0, 196, W, 8, fill='#d9a56b')
    g.rect(0, 300, W, 20, fill=PAL['wood_dark'])
    # green banker's lamp, lit
    g.circle(330, 196, 90, fill='url(#rv-sat-lamp)', cls='rv-breathe')
    g.rect(318, 152, 6, 44, fill=PAL['gold'])
    g.ellipse(321, 198, 22, 6, fill=PAL['gold'])
    g.path('M292 156 Q321 128 350 156 Z', fill=PAL['green_lamp'])
    g.ellipse(321, 156, 29, 5, fill='#fff1c2')
    # two open Bibles with ribbons
    for bx, by in [(70, 236), (200, 250)]:
        g.polygon([(bx - 54, by - 16), (bx, by - 22), (bx + 56, by - 16), (bx + 60, by + 18), (bx, by + 14), (bx - 58, by + 18)], fill=PAL['navy'])
        g.polygon([(bx - 50, by - 14), (bx - 2, by - 20), (bx - 2, by + 12), (bx - 54, by + 16)], fill=PAL['page'])
        g.polygon([(bx + 2, by - 20), (bx + 52, by - 14), (bx + 56, by + 16), (bx + 2, by + 12)], fill='#efe5cd')
        for i in range(5):
            g.line(bx - 44, by - 9 + i * 5, bx - 8, by - 12 + i * 5, stroke='#9a8f7f', stroke_width=1.2)
            g.line(bx + 8, by - 12 + i * 5, bx + 46, by - 9 + i * 5, stroke='#9a8f7f', stroke_width=1.2)
        g.path(f'M{bx} {by + 12} C{bx + 2} {by + 22} {bx - 4} {by + 30} {bx + 2} {by + 40}', fill='none', stroke=PAL['red'], stroke_width=2.4)
    # notebook and pencil
    g.rect(290, 236, 74, 50, rx=3, fill='#ffffff', transform='rotate(-6 327 261)')
    for i in range(5):
        g.line(298, 248 + i * 8, 356, 242 + i * 8, stroke='#c9d3e8', stroke_width=1.2)
    g.rect(300, 284, 66, 5, rx=2, fill=PAL['gold'], transform='rotate(-18 333 286)')
    # mugs with steam and a bowl of snacks
    for mx, c in [(390, PAL['red']), (140, PAL['green'])]:
        g.rect(mx - 13, 204, 26, 30, rx=5, fill=c)
        g.path(f'M{mx + 13} 210 a8 8 0 0 1 0 16', fill='none', stroke=c, stroke_width=4)
        for j, sx in enumerate((mx - 4, mx + 5)):
            g.path(f'M{sx} 198 c-4 -8 4 -12 0 -20', fill='none', stroke='#ffffff', stroke_width=2, opacity=0.7,
                   cls='rv-steam', style=f'animation-delay: {-(j * 1.1 + mx / 200):.2f}s')
    g.path('M368 276 Q394 304 420 276 Z', fill=PAL['cream'])
    for x, y in [(378, 274), (388, 270), (398, 274), (408, 271)]:
        g.circle(x, y, 4, fill='#c98b4a')
    return s


def sunday() -> Svg:
    s = Svg(W, H)
    s.linear('rv-sun-sky', [(0, '#e3ebf2'), (1, '#fbf2df')])
    g = frame(s, 'rv-sun')
    g.rect(0, 0, W, H, fill='url(#rv-sun-sky)')
    g.circle(72, 62, 26, fill='#f2c14e')
    g.path('M0 210 Q120 180 240 196 T440 186 V320 H0 Z', fill='#bfc58f')
    g.path('M0 250 Q160 228 320 244 T440 238 V320 H0 Z', fill='#a3b07a')
    # the meetinghouse
    cx, base = 270, 252
    g.rect(cx - 70, base - 84, 140, 84, fill=PAL['clap'])
    g.rect(cx + 40, base - 84, 30, 84, fill=PAL['clap_shade'])
    for i in range(1, 9):
        g.line(cx - 70, base - 84 + i * 10, cx + 70, base - 84 + i * 10, stroke='#d8d0c0', stroke_width=1)
    g.polygon([(cx - 78, base - 82), (cx, base - 128), (cx + 78, base - 82)], fill=PAL['roof'])
    g.polygon([(cx - 64, base - 82), (cx, base - 118), (cx + 64, base - 82)], fill=PAL['clap'])
    g.rect(cx - 14, base - 156, 28, 30, fill=PAL['clap'])
    g.polygon([(cx - 17, base - 156), (cx, base - 200), (cx + 17, base - 156)], fill=PAL['navy'])
    g.rect(cx - 1.4, base - 216, 2.8, 18, fill=PAL['gold'])
    g.rect(cx - 6, base - 210, 12, 2.8, fill=PAL['gold'])
    for wx in (cx - 56, cx - 34, cx + 22, cx + 44):
        g.path(f'M{wx} {base - 26} V{base - 54} a6 6 0 0 1 12 0 V{base - 26} Z', fill='#cdd4ea')
    g.path(f'M{cx - 14} {base - 40} a14 14 0 0 1 28 0 Z', fill=PAL['gold'])
    g.rect(cx - 14, base - 40, 28, 40, fill=PAL['red'])
    g.line(cx, base - 40, cx, base, stroke=PAL['red_dark'], stroke_width=2)
    # maple beside it
    g.rect(392, 160, 8, 76, fill='#6b4d3a')
    for x, y, r, c in [(380, 150, 26, '#c8432f'), (404, 132, 30, '#e0803a'), (420, 160, 24, '#c8432f'), (396, 166, 22, '#e6b84a')]:
        g.circle(x, y, r, fill=c)
    # the red car pulling up to the doors
    x, y = 110, 262
    g.rect(0, 270, W, 26, fill='#9a95a3')
    g.ellipse(x + 4, y + 30, 70, 6, fill=PAL['ink'], opacity=0.25)
    g.path(f'M{x - 64} {y + 24} C{x - 66} {y + 12} {x - 58} {y + 6} {x - 46} {y + 4} L{x - 22} {y + 2} C{x - 16} {y - 10} {x - 4} {y - 20} {x + 12} {y - 20} L{x + 34} {y - 20} C{x + 48} {y - 18} {x + 56} {y - 6} {x + 62} {y + 4} L{x + 70} {y + 6} C{x + 76} {y + 8} {x + 78} {y + 16} {x + 76} {y + 24} Z', fill=PAL['red'])
    g.path(f'M{x - 14} {y + 2} C{x - 8} {y - 8} {x} {y - 15} {x + 10} {y - 16} L{x + 10} {y + 2} Z', fill='#e6e9f6')
    g.path(f'M{x + 14} {y - 16} L{x + 32} {y - 16} C{x + 42} {y - 14} {x + 48} {y - 6} {x + 52} {y + 2} L{x + 14} {y + 2} Z', fill='#e6e9f6')
    g.rect(x - 62, y + 8, 6, 5, rx=2, fill='#fff1b8')
    for wx in (x - 38, x + 50):
        g.circle(wx, y + 24, 12, fill=PAL['ink'])
        g.circle(wx, y + 24, 5, fill='#d9d6e4')
    return s


def svg_markup(s: Svg) -> str:
    svg = s.render()
    svg = svg.replace(f' width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice"', ' aria-hidden="true" focusable="false"')
    return svg.strip()


def build() -> str:
    cases = [('friday', friday()), ('saturday', saturday()), ('sunday', sunday())]
    body = '\n'.join(f'  @case (\'{name}\') {{\n    {svg_markup(art)}\n  }}' for name, art in cases)
    return '@switch (art()) {\n' + body + '\n}\n'


if __name__ == '__main__':
    header = (
        '<!-- Generated by art-src/scenes/rcf_week.py: edit the generator, then run\n'
        '     python3 art-src/scenes/rcf_week.py. Decorative; the copy carries the facts. -->\n'
    )
    out = ROOT / 'src/app/features/rcf/rcf-vignette.html'
    out.write_text(header + build())
    print(f'wrote {out.relative_to(ROOT)}')
