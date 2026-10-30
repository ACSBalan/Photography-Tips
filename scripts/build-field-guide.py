#!/usr/bin/env python3
"""Build the separately delivered photographic companion and public six-scene sample.

Requires Pillow, reportlab and pypdf. Source photographs and authored recipes are
read from the app; the full guide is deliberately written outside public/.
"""
from __future__ import annotations

import argparse
import html
import hashlib
import io
import json
import math
import re
import subprocess
import tempfile
from urllib.parse import unquote
from pathlib import Path

from PIL import Image, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
OUTSIDE = ROOT.parent / "deliverables"
PUBLIC = ROOT / "public" / "downloads"
APP_URL = "https://acsbalan.github.io/Photography-Tips/"
W, H = A4
M = 38
CW = W - M * 2
INK = colors.HexColor("#191a1e")
MUTED = colors.HexColor("#666973")
BLUE = colors.HexColor("#0066dc")
PALE = colors.HexColor("#f4f5f7")
RULE = colors.HexColor("#e0e2e7")
DATE = "30 October 2026"
CATEGORIES = [
    ("night-sky", "Night & sky"),
    ("sunrise-sunset", "Sunrise & sunset"),
    ("landscape-weather", "Landscape & weather"),
    ("water-motion", "Water & motion"),
    ("city-street", "City & street"),
    ("events-low-light", "Events & low light"),
    ("people", "People"),
    ("action-sport", "Action & sport"),
    ("wildlife", "Animals & wildlife"),
    ("close-up", "Close-up & still life"),
    ("travel", "Travel"),
    ("creative", "Creative & multi-image"),
]
CATEGORY_NAMES = dict(CATEGORIES)
SAMPLE_IDS = ["milky-way", "waterfall-silk", "bird-in-flight", "indoor-concert", "night-street", "window-light-portrait"]
LAYOUT = []


def setup_fonts():
    base = Path("/opt/codex/runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/share/fonts/truetype")
    if not (base / "LiberationSans-Regular.ttf").exists():
        base = Path("/usr/share/fonts/truetype/liberation2")
    for name, filename in [("Field", "LiberationSans-Regular.ttf"), ("Field-Bold", "LiberationSans-Bold.ttf"), ("Field-Italic", "LiberationSans-Italic.ttf")]:
        if not (base / filename).exists():
            raise FileNotFoundError(f"Install Liberation Sans or update font path: {base / filename}")
        pdfmetrics.registerFont(TTFont(name, str(base / filename)))
    pdfmetrics.registerFontFamily("Field", normal="Field", bold="Field-Bold", italic="Field-Italic", boldItalic="Field-Bold")


def clean(s):
    return str(s).replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-").replace("\u00a0", " ").replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')


def esc(s):
    return html.escape(clean(s), quote=False)


def markup(s, size=9.3, leading=None, color=INK, bold=False):
    return Paragraph(s, ParagraphStyle(
        "field", fontName="Field-Bold" if bold else "Field", fontSize=size,
        leading=leading or size * 1.31, textColor=color,
        alignment=TA_LEFT, spaceBefore=0, spaceAfter=0, splitLongWords=True,
        allowWidows=0, allowOrphans=0,
    ))


def para(c, text, x, top, width, size=9.3, leading=None, color=INK, bold=False, raw=False, draw=True):
    p = markup(text if raw else esc(text), size, leading, color, bold)
    _, h = p.wrap(width, H)
    if draw:
        p.drawOn(c, x, top - h)
    return top - h


def label(c, text, x, y, color=BLUE, size=8):
    c.saveState()
    c.setFillColor(color)
    t = c.beginText(x, y)
    t.setFont("Field-Bold", size)
    t.setCharSpace(1.25)
    t.textOut(clean(text).upper())
    c.drawText(t)
    c.restoreState()


def line(c, x, y, width=CW, color=RULE):
    c.setStrokeColor(color)
    c.setLineWidth(.5)
    c.line(x, y, x + width, y)


def brand(c, x=M, y=H - 35, light=False):
    color = colors.white if light else INK
    c.setStrokeColor(color)
    c.setLineWidth(1.3)
    for a, b, dx, dy in [(x, y - 4, 4, 4), (x + 14, y - 4, -4, 4), (x, y + 10, 4, -4), (x + 14, y + 10, -4, -4)]:
        c.line(a, b, a + dx, b)
        c.line(a, b, a, b + dy)
    c.setFillColor(color)
    c.setFont("Field-Bold", 13)
    c.drawString(x + 23, y, "fieldframe")


