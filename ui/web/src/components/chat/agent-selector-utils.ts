import type { AgentData } from "@/types/agent";

export function agentEmoji(agent: AgentData): string | undefined {
  return (agent.other_config?.emoji as string) || undefined;
}

const sortByName = (a: AgentData, b: AgentData) =>
  (a.display_name || a.agent_key).localeCompare(b.display_name || b.agent_key);

export interface AgentGroups {
  favorites: AgentData[];
  rest: AgentData[];
  filtered: AgentData[] | null;
}

export function computeAgentGroups(
  agents: AgentData[],
  favoriteIds: Set<string>,
  search: string,
): AgentGroups {
  if (search) {
    const q = search.toLowerCase();
    const filtered = agents
      .filter(
        (a) =>
          (a.display_name || "").toLowerCase().includes(q) ||
          a.agent_key.toLowerCase().includes(q),
      )
      .sort(sortByName);
    return { favorites: [], rest: filtered, filtered };
  }
  return {
    favorites: agents.filter((a) => favoriteIds.has(a.id)).sort(sortByName),
    rest: agents.filter((a) => !favoriteIds.has(a.id)).sort(sortByName),
    filtered: null,
  };
}
