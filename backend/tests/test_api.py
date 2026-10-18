import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["total_vertices"] == 5241

def test_overview_endpoint():
    response = client.get("/api/overview/")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert data["summary"]["max_degree"] == 81
    assert data["summary"]["total_connected_components"] == 354
    assert len(data["degree_distribution"]) > 0

def test_network_graph_endpoint():
    response = client.get("/api/network/graph?limit=50")
    assert response.status_code == 200
    data = response.json()
    assert "elements" in data
    assert len(data["elements"]["nodes"]) <= 50
    assert len(data["elements"]["edges"]) > 0

def test_network_neighborhood_endpoint():
    # Top hub: 21012 has 81 collaborators
    response = client.get("/api/network/neighborhood/21012")
    assert response.status_code == 200
    data = response.json()
    assert data["collaborator_count"] == 81
    assert data["center_researcher"]["degree"] == 81

def test_researchers_list_and_sorting():
    response = client.get("/api/researchers/?page=1&page_size=10&sort_by=degree_rank")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5241
    assert len(data["items"]) == 10
    # Top researcher rank 1 should be 21012
    assert data["items"][0]["researcher_id"] == 21012
    assert data["items"][0]["degree"] == 81

def test_communities_endpoint():
    response = client.get("/api/communities/")
    assert response.status_code == 200
    data = response.json()
    assert data["total_components"] == 354
    assert data["largest_component_size"] == 4158
    # Top component should be 4158 nodes
    assert data["items"][0]["size"] == 4158

def test_discovery_recommendations():
    response = client.get("/api/discovery/recommendations?min_degree=10&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 5
    assert data["results"][0]["match_score"] > 0
    assert len(data["results"][0]["reasons"]) > 0

def test_simulator_remove_node():
    response = client.post("/api/simulator/remove-node", json={"researcher_id": 21012})
    assert response.status_code == 200
    data = response.json()
    assert data["removed_id"] == 21012
    assert data["severed_edges_count"] == 81
    assert data["fragmentation_risk"] in ["High", "Moderate", "Low"]

def test_reports_files():
    response = client.get("/api/reports/files")
    assert response.status_code == 200
    data = response.json()
    assert len(data["files"]) >= 6
    names = [f["filename"] for f in data["files"]]
    assert "degree_centrality.csv" in names
    assert "pagerank.csv" in names
    assert "connected_components.csv" in names
