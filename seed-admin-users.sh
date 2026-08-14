#!/bin/bash

# Idempotent seeder for per-worker Playwright admin accounts (see #439 /
# @utils/functions/admin.getAdminForWorker). Wraps admin-users.sh so a fresh
# project (or CI run) can get from "no admin_users configured" to "ready for
# ADMIN_WORKERS=N" in one call, without hand-picking passwords or worrying
# about stale accounts from a previous count.
#
# Always does a clean remove + recreate: Magento's admin:user:create errors
# on a username that already exists, so idempotency here means "guaranteed
# to end up with exactly COUNT fresh accounts", not "skip if present".
# These are throwaway test accounts (admin-users.sh's own remove already
# deletes by username pattern) — safe to rotate on every seed run.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_USERS_SH="$SCRIPT_DIR/admin-users.sh"

function show_usage {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --count=N       Number of per-worker admin accounts to seed (default: \$ADMIN_WORKERS or 2)"
  echo "  --config=PATH   config.private.json to write (default: tests/m2-hyva-playwright/src/apps/admin/config.private.json)"
  echo ""
  echo "Generates a fresh Magento-policy-compliant password per run (16 chars,"
  echo "mixed case + digit + special) — pass --password=P to pin one instead"
  echo "(e.g. for a reproducible CI seed)."
  echo ""
  echo "Examples:"
  echo "  $0                        # seed 2 accounts (or \$ADMIN_WORKERS), password auto-generated"
  echo "  $0 --count=4"
  echo "  ADMIN_WORKERS=3 $0"
}

COUNT="${ADMIN_WORKERS:-2}"
PASSWORD=""
CONFIG_PATH="tests/m2-hyva-playwright/src/apps/admin/config.private.json"

for i in "$@"; do
  case $i in
    --count=*)
      COUNT="${i#*=}"
      ;;
    --password=*)
      PASSWORD="${i#*=}"
      ;;
    --config=*)
      CONFIG_PATH="${i#*=}"
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $i"
      show_usage
      exit 1
      ;;
  esac
done

if ! command -v jq >/dev/null 2>&1; then
  echo "seed-admin-users.sh requires jq (not found on PATH)" >&2
  exit 1
fi

if [ -z "$PASSWORD" ]; then
  # Fixed prefix/suffix guarantee upper+lower+digit+special regardless of
  # what openssl's random hex happens to contain.
  PASSWORD="Pw$(openssl rand -hex 6)!A1"
fi

echo "Seeding $COUNT per-worker admin account(s) into $CONFIG_PATH ..."

"$ADMIN_USERS_SH" remove --write-config --config="$CONFIG_PATH"
"$ADMIN_USERS_SH" create --count="$COUNT" --password="$PASSWORD" --write-config --config="$CONFIG_PATH"

echo ""
echo "Seeded. Run the admin bucket with per-worker isolation via:"
echo "  ADMIN_WORKERS=$COUNT yarn test:admin"
