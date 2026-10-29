"""The people in the sanctuary: the congregation, the pastor, an usher, and a newcomer.

Every figure is drawn in the scene's 1440x900 coordinates, so the rest pose
painted into the bitmap (sanctuary.py) and its animated copy in the idle
overlay (idle.py, glax_sprites.py) line up exactly. Seated people face the
chancel, so we see their backs, cut at the top of their own pew's backrest.
The pastor and the usher face the room.

Each beat of the bulletin has its actors: the usher offers a bulletin and a
newcomer walks up the aisle (Arrival), the pastor preaches (The Word), hands go
up in worship (The Family), and two people in the pews turn round and wave
(The Sending). Arms are single stroked paths (shoulder, elbow, hand), so
Glaxnimate can morph one pose into the next.
"""

from dataclasses import dataclass

from svgkit import Group

W, H = 1440, 900
# Pew rows from sanctuary.py: (floor line y, depth scale k). Backrest top is y - 46k.
ROWS = [(640, 0.42), (680, 0.55), (734, 0.72), (806, 0.94), (900, 1.22)]
U = 62  # a seated person's shoulder width at k = 1

SKIN = {
    'deep': '#4e2f1f',
    'dark': '#6b4129',
    'brown': '#8a5636',
    'tan': '#b07a52',
    'light': '#d6a47c',
    'fair': '#efc6a4',
}
HAIR = {'black': '#1b1514', 'dark': '#33241c', 'brown': '#5e3f2a', 'grey': '#8f8a86', 'auburn': '#7a3b22'}
INK = '#221e3a'
HAZE = '#f6efe2'


