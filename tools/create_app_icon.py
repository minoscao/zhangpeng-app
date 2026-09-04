from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
out = ROOT / "assets" / "tentflow.ico"
size = 512
image = Image.new("RGBA", (size, size), (49, 46, 104, 255))
draw = ImageDraw.Draw(image)

# Warm child-friendly inner tile.
draw.rounded_rectangle((58, 58, 454, 454), radius=104, fill=(255, 240, 173, 255))

# Playhouse tent silhouette with a soft door and star motif.
purple = (80, 69, 173, 255)
coral = (255, 143, 112, 255)
cream = (255, 250, 239, 255)
draw.polygon([(112, 258), (256, 134), (400, 258)], fill=coral)
draw.rounded_rectangle((132, 242, 380, 388), radius=24, fill=purple)
draw.rounded_rectangle((212, 276, 300, 388), radius=44, fill=cream)
draw.rectangle((160, 276, 206, 322), fill=(191, 235, 240, 255))
draw.rectangle((306, 276, 352, 322), fill=(191, 235, 240, 255))
draw.regular_polygon((256, 218, 34), n_sides=5, rotation=-90, fill=(255, 226, 104, 255))
draw.line((132, 388, 380, 388), fill=cream, width=12)

image.save(out, format="ICO", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print(out)
