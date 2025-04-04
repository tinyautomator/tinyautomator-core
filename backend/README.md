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
