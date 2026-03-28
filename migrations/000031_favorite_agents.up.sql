CREATE TABLE IF NOT EXISTS favorite_agents (
    user_id    VARCHAR(255) NOT NULL,
    agent_id   UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, agent_id, tenant_id)
);

CREATE INDEX idx_favorite_agents_user_tenant ON favorite_agents(user_id, tenant_id);
