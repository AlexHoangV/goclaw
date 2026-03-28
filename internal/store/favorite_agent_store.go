package store

import "context"

// FavoriteAgentStore manages per-user agent favorites.
type FavoriteAgentStore interface {
	// List returns favorite agent IDs for the user in the current tenant.
	List(ctx context.Context, userID string) ([]string, error)
	// Set adds or removes a favorite. favorite=true inserts, false deletes.
	Set(ctx context.Context, userID, agentID string, favorite bool) error
}
