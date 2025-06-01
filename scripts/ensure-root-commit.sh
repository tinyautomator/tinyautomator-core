function git() {
  if [[ "$1" == "commit" ]]; then
    REPO_ROOT=$(command git rev-parse --show-toplevel 2>/dev/null)
    REPO_NAME=$(basename "$REPO_ROOT")

    if [[ "$REPO_NAME" == "tinyautomator-core" && "$PWD" != "$REPO_ROOT" ]]; then
      echo "❌ Please run git commit from the root of the tinyautomator-core repo."
      echo "   You're in: $(basename $PWD)"
      return 1
    fi

    if ! command -v pre-commit &> /dev/null; then
      echo "❌ pre-commit is not installed. Please install it first:"
      echo "   pip install pre-commit"
      return 1
    fi

    if [[ ! -f "$REPO_ROOT/.git/hooks/pre-commit" ]] || [[ -L "$REPO_ROOT/.git/hooks/pre-commit" && ! -e "$REPO_ROOT/.git/hooks/pre-commit" ]]; then
      echo "❌ pre-commit hook is not installed in this repository."
      echo "   Please run: pre-commit install"
      return 1
    fi
  fi

  command git "$@"
}
