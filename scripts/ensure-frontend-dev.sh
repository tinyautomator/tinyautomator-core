function yarn() {
  REPO_ROOT=$(command git rev-parse --show-toplevel 2>/dev/null)
  REPO_NAME=$(basename "$REPO_ROOT")

  if [[ "$REPO_NAME" == "tinyautomator-core" ]]; then
    if [[ "$PWD" != "$REPO_ROOT/frontend" ]]; then
      echo "📦 Switching to frontend directory..."
      cd "$REPO_ROOT/frontend"
    fi
  fi

  command yarn "$@"
}
