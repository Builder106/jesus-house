"""Road scene: Sunday morning on the way to the meetinghouse.

Writes art-src/ride-scene-art.svg (1440x900 viewBox). The camera target is
the car's rear side window at (866, 630): through it you see a Bible on the
back seat, the same book the pew scene zooms into next.
"""

from svgkit import Svg, write

W, H = 1440, 900
TARGET = (866, 630)
# The close-up layer is the frame a camera at this zoom sees; it fades in once
# the dive passes it (ride.css) and carries the dive to its 24x end sharp.
CLOSE_ZOOM = 12

PAL = {
    'sky_top': '#e3ebf2',
    'sky_low': '#fbf2df',
    'sun': '#f2c14e',
    'ridge_far': '#c4c8de',
    'ridge_mid': '#a9b4c9',
    'field_far': '#d8d4a4',
    'field_mid': '#bfc58f',
    'field_near': '#a3b07a',
    'field_front': '#8e9d68',
    'road': '#9a95a3',
    'road_edge': '#7f7a8c',
    'line': '#f2c14e',
    'wall': '#a7a19a',
    'wall_dark': '#857e78',
    'trunk': '#6b4d3a',
    'maple_red': '#c8432f',
    'maple_orange': '#e0803a',
    'maple_gold': '#e6b84a',
    'pine': '#3f6650',
    'pine_dark': '#2f5040',
    'clap': '#fdfaf3',
    'clap_shade': '#e4ddd0',
    'roof': '#5d6283',
    'navy': '#28166f',
    'red': '#da251d',
    'red_dark': '#a51a14',
    'gold': '#c9a227',
    'glass': '#cdd4ea',
    'ink': '#221e3a',
}


# Clouds and birds are not in the bitmap: they move, so they live in the idle
# overlay (idle.py), drawn from these lists.
CLOUDS = [(470, 150, 300, 0.75), (1010, 120, 240, 0.6), (1180, 210, 180, 0.5), (90, 330, 200, 0.45)]
BIRDS = [(905, 248, 1), (944, 232, 0.8), (980, 256, 0.7)]


def cloud_path(w: float) -> str:
    """A long morning cloud stratum, starting at the origin."""
    return (
        f'M0 0 q{w * 0.12} {-w * 0.09} {w * 0.3} {-w * 0.06} q{w * 0.12} {-w * 0.07} {w * 0.28} {-w * 0.02} '
        f'q{w * 0.2} {-w * 0.02} {w * 0.3} {w * 0.07} q{w * 0.08} {w * 0.05} {-w * 0.04} {w * 0.07} Z'
    )


def sky(s: Svg) -> None:
    s.linear('sky', [(0, PAL['sky_top']), (0.62, PAL['sky_low']), (1, '#fdf6e8')])
    s.radial('sun-glow', [(0, '#fff3cf', 0.95), (0.4, '#fbe3a0', 0.45), (1, '#fbe3a0', 0)])
    s.rect(0, 0, W, H, fill='url(#sky)')
    s.circle(250, 190, 260, fill='url(#sun-glow)')
    s.circle(250, 190, 54, fill=PAL['sun'])


def land(s: Svg) -> None:
    # Connecticut River valley ridges, fading with distance
    s.path('M0 430 Q180 372 360 404 T720 388 T1080 380 T1440 396 V560 H0 Z', fill=PAL['ridge_far'])
    s.path('M0 470 Q240 420 520 452 T1040 436 T1440 448 V600 H0 Z', fill=PAL['ridge_mid'], opacity=0.85)
    # fields, near ones warmer and darker
    s.path('M0 500 Q300 462 640 486 T1440 474 V900 H0 Z', fill=PAL['field_far'])
    s.path('M0 560 Q360 520 760 548 T1440 530 V900 H0 Z', fill=PAL['field_mid'])
    s.path('M0 640 Q420 600 860 630 T1440 612 V900 H0 Z', fill=PAL['field_near'])
    s.path('M0 780 Q480 742 980 770 T1440 756 V900 H0 Z', fill=PAL['field_front'])
    # light mown stripes on the near field
    for i in range(5):
        y = 662 + i * 22
        s.path(f'M{-20} {y} Q{520} {y - 30} {1460} {y - 10}', fill='none', stroke='#ffffff', stroke_width=6, opacity=0.06)


