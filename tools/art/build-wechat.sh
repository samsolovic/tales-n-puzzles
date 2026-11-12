#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COCOS="/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/MacOS/CocosCreator"
MODE="${1:-debug}"

if [[ "$MODE" != "debug" && "$MODE" != "release" ]]; then
  echo "usage: $0 [debug|release]" >&2
  exit 2
fi

if [[ ! -x "$COCOS" ]]; then
  echo "Cocos Creator not found: $COCOS" >&2
  exit 1
fi

echo "==> Cocos WeChat build ($MODE)"
env -u ELECTRON_RUN_AS_NODE "$COCOS" \
  --project "$ROOT/wechat-minigame" \
  --build "platform=wechatgame;debug=$([[ "$MODE" == "debug" ]] && echo true || echo false)"

echo "==> Patch WeChat subpackage + AppID"
sleep 1
node "$ROOT/tools/art/patch-wechat-build.mjs"

echo "==> Done"
echo "Import this folder in WeChat DevTools:"
echo "$ROOT/wechat-minigame/build/wechatgame"