def footer(c, page, right="PHOTOGRAPHY FIELD GUIDE"):
    line(c, M, 31)
    c.setFillColor(MUTED)
    c.setFont("Field", 7)
    c.drawString(M, 19, "FIELDFRAME  /  " + right)
    c.drawRightString(W - M, 19, f"{page:03d}")


_img_cache = {}


def image_reader(path, ratio, pos="50% 50%", contain=False):
    key = (str(path), round(ratio, 4), pos, contain)
    if key not in _img_cache:
        im = Image.open(path).convert("RGB")
        xy = re.findall(r"([\d.]+)%", pos)
        center = tuple(float(v) / 100 for v in xy[:2]) if len(xy) >= 2 else (.5, .5)
        width = min(im.width, 1600)
        h = max(1, round(width / ratio))
        if contain:
            im = ImageOps.pad(im, (width, h), Image.Resampling.LANCZOS, color=im.getpixel((0, 0)))
        else:
            im = ImageOps.fit(im, (width, h), Image.Resampling.LANCZOS, centering=center)
        b = io.BytesIO()
        im.save(b, "JPEG", quality=88, optimize=True)
        b.seek(0)
        _img_cache[key] = ImageReader(b)
    return _img_cache[key]


def photograph(c, photo, x, y, width, height, contain=False):
    path = ROOT / "public" / photo["src"].removeprefix("./")
    if not path.is_file():
        raise FileNotFoundError(path)
    c.drawImage(image_reader(path, width / height, photo.get("position", "50% 50%"), contain), x, y, width=width, height=height)


def shutter(t):
    if t >= 1:
        return f"{t:g} s"
    inv = 1 / t
    if abs(inv - round(inv)) < .1:
        return f"1/{round(inv)} s"
    return f"{t:g} s"


def cover(c, scenes, photos, sample=False):
    brand(c)
    label(c, "THE PHOTOGRAPHIC FIELD GUIDE", M, H - 94)
    para(c, "Make the<br/>photograph.", M - 1, H - 112, CW, 54, 52, bold=True, raw=True)
    summary = "Six scenes. A good starting point." if sample else "120 scenes. A good starting point."
    para(c, summary, M, H - 240, CW, 16, 21, MUTED)
    hero_id = "milky-way"
    photograph(c, photos[hero_id], M, 168, CW, 330)
    label(c, "SET. SHOOT. ADJUST.", M, 139)
    para(c, "Practical camera settings, precise focus targets and useful fixes,\nready when the scene is in front of you.".replace("\n", "<br/>"), M, 124, CW - 20, 12, 16, MUTED, raw=True)
    c.setFillColor(INK)
    c.setFont("Field-Bold", 9)
    c.drawString(M, 64, "FREE SAMPLE" if sample else "COMPLETE EDITION")
    c.setFillColor(MUTED)
    c.setFont("Field", 8)
    c.drawRightString(W - M, 64, "A4 digital & print companion  /  2026")
    footer(c, 1, "SIX-SCENE SAMPLE" if sample else "COMPLETE EDITION")
    c.showPage()


