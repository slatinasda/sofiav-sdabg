#!/bin/bash

show_help() {
  cat <<EOFHELP
Usage: $(basename "$0") [OPTIONS]

Deploy the production build to an FTP server.
All files on the remote (except api/, files/, and dot-items) are replaced.

Options:
  -y, --yes    Skip confirmation prompt (still shows warning)
  -h, --help   Show this help message and exit

Environment variables (will prompt if not set):
  FTP_HOST        Server hostname
  FTP_USER        Username
  FTP_PASS        Password
  FTP_PORT        Port (default: 21)
  FTP_REMOTE_DIR  Remote directory (default: /)
EOFHELP
  exit 0
}

check_dependencies() {
  if [ "$(command -v lftp)" = "" ]; then
    echo "ERROR: lftp is required but not installed."
    exit 1
  fi
}

resolve_paths() {
  SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_ROOT="$(dirname "$SCRIPTS_DIR")"
  PROD_BUILD_DIR="$PROJECT_ROOT/dist/sofiav-sdabg/browser"

  if [ ! -d "$PROD_BUILD_DIR" ]; then
    echo "ERROR: Deployment directory '$PROD_BUILD_DIR' does not exist."
    echo "Create a production build with: npm run build"
    exit 1
  fi
}

prompt_credentials() {
  if [ "${FTP_HOST:-}" = "" ]; then
    read -rp "FTP_HOST (server hostname): " FTP_HOST
  fi
  if [ "${FTP_USER:-}" = "" ]; then
    read -rp "FTP_USER (username): " FTP_USER
  fi
  if [ "${FTP_PASS:-}" = "" ]; then
    read -rsp "FTP_PASS (password): " FTP_PASS
    echo
  fi

  FTP_PORT="${FTP_PORT:-21}"
  FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"
}

show_warning() {
  cat <<EOFWARNING
============================== WARNING =============================
This script will DELETE everything on the FTP server at:
  $FTP_HOST:$FTP_REMOTE_DIR

The following items will be PRESERVED:
  - api/ directory
  - files/ directory
  - all files and folders starting with a dot (.)

All other files and folders will be REMOVED and replaced
with the contents of $PROD_BUILD_DIR.
==================================================================
EOFWARNING
}

deploy() {
  echo ""
  echo "Deploying from $PROD_BUILD_DIR to $FTP_HOST:$FTP_REMOTE_DIR"

  lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" "$FTP_PORT" <<EOFDEPLOY
set ftp:ssl-allow no
set net:timeout 30
set net:max-retries 3
set net:reconnect-interval-base 5

mirror -R --delete --only-newer \
    --exclude-glob 'api/*' \
    --exclude-glob 'files/*' \
    --exclude-glob '.*' \
    "$PROD_BUILD_DIR" "$FTP_REMOTE_DIR"

quit
EOFDEPLOY

  echo "Deployment completed successfully!"
}


SKIP_CONFIRM=0
for arg in "$@"; do
  case "$arg" in
    -h|--help)
      show_help
      ;;
    -y|--yes)
      SKIP_CONFIRM=1
      ;;
  esac
done

check_dependencies
resolve_paths
prompt_credentials
show_warning

if [ "$SKIP_CONFIRM" = "0" ]; then
  read -rp "Continue? [y/N] " CONFIRM_DEPLOY
  if [ "${CONFIRM_DEPLOY:0:1}" != "y" ]; then
    echo "Deployment cancelled."
    exit 1
  fi
fi

deploy