def distant_trees(s: Svg) -> None:
    clumps = [
        (40, 492, 46, PAL['maple_gold']), (110, 486, 38, PAL['pine']), (200, 494, 34, PAL['maple_orange']),
        (1180, 478, 40, PAL['pine']), (1250, 470, 48, PAL['maple_red']), (1340, 482, 36, PAL['maple_gold']),
        (1410, 476, 42, PAL['pine']),
    ]
    for x, y, r, c in clumps:
        s.ellipse(x, y, r, r * 0.7, fill=c, opacity=0.55)


def meetinghouse(s: Svg, cx: float, base: float) -> None:
    """New England meetinghouse: white clapboard, navy steeple, red doors."""
    w, h = 170, 110
    x0 = cx - w / 2
    # grassy knoll the meetinghouse sits on\n    s.ellipse(cx, base + 26, w * 1.5, 40, fill=PAL['field_far'])\n    s.ellipse(cx + 10, base + 4, w * 0.75, 12, fill=PAL['ink'], opacity=0.12)
    # body, lit face and shaded side
    s.rect(x0, base - h, w, h, fill=PAL['clap'])
    s.rect(x0 + w - 36, base - h, 36, h, fill=PAL['clap_shade'])
    for i in range(1, 11):
        y = base - h + i * 10
        s.line(x0, y, x0 + w, y, stroke='#d8d0c0', stroke_width=1.2, opacity=0.8)
    # gable roof
    s.polygon([(x0 - 10, base - h + 2), (cx, base - h - 58), (x0 + w + 10, base - h + 2)], fill=PAL['roof'])
    s.polygon([(x0 + 6, base - h + 2), (cx, base - h - 46), (x0 + w - 6, base - h + 2)], fill=PAL['clap'])
    s.circle(cx, base - h - 18, 11, fill=PAL['gold'])
    # tower and steeple
    s.rect(cx - 18, base - h - 104, 36, 52, fill=PAL['clap'])
    s.rect(cx + 6, base - h - 104, 12, 52, fill=PAL['clap_shade'])
    s.rect(cx - 9, base - h - 96, 18, 26, rx=9, fill=PAL['ink'], opacity=0.75)
    s.rect(cx - 24, base - h - 110, 48, 8, fill=PAL['clap_shade'])
    s.polygon([(cx - 22, base - h - 110), (cx, base - h - 178), (cx + 22, base - h - 110)], fill=PAL['navy'])
    s.rect(cx - 1.6, base - h - 200, 3.2, 24, fill=PAL['gold'])
    s.rect(cx - 8, base - h - 192, 16, 3.2, fill=PAL['gold'])
    # arched windows
    for wx in (x0 + 22, x0 + 50, x0 + w - 72, x0 + w - 44):
        s.path(f'M{wx} {base - 34} V{base - 70} a11 11 0 0 1 22 0 V{base - 34} Z', fill=PAL['glass'])
        s.line(wx + 11, base - 78, wx + 11, base - 34, stroke='#ffffff', stroke_width=2)
    # the red doors under a gold fan
    s.path(f'M{cx - 17} {base - 46} a17 17 0 0 1 34 0 Z', fill=PAL['gold'])
    s.rect(cx - 17, base - 46, 34, 46, fill=PAL['red'])
    s.line(cx, base - 46, cx, base, stroke=PAL['red_dark'], stroke_width=2)
    s.rect(cx - 26, base - 2, 52, 6, fill=PAL['clap_shade'])


def road(s: Svg) -> None:
    # Sweeps in wide from the lower right, runs level under the car, then
    # narrows uphill to the meetinghouse doors.
    edge_far = 'M612 470 C640 520 520 560 470 600 C380 668 420 700 560 712 L1440 726'
    s.path(
        'M600 470 L626 470 C660 524 560 568 520 606 C470 652 520 676 640 682 L1440 690 '
        'L1440 790 L560 760 C330 740 300 668 420 600 C480 560 600 520 600 470 Z',
        fill=PAL['road'],
    )
    s.path(edge_far, fill='none', stroke=PAL['road_edge'], stroke_width=3, opacity=0.6)
    # centre line, dashes shrinking with distance
    s.path(
        'M613 472 C640 526 548 570 500 610 C440 664 470 712 620 722 L1440 740',
        fill='none',
        stroke=PAL['line'],
        stroke_width=4,
        stroke_dasharray='18 22',
        opacity=0.9,
    )
    # stone wall along the front edge
    for i in range(24):
        x = 560 + i * 38 + (i % 2) * 6
        y = 770 + i * 0.6
        s.rect(x, y, 34, 18, rx=7, fill=PAL['wall'] if i % 3 else PAL['wall_dark'])
        s.rect(x + 4, y + 12, 30, 7, rx=3, fill=PAL['wall_dark'], opacity=0.5)


