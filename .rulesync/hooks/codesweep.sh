#!/bin/zsh

if [ -n "$(git diff --name-only 2>/dev/null)" ]; then
  OUTPUT=$(NO_COLOR=1 bun codesweep:fix 2>&1)
  if [ $? -ne 0 ]; then
    echo "$OUTPUT" | jq -Rs '{decision: "block", reason: .}'
    exit 0
  fi
fi
