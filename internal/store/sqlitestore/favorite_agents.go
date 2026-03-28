//go:build sqlite || sqliteonly

package sqlitestore

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// SQLiteFavoriteAgentStore implements store.FavoriteAgentStore backed by SQLite.
type SQLiteFavoriteAgentStore struct {
	db *sql.DB
}

func NewSQLiteFavoriteAgentStore(db *sql.DB) *SQLiteFavoriteAgentStore {
	return &SQLiteFavoriteAgentStore{db: db}
}

func (s *SQLiteFavoriteAgentStore) List(ctx context.Context, userID string) ([]string, error) {
	tid, err := requireTenantID(ctx)
	if err != nil {
		return nil, fmt.Errorf("favorite_agents list: %w", err)
	}

	rows, err := s.db.QueryContext(ctx,
		`SELECT agent_id FROM favorite_agents WHERE user_id = ? AND tenant_id = ? ORDER BY created_at`,
		userID, tid.String(),
	)
	if err != nil {
		return nil, fmt.Errorf("favorite_agents list: %w", err)
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("favorite_agents scan: %w", err)
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

func (s *SQLiteFavoriteAgentStore) Set(ctx context.Context, userID, agentID string, favorite bool) error {
	tid, err := requireTenantID(ctx)
	if err != nil {
		return fmt.Errorf("favorite_agents set: %w", err)
	}

	if _, err := uuid.Parse(agentID); err != nil {
		return fmt.Errorf("favorite_agents: invalid agent_id: %w", err)
	}

	if favorite {
		_, err = s.db.ExecContext(ctx,
			`INSERT INTO favorite_agents (user_id, agent_id, tenant_id, created_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT (user_id, agent_id, tenant_id) DO NOTHING`,
			userID, agentID, tid.String(), time.Now().UTC().Format("2006-01-02T15:04:05.000Z"),
		)
	} else {
		_, err = s.db.ExecContext(ctx,
			`DELETE FROM favorite_agents WHERE user_id = ? AND agent_id = ? AND tenant_id = ?`,
			userID, agentID, tid.String(),
		)
	}
	return err
}
