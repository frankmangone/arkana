#!/usr/bin/env bash
# Copy article images into public/images/ before building.
# Usage: scripts/sync-images.sh [source]
#   source defaults to $ARKANA_IMAGES_SOURCE, then ../arkana-content/images.
#   It can be a local directory or user@host:/path/ (set RSYNC_RSH for ssh options).
# Additive: nothing is ever deleted, so images that still live in this repo
# (including writers/, logos/ and the default og image) are left alone.
# If a file exists in both places with different bytes, the source wins.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
frontend_dir="$script_dir/.."
src_dir="${1:-${ARKANA_IMAGES_SOURCE:-$frontend_dir/../arkana-content/images}}"
dest_dir="${ARKANA_IMAGES_DEST:-$frontend_dir/public/images}"

mkdir -p "$dest_dir"
rsync -rcz -v --exclude=.DS_Store "${src_dir%/}/" "${dest_dir%/}/"
