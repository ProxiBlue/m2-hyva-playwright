#!/bin/bash

# Script to create and remove test admin accounts for Playwright testing using Magento's built-in command

# Function to display usage information
function show_usage {
  echo "Usage: $0 [create|remove] [options]"
  echo ""
  echo "Commands:"
  echo "  create    Create test admin accounts"
  echo "  remove    Remove test admin accounts"
  echo ""
  echo "Options for 'create':"
  echo "  --count=N        Number of test admin accounts to create (default: 3)"
  echo "  --password=P     Password for test admin accounts (default: admin123)"
  echo "  --write-config   Write the created accounts into config.private.json's admin_users"
  echo "                   array, for @utils/functions/admin.getAdminForWorker (requires jq)."
  echo "  --config=PATH    config.private.json to write (default: tests/m2-hyva-playwright/src/apps/admin/config.private.json)"
  echo ""
  echo "Options for 'remove':"
  echo "  --write-config   Also strip admin_users from config.private.json (requires jq)"
  echo "  --config=PATH    config.private.json to update (default: tests/m2-hyva-playwright/src/apps/admin/config.private.json)"
  echo ""
  echo "Examples:"
  echo "  $0 create --count=5"
  echo "  $0 create --count=3 --password=secure123"
  echo "  $0 create --count=2 --write-config    # provision + wire for ADMIN_WORKERS=2"
  echo "  $0 remove --write-config"
}

# Check if command is provided
if [ $# -lt 1 ]; then
  show_usage
  exit 1
fi

COMMAND=$1
shift

# Parse options
COUNT=3
PASSWORD="admin123"
WRITE_CONFIG=0
CONFIG_PATH="tests/m2-hyva-playwright/src/apps/admin/config.private.json"

for i in "$@"; do
  case $i in
    --count=*)
      COUNT="${i#*=}"
      ;;
    --password=*)
      PASSWORD="${i#*=}"
      ;;
    --write-config)
      WRITE_CONFIG=1
      ;;
    --config=*)
      CONFIG_PATH="${i#*=}"
      ;;
    *)
      echo "Unknown option: $i"
      show_usage
      exit 1
      ;;
  esac
done

if [ "$WRITE_CONFIG" -eq 1 ] && ! command -v jq >/dev/null 2>&1; then
  echo "--write-config requires jq (not found on PATH)" >&2
  exit 1
fi

# Execute the appropriate command
case $COMMAND in
  create)
    echo "Creating $COUNT test admin accounts..."
    ADMIN_USERS_JSON="[]"
    for i in $(seq 0 $(($COUNT-1))); do
      USERNAME="playwright_admin_$i"
      EMAIL="playwright_admin_$i@example.com"
      FIRSTNAME="Playwright"
      LASTNAME="Admin $i"

      echo "Creating admin user: $USERNAME"
      php bin/magento admin:user:create --admin-user="$USERNAME" --admin-password="$PASSWORD" --admin-email="$EMAIL" --admin-firstname="$FIRSTNAME" --admin-lastname="$LASTNAME"

      if [ "$WRITE_CONFIG" -eq 1 ]; then
        ADMIN_USERS_JSON=$(echo "$ADMIN_USERS_JSON" | jq --arg u "$USERNAME" --arg p "$PASSWORD" '. + [{username: $u, password: $p}]')
      fi
    done

    if [ "$WRITE_CONFIG" -eq 1 ]; then
      if [ ! -f "$CONFIG_PATH" ]; then
        echo "--write-config: $CONFIG_PATH not found, skipping" >&2
        exit 1
      fi
      TMP_CONFIG=$(mktemp)
      jq --argjson admins "$ADMIN_USERS_JSON" '.admin_users = $admins' "$CONFIG_PATH" > "$TMP_CONFIG" && mv "$TMP_CONFIG" "$CONFIG_PATH"
      echo "Wrote $COUNT admin accounts to $CONFIG_PATH (admin_users) — round-robin assigned by getAdminForWorker(), one per parallel worker slot"
    fi
    ;;
  remove)
    echo "Removing test admin accounts..."
    # Magento doesn't have a built-in command to remove users, so we'll use MySQL
    # Use a direct MySQL command without trying to extract the database name
    mysql -e "DELETE FROM admin_user WHERE username LIKE 'playwright_admin_%';"
    echo "Test admin accounts removed"

    if [ "$WRITE_CONFIG" -eq 1 ]; then
      if [ -f "$CONFIG_PATH" ]; then
        TMP_CONFIG=$(mktemp)
        jq 'del(.admin_users)' "$CONFIG_PATH" > "$TMP_CONFIG" && mv "$TMP_CONFIG" "$CONFIG_PATH"
        echo "Removed admin_users from $CONFIG_PATH"
      fi
    fi
    ;;
  *)
    echo "Unknown command: $COMMAND"
    show_usage
    exit 1
    ;;
esac

exit 0
