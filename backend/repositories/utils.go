package repositories

import (
	"encoding/json"
	"fmt"
)

const (
	limit = 1000
)

func marshalConfig(config any) ([]byte, error) {
	jsonBytes, err := json.Marshal(config)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal workflow email config: %w", err)
	}

	return jsonBytes, nil
}
