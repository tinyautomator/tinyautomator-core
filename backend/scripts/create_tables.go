package main

import (
	"context"
	"flag"
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

	tableName := flag.String("table", "", "Specific table to drop and create")
	allTables := flag.Bool("all", false, "Drop and create all tables")
	flag.Parse()

	ctx := context.Background()

	db, err := pgx.Connect(ctx, connStr)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	defer db.Close(ctx)

	if *allTables {
		handleAllTables(ctx, db)
	} else if *tableName != "" {
		handleSpecificTable(ctx, db, *tableName)
	} else {
		createAllTables(ctx, db)
	}
}

func handleAllTables(ctx context.Context, db *pgx.Conn) {
	fmt.Println("dropping and recreating all tables")

	files, err := loadSQLFiles("db/schema")
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println("dropping tables in reverse dependency order:")
	for i := len(files) - 1; i >= 0; i-- {
		tableName := filepath.Base(files[i])
		tableName = tableName[:len(tableName)-4]

		fmt.Printf("  dropping %s\n", tableName)
		dropQuery := fmt.Sprintf("DROP TABLE IF EXISTS %s CASCADE", tableName)
		if _, err := db.Exec(ctx, dropQuery); err != nil {
			fmt.Printf("failed to drop table %s: %v\n", tableName, err)
		}
	}

	fmt.Println("creating tables in dependency order:")
	createTables(ctx, db, files)
}

func handleSpecificTable(ctx context.Context, db *pgx.Conn, tableName string) {
	fmt.Printf("dropping and recreating table %s and its dependencies\n", tableName)

	dependentTables, err := getDependentTables(ctx, db, tableName)
	if err != nil {
		fmt.Printf("failed to get dependent tables: %v\n", err)
		return
	}

	if len(dependentTables) > 0 {
		fmt.Printf("found %d dependent tables: %v\n", len(dependentTables), dependentTables)
	} else {
		fmt.Println("no dependent tables found")
	}

	allTablesToRecreate := make(map[string]bool)
	allTablesToRecreate[tableName] = true

	for _, depTable := range dependentTables {
		allTablesToRecreate[depTable] = true
	}

	fmt.Println("dropping tables:")
	for table := range allTablesToRecreate {
		fmt.Printf("  dropping %s\n", table)
		dropQuery := fmt.Sprintf("DROP TABLE IF EXISTS %s CASCADE", table)
		if _, err := db.Exec(ctx, dropQuery); err != nil {
			fmt.Printf("failed to drop table %s: %v\n", table, err)
		}
	}

	files, err := loadSQLFiles("db/schema")
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println("recreating tables:")
	for _, file := range files {
		tableNameFromFile := filepath.Base(file)
		tableNameFromFile = tableNameFromFile[:len(tableNameFromFile)-4]

		if allTablesToRecreate[tableNameFromFile] {
			fmt.Printf("  creating %s\n", tableNameFromFile)
			content, err := os.ReadFile(file)
			if err != nil {
				fmt.Printf("failed to read %s: %v\n", file, err)
				continue
			}

			ddl := string(content)
			if _, err := db.Exec(ctx, ddl); err != nil {
				fmt.Printf("failed to create table %s: %v\n", tableNameFromFile, err)
			}
		}
	}
}

func createAllTables(ctx context.Context, db *pgx.Conn) {
	fmt.Println("creating all tables (no drops)")

	files, err := loadSQLFiles("db/schema")
	if err != nil {
		fmt.Println(err)
		return
	}
	createTables(ctx, db, files)
}

func getDependentTables(ctx context.Context, db *pgx.Conn, tableName string) ([]string, error) {
	query := `
		SELECT DISTINCT
			cl.relname AS dependent_table
		FROM pg_constraint con
		JOIN pg_class cl ON cl.oid = con.conrelid
		JOIN pg_class ref ON ref.oid = con.confrelid
		WHERE ref.relname = $1
		AND con.contype = 'f'
		AND cl.relname != $1;
	`

	rows, err := db.Query(ctx, query, tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dependentTables []string
	for rows.Next() {
		var depTable string
		if err := rows.Scan(&depTable); err != nil {
			return nil, err
		}
		dependentTables = append(dependentTables, depTable)
	}

	return dependentTables, rows.Err()
}

func createTables(ctx context.Context, db *pgx.Conn, files []string) {
	for _, file := range files {
		tableName := filepath.Base(file)
		tableName = tableName[:len(tableName)-4]

		fmt.Printf("  creating %s\n", tableName)

		content, err := os.ReadFile(file)
		if err != nil {
			fmt.Printf("failed to read %s: %v\n", file, err)
			continue
		}

		ddl := string(content)
		if _, err := db.Exec(ctx, ddl); err != nil {
			fmt.Printf("failed to execute DDL for %s: %v\n", file, err)
		}

		time.Sleep(500 * time.Millisecond)
	}
}

func loadSQLFiles(dir string) ([]string, error) {
	inOrderOfDependency := []string{
		"workflow",
		"workflow_schedule",
		"workflow_node",
		"workflow_node_ui",
		"workflow_edge",
		"workflow_run",
		"workflow_node_run",
		"workflow_calendar",
		"workflow_email",
		"oauth_integration",
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
