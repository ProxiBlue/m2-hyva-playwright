#!/bin/bash

# Script to create and remove test admin accounts for Playwright testing

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
    ddev exec "bin/magento proxiblue:playwright:create-test-admins --count=$COUNT --password=$PASSWORD"
    ;;
  remove)
    echo "Removing test admin accounts..."
    ddev exec "bin/magento proxiblue:playwright:remove-test-admins"
    ;;
  *)
    echo "Unknown command: $COMMAND"
    show_usage
    exit 1
    ;;
esac

exit 0