def intro(c, scene_count, sample=False):
    brand(c)
    label(c, "HOW TO USE YOUR GUIDE", M, H - 89)
    para(c, "Start with the scene.", M, H - 108, CW, 31, 35, bold=True)
    y = para(c, "Choose the photograph you want to make. Read the light and subject assumptions, set the starting values, then inspect a test frame. The small adjustments make the difference.", M, H - 159, CW - 20, 13, 18, MUTED)
    items = [
        ("01", "Match the conditions", "A night street, a bright stage and a moonlit sky need different exposures. Start with the sheet that matches both the subject and the light."),
        ("02", "Set the camera", "ISO, aperture and shutter are a coherent starting combination. In M + Auto ISO, you set aperture and shutter; the camera chooses ISO within the shown bounds. The estimate is not a fixed instruction."),
        ("03", "Put focus in the right place", "The focus target matters as much as the exposure. Follow the instruction under Focus, then check the recorded image enlarged."),
        ("04", "Read the photograph", "Check movement, important highlights and sharpness. Use the symptom-to-adjustment pairs to make the next frame better."),
    ]
    y -= 27
    for number, title, copy in items:
        c.setFillColor(BLUE)
        c.setFont("Field-Bold", 12)
        c.drawString(M, y - 13, number)
        end = para(c, title, M + 35, y, CW - 35, 13, 16, bold=True)
        end = para(c, copy, M + 35, end - 6, CW - 35, 10, 14, MUTED)
        y = end - 19
    line(c, M, y + 4)
    y -= 17
    notes = [
        ("Your camera format", "Lens lengths in this guide describe a full-frame equivalent field of view. Divide by 1.5 or 1.6 for APS-C, or by 2 for Micro Four Thirds, to choose a similar actual focal length. Exposure values do not change just because sensor size changes."),
        ("A compact companion", "This edition condenses each scene into one practical camera sheet. The free app contains additional alternatives, explanations, capability-aware phone advice, lens-limit adaptation and tools. Use the linked scene for the full treatment."),
        ("About the photographs", "Real, licensed photographs show the subject or atmosphere. They are visual references; the nearby recipes are original starting setups, not claimed capture metadata for the photographs. Crop, season, light and equipment will change your result."),
    ]
    for title, copy in notes:
        end = para(c, f"<b>{esc(title)}.</b> {esc(copy)}", M, y, CW, 9.4, 13, raw=True)
        y = end - 13
    y = para(c, "Print only the sheets you need. Use A4 paper at actual size (100%) or fit to your printer's paper. On a phone or tablet, use the PDF bookmarks to jump straight to a scene.", M, y, CW, 9.4, 13, MUTED) - 13
    y = para(c, f'<link href="{APP_URL}" color="#0066dc">Open the complete Fieldframe app</link>  ·  Updated {DATE}', M, y - 1, CW, 9, 12, raw=True)
    if y < 44:
        raise ValueError(f"Introduction overflow: {y}")
    footer(c, 2, "SIX-SCENE SAMPLE" if sample else "HOW TO USE")
    c.showPage()


def contents(c, scenes, first_scene_page):
    for half in range(3):
        brand(c)
        label(c, "FIND YOUR SCENE", M, H - 89)
        para(c, "A photograph for every day.", M, H - 108, CW, 29, 34, bold=True)
        para(c, "Select a title to jump to its sheet.", M, H - 153, CW, 11, 15, MUTED)
        subset = CATEGORIES[half * 4:half * 4 + 4]
        colw = (CW - 24) / 2
        for col in range(2):
            x = M + col * (colw + 24)
            y = H - 198
            for catid, catname in subset[col * 2:col * 2 + 2]:
                label(c, catname, x, y)
                y -= 18
                for scene in [s for s in scenes if s["category"] == catid]:
                    pno = first_scene_page + scenes.index(scene)
                    text = f'<link href="#{scene["id"]}">{esc(scene["title"])}</link>'
                    p = markup(text, 8.7, 11.2)
                    _, height = p.wrap(colw - 25, H)
                    p.drawOn(c, x, y - height)
                    c.setFillColor(MUTED)
                    c.setFont("Field", 8)
                    c.drawRightString(x + colw, y - 9, f"{pno:03d}")
                    y -= max(16, height + 5)
                y -= 21
            if y < 50:
                raise ValueError(f"Contents overflow col {col}: {y}")
        footer(c, 3 + half, "SCENE INDEX")
        c.showPage()


def safety_height(scene, width, size):
    if not scene["safety"]:
        return 0
    txt = "<b>SAFETY FIRST.</b> " + " ".join(esc(s) for s in scene["safety"])
    return -para(None, txt, 0, 0, width - 20, size, size * 1.28, raw=True, draw=False) + 19


