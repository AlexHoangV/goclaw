//go:build sqlite

package sqlitestore

import (
	"fmt"
	"log/slog"

	"github.com/nextlevelbuilder/goclaw/internal/store"
)

// NewSQLiteStores creates all stores backed by SQLite.
// Mirrors pg.NewPGStores() — returns the same *store.Stores struct.
func NewSQLiteStores(cfg store.StoreConfig) (*store.Stores, error) {
	db, err := OpenDB(cfg.SQLitePath)
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}

	// Apply schema (create tables on first run, migrate on upgrade).
	if err := EnsureSchema(db); err != nil {
		db.Close()
		return nil, fmt.Errorf("ensure schema: %w", err)
	}

	slog.Info("sqlite stores initialized", "path", cfg.SQLitePath)

	// TODO: Wire all 27 store implementations as they are created.
	// Each store will be added incrementally (Phase 1 → Phase 3).
	return &store.Stores{
		DB: db,
		// Phase 1 stores will be wired here.
	}, nil
}
