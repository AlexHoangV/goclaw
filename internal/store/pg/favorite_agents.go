package pg

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// PGFavoriteAgentStore implements store.FavoriteAgentStore backed by PostgreSQL.
type PGFavoriteAgentStore struct {
	db *sql.DB
}

func NewPGFavoriteAgentStore(db *sql.DB) *PGFavoriteAgentStore {
	return &PGFavoriteAgentStore{db: db}
}

func (s *PGFavoriteAgentStore) List(ctx context.Context, userID string) ([]string, error) {
	tid := tenantIDForInsert(ctx)
	rows, err := s.db.QueryContext(ctx,
		`SELECT agent_id FROM favorite_agents WHERE user_id = $1 AND tenant_id = $2 ORDER BY created_at`,
		userID, tid,
	)
	if err != nil {
		return nil, fmt.Errorf("favorite_agents list: %w", err)
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("favorite_agents scan: %w", err)
		}
		ids = append(ids, id.String())
	}
	return ids, rows.Err()
}

func (s *PGFavoriteAgentStore) Set(ctx context.Context, userID, agentID string, favorite bool) error {
	tid := tenantIDForInsert(ctx)
	id, err := uuid.Parse(agentID)
	if err != nil {
		return fmt.Errorf("favorite_agents: invalid agent_id: %w", err)
	}

	if favorite {
		_, err = s.db.ExecContext(ctx,
			`INSERT INTO favorite_agents (user_id, agent_id, tenant_id, created_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, agent_id, tenant_id) DO NOTHING`,
			userID, id, tid, time.Now(),
		)
	} else {
		_, err = s.db.ExecContext(ctx,
			`DELETE FROM favorite_agents WHERE user_id = $1 AND agent_id = $2 AND tenant_id = $3`,
			userID, id, tid,
		)
	}
	return err
}
