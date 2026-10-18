import httpx
from typing import Optional, Dict, Any, List

class OpenAlexService:
    BASE_URL = "https://api.openalex.org"

    @classmethod
    async def search_authors(cls, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search OpenAlex authors by name or query.
        Returns authentic scholarly profiles with h-index, works_count, cited_by_count, institutions.
        """
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"{cls.BASE_URL}/authors",
                    params={
                        "search": query,
                        "per_page": limit,
                        "mailto": "collabsphere-student@university.edu"
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for item in data.get("results", []):
                        inst = item.get("last_known_institution") or {}
                        results.append({
                            "openalex_id": item.get("id"),
                            "display_name": item.get("display_name"),
                            "works_count": item.get("works_count", 0),
                            "cited_by_count": item.get("cited_by_count", 0),
                            "h_index": item.get("summary_stats", {}).get("h_index", 0),
                            "institution": inst.get("display_name", "Independent / Unlisted"),
                            "institution_country": inst.get("country_code", ""),
                            "topics": [t.get("display_name") for t in item.get("topics", [])[:3]],
                            "orcid": item.get("orcid")
                        })
                    return results
        except Exception as e:
            print(f"[OpenAlexService] Search author error: {e}")
        return []

    @classmethod
    async def get_author_works(cls, openalex_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Fetch latest publications for an author."""
        try:
            # normalize id
            short_id = openalex_id.split("/")[-1]
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"{cls.BASE_URL}/works",
                    params={
                        "filter": f"author.id:{short_id}",
                        "sort": "publication_year:desc",
                        "per_page": limit,
                        "mailto": "collabsphere-student@university.edu"
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    works = []
                    for w in data.get("results", []):
                        works.append({
                            "title": w.get("title"),
                            "publication_year": w.get("publication_year"),
                            "cited_by_count": w.get("cited_by_count"),
                            "doi": w.get("doi"),
                            "primary_topic": w.get("primary_topic", {}).get("display_name", "General Physics")
                        })
                    return works
        except Exception as e:
            print(f"[OpenAlexService] Works error: {e}")
        return []

    @classmethod
    async def search_works_by_topic(cls, topic: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search works by research topic or keywords."""
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"{cls.BASE_URL}/works",
                    params={
                        "search": topic,
                        "per_page": limit,
                        "mailto": "collabsphere-student@university.edu"
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    return [{
                        "id": w.get("id"),
                        "title": w.get("title"),
                        "publication_year": w.get("publication_year"),
                        "cited_by_count": w.get("cited_by_count"),
                        "authors": [a.get("author", {}).get("display_name") for a in w.get("authorships", [])[:5]],
                        "doi": w.get("doi")
                    } for w in data.get("results", [])]
        except Exception as e:
            print(f"[OpenAlexService] Topic search error: {e}")
        return []
