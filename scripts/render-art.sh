#!/usr/bin/env bash
# Renders the /art/<name> pages to PNGs with headless Chrome.
# Needs the dev server running: pnpm dev
set -euo pipefail
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="${BASE:-http://localhost:5173}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

render() { # name width height output
  # headless Chrome's viewport is shorter than its window, so render taller and crop
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size="$2,$(($3 + 200))" --virtual-time-budget=6000 \
    --screenshot="$4" "$BASE/art/$1" >/dev/null 2>&1
  magick "$4" -crop "$(($2 * 2))x$(($3 * 2))+0+0" +repage "$4"
  echo "rendered $4"
}

render og 1200 630 "$ROOT/apps/web/public/og.png"
render hero 1280 560 "$ROOT/docs/assets/hero.png"
render cast 1280 440 "$ROOT/docs/assets/cast.png"
render switch 1280 460 "$ROOT/docs/assets/switch.png"
render widget 1280 520 "$ROOT/docs/assets/widget.png"
