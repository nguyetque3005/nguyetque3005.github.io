#!/usr/bin/env bash
# Đưa website lên GitHub Pages.
#
# Cách hoạt động:
#   nhánh "source" giữ mã nguồn (thư mục content/, src/, build.mjs...)
#   nhánh "main"   chỉ chứa website đã dựng — đây là nhánh GitHub Pages đọc.
#
# Chạy:  npm run deploy

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

BRANCH_PUBLISH="main"
WORKTREE=".publish"

export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -i $HOME/.ssh/id_ed25519_nguyetque -o IdentitiesOnly=yes}"

echo "→ Dựng website…"
npm run build --silent

if [ ! -f dist/index.html ]; then
  echo "Lỗi: không thấy dist/index.html. Dừng lại." >&2
  exit 1
fi

echo "→ Chuẩn bị nhánh $BRANCH_PUBLISH…"
git worktree remove --force "$WORKTREE" 2>/dev/null || true
rm -rf "$WORKTREE"

if git show-ref --verify --quiet "refs/heads/$BRANCH_PUBLISH"; then
  git worktree add --quiet "$WORKTREE" "$BRANCH_PUBLISH"
else
  git worktree add --quiet --detach "$WORKTREE"
  git -C "$WORKTREE" checkout --orphan "$BRANCH_PUBLISH"
  git -C "$WORKTREE" rm -rf --quiet . 2>/dev/null || true
fi

echo "→ Chép nội dung đã dựng…"
# Xoá nội dung cũ nhưng giữ lại thư mục .git
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -r dist/. "$WORKTREE"/

cd "$WORKTREE"
git add -A

if git diff --cached --quiet; then
  echo "→ Không có gì thay đổi. Bỏ qua."
else
  git commit -q -m "Cập nhật website — $(date '+%d/%m/%Y %H:%M')"
  echo "→ Đẩy lên GitHub…"
  git push -q origin "$BRANCH_PUBLISH"
  echo "→ Xong. Website: https://nguyetque3005.github.io"
fi

cd "$REPO_DIR"
git worktree remove --force "$WORKTREE"