def mix(a: str, b: str, t: float) -> str:
    """Blend two #rrggbb colours: t = 0 gives a, 1 gives b."""
    ca = [int(a[i : i + 2], 16) for i in (1, 3, 5)]
    cb = [int(b[i : i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(x + (y - x) * t):02x}' for x, y in zip(ca, cb))


def shade(c: str, t: float = 0.22) -> str:
    return mix(c, '#140c2c', t)


def arm(g: Group, pts: list[tuple[float, float]], sleeve: str, skin: str, w: float, pid: str = '') -> None:
    """A stroked arm through shoulder, elbow, hand, with a round hand at the end.

    A darker edge under the sleeve keeps the arm readable over a body in the
    same cloth.
    """
    d = arm_paths(pts)
    g.path(d['edge'], id=f'{pid}-edge' if pid else None, fill='none', stroke=shade(sleeve, 0.45), stroke_width=w * 1.25,
           stroke_linecap='round', stroke_linejoin='round')
    g.path(d['sleeve'], id=f'{pid}-sleeve' if pid else None, fill='none', stroke=sleeve, stroke_width=w,
           stroke_linecap='round', stroke_linejoin='round')
    g.path(d['hand'], id=f'{pid}-hand' if pid else None, fill='none',
           stroke=skin, stroke_width=w * 0.95, stroke_linecap='round')


def arm_paths(pts: list[tuple[float, float]]) -> dict[str, str]:
    """Path data for each part of an arm, keyed by the id suffix `arm` gives it."""
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    hx, hy = pts[-1]
    return {'edge': d, 'sleeve': d, 'hand': f'M{hx:.1f} {hy:.1f} L{hx:.1f} {hy - 0.1:.1f}'}


# ── seated, seen from behind ─────────────────────────────────────────────


@dataclass
class Seated:
    pid: str
    row: int
    side: int  # -1 left of the aisle, 1 right
    seat: int  # 0 is nearest the aisle
    skin: str
    hair: str  # short, afro, gele, braids, locs, bun, hood, scarf, bald
    hair_color: str
    top: str
    accent: str = '#ffffff'
    act: str = ''  # worship (beat 2) or wave (beat 3)

    @property
    def k(self) -> float:
        return ROWS[self.row][1]

    @property
    def u(self) -> float:
        return U * self.k

    @property
    def base(self) -> float:
        y, k = ROWS[self.row]
        return y - 46 * k

    @property
    def cx(self) -> float:
        k = self.k
        inner = 720 + self.side * (60 + 90 * k)
        return inner + self.side * (16 * k + 0.62 * self.u + self.seat * 1.12 * self.u)

    @property
    def haze(self) -> float:
        """Far rows fade toward the wall colour, like the pews in front of them."""
        return (1 - self.k / 1.4) * 0.25

    def c(self, color: str) -> str:
        return mix(color, HAZE, self.haze)

    def box(self, top: float = 1.15, half: float = 0.62) -> tuple[float, float, float, float]:
        """Crop box (x, y, w, h) from `top` units above the backrest down to it."""
        u = self.u
        return (self.cx - half * u, self.base - top * u, 2 * half * u, top * u)


def torso(g: Group, p: Seated, front: bool = False) -> None:
    u, cx, b = p.u, p.cx, p.base
    top = p.c(p.top)
    g.path(
        f'M{cx - 0.5 * u:.1f} {b + 0.45 * u:.1f} L{cx - 0.49 * u:.1f} {b - 0.1 * u:.1f} '
        f'Q{cx - 0.47 * u:.1f} {b - 0.3 * u:.1f} {cx - 0.22 * u:.1f} {b - 0.34 * u:.1f} '
        f'L{cx + 0.22 * u:.1f} {b - 0.34 * u:.1f} Q{cx + 0.47 * u:.1f} {b - 0.3 * u:.1f} '
        f'{cx + 0.49 * u:.1f} {b - 0.1 * u:.1f} L{cx + 0.5 * u:.1f} {b + 0.45 * u:.1f} Z',
        fill=top,
    )
    # the side away from the great window falls into shade
    s = -1 if p.cx > 720 else 1
    g.path(
        f'M{cx + s * 0.5 * u:.1f} {b + 0.45 * u:.1f} L{cx + s * 0.49 * u:.1f} {b - 0.1 * u:.1f} '
        f'Q{cx + s * 0.47 * u:.1f} {b - 0.3 * u:.1f} {cx + s * 0.3 * u:.1f} {b - 0.33 * u:.1f} '
        f'L{cx + s * 0.34 * u:.1f} {b + 0.45 * u:.1f} Z',
        fill=shade(top, 0.14),
    )
    if p.hair == 'gele':
        # aso-ebi: the print matches the headwrap
        for i in range(-2, 3):
            g.circle(cx + i * 0.19 * u, b - 0.12 * u, 0.04 * u, fill=p.c(p.accent), opacity=0.8)
    if p.hair == 'hood':
        g.path(
            f'M{cx - 0.3 * u:.1f} {b - 0.3 * u:.1f} Q{cx:.1f} {b - 0.02 * u:.1f} {cx + 0.3 * u:.1f} {b - 0.3 * u:.1f} '
            f'Q{cx:.1f} {b - 0.2 * u:.1f} {cx - 0.3 * u:.1f} {b - 0.3 * u:.1f} Z',
            fill=shade(top, 0.25),
        )
    if front:
        # turned round: a collar opening and buttons on the front
        g.polygon([(cx - 0.12 * u, b - 0.34 * u), (cx + 0.12 * u, b - 0.34 * u), (cx, b - 0.12 * u)], fill=p.c(p.accent))


def head(g: Group, p: Seated, front: bool = False) -> None:
    u, cx, b = p.u, p.cx, p.base
    skin, hair = p.c(p.skin), p.c(p.hair_color)
    hy = b - 0.6 * u
    g.rect(cx - 0.09 * u, b - 0.46 * u, 0.18 * u, 0.14 * u, fill=shade(skin, 0.15))
    g.ellipse(cx - 0.21 * u, hy + 0.03 * u, 0.045 * u, 0.07 * u, fill=skin)
    g.ellipse(cx + 0.21 * u, hy + 0.03 * u, 0.045 * u, 0.07 * u, fill=skin)
    g.ellipse(cx, hy, 0.21 * u, 0.25 * u, fill=skin)
    if front:
        # a face: eyes and a smile, the hair framing it from above
        g.ellipse(cx - 0.075 * u, hy + 0.01 * u, 0.022 * u, 0.03 * u, fill=INK)
        g.ellipse(cx + 0.075 * u, hy + 0.01 * u, 0.022 * u, 0.03 * u, fill=INK)
        g.path(f'M{cx - 0.08 * u:.1f} {hy + 0.11 * u:.1f} Q{cx:.1f} {hy + 0.17 * u:.1f} {cx + 0.08 * u:.1f} {hy + 0.11 * u:.1f}',
               fill='none', stroke=shade(skin, 0.45), stroke_width=0.025 * u, stroke_linecap='round')
        g.path(f'M{cx - 0.22 * u:.1f} {hy - 0.02 * u:.1f} Q{cx - 0.22 * u:.1f} {hy - 0.3 * u:.1f} {cx:.1f} {hy - 0.29 * u:.1f} '
               f'Q{cx + 0.22 * u:.1f} {hy - 0.3 * u:.1f} {cx + 0.22 * u:.1f} {hy - 0.02 * u:.1f} '
               f'Q{cx + 0.16 * u:.1f} {hy - 0.16 * u:.1f} {cx:.1f} {hy - 0.17 * u:.1f} '
               f'Q{cx - 0.16 * u:.1f} {hy - 0.16 * u:.1f} {cx - 0.22 * u:.1f} {hy - 0.02 * u:.1f} Z', fill=hair)
        return
    style = p.hair
    if style == 'short':
        g.ellipse(cx, hy - 0.03 * u, 0.215 * u, 0.235 * u, fill=hair)
    elif style == 'bald':
        g.ellipse(cx - 0.06 * u, hy - 0.12 * u, 0.07 * u, 0.05 * u, fill='#ffffff', opacity=0.18)
    elif style == 'afro':
        g.circle(cx, hy - 0.06 * u, 0.3 * u, fill=hair)
    elif style == 'bun':
        g.ellipse(cx, hy - 0.03 * u, 0.215 * u, 0.235 * u, fill=hair)
        g.circle(cx, hy - 0.27 * u, 0.1 * u, fill=shade(hair, 0.1))
    elif style == 'braids':
        g.ellipse(cx, hy - 0.03 * u, 0.22 * u, 0.24 * u, fill=hair)
        for i in range(-3, 4):
            x = cx + i * 0.055 * u
            g.line(x, hy, x + i * 0.012 * u, b - 0.08 * u, stroke=hair, stroke_width=0.05 * u, stroke_linecap='round')
            g.line(x, hy + 0.06 * u, x + i * 0.012 * u, b - 0.1 * u, stroke=mix(hair, '#ffffff', 0.12),
                   stroke_width=0.012 * u, stroke_dasharray=f'{0.03 * u:.1f} {0.03 * u:.1f}')
    elif style == 'locs':
        g.ellipse(cx, hy - 0.04 * u, 0.235 * u, 0.25 * u, fill=hair)
        for i in range(-3, 4):
            x = cx + i * 0.065 * u
            g.line(x, hy - 0.05 * u, x + i * 0.02 * u, hy + 0.34 * u, stroke=hair, stroke_width=0.07 * u, stroke_linecap='round')
    elif style == 'hood':
        g.ellipse(cx, hy - 0.03 * u, 0.215 * u, 0.235 * u, fill=hair)
    elif style == 'scarf':
        cloth = p.c(p.accent)
        g.ellipse(cx, hy - 0.03 * u, 0.235 * u, 0.26 * u, fill=cloth)
        g.path(f'M{cx - 0.06 * u:.1f} {hy + 0.18 * u:.1f} L{cx:.1f} {hy + 0.36 * u:.1f} L{cx + 0.06 * u:.1f} {hy + 0.18 * u:.1f} Z',
               fill=shade(cloth, 0.15))
    elif style == 'gele':
        cloth = p.c(p.accent)
        dark = shade(cloth, 0.2)
        g.ellipse(cx, hy - 0.02 * u, 0.24 * u, 0.25 * u, fill=cloth)
        # the fan of stiff pleats standing up behind the head
        g.path(
            f'M{cx - 0.36 * u:.1f} {hy - 0.08 * u:.1f} Q{cx - 0.46 * u:.1f} {hy - 0.42 * u:.1f} {cx - 0.14 * u:.1f} {hy - 0.5 * u:.1f} '
            f'Q{cx - 0.02 * u:.1f} {hy - 0.36 * u:.1f} {cx + 0.08 * u:.1f} {hy - 0.54 * u:.1f} '
            f'Q{cx + 0.44 * u:.1f} {hy - 0.5 * u:.1f} {cx + 0.37 * u:.1f} {hy - 0.06 * u:.1f} '
            f'Q{cx:.1f} {hy + 0.06 * u:.1f} {cx - 0.36 * u:.1f} {hy - 0.08 * u:.1f} Z',
            fill=cloth,
        )
        for a, bx in [(-0.28, -0.1), (-0.12, 0.0), (0.05, 0.08), (0.22, 0.16)]:
            g.path(f'M{cx + bx * u:.1f} {hy - 0.02 * u:.1f} Q{cx + (a + bx) / 2 * u:.1f} {hy - 0.26 * u:.1f} {cx + a * u:.1f} {hy - 0.44 * u:.1f}',
                   fill='none', stroke=dark, stroke_width=0.025 * u, stroke_linecap='round')
        g.path(f'M{cx - 0.24 * u:.1f} {hy + 0.06 * u:.1f} Q{cx:.1f} {hy + 0.16 * u:.1f} {cx + 0.24 * u:.1f} {hy + 0.06 * u:.1f}',
               fill='none', stroke=dark, stroke_width=0.04 * u)


def seated(g: Group, p: Seated, front: bool = False) -> None:
    torso(g, p, front)
    head(g, p, front)


# Worship: both arms up, elbows out, swaying between two poses.
def worship_arms(p: Seated, sway: float) -> list[list[tuple[float, float]]]:
    u, cx, b = p.u, p.cx, p.base
    out = []
    for s in (-1, 1):
        out.append([
            (cx + s * 0.34 * u, b - 0.3 * u),
            (cx + s * 0.62 * u + sway * u, b - 0.78 * u),
            (cx + s * 0.44 * u + sway * 1.6 * u, b - 1.3 * u),
        ])
    return out


# Wave: turned round in the pew, one hand up and waving at the viewer.
def wave_arm(p: Seated, phase: int) -> list[tuple[float, float]]:
    u, cx, b = p.u, p.cx, p.base
    s = 1 if p.cx < 720 else -1  # wave with the arm on the aisle's far side
    hand = (cx + s * 0.62 * u, b - 1.08 * u) if phase == 0 else (cx + s * 0.86 * u, b - 0.98 * u)
    elbow = (cx + s * 0.66 * u, b - 0.56 * u) if phase == 0 else (cx + s * 0.7 * u, b - 0.54 * u)
    return [(cx + s * 0.36 * u, b - 0.3 * u), elbow, hand]


# The congregation. Rows 0 and 1 are far and small: they live in the bitmap only.
CAST = [
    Seated('r0a', 0, 1, 0, SKIN['dark'], 'gele', HAIR['black'], '#2e6b4f', '#e6b84a'),
    Seated('r0b', 0, 1, 1, SKIN['brown'], 'short', HAIR['black'], '#3b3b48'),
    Seated('r0c', 0, 1, 3, SKIN['light'], 'bun', HAIR['brown'], '#7a2e3b'),
    Seated('r0d', 0, -1, 0, SKIN['deep'], 'short', HAIR['black'], '#2f5d8a'),
    Seated('r0e', 0, -1, 1, SKIN['tan'], 'braids', HAIR['black'], '#d8892f'),
    Seated('r0f', 0, -1, 3, SKIN['dark'], 'bald', HAIR['black'], '#efefef'),
    Seated('r1a', 1, 1, 0, SKIN['fair'], 'short', HAIR['auburn'], '#1f7a7a', act='worship'),
    Seated('r1b', 1, 1, 1, SKIN['dark'], 'scarf', HAIR['black'], '#5b3f8c', '#c8432f'),
    Seated('r1c', 1, 1, 3, SKIN['deep'], 'afro', HAIR['black'], '#e6b84a'),
    Seated('r1d', 1, -1, 0, SKIN['brown'], 'locs', HAIR['dark'], '#c8432f', act='worship'),
    Seated('r1e', 1, -1, 2, SKIN['dark'], 'gele', HAIR['black'], '#28166f', '#da251d'),
    Seated('r2a', 2, 1, 0, SKIN['dark'], 'short', HAIR['grey'], '#3b3b48', act='wave'),
    Seated('r2b', 2, 1, 1, SKIN['brown'], 'gele', HAIR['black'], '#7a2e3b', '#e6b84a'),
    Seated('r2c', 2, 1, 3, SKIN['light'], 'hood', HAIR['dark'], '#2f5d8a'),
    Seated('r2d', 2, -1, 0, SKIN['deep'], 'braids', HAIR['black'], '#2e6b4f', act='wave'),
    Seated('r2e', 2, -1, 1, SKIN['tan'], 'short', HAIR['black'], '#efefef'),
    Seated('r3a', 3, 1, 0, SKIN['brown'], 'afro', HAIR['black'], '#c8432f', act='worship'),
    Seated('r3b', 3, 1, 1, SKIN['dark'], 'gele', HAIR['black'], '#1f7a7a', '#e6b84a'),
    Seated('r3c', 3, 1, 2, SKIN['fair'], 'bun', HAIR['brown'], '#5b3f8c'),
    Seated('r3d', 3, -1, 0, SKIN['tan'], 'hood', HAIR['black'], '#d8892f', act='worship'),
    Seated('r3e', 3, -1, 1, SKIN['deep'], 'short', HAIR['black'], '#2f5d8a'),
    Seated('r4a', 4, 1, 0, SKIN['deep'], 'locs', HAIR['black'], '#2e6b4f', act='worship'),
    Seated('r4b', 4, 1, 1, SKIN['brown'], 'scarf', HAIR['black'], '#e6b84a', '#28166f'),
    Seated('r4c', 4, -1, 0, SKIN['dark'], 'short', HAIR['black'], '#7a2e3b'),
]

# Rows 2-4 sway in the overlay; rows 0-1 are too small for the motion to read.
SWAYING = [p for p in CAST if p.row >= 2]


def row_people(row: int) -> list[Seated]:
    return [p for p in CAST if p.row == row]


# ── standing, facing the room ────────────────────────────────────────────


def face(g: Group, cx: float, hy: float, h: float, skin: str) -> None:
    g.ellipse(cx - 0.019 * h, hy + 0.003 * h, 0.0055 * h, 0.0075 * h, fill=INK)
    g.ellipse(cx + 0.019 * h, hy + 0.003 * h, 0.0055 * h, 0.0075 * h, fill=INK)
    g.path(f'M{cx - 0.02 * h:.1f} {hy + 0.03 * h:.1f} Q{cx:.1f} {hy + 0.045 * h:.1f} {cx + 0.02 * h:.1f} {hy + 0.03 * h:.1f}',
           fill='none', stroke=shade(skin, 0.45), stroke_width=0.006 * h, stroke_linecap='round')


# The pastor stands on the chancel step beside the pulpit, Bible in hand.
PASTOR = {'cx': 858, 'feet': 568, 'h': 178, 'skin': SKIN['dark'], 'suit': '#2b2f45'}


def pastor_arms(pose: str) -> dict[str, list[tuple[float, float]]]:
    cx, h = PASTOR['cx'], PASTOR['h']
    top = PASTOR['feet'] - h
    left = [(cx + 0.105 * h, top + 0.2 * h), (cx + 0.125 * h, top + 0.35 * h), (cx + 0.035 * h, top + 0.31 * h)]
    if pose == 'rest':
        right = [(cx - 0.105 * h, top + 0.2 * h), (cx - 0.125 * h, top + 0.35 * h), (cx - 0.07 * h, top + 0.41 * h)]
    elif pose == 'preach-a':
        right = [(cx - 0.105 * h, top + 0.2 * h), (cx - 0.21 * h, top + 0.17 * h), (cx - 0.25 * h, top - 0.04 * h)]
    else:
        right = [(cx - 0.105 * h, top + 0.2 * h), (cx - 0.25 * h, top + 0.22 * h), (cx - 0.34 * h, top + 0.05 * h)]
    return {'left': left, 'right': right}


def pastor(g: Group, pose: str = 'rest', with_arms: bool = True) -> None:
    cx, h, skin, suit = PASTOR['cx'], PASTOR['h'], PASTOR['skin'], PASTOR['suit']
    top = PASTOR['feet'] - h
    hy = top + 0.075 * h
    # trousers and shoes
    g.path(f'M{cx - 0.085 * h:.1f} {top + 0.46 * h:.1f} L{cx - 0.075 * h:.1f} {top + 0.97 * h:.1f} L{cx - 0.01 * h:.1f} {top + 0.97 * h:.1f} '
           f'L{cx:.1f} {top + 0.56 * h:.1f} L{cx + 0.01 * h:.1f} {top + 0.97 * h:.1f} L{cx + 0.075 * h:.1f} {top + 0.97 * h:.1f} '
           f'L{cx + 0.085 * h:.1f} {top + 0.46 * h:.1f} Z', fill=shade(suit, 0.1))
    g.ellipse(cx - 0.045 * h, top + 0.98 * h, 0.05 * h, 0.018 * h, fill='#151320')
    g.ellipse(cx + 0.045 * h, top + 0.98 * h, 0.05 * h, 0.018 * h, fill='#151320')
    # neck, jacket, shirt and tie
    g.rect(cx - 0.022 * h, top + 0.12 * h, 0.044 * h, 0.05 * h, fill=shade(skin, 0.15))
    g.path(f'M{cx - 0.115 * h:.1f} {top + 0.2 * h:.1f} Q{cx - 0.115 * h:.1f} {top + 0.165 * h:.1f} {cx - 0.075 * h:.1f} {top + 0.158 * h:.1f} '
           f'L{cx + 0.075 * h:.1f} {top + 0.158 * h:.1f} Q{cx + 0.115 * h:.1f} {top + 0.165 * h:.1f} {cx + 0.115 * h:.1f} {top + 0.2 * h:.1f} '
           f'L{cx + 0.095 * h:.1f} {top + 0.5 * h:.1f} L{cx - 0.095 * h:.1f} {top + 0.5 * h:.1f} Z', fill=suit)
    g.polygon([(cx - 0.04 * h, top + 0.158 * h), (cx + 0.04 * h, top + 0.158 * h), (cx, top + 0.28 * h)], fill='#ffffff')
    g.polygon([(cx - 0.01 * h, top + 0.17 * h), (cx + 0.01 * h, top + 0.17 * h), (cx + 0.014 * h, top + 0.26 * h),
               (cx, top + 0.28 * h), (cx - 0.014 * h, top + 0.26 * h)], fill='#da251d')
    g.circle(cx + 0.06 * h, top + 0.2 * h, 0.008 * h, fill='#c9a227')  # lapel pin
    # head
    g.ellipse(cx, hy, 0.053 * h, 0.066 * h, fill=skin)
    g.path(f'M{cx - 0.054 * h:.1f} {hy - 0.005 * h:.1f} Q{cx - 0.054 * h:.1f} {hy - 0.075 * h:.1f} {cx:.1f} {hy - 0.073 * h:.1f} '
           f'Q{cx + 0.054 * h:.1f} {hy - 0.075 * h:.1f} {cx + 0.054 * h:.1f} {hy - 0.005 * h:.1f} '
           f'Q{cx + 0.04 * h:.1f} {hy - 0.045 * h:.1f} {cx:.1f} {hy - 0.046 * h:.1f} '
           f'Q{cx - 0.04 * h:.1f} {hy - 0.045 * h:.1f} {cx - 0.054 * h:.1f} {hy - 0.005 * h:.1f} Z', fill=HAIR['grey'])
    face(g, cx, hy, h, skin)
    if not with_arms:
        return
    arms = pastor_arms(pose)
    # the Bible held against the chest, then the arm holding it
    g.rect(cx - 0.035 * h, top + 0.26 * h, 0.085 * h, 0.07 * h, rx=0.006 * h, fill='#28166f')
    g.rect(cx - 0.035 * h, top + 0.325 * h, 0.085 * h, 0.006 * h, fill='#f2ead4')
    g.rect(cx + 0.002 * h, top + 0.275 * h, 0.006 * h, 0.035 * h, fill='#c9a227')
    arm(g, arms['left'], suit, skin, 0.058 * h)
    arm(g, arms['right'], suit, skin, 0.058 * h, 'pastor-r' if pose != 'rest' else '')


def pastor_box() -> tuple[float, float, float, float]:
    h = PASTOR['h']
    top = PASTOR['feet'] - h
    return (PASTOR['cx'] - 0.4 * h, top - 0.08 * h, 0.58 * h, 1.1 * h)


# The usher stands in the aisle by the front pews with a stack of bulletins.
USHER = {'cx': 846, 'feet': 896, 'h': 206, 'skin': SKIN['brown'], 'dress': '#28166f', 'gele': '#c9a227'}


def usher_arms(pose: str) -> dict[str, list[tuple[float, float]]]:
    cx, h = USHER['cx'], USHER['h']
    top = USHER['feet'] - h
    left = [(cx + 0.1 * h, top + 0.2 * h), (cx + 0.115 * h, top + 0.34 * h), (cx + 0.02 * h, top + 0.4 * h)]
    shoulder = (cx - 0.1 * h, top + 0.2 * h)
    right = {
        'rest': [shoulder, (cx - 0.115 * h, top + 0.34 * h), (cx - 0.02 * h, top + 0.4 * h)],
        'offer-a': [shoulder, (cx - 0.17 * h, top + 0.32 * h), (cx - 0.28 * h, top + 0.33 * h)],
        'offer-b': [shoulder, (cx - 0.18 * h, top + 0.3 * h), (cx - 0.3 * h, top + 0.29 * h)],
        # the same usher waves you off at the end of the service
        'wave-a': [shoulder, (cx - 0.19 * h, top + 0.21 * h), (cx - 0.19 * h, top + 0.05 * h)],
        'wave-b': [shoulder, (cx - 0.2 * h, top + 0.22 * h), (cx - 0.26 * h, top + 0.08 * h)],
    }[pose]
    return {'left': left, 'right': right}


def bulletin_path(x: float, y: float, h: float) -> str:
    """A folded bulletin held at its lower corner, as a path so it can move with the hand."""
    w, t = 0.07 * h, 0.09 * h
    return f'M{x - 0.01 * h:.1f} {y:.1f} L{x - 0.01 * h - w:.1f} {y - 0.01 * h:.1f} L{x - 0.01 * h - w:.1f} {y - t:.1f} L{x - 0.01 * h:.1f} {y - t + 0.01 * h:.1f} Z'


def usher(g: Group, pose: str = 'rest', with_arms: bool = True) -> None:
    cx, h, skin, dress, gele = USHER['cx'], USHER['h'], USHER['skin'], USHER['dress'], USHER['gele']
    top = USHER['feet'] - h
    hy = top + 0.085 * h
    # legs and shoes under the skirt
    for s in (-1, 1):
        g.rect(cx + s * 0.04 * h - 0.016 * h, top + 0.75 * h, 0.032 * h, 0.22 * h, fill=shade(skin, 0.1))
        g.ellipse(cx + s * 0.045 * h, top + 0.975 * h, 0.035 * h, 0.016 * h, fill='#151320')
    # skirt, jacket, collar, and the red usher's sash
    g.path(f'M{cx - 0.09 * h:.1f} {top + 0.46 * h:.1f} L{cx - 0.13 * h:.1f} {top + 0.78 * h:.1f} '
           f'L{cx + 0.13 * h:.1f} {top + 0.78 * h:.1f} L{cx + 0.09 * h:.1f} {top + 0.46 * h:.1f} Z', fill=shade(dress, 0.12))
    g.rect(cx - 0.02 * h, top + 0.13 * h, 0.04 * h, 0.05 * h, fill=shade(skin, 0.15))
    g.path(f'M{cx - 0.11 * h:.1f} {top + 0.2 * h:.1f} Q{cx - 0.11 * h:.1f} {top + 0.17 * h:.1f} {cx - 0.07 * h:.1f} {top + 0.165 * h:.1f} '
           f'L{cx + 0.07 * h:.1f} {top + 0.165 * h:.1f} Q{cx + 0.11 * h:.1f} {top + 0.17 * h:.1f} {cx + 0.11 * h:.1f} {top + 0.2 * h:.1f} '
           f'L{cx + 0.09 * h:.1f} {top + 0.48 * h:.1f} L{cx - 0.09 * h:.1f} {top + 0.48 * h:.1f} Z', fill=dress)
    g.polygon([(cx - 0.035 * h, top + 0.165 * h), (cx + 0.035 * h, top + 0.165 * h), (cx, top + 0.24 * h)], fill='#ffffff')
    g.polygon([(cx + 0.06 * h, top + 0.17 * h), (cx + 0.1 * h, top + 0.19 * h), (cx - 0.06 * h, top + 0.47 * h),
               (cx - 0.09 * h, top + 0.45 * h)], fill='#da251d')
    g.circle(cx - 0.005 * h, top + 0.32 * h, 0.012 * h, fill='#c9a227')  # badge on the sash
    # head and gele
    g.ellipse(cx, hy, 0.05 * h, 0.064 * h, fill=skin)
    g.path(f'M{cx - 0.1 * h:.1f} {hy - 0.02 * h:.1f} Q{cx - 0.12 * h:.1f} {hy - 0.12 * h:.1f} {cx - 0.03 * h:.1f} {hy - 0.135 * h:.1f} '
           f'Q{cx:.1f} {hy - 0.1 * h:.1f} {cx + 0.03 * h:.1f} {hy - 0.145 * h:.1f} '
           f'Q{cx + 0.125 * h:.1f} {hy - 0.13 * h:.1f} {cx + 0.1 * h:.1f} {hy - 0.015 * h:.1f} '
           f'Q{cx:.1f} {hy - 0.05 * h:.1f} {cx - 0.1 * h:.1f} {hy - 0.02 * h:.1f} Z', fill=gele)
    for a, bx in [(-0.07, -0.03), (-0.02, 0.0), (0.04, 0.03)]:
        g.path(f'M{cx + bx * h:.1f} {hy - 0.04 * h:.1f} L{cx + a * h:.1f} {hy - 0.12 * h:.1f}', fill='none',
               stroke=shade(gele, 0.25), stroke_width=0.006 * h, stroke_linecap='round')
    g.path(f'M{cx - 0.055 * h:.1f} {hy - 0.02 * h:.1f} Q{cx:.1f} {hy - 0.05 * h:.1f} {cx + 0.055 * h:.1f} {hy - 0.02 * h:.1f}',
           fill='none', stroke=shade(gele, 0.2), stroke_width=0.012 * h)
    face(g, cx, hy, h, skin)
    if not with_arms:
        return
    arms = usher_arms(pose)
    g.path(bulletin_path(cx + 0.03 * h, top + 0.42 * h, h), fill='#ffffff', stroke='#d9d4e4', stroke_width=0.6)
    if pose.startswith('offer'):
        hx, hy2 = arms['right'][-1]
        g.path(bulletin_path(hx, hy2 + 0.01 * h, h), id='usher-paper', fill='#ffffff', stroke='#d9d4e4', stroke_width=0.6)
    arm(g, arms['left'], dress, skin, 0.052 * h)
    arm(g, arms['right'], dress, skin, 0.052 * h, 'usher-r' if pose != 'rest' else '')


def usher_box() -> tuple[float, float, float, float]:
    h = USHER['h']
    top = USHER['feet'] - h
    return (USHER['cx'] - 0.36 * h, top - 0.08 * h, 0.52 * h, 1.1 * h)


# The newcomer: a student with a backpack, walking up the aisle (overlay only).
WALKER_H = 200


def walker_legs(phase: int, h: float = WALKER_H) -> list[list[tuple[float, float]]]:
    """Legs from behind in the space of a sprite 0.4h wide: one planted, one lifting."""
    cx, top = 0.2 * h, 0.0
    plant = lambda s: [(cx + s * 0.042 * h, top + 0.52 * h), (cx + s * 0.044 * h, top + 0.74 * h), (cx + s * 0.044 * h, top + 0.95 * h)]
    lift = lambda s: [(cx + s * 0.042 * h, top + 0.52 * h), (cx + s * 0.052 * h, top + 0.69 * h), (cx + s * 0.056 * h, top + 0.83 * h)]
    return [plant(-1), lift(1)] if phase == 0 else [lift(-1), plant(1)]


def walker_arms(phase: int, h: float = WALKER_H) -> list[list[tuple[float, float]]]:
    cx = 0.2 * h
    out = []
    for s in (-1, 1):
        fwd = (phase == 0) == (s > 0)
        out.append([(cx + s * 0.105 * h, 0.2 * h), (cx + s * 0.13 * h, 0.34 * h),
                    (cx + s * (0.115 if fwd else 0.135) * h, (0.42 if fwd else 0.49) * h)])
    return out


def walker_paths(phase: int, h: float = WALKER_H) -> dict[str, str]:
    """Path data for the walker's moving parts, keyed by element id."""
    out = {}
    for i, leg in enumerate(walker_legs(phase, h)):
        out[f'leg-{i}'] = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in leg)
        x, y = leg[-1]
        out[f'shoe-{i}'] = f'M{x - 0.02 * h:.1f} {y + 0.02 * h:.1f} L{x + 0.02 * h:.1f} {y + 0.02 * h:.1f}'
    for i, a in enumerate(walker_arms(phase, h)):
        out[f'arm-{i}'] = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in a)
        x, y = a[-1]
        out[f'fist-{i}'] = f'M{x:.1f} {y:.1f} L{x:.1f} {y - 0.1:.1f}'
    return out


