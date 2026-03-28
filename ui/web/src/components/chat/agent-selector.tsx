import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Bot, ChevronDown, Star, Pin } from "lucide-react";
import { useHttp } from "@/hooks/use-ws";
import { useAuthStore } from "@/stores/use-auth-store";
import type { AgentData } from "@/types/agent";
import { agentEmoji, computeAgentGroups } from "./agent-selector-utils";

interface AgentSelectorProps {
  value: string;
  onChange: (agentId: string) => void;
}

export function AgentSelector({ value, onChange }: AgentSelectorProps) {
  const { t } = useTranslation("common");
  const http = useHttp();
  const connected = useAuthStore((s) => s.connected);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const showSearch = agents.length > 5;

  useEffect(() => {
    if (!connected) return;
    Promise.all([
      http.get<{ agents: AgentData[] }>("/v1/agents"),
      http.get<{ agent_ids: string[] }>("/v1/favorites/agents").catch(() => ({ agent_ids: [] })),
    ])
      .then(([agentsRes, favsRes]) => {
        const active = (agentsRes.agents ?? []).filter((a) => a.status === "active");
        setAgents(active);
        setFavoriteIds(new Set(favsRes.agent_ids ?? []));
        if (active.length > 0 && !active.some((a) => a.agent_key === value)) {
          const defaultAgent = active.find((a) => a.is_default) ?? active[0]!;
          onChange(defaultAgent.agent_key);
        }
      })
      .catch(() => {});
  }, [http, connected]);

  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && showSearch && searchRef.current) {
      if (window.matchMedia("(pointer: fine)").matches) {
        searchRef.current.focus();
      }
    }
    if (!open) setSearch("");
  }, [open, showSearch]);

  const toggleFavorite = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const isFav = favoriteIds.has(agentId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(agentId); else next.add(agentId);
      return next;
    });
    http.put(`/v1/agents/${agentId}/favorite`, { favorite: !isFav }).catch(() => {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(agentId); else next.delete(agentId);
        return next;
      });
    });
  };

  const setDefaultAgent = (agent: AgentData, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (agent.is_default) return;
    // Optimistic update
    setAgents((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === agent.id })),
    );
    http.put(`/v1/agents/${agent.id}`, { is_default: true }).catch(() => {
      // Revert on error — refetch
      http.get<{ agents: AgentData[] }>("/v1/agents").then((res) => {
        setAgents((res.agents ?? []).filter((a) => a.status === "active"));
      }).catch(() => {});
    });
  };

  const { favorites, rest, filtered } = computeAgentGroups(agents, favoriteIds, search);
  const selected = agents.find((a) => a.agent_key === value);
  const selectedEmoji = selected ? agentEmoji(selected) : undefined;

  const renderRow = (agent: AgentData) => {
    const emoji = agentEmoji(agent);
    const isFav = favoriteIds.has(agent.id);
    return (
      <button
        key={agent.id}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onChange(agent.agent_key); setOpen(false); }}
        className={`group flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm hover:bg-accent ${
          agent.agent_key === value ? "bg-accent" : ""
        }`}
      >
        {emoji ? (
          <span className="text-sm shrink-0">{emoji}</span>
        ) : (
          <Bot className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 truncate text-left text-[13px]">
          {agent.display_name || agent.agent_key}
        </span>
        {/* Default indicator / toggle */}
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => setDefaultAgent(agent, e)}
          onMouseDown={(e) => e.preventDefault()}
          title={agent.is_default ? t("defaultAgent") : t("setAsDefault")}
          className={`shrink-0 p-0.5 rounded transition-colors duration-150 ${
            agent.is_default
              ? "text-blue-400"
              : "text-transparent group-hover:text-muted-foreground/40 hover:!text-blue-400"
          }`}
        >
          <Pin className="h-3 w-3" />
        </span>
        {/* Favorite star toggle */}
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => toggleFavorite(agent.id, e)}
          onMouseDown={(e) => e.preventDefault()}
          title={isFav ? t("removeFavorite") : t("addFavorite")}
          className={`shrink-0 p-0.5 rounded transition-colors duration-150 ${
            isFav
              ? "text-amber-400"
              : "text-transparent group-hover:text-muted-foreground/40 hover:!text-amber-400"
          }`}
        >
          <Star className={`h-3 w-3 ${isFav ? "fill-amber-400" : ""}`} />
        </span>
      </button>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent"
      >
        {selectedEmoji ? (
          <span className="text-base shrink-0">{selectedEmoji}</span>
        ) : (
          <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 truncate text-left font-medium">
          {selected?.display_name ?? selected?.agent_key ?? (value || t("selectAgent"))}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="pointer-events-auto max-h-60 sm:max-h-80 overflow-y-auto rounded-lg border bg-popover p-1 shadow-md"
        >
          {showSearch && (
            <div className="px-1 pb-1">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchAgents")}
                className="w-full rounded-md border bg-background px-2.5 py-1 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {!search && favorites.length > 0 && (
            <>
              {favorites.map(renderRow)}
              {rest.length > 0 && <div className="mx-2.5 my-0.5 border-t border-border/50" />}
            </>
          )}

          {(filtered !== null ? filtered : rest).map(renderRow)}

          {agents.length === 0 && (
            <div className="px-2.5 py-1.5 text-sm text-muted-foreground">
              {t("noAgentsAvailable")}
            </div>
          )}
          {search && filtered !== null && filtered.length === 0 && agents.length > 0 && (
            <div className="px-2.5 py-1.5 text-sm text-muted-foreground">
              {t("noResults")}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
