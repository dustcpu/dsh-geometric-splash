from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math

S = 4  # supersampling factor
SIZE = 512 * S
CENTER = SIZE / 2
CREAM = (232, 227, 207, 255)
CREAM_LIGHT = (244, 239, 224, 255)
FRAME = (239, 233, 216, 255)
PURPLE = (143, 95, 148, 255)
PURPLE_DARK = (111, 70, 116, 255)
PINK_LIGHT = (241, 162, 170, 255)
PINK_MID = (212, 134, 155, 255)

img = Image.new("RGBA", (SIZE, SIZE), CREAM)
draw = ImageDraw.Draw(img)

# Soft warm backdrop: a large off-center glow.
glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
g = ImageDraw.Draw(glow)
g.ellipse((SIZE * 0.06, SIZE * 0.02, SIZE * 0.94, SIZE * 0.90), fill=(250, 247, 236, 90))
glow = glow.filter(ImageFilter.GaussianBlur(90 * S))
img.alpha_composite(glow)

# Drop shadow under the circular frame.
shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.ellipse((CENTER - 235 * S, CENTER - 220 * S, CENTER + 235 * S, CENTER + 250 * S), fill=(80, 48, 88, 95))
shadow = shadow.filter(ImageFilter.GaussianBlur(38 * S))
img.alpha_composite(shadow)

# Circular frame.
R = 220 * S
frame_box = (CENTER - R, CENTER - R, CENTER + R, CENTER + R)
draw.ellipse(frame_box, fill=FRAME, outline=(143, 95, 148, 150), width=int(2.2 * S))

# The isometric ocean lives inside the circle, clipped by a mask.
ocean = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
od = ImageDraw.Draw(ocean)
TW = 44 * S
TH = 24 * S
cx = CENTER
cy = CENTER + 40 * S


def iso(i, j):
    return (cx + (j - i) * TW, cy + (j + i) * TH)


for i in range(-14, 15):
    for j in range(-14, 15):
        p0 = iso(i, j)
        p1 = iso(i, j + 1)
        p2 = iso(i + 1, j + 1)
        p3 = iso(i + 1, j)
        shade = 0.5 + 0.5 * math.sin((i * 0.9 + j * 0.7) * 0.9)
        fill = (
            int(248 - 18 * shade),
            int(244 - 28 * shade),
            int(236 - 20 * shade),
            int(28 + 26 * shade),
        )
        od.polygon([p0, p1, p2, p3], fill=fill, outline=(143, 95, 148, 32))
mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).ellipse((CENTER - R - 2 * S, CENTER - R - 2 * S, CENTER + R + 2 * S, CENTER + R + 2 * S), fill=255)
img.alpha_composite(Image.composite(ocean, Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0)), mask))

# Penrose triangle, using the same polygons as the splash SVG.
VIEW_CX, VIEW_CY = 44.0, 38.0
SCALE = 12.73
TARGET_Y = CENTER + 6 * S
polygons = [
    ([(0, 68), (69, 68), (64, 60), (14, 60), (48, 0), (38, 0)], PINK_LIGHT),
    ([(0, 68), (4, 76), (84, 76), (48, 17), (43.5, 23.5), (69, 68)], PINK_MID),
    ([(84, 76), (88, 68), (48, 0), (14, 60), (23, 60), (48, 17)], PURPLE),
]


def project(point):
    x, y = point
    return (CENTER + (x - VIEW_CX) * SCALE, TARGET_Y + (y - VIEW_CY) * SCALE)


for points, color in polygons:
    projected = [project(p) for p in points]
    draw.polygon(projected, fill=color, outline=PURPLE_DARK, width=int(2.2 * S))

# A thin highlight arc on the upper-left of the frame.
arc = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
ad = ImageDraw.Draw(arc)
ad.arc(
    (CENTER - R + 8 * S, CENTER - R + 8 * S, CENTER + R - 8 * S, CENTER + R - 8 * S),
    start=205,
    end=300,
    fill=(255, 252, 240, 150),
    width=int(3 * S),
)
img.alpha_composite(arc)

# Downsample with a high-quality filter.
final = img.convert("RGB").resize((512, 512), Image.LANCZOS)
out = Path("assets/icon-512.png")
out.parent.mkdir(parents=True, exist_ok=True)
final.save(out, "PNG")
print(out, final.size)
