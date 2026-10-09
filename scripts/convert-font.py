"""Convert a subset of OFL-licensed Noto Sans CJK outlines to Three.js typeface JSON."""
import json
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.reverseContourPen import ReverseContourPen

class ThreePen(BasePen):
    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.commands = []
        self.start = None

    def points(self, command, *points):
        self.commands.append(command + ' ' + ' '.join(str(round(v, 2)) for point in points for v in point))

    def _moveTo(self, point):
        self.start = point
        self.points('m', point)

    def _lineTo(self, point):
        self.points('l', point)

    def _curveToOne(self, p1, p2, p3):
        self.points('b', p3, p1, p2)

    def _qCurveToOne(self, p1, p2):
        self.points('q', p2, p1)

    def _closePath(self):
        if self.start is not None:
            self.points('l', self.start)

    def _endPath(self):
        pass

source, characters, destination = sys.argv[1:]
font = TTFont(source)
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()
glyphs = {}
missing = []
for char in sorted(set(Path(characters).read_text())):
    name = cmap.get(ord(char))
    if not name:
        missing.append(char)
        continue
    pen = ThreePen(glyph_set)
    bounds = BoundsPen(glyph_set)
    # OpenType CFF winds outer contours opposite to Three.js ShapePath.
    # Reverse every contour while preserving the relative hole winding.
    glyph_set[name].draw(ReverseContourPen(pen))
    glyph_set[name].draw(bounds)
    box = bounds.bounds or (0, 0, 0, 0)
    glyphs[char] = {'ha': font['hmtx'][name][0], 'x_min': box[0], 'x_max': box[2], 'o': ' '.join(pen.commands)}

data = {
    'glyphs': glyphs,
    'familyName': 'Noto Sans CJK SC',
    'ascender': 1000,
    'descender': -200,
    'underlineThickness': 50,
    'boundingBox': {'xMin': -1000, 'xMax': 2000, 'yMin': -200, 'yMax': 1000},
    'resolution': font['head'].unitsPerEm,
    'original_font_information': {'license': 'SIL Open Font License 1.1', 'source': 'https://github.com/notofonts/noto-cjk'},
}
Path(destination).parent.mkdir(parents=True, exist_ok=True)
Path(destination).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'glyphs': len(glyphs), 'missing': ''.join(missing), 'bytes': Path(destination).stat().st_size}))
