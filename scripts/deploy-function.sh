#!/usr/bin/env bash
set -euo pipefail

# Deploy a Supabase Edge Function with lineage tracking.
#
# Usage:
#   ./scripts/deploy-function.sh <function-name>
#
# What it does:
#   1. Deploys the function via supabase CLI
#   2. Tags the commit: deploy/<function>/<date>-<sha>
#   3. Creates a GitHub Deployment record linked to the commit
#
# Prerequisites: supabase CLI (linked), gh CLI (authenticated), git

FUNCTION="${1:?Usage: deploy-function.sh <function-name>}"
SHA=$(git rev-parse --short HEAD)
FULL_SHA=$(git rev-parse HEAD)
DATE=$(date -u +%Y%m%d-%H%M)
TAG="deploy/${FUNCTION}/${DATE}-${SHA}"
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo "==> Deploying function: ${FUNCTION}"
echo "    Commit: ${SHA}"
echo "    Tag:    ${TAG}"
echo ""

# 1. Deploy
supabase functions deploy "${FUNCTION}" --no-verify-jwt

# 2. Tag
git tag -a "${TAG}" -m "Deploy ${FUNCTION} from ${SHA}"
git push origin "${TAG}"

# 3. GitHub Deployment record
DEPLOY_ID=$(gh api "repos/${REPO}/deployments" \
  -f ref="${FULL_SHA}" \
  -f environment="production" \
  -f task="deploy" \
  -f auto_merge=false \
  -f required_contexts="[]" \
  -f description="Deploy ${FUNCTION} from ${SHA}" \
  --jq '.id')

gh api "repos/${REPO}/deployments/${DEPLOY_ID}/statuses" \
  -f state="success" \
  -f description="Deployed ${FUNCTION}" \
  -f environment="production" \
  > /dev/null

echo ""
echo "==> Deployed successfully"
echo "    Function:   ${FUNCTION}"
echo "    Commit:     ${SHA}"
echo "    Tag:        ${TAG}"
echo "    Deployment: https://github.com/${REPO}/deployments/activity_log?environment=production"
