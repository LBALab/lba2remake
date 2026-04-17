#!/usr/bin/env bash
set -euo pipefail

ASSETS_DIR="www/data"

# Convert a Google Drive share URL to a direct download URL.
# Share URLs look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
# Direct download:      https://drive.usercontent.google.com/download?id=FILE_ID&export=download&confirm=t
resolve_url() {
  local url="$1"
  local file_id
  if [[ "$url" =~ drive\.google\.com/file/d/([^/]+) ]]; then
    file_id="${BASH_REMATCH[1]}"
    echo "https://drive.usercontent.google.com/download?id=${file_id}&export=download&confirm=t"
  else
    echo "$url"
  fi
}

download_game_assets() {
  local game="$1"       # e.g. LBA1
  local url="$2"
  local secret="${3:-}"
  local target="$ASSETS_DIR/$game"

  if [ -d "$target" ] && [ -n "$(ls -A "$target" 2>/dev/null)" ]; then
    echo "[$game] Assets already present in $target, skipping download."
    return
  fi

  url="$(resolve_url "$url")"

  local tmp
  tmp=$(mktemp /tmp/assets-XXXXXX.tar.gz)

  if [ -n "$secret" ]; then
    echo "[$game] Downloading (with auth): curl -fSL --progress-bar -H \"Authorization: Bearer ***\" \"$url\" -o \"$tmp\""
    curl -fSL --progress-bar -H "Authorization: Bearer $secret" "$url" -o "$tmp"
  else
    echo "[$game] Downloading: curl -fSL --progress-bar \"$url\" -o \"$tmp\""
    curl -fSL --progress-bar "$url" -o "$tmp"
  fi

  echo "[$game] Archive size: $(du -sh "$tmp" | cut -f1)"

  echo "[$game] Extracting: tar -xzvf \"$tmp\" -C \"$ASSETS_DIR\""
  tar -xzvf "$tmp" -C "$ASSETS_DIR"
  rm -f "$tmp"

  if [ ! -d "$target" ] || [ -z "$(ls -A "$target" 2>/dev/null)" ]; then
    echo "ERROR: [$game] assets missing after extraction (expected $target)." >&2
    exit 1
  fi

  echo "[$game] Done. $(ls "$target" | wc -l | tr -d ' ') files extracted to $target."
}

if [ -z "${LBA1_ASSETS_URL:-}" ]; then
  echo "ERROR: LBA1_ASSETS_URL is not set." >&2
  exit 1
fi

if [ -z "${LBA2_ASSETS_URL:-}" ]; then
  echo "ERROR: LBA2_ASSETS_URL is not set." >&2
  exit 1
fi

mkdir -p "$ASSETS_DIR"

download_game_assets "LBA1" "$LBA1_ASSETS_URL" "${LBA1_ASSETS_SECRET:-}"
download_game_assets "LBA2" "$LBA2_ASSETS_URL" "${LBA2_ASSETS_SECRET:-}"
