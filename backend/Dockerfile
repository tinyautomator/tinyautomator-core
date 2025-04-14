# Use the Go 1.24.2 base image
FROM golang:1.24.2

# Set the working directory inside the container
WORKDIR /app

# Install air (lightweight binary watcher)
RUN go install github.com/air-verse/air@latest

# Copy Go module files first (leverages Docker layer cache)
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the backend source code
COPY . .

# Expose the port your app listens on
EXPOSE 9000

# Run the app
CMD ["air"]
