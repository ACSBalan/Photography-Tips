#!/usr/bin/env python3
"""Restore the exact selected photograph set using the provenance manifest.

Requires Pillow. This optional maintenance script is not part of the app build;
all production photographs are already committed and work without an image CDN.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import io
import json
from pathlib import Path
import urllib.request

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "src/photo-manifest.json"


def verify(path: Path) -> None:
    if path.stat().st_size < 1000:
        raise ValueError(f"Photograph is empty or unexpectedly small: {path}")
    with Image.open(path) as im:
        im.load()
        if im.format != "WEBP":
            raise ValueError(f"Expected a WebP photograph: {path}")


def restore(entry: dict, *, force: bool, verify_only: bool) -> str:
    path = (ROOT / "public" / entry["src"].removeprefix("./")).resolve()
    if not path.is_relative_to(ROOT / "public/photos"):
        raise ValueError("Photo path must remain under public/photos")
    if path.exists() and not force:
        verify(path)
        return f"Verified {path.name}"
    if verify_only:
        raise FileNotFoundError(path)
    url = entry["downloadUrl"]
    if not url.startswith("https://"):
        raise ValueError("Photo download URL must use HTTPS")
    request = urllib.request.Request(
        url, headers={"User-Agent": "Fieldframe photo asset maintenance"}
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        image_bytes = response.read()
    with Image.open(io.BytesIO(image_bytes)) as image:
        prepared = ImageOps.exif_transpose(image).convert("RGB")
        prepared.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(".webp.tmp")
        prepared.save(temporary, "WEBP", quality=82, method=6)
        verify(temporary)
        temporary.replace(path)
    return f"Restored {path.name}"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify-only", action="store_true", help="Check local assets without network requests")
    parser.add_argument("--force", action="store_true", help="Download selected sources again")
    args = parser.parse_args()
    if args.force and args.verify_only:
        parser.error("Choose either --force or --verify-only")
    manifest = json.loads(MANIFEST.read_text())
    unique = {entry["src"]: entry for entry in manifest.values()}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(restore, entry, force=args.force, verify_only=args.verify_only)
                   for entry in unique.values()]
        for future in concurrent.futures.as_completed(futures):
            print(future.result())
    print(f"{len(manifest)} scenes, {len(unique)} photographic assets verified.")


if __name__ == "__main__":
    main()
