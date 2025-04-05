# TinyAutomator

TinyAutomator is a lightweight, extensible backend platform for building and executing custom workflow automations. Built with Go and the Gin web framework, it supports dynamic workflows composed of triggers and actions—designed to be intuitive for both technical and non-technical users. The system powers drag-and-drop automation flows similar in spirit to Zapier, while prioritizing performance, developer flexibility, and scalability.

---

## 🔁 Backend Hot Reloading with Air

We use [air](https://github.com/air-verse/air) for automatic hot reloading during development of the Go backend.

### 📦 Installation (One-time setup)

```bash
go install github.com/air-verse/air@latest
```

try:

```bash
which air
```

If not a valid command make sure `$GOPATH/bin` is in your system `PATH`:

```bash
echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.zshrc
source ~/.zshrc
```

---

### 🧪 Running the Backend with Hot Reload

From the root of the project:

```bash
cd backend
air
```

This watches for changes to `.go`, `.html`, `.tpl`, etc. and restarts the server on each save.

---

### 🧰 `.air.toml` Config

The air config file is stored in `backend/.air.toml`.

It includes:

- Output binary path: `backend/tmp/main`
- File extensions to watch
- Delay settings for rebuilds
- Option to proxy and auto-reload browser (disabled by default)

You can customize this as needed. [[example](https://github.com/air-verse/air/blob/master/air_example.toml)]

---

### 📂 Git Ignore Reminder

Make sure the air `tmp/` directory is excluded in `.gitignore`:

```bash
# Air build output
backend/tmp/
```

---

## 🧼 Pre-commit Hooks

We use [pre-commit](https://pre-commit.com) to enforce code quality and formatting before commits.

When you commit changes, the following hooks are run automatically:

- `trailing-whitespace` – removes trailing whitespace
- `end-of-file-fixer` – ensures files end with a single newline
- `check-yaml` – validates `.yml` and `.yaml` syntax
- `check-added-large-files` – warns on large files
- `golangci-lint` – lints Go code in the `backend/` directory using `golangci-lint run`
- `golangci-fmt` – formats Go code in the `backend/` directory using `golangci-lint fmt`

We use [golangci-lint](https://golangci-lint.run/usage/configuration/) to lint and format our backend go code.

### 📦 Installation (one-time setup)

```bash
pip install pre-commit
```

If `pip` does not work, try `pip3` otherwise you may have to install [pip](https://pip.pypa.io/en/stable/installation/).

## ⚙️ Enabling hooks

Run this once after cloning the repo:

```bash
pre-commit install
```

## 🧪 Testing hooks

To run all hooks manually:

```bash
pre-commit run --all-files
```

## 📁 Config location

All hook configuration is defined in .pre-commit-config.yaml at the project root. Hooks targeting the Go backend are scoped using:

```yaml
entry: bash -c "cd backend && <command>"
```

This ensures formatting and linting happen relative to the Go module in backend/.
