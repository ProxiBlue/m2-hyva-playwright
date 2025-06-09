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
  echo "  --count=N     Number of test admin accounts to create (default: 3)"
  echo "  --password=P  Password for test admin accounts (default: admin123)"
  echo ""
  echo "Examples:"
  echo "  $0 create --count=5"
  echo "  $0 create --count=3 --password=secure123"
  echo "  $0 remove"
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

for i in "$@"; do
  case $i in
    --count=*)
      COUNT="${i#*=}"
      ;;
    --password=*)
      PASSWORD="${i#*=}"
      ;;
    *)
      echo "Unknown option: $i"
      show_usage
      exit 1
      ;;
  esac
done

# Execute the appropriate command
case $COMMAND in
  create)
    echo "Creating $COUNT test admin accounts..."
    for i in $(seq 0 $(($COUNT-1))); do
      USERNAME="playwright_admin_$i"
      EMAIL="playwright_admin_$i@example.com"
      FIRSTNAME="Playwright"
      LASTNAME="Admin $i"

      echo "Creating admin user: $USERNAME"
      php bin/magento admin:user:create --admin-user="$USERNAME" --admin-password="$PASSWORD" --admin-email="$EMAIL" --admin-firstname="$FIRSTNAME" --admin-lastname="$LASTNAME"
    done
    ;;
  remove)
    echo "Removing test admin accounts..."
    # Magento doesn't have a built-in command to remove users, so we'll use MySQL
    # Use a direct MySQL command without trying to extract the database name
    mysql -e "DELETE FROM admin_user WHERE username LIKE 'playwright_admin_%';"
    echo "Test admin accounts removed"
    ;;
  *)
    echo "Unknown command: $COMMAND"
    show_usage
    exit 1
    ;;
esac

exit 0