def maple(s: Svg, x: float, base: float, scale: float, colors: list[str]) -> None:
    s.path(
        f'M{x - 7 * scale} {base} C{x - 5 * scale} {base - 60 * scale} {x - 12 * scale} {base - 90 * scale} {x - 30 * scale} {base - 120 * scale} '
        f'M{x} {base} L{x} {base - 130 * scale} M{x + 3 * scale} {base - 70 * scale} C{x + 20 * scale} {base - 95 * scale} {x + 30 * scale} {base - 110 * scale} {x + 44 * scale} {base - 126 * scale}',
        fill='none',
        stroke=PAL['trunk'],
        stroke_width=9 * scale,
        stroke_linecap='round',
    )
    blobs = [(-46, -150, 52), (8, -176, 60), (56, -142, 48), (-14, -122, 50), (36, -108, 40), (-60, -112, 38)]
    for i, (dx, dy, r) in enumerate(blobs):
        s.circle(x + dx * scale, base + dy * scale, r * scale, fill=colors[i % len(colors)])
    # light on the upper left of the crown, shade lower right
    s.circle(x - 30 * scale, base - 170 * scale, 34 * scale, fill='#ffffff', opacity=0.12)
    s.ellipse(x + 30 * scale, base - 96 * scale, 70 * scale, 26 * scale, fill=PAL['ink'], opacity=0.08)


def pine(s: Svg, x: float, base: float, scale: float) -> None:
    for i, (w, y) in enumerate([(58, 0), (48, -34), (38, -64), (26, -90)]):
        c = PAL['pine'] if i % 2 == 0 else PAL['pine_dark']
        s.polygon([(x - w * scale, base + (y + 4) * scale), (x, base + (y - 52) * scale), (x + w * scale, base + (y + 4) * scale)], fill=c)
    s.rect(x - 5 * scale, base, 10 * scale, 16 * scale, fill=PAL['trunk'])


WHEELS = (680, 936)
WHEEL_Y = 692


