export interface NetworkSummary {
  total_vertices: number;
  total_undirected_edges: number;
  total_connected_components: number;
  largest_component_vertices: number;
  largest_component_fraction: number;
  max_degree: number;
  avg_degree: number;
  max_pagerank: number;
  min_pagerank: number;
  self_loops_filtered: number;
  directed_input_lines: number;
  dataset: string;
}

export interface Researcher {
  id: number;
  researcher_id: number;
  degree: number;
  degree_rank: number;
  pagerank: number;
  pagerank_rank: number;
  rank_delta: number;
  category: string;
  component_id: number;
  component_size: number;
  is_largest_component: boolean;
}

export interface CommunityItem {
  component_id: number;
  size: number;
  fraction: number;
  is_largest: boolean;
  top_researcher_id: number;
  top_degree: number;
}

export interface GraphElements {
  elements: {
    nodes: any[];
    edges: any[];
  };
  stats?: any;
}

const API_BASE = '/api';

export const api = {
  getOverview: async () => {
    const res = await fetch(`${API_BASE}/overview/`);
    return res.json();
  },

  getGraph: async (params?: { component_id?: number; min_degree?: number; limit?: number }): Promise<GraphElements> => {
    const query = new URLSearchParams();
    if (params?.component_id !== undefined) query.append('component_id', params.component_id.toString());
    if (params?.min_degree !== undefined) query.append('min_degree', params.min_degree.toString());
    if (params?.limit !== undefined) query.append('limit', params.limit.toString());
    const res = await fetch(`${API_BASE}/network/graph?${query.toString()}`);
    return res.json();
  },

  getNeighborhood: async (researcherId: number) => {
    const res = await fetch(`${API_BASE}/network/neighborhood/${researcherId}`);
    return res.json();
  },

  getResearchers: async (params?: { page?: number; page_size?: number; search?: string; sort_by?: string; sort_order?: string; min_degree?: number; component_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.sort_order) query.append('sort_order', params.sort_order);
    if (params?.min_degree) query.append('min_degree', params.min_degree.toString());
    if (params?.component_id !== undefined) query.append('component_id', params.component_id.toString());
    const res = await fetch(`${API_BASE}/researchers/?${query.toString()}`);
    return res.json();
  },

  getResearcherDetail: async (id: number, fetchScholarly: boolean = false) => {
    const res = await fetch(`${API_BASE}/researchers/${id}?fetch_scholarly_metadata=${fetchScholarly}`);
    return res.json();
  },

  getCommunities: async (params?: { page?: number; page_size?: number; min_size?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    if (params?.min_size) query.append('min_size', params.min_size.toString());
    const res = await fetch(`${API_BASE}/communities/?${query.toString()}`);
    return res.json();
  },

  getCommunityDetail: async (id: number) => {
    const res = await fetch(`${API_BASE}/communities/${id}`);
    return res.json();
  },

  getDiscovery: async (params?: { seed_researcher_id?: number; prefer_high_prestige?: boolean; min_degree?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.seed_researcher_id) query.append('seed_researcher_id', params.seed_researcher_id.toString());
    if (params?.prefer_high_prestige !== undefined) query.append('prefer_high_prestige', params.prefer_high_prestige.toString());
    if (params?.min_degree) query.append('min_degree', params.min_degree.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const res = await fetch(`${API_BASE}/discovery/recommendations?${query.toString()}`);
    return res.json();
  },

  searchScholarly: async (query: string) => {
    const res = await fetch(`${API_BASE}/discovery/scholarly-search?query=${encodeURIComponent(query)}`);
    return res.json();
  },

  simulateNodeRemoval: async (researcherId: number) => {
    const res = await fetch(`${API_BASE}/simulator/remove-node`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ researcher_id: researcherId })
    });
    return res.json();
  },

  simulateEdgeRemoval: async (u: number, v: number) => {
    const res = await fetch(`${API_BASE}/simulator/remove-edge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ researcher_u: u, researcher_v: v })
    });
    return res.json();
  },

  getSaved: async () => {
    const res = await fetch(`${API_BASE}/saved/`);
    return res.json();
  },

  saveResearcher: async (id: number, notes: string = '') => {
    const res = await fetch(`${API_BASE}/saved/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ researcher_id: id, notes })
    });
    return res.json();
  },

  removeSaved: async (id: number) => {
    const res = await fetch(`${API_BASE}/saved/${id}`, { method: 'DELETE' });
    return res.json();
  },

  draftOutreach: async (data: { sender_name: string; sender_topic: string; target_researcher_id: number; collaboration_goal: string }) => {
    const res = await fetch(`${API_BASE}/saved/draft-outreach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getReportFiles: async () => {
    const res = await fetch(`${API_BASE}/reports/files`);
    return res.json();
  }
};