def walker(g: Group, phase: int = 0, h: float = WALKER_H) -> None:
    cx = 0.2 * h
    skin, hoodie, jeans = SKIN['tan'], '#b5252a', '#3d5a88'
    d = walker_paths(phase, h)
    for i in range(2):
        g.path(d[f'leg-{i}'], id=f'leg-{i}', fill='none', stroke=jeans, stroke_width=0.075 * h, stroke_linecap='round',
               stroke_linejoin='round')
        g.path(d[f'shoe-{i}'], id=f'shoe-{i}', fill='none', stroke='#f4f4f6', stroke_width=0.045 * h, stroke_linecap='round')
    for i in range(2):
        g.path(d[f'arm-{i}'], id=f'arm-{i}', fill='none', stroke=hoodie, stroke_width=0.06 * h, stroke_linecap='round',
               stroke_linejoin='round')
        g.path(d[f'fist-{i}'], id=f'fist-{i}', fill='none', stroke=skin, stroke_width=0.05 * h, stroke_linecap='round')
    # hoodie, hood, backpack, head from behind
    g.path(f'M{cx - 0.11 * h:.1f} {0.2 * h:.1f} Q{cx - 0.11 * h:.1f} {0.16 * h:.1f} {cx - 0.06 * h:.1f} {0.155 * h:.1f} '
           f'L{cx + 0.06 * h:.1f} {0.155 * h:.1f} Q{cx + 0.11 * h:.1f} {0.16 * h:.1f} {cx + 0.11 * h:.1f} {0.2 * h:.1f} '
           f'L{cx + 0.1 * h:.1f} {0.54 * h:.1f} L{cx - 0.1 * h:.1f} {0.54 * h:.1f} Z', fill=hoodie)
    g.rect(cx - 0.1 * h, 0.5 * h, 0.2 * h, 0.04 * h, fill=shade(hoodie, 0.2))
    g.rect(cx - 0.012 * h, 0.12 * h, 0.024 * h, 0.04 * h, fill=shade(skin, 0.15))
    g.ellipse(cx, 0.085 * h, 0.05 * h, 0.062 * h, fill=skin)
    g.ellipse(cx, 0.078 * h, 0.051 * h, 0.058 * h, fill=HAIR['black'])
    g.path(f'M{cx - 0.07 * h:.1f} {0.17 * h:.1f} Q{cx:.1f} {0.23 * h:.1f} {cx + 0.07 * h:.1f} {0.17 * h:.1f} '
           f'Q{cx:.1f} {0.2 * h:.1f} {cx - 0.07 * h:.1f} {0.17 * h:.1f} Z', fill=shade(hoodie, 0.25))
    g.rect(cx - 0.075 * h, 0.21 * h, 0.15 * h, 0.22 * h, rx=0.03 * h, fill='#2b2f45')
    g.rect(cx - 0.06 * h, 0.32 * h, 0.12 * h, 0.07 * h, rx=0.015 * h, fill='#3a3f5c')
    for s in (-1, 1):
        g.line(cx + s * 0.06 * h, 0.17 * h, cx + s * 0.065 * h, 0.22 * h, stroke='#1d2033', stroke_width=0.02 * h, stroke_linecap='round')
