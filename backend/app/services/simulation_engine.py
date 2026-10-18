from typing import Dict, Any, List, Set
from collections import deque
from ..data_loader import loader

class SimulationEngine:
    @classmethod
    def simulate_node_removal(cls, removed_node_id: int) -> Dict[str, Any]:
        """
        Simulates removing a researcher vertex and all incident edges.
        Calculates:
        - Number of edges severed
        - Immediate affected neighbors and their updated degree
        - Component fragmentation check for the removed node's neighborhood
        Operates on an in-memory graph copy, never altering the original dataset.
        """
        if removed_node_id not in loader.researchers:
            return {"error": f"Researcher {removed_node_id} not found."}

        original_r = loader.researchers[removed_node_id]
        original_degree = original_r["degree"]
        neighbors = list(loader.adj_list.get(removed_node_id, set()))

        # Check neighborhood reachability after node removal
        # Build local subgraph of neighbors and their immediate interconnects
        neighbor_set = set(neighbors)
        sub_adj = {n: set(loader.adj_list.get(n, set())) - {removed_node_id} for n in neighbor_set}

        # Count connected clusters among neighbors
        visited = set()
        neighbor_clusters = 0
        for n in neighbor_set:
            if n not in visited:
                neighbor_clusters += 1
                queue = deque([n])
                visited.add(n)
                while queue:
                    curr = queue.popleft()
                    for nxt in sub_adj.get(curr, set()):
                        if nxt in neighbor_set and nxt not in visited:
                            visited.add(nxt)
                            queue.append(nxt)

        fragmentation_risk = "High" if (original_degree > 15 and neighbor_clusters > 2) else (
            "Moderate" if original_degree > 5 else "Low"
        )

        impact_explanation = (
            f"Removing Researcher {removed_node_id} severs {original_degree} active collaboration ties. "
            f"Their {len(neighbors)} direct co-authors now fragment into {neighbor_clusters} separate subgroups "
            f"in their immediate cluster. This represents a {fragmentation_risk.lower()} risk of community disconnection."
        )

        return {
            "target_type": "node",
            "removed_id": removed_node_id,
            "original_degree": original_degree,
            "original_pagerank": original_r["pagerank"],
            "component_id": original_r["component_id"],
            "severed_edges_count": original_degree,
            "affected_neighbors_count": len(neighbors),
            "affected_neighbors": neighbors[:20],
            "neighbor_subgroups_formed": neighbor_clusters,
            "fragmentation_risk": fragmentation_risk,
            "explanation": impact_explanation,
            "disclaimer": "This simulator measures graph-topological structural vulnerability; it does not model human publication behavior or social decisions."
        }

    @classmethod
    def simulate_edge_removal(cls, node_u: int, node_v: int) -> Dict[str, Any]:
        """
        Simulates removing a collaboration edge between two researchers.
        Tests if alternative paths exist between u and v up to hop 4 (bridge test).
        """
        if node_u not in loader.researchers or node_v not in loader.researchers:
            return {"error": "One or both researcher IDs not found."}

        is_connected = node_v in loader.adj_list.get(node_u, set())
        if not is_connected:
            return {"error": f"No active collaboration edge exists between {node_u} and {node_v}."}

        # Check alternative path (BFS excluding direct edge u-v)
        visited = {node_u}
        queue = deque([(node_u, 0)])
        shortest_alt_path = -1

        while queue:
            curr, depth = queue.popleft()
            if depth >= 4:
                continue
            for nxt in loader.adj_list.get(curr, set()):
                if curr == node_u and nxt == node_v:
                    continue  # skip the removed direct edge
                if nxt == node_v:
                    shortest_alt_path = depth + 1
                    queue.clear()
                    break
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append((nxt, depth + 1))

        is_critical_bridge = shortest_alt_path == -1
        explanation = (
            f"Edge ({node_u} <-> {node_v}) was simulated as severed. "
            + (f"This edge was a local critical bridge! No alternative path within 4 hops exists." if is_critical_bridge
               else f"An alternative indirect path of length {shortest_alt_path} hops remains through shared network contacts.")
        )

        return {
            "target_type": "edge",
            "edge": [node_u, node_v],
            "u_original_degree": loader.researchers[node_u]["degree"],
            "v_original_degree": loader.researchers[node_v]["degree"],
            "is_critical_bridge": is_critical_bridge,
            "alternative_path_length": shortest_alt_path if shortest_alt_path != -1 else "Infinity (>4 hops)",
            "explanation": explanation,
            "disclaimer": "This simulator measures graph-topological structural vulnerability; it does not model human publication behavior or social decisions."
        }