def car(s: Svg, wheels: bool = True) -> None:
    """Red sedan facing left (toward the meetinghouse). Rear side window at TARGET."""
    s.linear('car-body', [(0, '#ec5a48'), (0.5, PAL['red']), (1, '#9e1913')])
    s.linear('car-glass', [(0, '#f4f6fd'), (1, '#c9cfe6')])
    s.linear('seat', [(0, '#e9d6b4'), (1, '#c7ad84')])
    tx, ty = TARGET
    s.ellipse(806, 718, 214, 14, fill=PAL['ink'], opacity=0.22)
    # body: long hood to the left, rounded cabin, trunk to the right
    s.path(
        'M600 690 C596 664 612 652 640 648 L706 642 C722 614 748 588 784 584 L888 584 '
        'C920 586 940 612 958 640 L990 646 C1010 650 1016 668 1012 690 Z',
        fill='url(#car-body)',
    )
    s.path('M608 662 L1008 664', stroke='#f6efe6', stroke_width=3, opacity=0.7, fill='none')
    s.rect(612, 684, 396, 7, rx=3, fill=PAL['red_dark'])
    # front side window with the windshield rake
    s.path('M722 640 C734 618 752 598 776 594 L808 594 L808 640 Z', fill='url(#car-glass)')
    s.path('M730 640 L756 600 L770 600 L744 640 Z', fill='#ffffff', opacity=0.35)
    # B-pillar
    s.rect(808, 590, 9, 52, fill='#b01d16')
    # rear side window: the camera target, centred on (tx, ty). Interior shows through.
    win = f'M817 594 L{tx + 36} 594 C{tx + 56} 596 {tx + 70} 618 {tx + 82} 640 L817 640 Z'
    s.clip('rear-window', win)
    g = s.group(clip='rear-window')
    g.rect(810, 590, 150, 54, fill='#3c3352')  # cabin shadow
    g.rect(810, ty - 20, 150, 34, rx=8, fill='url(#seat)')  # seat back
    for i in range(6):
        g.line(826 + i * 22, ty - 16, 826 + i * 22, ty + 10, stroke='#b49a72', stroke_width=1.6)
    g.rect(810, ty + 10, 150, 14, fill=PAL['red'])  # red seat cushion
    g.rect(810, ty + 10, 150, 2, fill='#ffffff', opacity=0.25)
    # the Bible riding to church: navy cover, gold cross, page edge
    g.rect(tx - 15, ty + 2, 30, 9, rx=1.5, fill=PAL['navy'])
    g.rect(tx - 14, ty + 9.5, 28, 2.2, fill='#f3ead6')
    g.rect(tx - 0.8, ty + 3.2, 1.6, 5.6, fill=PAL['gold'])
    g.rect(tx - 2.6, ty + 4.8, 5.2, 1.4, fill=PAL['gold'])
    # glass sheen
    g.path('M817 594 L840 594 L817 626 Z', fill='#ffffff', opacity=0.3)
    g.path(f'M{tx + 8} 594 L{tx + 20} 594 L{tx - 10} 640 L{tx - 22} 640 Z', fill='#ffffff', opacity=0.16)
    s.path(win, fill='none', stroke='#7c1410', stroke_width=3)
    # door seams and handles
    s.path('M808 646 L808 684 M904 646 L904 684', stroke=PAL['red_dark'], stroke_width=2)
    s.rect(782, 652, 16, 4, rx=2, fill='#f6efe6')
    s.rect(878, 652, 16, 4, rx=2, fill='#f6efe6')
    # lamps
    s.rect(600, 660, 10, 9, rx=3, fill='#fff1b8')
    s.circle(604, 664, 18, fill='#fff1b8', opacity=0.25)
    s.rect(1004, 656, 8, 12, rx=2, fill='#7c1410')
    # wheel arches; the wheels themselves spin in the idle overlay too (idle.py)
    for wx in WHEELS:
        s.path(f'M{wx - 36} 688 a36 36 0 0 1 72 0 Z', fill='#5a1410')
    if wheels:
        for wx in WHEELS:
            wheel(s, wx, WHEEL_Y)
    s.path('M790 588 L884 588', stroke='#ffffff', stroke_width=3, opacity=0.35, fill='none')


def wheel(s: Svg, cx: float, cy: float) -> None:
    s.circle(cx, cy, 30, fill=PAL['ink'])
    s.circle(cx, cy, 16, fill='#d9d6e4')
    for i in range(5):
        s.rect(cx - 2, cy - 15, 4, 15, rx=2, fill='#9b98aa', transform=f'rotate({i * 72} {cx} {cy})')
    s.circle(cx, cy, 6, fill='#7d7a90')


def foreground(s: Svg) -> None:
    maple(s, 150, 860, 1.9, [PAL['maple_red'], PAL['maple_orange'], PAL['maple_red'], PAL['maple_gold']])
    pine(s, 1300, 640, 1.5)
    pine(s, 1380, 662, 1.2)
    maple(s, 1180, 610, 0.9, [PAL['maple_gold'], PAL['maple_orange']])
    maple(s, 400, 560, 0.7, [PAL['maple_orange'], PAL['maple_red']])
    # fallen leaves on the verge
    for i, (x, y, c) in enumerate([(300, 820, 'maple_red'), (360, 842, 'maple_gold'), (1080, 830, 'maple_orange'),
                                   (1160, 848, 'maple_red'), (980, 860, 'maple_gold'), (240, 870, 'maple_orange')]):
        s.ellipse(x, y, 7, 3.5, fill=PAL[c], transform=f'rotate({(i * 47) % 180} {x} {y})')


def build() -> Svg:
    s = Svg(W, H)
    sky(s)
    land(s)
    distant_trees(s)
    meetinghouse(s, 640, 472)
    road(s)
    foreground(s)
    car(s)
    # gentle morning haze over the distance
    s.linear('haze', [(0, '#fdf6e8', 0), (0.45, '#fdf6e8', 0.0), (0.55, '#fdf6e8', 0.18), (0.7, '#fdf6e8', 0)], x2=0, y2=1)
    s.rect(0, 0, W, H, fill='url(#haze)')
    return s


if __name__ == '__main__':
    write(build(), 'ride-scene-art.svg')
