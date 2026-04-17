#!/usr/bin/env bash
set -euo pipefail

ASSETS_DIR="www/data"
OUT_DIR="${1:-dist}"

mkdir -p "$OUT_DIR"

for game in LBA1 LBA2; do
  src="$ASSETS_DIR/$game"
  out="$OUT_DIR/${game}.tar.gz"

  if [ ! -d "$src" ] || [ -z "$(ls -A "$src" 2>/dev/null)" ]; then
    echo "ERROR: $src not found or empty." >&2
    exit 1
  fi

  echo "Packing $game -> $out..."
  tar -czf "$out" -C "$ASSETS_DIR" "$game"
  echo "Done: $out"
done
