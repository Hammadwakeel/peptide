#!/usr/bin/env python3
"""Extract 27 brand icons from public/Icons/1.png sprite sheet."""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/Icons/1.png"
BRAND_DIR = ROOT / "public/icons/frontier-brand"
FRONTIER_DIR = ROOT / "public/icons/frontier"

# Row-major grid: 7 cols x 4 rows (row 4 has only 6 icons)
SLUGS: list[list[str | None]] = [
    ["cloud", "wallet", "user", "calculator", "layers", "calendar", "price-tag"],
    ["cards", "lock", "location", "folder", "home", "notification", "toggle"],
    ["edit", "mail", "fingerprint", "analytics", "headset", "clock", "chevron"],
    ["grid", "search", "add", "key", "pie-chart", "forward", None],
]

# Sidebar portal slug -> brand sprite slug
SIDEBAR_MAP: dict[str, str] = {
    "layout-dashboard": "grid",
    "layout-grid": "layers",
    "clipboard-check": "edit",
    "users": "notification",
    "users-round": "user",
    "user": "user",
    "user-plus": "add",
    "package": "cards",
    "shopping-bag": "price-tag",
    "wallet": "wallet",
    "handshake": "analytics",
    "warehouse": "folder",
    "bar-chart": "pie-chart",
    "shield": "lock",
    "settings": "toggle",
    "store": "home",
    "calculator": "calculator",
    "message-square": "notification",
    "help-circle": "headset",
    "log-out": "key",
    "menu": "grid",
}

PADDING_RATIO = 0.08
BLACK_THRESHOLD = 35


def remove_black_bg(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD:
                pixels[x, y] = (r, g, b, 0)
    return img


def normalize_icon(img: Image.Image, padding_ratio: float = 0.1) -> Image.Image:
    """Crop to visible content and center in a square canvas."""
    img = img.convert("RGBA")
    bbox = img.getbbox()
    if not bbox:
        return img

    cropped = img.crop(bbox)
    content_w, content_h = cropped.size
    content_size = max(content_w, content_h)
    pad = max(1, int(content_size * padding_ratio))
    canvas_size = content_size + pad * 2
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_x = (canvas_size - content_w) // 2
    offset_y = (canvas_size - content_h) // 2
    canvas.paste(cropped, (offset_x, offset_y), cropped)
    return canvas


def crop_cell(sheet: Image.Image, row: int, col: int, cols: int, rows: int) -> Image.Image:
    w, h = sheet.size
    cell_w = w / cols
    cell_h = h / rows
    pad_x = int(cell_w * PADDING_RATIO)
    pad_y = int(cell_h * PADDING_RATIO)
    left = int(col * cell_w) + pad_x
    top = int(row * cell_h) + pad_y
    right = int((col + 1) * cell_w) - pad_x
    bottom = int((row + 1) * cell_h) - pad_y
    return sheet.crop((left, top, right, bottom))


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing sprite sheet: {SOURCE}")

    BRAND_DIR.mkdir(parents=True, exist_ok=True)
    FRONTIER_DIR.mkdir(parents=True, exist_ok=True)

    sheet = Image.open(SOURCE).convert("RGBA")
    cols, rows = 7, 4
    extracted: dict[str, Path] = {}

    for row_idx, row_slugs in enumerate(SLUGS):
        for col_idx, slug in enumerate(row_slugs):
            if slug is None:
                continue
            cell = crop_cell(sheet, row_idx, col_idx, cols, rows)
            cell = remove_black_bg(cell)
            cell = normalize_icon(cell)
            out_path = BRAND_DIR / f"{slug}.png"
            cell.save(out_path, "PNG")
            extracted[slug] = out_path
            print(f"Extracted {slug}.png")

    for portal_slug, brand_slug in SIDEBAR_MAP.items():
        src = extracted.get(brand_slug)
        if src is None:
            print(f"WARN: missing brand sprite '{brand_slug}' for sidebar '{portal_slug}'")
            continue
        default_dst = FRONTIER_DIR / f"{portal_slug}.png"
        active_dst = FRONTIER_DIR / f"{portal_slug}-active.png"
        shutil.copy2(src, default_dst)
        shutil.copy2(src, active_dst)
        print(f"Mapped {portal_slug} <- {brand_slug}")

    print(f"\nDone: {len(extracted)} brand icons, {len(SIDEBAR_MAP)} sidebar PNGs")


if __name__ == "__main__":
    main()
