package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
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
		os.Exit(1)
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
	inOrderOfDependency := []string{
		"workflow",
		"workflow_schedule",
		"workflow_node",
		"workflow_node_ui",
		"workflow_edge",
	}

	var files []string
	for _, name := range inOrderOfDependency {
		path := filepath.Join(dir, name+".sql")
		if _, err := os.Stat(path); err != nil {
			return nil, fmt.Errorf("expected SQL file missing: %s", path)
		}
		files = append(files, path)
	}

	return files, nil
}