def field_columns(c, scene, top, size, draw=True):
    gap = 26
    colw = (CW - gap) / 2
    leading = size * 1.30
    s = scene["setup"]
    def head(t, x, y):
        if draw:
            label(c, t, x, y - 8, size=7.4)
        return y - 20
    def p(t, x, y, bold=False, raw=False):
        return para(c, t, x, y, colw, size, leading, bold=bold, raw=raw, draw=draw)
    x = M
    y = head("FOCUS", x, top)
    y = p(s["focusTarget"], x, y) - 15
    y = head("MAKE THE FRAME", x, y)
    for i, step in enumerate(scene["steps"]):
        y = p(f'<b>{i+1}.</b> {esc(step)}', x, y, raw=True) - 5
    y -= 7
    y = head("TAKE WITH YOU", x, y)
    y = p(" · ".join(scene["pack"]["essential"]), x, y) - 7
    y = p(f'<font color="#666973"><b>Useful:</b> {esc(" · ".join(scene["pack"]["optional"]))}</font>', x, y, raw=True)
    left_bottom = y
    x = M + colw + gap
    y = head("IF THIS HAPPENS, ADJUST THIS", x, top)
    for problem in scene["problems"]:
        y = p(problem["symptom"], x, y, bold=True) - 3
        y = p(problem["fix"], x, y) - 10
    y -= 3
    y = head("ONE THING TO TRY", x, y)
    y = p(scene["tip"], x, y) - 9
    return min(left_bottom, y)


def column_top(scene, photo_height):
    y = H - 60 - photo_height - 25
    title_size = 21.5 if len(scene["title"]) > 48 else 25
    y = para(None, scene["title"], M, y, CW, title_size, title_size * 1.1, bold=True, draw=False) - 9
    y = para(None, scene["conditions"], M, y, CW, 9.2, 12, MUTED, draw=False) - 12 - 53 - 11
    s = scene["setup"]
    iso = f"Auto ISO bounds {s['isoRange'][0]:g}-{s['isoRange'][1]:g}." if s["autoISO"] else "ISO is set manually."
    note = f'<b>{esc(s["mode"])}</b>  ·  <b>{s["focalLength"]:g} mm equivalent</b>  ·  {esc(s["whiteBalance"])}  ·  {esc(iso)}'
    y = para(None, note, M, y, CW, 8.2, 11, raw=True, draw=False) - 8
    return para(None, s["exposureNote"], M, y, CW, 8.1, 10.5, MUTED, draw=False) - 16


def scene_layout(scene):
    # Preserve readable type; long safety-critical sheets get a shallower photo.
    for size in [9.3, 9.0, 8.7]:
        safety_h = safety_height(scene, CW, size - .1)
        for photo_h in [148, 130, 112, 96]:
            top = column_top(scene, photo_h)
            bottom = field_columns(None, scene, top, size, draw=False)
            if bottom >= 68 + safety_h:
                return photo_h, size, safety_h
    raise ValueError(f"Scene needs editorial layout review: {scene['id']}")


