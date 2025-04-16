// TODO : Possible email validation for "to" and "from"

package gmail

import (
	"encoding/base64"
	"fmt"
)

func EncodeSimpleText(to, from, subject, body string) (string, error) {
	if to == "" || from == "" || subject == "" {
		return "", fmt.Errorf("to, from, and subject are required")
	}
	raw := fmt.Sprintf(
		"To: %s\r\nFrom: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n\r\n%s",
		to,
		from,
		subject,
		body,
	)
	encoded := base64.RawURLEncoding.EncodeToString([]byte(raw))

	return encoded, nil
}
