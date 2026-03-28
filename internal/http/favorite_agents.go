package http

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/nextlevelbuilder/goclaw/internal/i18n"
	"github.com/nextlevelbuilder/goclaw/internal/store"
	"github.com/nextlevelbuilder/goclaw/pkg/protocol"
)

// FavoriteAgentsHandler manages per-user agent favorites.
type FavoriteAgentsHandler struct {
	store store.FavoriteAgentStore
}

func NewFavoriteAgentsHandler(s store.FavoriteAgentStore) *FavoriteAgentsHandler {
	return &FavoriteAgentsHandler{store: s}
}

// RegisterRoutes registers favorite agent endpoints on the given mux.
// Uses /v1/favorites/agents (list) to avoid conflict with /v1/agents/{id} wildcard.
func (h *FavoriteAgentsHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /v1/favorites/agents", requireAuth("", h.handleList))
	mux.HandleFunc("PUT /v1/agents/{id}/favorite", requireAuth("", h.handleSet))
}

func (h *FavoriteAgentsHandler) handleList(w http.ResponseWriter, r *http.Request) {
	locale := store.LocaleFromContext(r.Context())
	userID := store.UserIDFromContext(r.Context())
	if userID == "" {
		writeError(w, http.StatusBadRequest, protocol.ErrInvalidRequest, i18n.T(locale, i18n.MsgUserIDHeader))
		return
	}

	ids, err := h.store.List(r.Context(), userID)
	if err != nil {
		slog.Error("favorite_agents.list", "error", err)
		writeError(w, http.StatusInternalServerError, protocol.ErrInternal, i18n.T(locale, i18n.MsgFailedToList, "favorites"))
		return
	}
	if ids == nil {
		ids = []string{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"agent_ids": ids})
}

func (h *FavoriteAgentsHandler) handleSet(w http.ResponseWriter, r *http.Request) {
	locale := store.LocaleFromContext(r.Context())
	userID := store.UserIDFromContext(r.Context())
	if userID == "" {
		writeError(w, http.StatusBadRequest, protocol.ErrInvalidRequest, i18n.T(locale, i18n.MsgUserIDHeader))
		return
	}

	agentID := r.PathValue("id")

	var req struct {
		Favorite bool `json:"favorite"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<16)).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, protocol.ErrInvalidRequest, i18n.T(locale, i18n.MsgInvalidJSON))
		return
	}

	if err := h.store.Set(r.Context(), userID, agentID, req.Favorite); err != nil {
		slog.Error("favorite_agents.set", "agent_id", agentID, "error", err)
		writeError(w, http.StatusInternalServerError, protocol.ErrInternal, i18n.T(locale, i18n.MsgFailedToSave, "favorite", "internal error"))
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"ok": "true"})
}
