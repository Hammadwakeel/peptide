#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Pushing full monorepo (frontend + backend) to frontier-nexus (Hasnain)..."
git push frontier-nexus main

echo "→ Pushing frontend-only subtree to origin (Hammad)..."
git subtree push --prefix=frontend origin main

echo "Done."
