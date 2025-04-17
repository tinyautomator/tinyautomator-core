function git() {
  if [[ "$1" == "commit" ]]; then
    REPO_ROOT=$(command git rev-parse --show-toplevel 2>/dev/null)
    REPO_NAME=$(basename "$REPO_ROOT")

    if [[ "$REPO_NAME" == "tinyautomator-core" && "$PWD" != "$REPO_ROOT" ]]; then
      echo "❌ Please run git commit from the root of the tinyautomator-core repo."
      echo "   You're in: $(basename $PWD)"
      return 1
    fi
  fi

  command git "$@"
}
