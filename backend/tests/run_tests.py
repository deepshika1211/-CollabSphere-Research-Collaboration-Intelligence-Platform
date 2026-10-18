import unittest
import asyncio
import httpx
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.main import app
from backend.app.data_loader import loader

class TestCollabSphereAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        loader.load_all()

    def _run_async(self, coro):
        return asyncio.run(coro)

    def test_01_root(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get("/")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["status"], "online")
                self.assertEqual(data["total_vertices"], 5241)
                self.assertEqual(data["total_edges"], 14484)
                print("  [PASS] Root endpoint verified.")
        self._run_async(run())

    def test_02_overview(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get("/api/overview/")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["summary"]["max_degree"], 81)
                self.assertEqual(data["summary"]["total_connected_components"], 354)
                self.assertGreater(len(data["degree_distribution"]), 0)
                print("  [PASS] Overview endpoint and distributions verified.")
        self._run_async(run())

    def test_03_network_graph(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get("/api/network/graph?limit=50")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertIn("elements", data)
                self.assertLessEqual(len(data["elements"]["nodes"]), 50)
                self.assertGreater(len(data["elements"]["edges"]), 0)
                print("  [PASS] Network Cytoscape graph elements verified.")
        self._run_async(run())

    def test_04_neighborhood(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get("/api/network/neighborhood/21012")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["collaborator_count"], 81)
                self.assertEqual(data["center_researcher"]["degree"], 81)
                print("  [PASS] 1-hop ego neighborhood verified for hub 21012.")
        self._run_async(run())

    def test_05_researchers_ranking(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get("/api/researchers/?page=1&page_size=10&sort_by=degree_rank")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["total"], 5241)
                self.assertEqual(data["items"][0]["researcher_id"], 21012)
                self.assertEqual(data["items"][0]["degree"], 81)
                print("  [PASS] Researcher rankings and pagination verified.")
        self._run_async(run())

    def test_06_communities(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get("/api/communities/")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["total_components"], 354)
                self.assertEqual(data["largest_component_size"], 4158)
                self.assertEqual(data["items"][0]["size"], 4158)
                print("  [PASS] Communities / Connected Components verified.")
        self._run_async(run())

    def test_07_discovery(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get("/api/discovery/recommendations?min_degree=10&limit=5")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(len(data["results"]), 5)
                self.assertGreater(data["results"][0]["match_score"], 0)
                print("  [PASS] Explainable discovery recommendations verified.")
        self._run_async(run())

    def test_08_simulator(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.post("/api/simulator/remove-node", json={"researcher_id": 21012})
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["removed_id"], 21012)
                self.assertEqual(data["severed_edges_count"], 81)
                self.assertIn(data["fragmentation_risk"], ["High", "Moderate", "Low"])
                print("  [PASS] Structural What-If node removal simulation verified.")
        self._run_async(run())

    def test_09_reports(self):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get("/api/reports/files")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                names = [f["filename"] for f in data["files"]]
                self.assertIn("degree_centrality.csv", names)
                self.assertIn("pagerank.csv", names)
                self.assertIn("connected_components.csv", names)
                print("  [PASS] CSV & JSON export file downloads verified.")
        self._run_async(run())

if __name__ == "__main__":
    unittest.main()
