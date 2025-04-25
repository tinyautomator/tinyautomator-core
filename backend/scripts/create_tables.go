package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

func main() {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://tiny:autowmater@localhost:5432/tinyautomator?sslmode=disable"
	}

	ctx := context.Background()

	db, err := pgx.Connect(ctx, connStr)
	if err != nil {
		fmt.Println(err)
	}
	defer db.Close(ctx)

	fmt.Println("creating dev tables")

	files, err := loadSQLFiles("db/schema")
	if err != nil {
		fmt.Println(fmt.Errorf("failed to load SQL files: %w", err))
	}

	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			fmt.Println(fmt.Errorf("failed to read %s: %v", file, err))
		}

		ddl := string(content)
		fmt.Println(string(content))

		_, err = db.Exec(ctx, ddl)
		if err != nil {
			fmt.Println(err)
		}

		time.Sleep(1 * time.Second)
	}

	fmt.Println("dev tables created")
}

func loadSQLFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var files []string

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}

		files = append(files, filepath.Join(dir, entry.Name()))
	}

	// TODO: i have to put these in the order they depend on
	return files, nil
}
