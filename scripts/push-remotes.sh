#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Pushing full monorepo (frontend + backend) to frontier-nexus (Hasnain)..."
git push frontier-nexus main

echo "→ Pushing frontend-only to origin (Hammad)..."
git subtree split --prefix=frontend -b frontend-only
git push origin frontend-only:main --force

echo "Done."
