#!/usr/bin/env bash
# Local development only: symlink ../arkana-content into this checkout, so
# articles, images, writers etc. can be edited and previewed without pulling
# from the API or syncing images from the VPS (what CI does).
#
# Usage: scripts/link-content.sh [--unlink]
#   ARKANA_CONTENT overrides the content repo location (default: ../arkana-content).
#
# - src/data/{content,reading-lists,tags.json,writers}: linked as a whole.
# - public/images/<series>/<article>: linked per article folder, NOT per
#   series, because public/images also holds files that belong to this repo
#   (default og image, logos, writer photos, a few article folders). A real
#   directory that already exists is left alone and reported.
# - Created links are added to .git/info/exclude (local only, never committed)
#   so they don't show up in `git status`.
#
# Safe to re-run. `--unlink` removes the image links and the exclude block;
# the src/data links are left in place.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
frontend_dir="$(cd "$script_dir/.." && pwd)"
content_dir="$(cd "${ARKANA_CONTENT:-$frontend_dir/../arkana-content}" && pwd)"
images_src="$content_dir/images"
images_dest="$frontend_dir/public/images"
exclude_file="$(cd "$frontend_dir" && git rev-parse --git-path info/exclude)"
case "$exclude_file" in /*) ;; *) exclude_file="$frontend_dir/$exclude_file" ;; esac

marker_start="# >>> link-content.sh (local symlinks, generated)"
marker_end="# <<< link-content.sh"

# Prefer relative links (like the existing src/data ones) when the content repo
# is a sibling checkout; fall back to absolute for ARKANA_CONTENT overrides.
link_target() { # $1 = absolute target, $2 = directory the link lives in
  if [ -z "${ARKANA_CONTENT:-}" ]; then
    python3 -c 'import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))' "$1" "$2"
  else
    printf '%s\n' "$1"
  fi
}

strip_exclude_block() {
  [ -f "$exclude_file" ] || return 0
  local tmp
  tmp="$(mktemp)"
  awk -v s="$marker_start" -v e="$marker_end" '
    $0 == s { skip = 1; next }
    $0 == e { skip = 0; next }
    !skip { print }
  ' "$exclude_file" > "$tmp"
  cat "$tmp" > "$exclude_file"
  rm -f "$tmp"
}

if [ "${1:-}" = "--unlink" ]; then
  removed=0
  while IFS= read -r -d '' link; do
    rm "$link"
    removed=$((removed + 1))
  done < <(find "$images_dest" -mindepth 2 -maxdepth 2 -type l -lname "*arkana-content/images/*" -print0)
  strip_exclude_block
  echo "Removed $removed image links and the .git/info/exclude block."
  exit 0
fi

[ -d "$content_dir/content" ] || { echo "No content repo at $content_dir" >&2; exit 1; }

linked=0; kept=0; skipped=0
excludes=()

# --- src/data ---------------------------------------------------------------
mkdir -p "$frontend_dir/src/data"
for name in content reading-lists tags.json writers; do
  src="$content_dir/$name"
  dest="$frontend_dir/src/data/$name"
  [ -e "$src" ] || { echo "skip  src/data/$name (not in content repo)"; continue; }
  if [ -e "$dest" ] && [ ! -L "$dest" ]; then
    echo "WARN  src/data/$name is a real file/dir, left alone"; skipped=$((skipped + 1)); continue
  fi
  ln -sfn "$(link_target "$src" "$frontend_dir/src/data")" "$dest"
done

# --- public/images ----------------------------------------------------------
if [ -d "$images_src" ]; then
  for series_path in "$images_src"/*/; do
    series="$(basename "$series_path")"
    series_dest="$images_dest/$series"
    if [ -L "$series_dest" ]; then
      echo "WARN  public/images/$series is a symlink, left alone"; skipped=$((skipped + 1)); continue
    fi
    mkdir -p "$series_dest"
    for article_path in "$series_path"*/; do
      [ -d "$article_path" ] || continue
      article="$(basename "$article_path")"
      dest="$series_dest/$article"
      if [ -e "$dest" ] && [ ! -L "$dest" ]; then
        echo "keep  public/images/$series/$article (real directory in this repo)"
        kept=$((kept + 1)); continue
      fi
      ln -sfn "$(link_target "${article_path%/}" "$series_dest")" "$dest"
      excludes+=("/public/images/$series/$article")
      linked=$((linked + 1))
    done
  done
fi

# --- keep the links out of git status ---------------------------------------
strip_exclude_block
mkdir -p "$(dirname "$exclude_file")"
{
  echo "$marker_start"
  [ "${#excludes[@]}" -gt 0 ] && printf '%s\n' "${excludes[@]}"
  echo "$marker_end"
} >> "$exclude_file"

echo "Linked $linked image folders; kept $kept real ones; $skipped warnings."
