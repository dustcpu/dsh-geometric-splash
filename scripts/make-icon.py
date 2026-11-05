"""Render assets/icon-512.png: the Penrose triangle alone, on transparency.

The plugin list shows icons as flat glyphs on the app's own dark tile, so this
draws no backdrop, no frame and no ocean -- a miniature of the splash screen
reads as a screenshot at 32px. The three polygons are the same geometry as the
in-page SVG in the Geometric Islands site, so the mark matches the brand.

Run from the repository root:  py -3 scripts/make-icon.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

S = 4  # supersampling factor
SIZE = 512 * S
CENTER = SIZE / 2

# Palette lifted from the site's --blue-* ramp, spread out for small sizes:
# adjacent faces need real value separation or the solid collapses into a blob.
# The rim stays bright and the stroke thin: a heavy navy outline reads as a
# hollow triangle tube against the app's dark plugin list.
FACE_LIGHT = (234, 244, 252, 255)
FACE_MID = (160, 203, 236, 255)
FACE_DARK = (82, 142, 205, 255)
STROKE = (58, 118, 180, 255)

# Site viewBox is "-6 -2 100 100"; the three faces span x 0..88, y 0..76.
PENROSE = [
    ([(0, 68), (69, 68), (64, 60), (14, 60), (48, 0), (38, 0)], FACE_LIGHT),
    ([(0, 68), (4, 76), (84, 76), (48, 17), (43.5, 23.5), (69, 68)], FACE_MID),
    ([(84, 76), (88, 68), (48, 0), (14, 60), (23, 60), (48, 17)], FACE_DARK),
]

VIEW_CX = 44.0
VIEW_CY = 38.0
SCALE = 4.75
STROKE_W = 6

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)


def project(point):
    x, y = point
    return (
        CENTER + (x - VIEW_CX) * SCALE * S,
        CENTER + (y - VIEW_CY) * SCALE * S,
    )


for points, fill in PENROSE:
    draw.polygon(
        [project(p) for p in points],
        fill=fill,
        outline=STROKE,
        width=STROKE_W * S,
    )

# Downsample; RGBA (not RGB) so the glyph keeps its transparency.
final = img.resize((512, 512), Image.LANCZOS)
out = Path(__file__).resolve().parent.parent / "assets" / "icon-512.png"
out.parent.mkdir(parents=True, exist_ok=True)
final.save(out, "PNG")
print(out, final.size, final.mode)