def scene_page(c, scene, photo, page, number, sample=False):
    c.bookmarkPage(scene["id"])
    c.addOutlineEntry(clean(scene["title"]), scene["id"], level=1, closed=False)
    brand(c)
    c.setFillColor(MUTED)
    c.setFont("Field", 8)
    c.drawRightString(W - M, H - 35, f"{number:03d} / {CATEGORY_NAMES[scene['category']]}")
    photo_h, font_size, safety_h = scene_layout(scene)
    photo_y = H - 60 - photo_h
    photograph(c, photo, M, photo_y, CW, photo_h, contain=scene["id"] in {"full-moon", "moon-terminator", "lunar-eclipse", "partial-solar-eclipse", "earthshine"})
    credit = "Photo: " + clean(photo["author"]) + "  /  Visual reference. Settings below are starting recommendations."
    c.setFillColor(MUTED)
    c.setFont("Field", 6.1)
    if pdfmetrics.stringWidth(credit, "Field", 6.1) > CW:
        credit = "Photo credit and licence: see the back of this guide. Settings are starting recommendations."
    c.drawString(M, photo_y - 10, credit)
    title_size = 25
    if len(scene["title"]) > 48:
        title_size = 21.5
    title_top = photo_y - 25
    y = para(c, scene["title"], M, title_top, CW, title_size, title_size * 1.1, bold=True) - 9
    y = para(c, scene["conditions"], M, y, CW, 9.2, 12.0, MUTED) - 12
    setup = scene["setup"]
    bar_h = 53
    c.setFillColor(INK)
    c.roundRect(M, y - bar_h, CW, bar_h, 9, stroke=0, fill=1)
    iso = f"Auto ~{setup['iso']:g}" if setup["autoISO"] else f"{setup['iso']:g}"
    cells = [("ISO", iso), ("APERTURE", f"f/{setup['aperture']:g}"), ("SHUTTER", shutter(setup["shutter"])), ("SUPPORT", setup["support"])]
    for i, (title, val) in enumerate(cells):
        x = M + (CW / 4) * i + 14
        label(c, title, x, y - 15, color=colors.HexColor("#bdc4d1"), size=6.8)
        c.setFillColor(colors.white)
        c.setFont("Field-Bold", 18 if len(val) < 10 else 14)
        c.drawString(x, y - 38, clean(val))
    y -= bar_h + 11
    mode = setup["mode"]
    lens = f"{setup['focalLength']:g} mm equivalent"
    iso_note = f"Auto ISO bounds {setup['isoRange'][0]:g}-{setup['isoRange'][1]:g}." if setup["autoISO"] else "ISO is set manually."
    note = f'<b>{esc(mode)}</b>  ·  <b>{esc(lens)}</b>  ·  {esc(setup["whiteBalance"])}  ·  {esc(iso_note)}'
    y = para(c, note, M, y, CW, 8.2, 11, raw=True) - 8
    y = para(c, setup["exposureNote"], M, y, CW, 8.1, 10.5, MUTED) - 16

    if abs(y - column_top(scene, photo_h)) > .1:
        raise ValueError(f"Measured header disagrees with rendered header: {scene['id']}")
    bottom = field_columns(c, scene, y, font_size, draw=True)
    if scene["safety"]:
        safety_top = min(bottom - 8, 69 + safety_h)
        c.setFillColor(colors.HexColor("#fff4e6"))
        c.roundRect(M, safety_top - safety_h, CW, safety_h, 7, stroke=0, fill=1)
        safety = "<b>SAFETY FIRST.</b> " + " ".join(esc(s) for s in scene["safety"])
        para(c, safety, M + 10, safety_top - 9, CW - 20, max(7.7, font_size - .1), max(7.7, font_size - .1) * 1.28, colors.HexColor("#6c4108"), raw=True)
    c.setFillColor(BLUE)
    c.setFont("Field", 7.3)
    link_text = "Open the full scene, alternatives & sources"
    c.drawString(M, 47, link_text)
    c.linkURL(APP_URL + "#/scene/" + scene["id"], (M, 44, M + pdfmetrics.stringWidth(link_text, "Field", 7.3), 56), relative=0)
    c.setFillColor(MUTED)
    c.setFont("Field", 6.9)
    c.drawRightString(W - M, 47, scene["difficulty"] + "  /  Starting values: test and adjust")
    footer(c, page, "SAMPLE / " + scene["id"] if sample else scene["id"])
    LAYOUT.append({"scene": scene["id"], "page": page, "font": font_size, "photoHeight": photo_h, "bottom": round(bottom, 2), "safetyHeight": round(safety_h, 2), "sample": sample})
    c.showPage()


def credits(c, scenes, photos, first_page, sample=False):
    # Every use has scene-specific identity, creator, original source and licence.
    page = first_page
    y = 0
    def new_page(first=False):
        nonlocal y, page
        if not first:
            footer(c, page, "PHOTOGRAPH CREDITS")
            c.showPage()
            page += 1
        brand(c)
        label(c, "THE PHOTOGRAPHERS BEHIND THE SCENES", M, H - 89)
        para(c, "Credits & licences", M, H - 108, CW, 30, 35, bold=True)
        y = H - 165
        if first:
            y = para(c, "The photographs are licensed visual references. They are not claimed to have been captured with the printed camera settings. Each image is resized and cropped to fit the page; photographic rights remain with the original creators. Click a source or licence to inspect its terms.", M, y, CW, 9.6, 13, MUTED) - 20
    new_page(first=True)
    for i, scene in enumerate(scenes):
        photo = photos[scene["id"]]
        title = f'<b>{i+1:03d}  {esc(scene["title"])}</b>  /  {esc(photo["author"])}'
        source = photo["source"]
        lic = photo["licenseUrl"]
        supplied_title = photo.get("title")
        if not supplied_title and "/wiki/File:" in source:
            supplied_title = unquote(source.split("/wiki/File:", 1)[1]).replace("_", " ")
        source_label = supplied_title or "Original photograph"
        txt = title + f'<br/><link href="{html.escape(source, quote=True)}" color="#0066dc">{esc(source_label)}</link>  ·  <link href="{html.escape(lic, quote=True)}" color="#0066dc">{esc(photo["license"])}</link>'
        p = markup(txt, 8.8, 12)
        _, height = p.wrap(CW, H)
        if y - height < 62:
            new_page()
        p.drawOn(c, M, y - height)
        y -= height + 12
    y -= 8
    end_copy = "Original Fieldframe scene recipes and layout. Public technical sources are linked from each scene. Reference websites informed the practical field-reference approach; their paid content, text and artwork have not been reproduced. This guide is an independent product."
    p = markup(esc(end_copy), 8.5, 12, MUTED)
    _, hh = p.wrap(CW, H)
    if y - hh < 60:
        new_page()
    p.drawOn(c, M, y - hh)
    footer(c, page, "PHOTOGRAPH CREDITS")
    c.showPage()
    return page


