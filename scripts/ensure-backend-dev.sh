function air() {
  REPO_ROOT=$(command git rev-parse --show-toplevel 2>/dev/null)
  REPO_NAME=$(basename "$REPO_ROOT")

  if [[ "$REPO_NAME" == "tinyautomator-core" ]]; then
    if [[ "$PWD" != "$REPO_ROOT/backend" ]]; then
      echo "🔄 Switching to backend directory..."
      cd "$REPO_ROOT/backend"
    fi
  fi

  command air "$@"
}

function go() {
  REPO_ROOT=$(command git rev-parse --show-toplevel 2>/dev/null)
  REPO_NAME=$(basename "$REPO_ROOT")

  if [[ "$REPO_NAME" == "tinyautomator-core" ]]; then
    if [[ "$PWD" != "$REPO_ROOT/backend" ]]; then
      echo "🔄 Switching to backend directory..."
      cd "$REPO_ROOT/backend"
    fi
  fi

  command go "$@"
}
