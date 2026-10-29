"""Tiny SVG builder for the scene sources.

Shapes are appended in paint order. Keyword arguments become attributes, with
underscores turned into hyphens (stroke_width -> stroke-width).
"""

import pathlib

OUT = pathlib.Path(__file__).resolve().parents[1]


def _attrs(kw: dict) -> str:
    parts = []
    for key, value in kw.items():
        if value is None:
            continue
        if isinstance(value, float):
            value = f'{value:.2f}'.rstrip('0').rstrip('.')
        name = 'class' if key == 'cls' else key.replace('_', '-')
        parts.append(f'{name}="{value}"')
    return ' '.join(parts)


class Group:
    def __init__(self, items: list[str]):
        self.items = items

    def _el(self, tag: str, **kw) -> None:
        self.items.append(f'<{tag} {_attrs(kw)}/>')

    def rect(self, x, y, w, h, **kw):
        self._el('rect', x=x, y=y, width=w, height=h, **kw)

    def circle(self, cx, cy, r, **kw):
        self._el('circle', cx=cx, cy=cy, r=r, **kw)

    def ellipse(self, cx, cy, rx, ry, **kw):
        self._el('ellipse', cx=cx, cy=cy, rx=rx, ry=ry, **kw)

    def line(self, x1, y1, x2, y2, **kw):
        self._el('line', x1=x1, y1=y1, x2=x2, y2=y2, **kw)

    def path(self, d, **kw):
        self._el('path', d=d, **kw)

    def polygon(self, points, **kw):
        pts = ' '.join(f'{x:g},{y:g}' for x, y in points)
        self._el('polygon', points=pts, **kw)


class Svg(Group):
    def __init__(self, width: int, height: int):
        super().__init__([])
        self.width = width
        self.height = height
        self.defs: list[str] = []
        self._groups: list[tuple[int, list[str], dict]] = []

    def _stops(self, stops) -> str:
        out = []
        for stop in stops:
            offset, color = stop[0], stop[1]
            opacity = f' stop-opacity="{stop[2]}"' if len(stop) > 2 else ''
            out.append(f'<stop offset="{offset}" stop-color="{color}"{opacity}/>')
        return ''.join(out)

    def linear(self, gid, stops, x1=0, y1=0, x2=0, y2=1):
        self.defs.append(
            f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{self._stops(stops)}</linearGradient>'
        )

    def radial(self, gid, stops, cx=0.5, cy=0.5, r=0.5):
        self.defs.append(f'<radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}">{self._stops(stops)}</radialGradient>')

    def clip(self, cid, d):
        self.defs.append(f'<clipPath id="{cid}"><path d="{d}"/></clipPath>')

    def group(self, clip: str | None = None, **kw) -> Group:
        items: list[str] = []
        attrs = dict(kw)
        if clip:
            attrs['clip_path'] = f'url(#{clip})'
        self._groups.append((len(self.items), items, attrs))
        self.items.append('')  # placeholder, filled on render
        return Group(items)

    def render(self, view_box: str | None = None, width: int | None = None, height: int | None = None) -> str:
        items = list(self.items)
        for index, children, attrs in self._groups:
            items[index] = f'<g {_attrs(attrs)}>' + ''.join(children) + '</g>'
        vb = view_box or f'0 0 {self.width} {self.height}'
        w = width or self.width
        h = height or self.height
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}" '
            f'preserveAspectRatio="xMidYMid slice">'
            f'<defs>{"".join(self.defs)}</defs>{"".join(items)}</svg>\n'
        )


def write(svg: Svg, name: str) -> pathlib.Path:
    path = OUT / name
    path.write_text(svg.render())
    return path


def crop(svg: Svg, cx: float, cy: float, zoom: float) -> str:
    """The region a camera at `zoom`, centred on (cx, cy), sees of a 16:10 frame."""
    w = svg.width / zoom
    h = svg.height / zoom
    return svg.render(view_box=f'{cx - w / 2:g} {cy - h / 2:g} {w:g} {h:g}')