def build(path, scenes, photos, sample=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name("." + path.name + ".pending")
    c = canvas.Canvas(str(temporary), pagesize=A4, pageCompression=1, invariant=1)
    c.setTitle("Fieldframe - Six-scene sample" if sample else "Fieldframe - Complete photographic field guide")
    c.setAuthor("Fieldframe")
    c.setSubject("Original camera starting settings, field instructions, corrections and licensed photographic references")
    c.setKeywords("photography, camera settings, scene cheat sheets, field guide, Fieldframe")
    c.setViewerPreference("DisplayDocTitle", "true")
    c.bookmarkPage("cover")
    c.addOutlineEntry("Fieldframe - Sample" if sample else "Fieldframe - Complete edition", "cover", level=0, closed=False)
    cover(c, scenes, photos, sample)
    intro(c, len(scenes), sample)
    first_scene = 3 if sample else 6
    if not sample:
        contents(c, scenes, first_scene)
    for i, scene in enumerate(scenes):
        scene_page(c, scene, photos[scene["id"]], first_scene + i, i + 1, sample)
    total = credits(c, scenes, photos, first_scene + len(scenes), sample)
    c.save()
    reader = PdfReader(temporary)
    assert len(reader.pages) == total, (len(reader.pages), total)
    pages = [p.extract_text() for p in reader.pages]
    for i, scene in enumerate(scenes):
        text = clean(pages[first_scene - 1 + i]).replace("\n", " ")
        assert scene["id"] in text, f"Missing scene ID: {scene['id']}"
        for safety in scene["safety"]:
            assert clean(safety) in text, f"Missing safety text: {scene['id']}"
    temporary.replace(path)
    return {"file": str(path), "pages": total, "scenes": len(scenes), "bytes": path.stat().st_size}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample-only", action="store_true")
    parser.add_argument("--full-output", type=Path, default=OUTSIDE / "fieldframe-complete-field-guide.pdf")
    args = parser.parse_args()
    setup_fonts()
    source = [s for p in sorted((ROOT / "src/data").glob("*.json")) for s in json.loads(p.read_text())]
    scenes = [s for cat, _ in CATEGORIES for s in source if s["category"] == cat]
    assert len(scenes) == len({s["id"] for s in scenes}) == 120
    photos = json.loads((ROOT / "src/photo-manifest.json").read_text())
    chosen = [next(s for s in scenes if s["id"] == sid) for sid in SAMPLE_IDS]
    results = [build(PUBLIC / "fieldframe-sample.pdf", chosen, photos, sample=True)]
    if not args.sample_only:
        results.append(build(args.full_output, scenes, photos))
    with tempfile.TemporaryDirectory(prefix="fieldframe-sample-preview-") as tmp:
        for page, name in [(1, "sample-preview-cover"), (3, "sample-preview-scene")]:
            prefix = str(Path(tmp) / name)
            subprocess.run(["pdftoppm", "-f", str(page), "-l", str(page), "-singlefile", "-scale-to", "1400", "-png", str(PUBLIC / "fieldframe-sample.pdf"), prefix], check=True, capture_output=True)
            with Image.open(prefix + ".png") as preview:
                target = PUBLIC / (name + ".webp")
                temporary = PUBLIC / ("." + name + ".pending")
                preview.convert("RGB").save(temporary, "WEBP", quality=86, method=6)
                temporary.replace(target)
    OUTSIDE.mkdir(exist_ok=True)
    manifest_digest = hashlib.sha256((ROOT / "src/photo-manifest.json").read_bytes()).hexdigest()
    (OUTSIDE / "fieldframe-guide-validation.json").write_text(json.dumps({"results": results, "photoManifestSha256": manifest_digest, "layout": LAYOUT}, indent=2))
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
