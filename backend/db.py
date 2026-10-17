import os
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

FALKORDB_HOST = os.getenv("FALKORDB_HOST", "localhost")
FALKORDB_PORT = int(os.getenv("FALKORDB_PORT", "6379"))
FALKORDB_USER = os.getenv("FALKORDB_USER", "falkordb")
FALKORDB_PASSWORD = os.getenv("FALKORDB_PASSWORD", "") or None
FALKORDB_SSL = os.getenv("FALKORDB_SSL", "false").lower() in ("true", "1", "yes")
GRAPH_NAME = os.getenv("GRAPH_NAME", "waaris_estate_001")

_falkordb_driver = None
_falkordb_available = False

def create_falkordb_client():
    from falkordb import FalkorDB
    kwargs = {
        "host": FALKORDB_HOST,
        "port": FALKORDB_PORT,
    }
    if FALKORDB_USER:
        kwargs["username"] = FALKORDB_USER
    if FALKORDB_PASSWORD:
        kwargs["password"] = FALKORDB_PASSWORD
    if FALKORDB_SSL:
        kwargs["ssl"] = True

    client = FalkorDB(**kwargs)
    client.select_graph(GRAPH_NAME)
    return client

try:
    _falkordb_driver = create_falkordb_client()
    _falkordb_available = True
    print(f"[DB] Connected successfully to FalkorDB at {FALKORDB_HOST}:{FALKORDB_PORT}")
except Exception as e:
    print(f"[DB] Notice: FalkorDB is not connected on {FALKORDB_HOST}:{FALKORDB_PORT} ({e}).")
    _falkordb_driver = None
    _falkordb_available = False


class InMemoryFallbackGraph:
    """
    In-memory fallback graph emulator that mirrors FalkorDB cypher queries
    when FalkorDB Docker container is not currently running.
    """
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []

    def clear(self):
        self.nodes.clear()
        self.edges.clear()

    def add_node(self, node_id: str, labels: List[str], properties: Dict[str, Any]):
        self.nodes[node_id] = {
            "id": node_id,
            "labels": labels,
            "properties": properties
        }

    def add_edge(self, edge_id: str, src_id: str, dst_id: str, relation: str, properties: Optional[Dict[str, Any]] = None):
        self.edges.append({
            "id": edge_id,
            "source": src_id,
            "target": dst_id,
            "relation": relation,
            "properties": properties or {}
        })

    def get_nodes_and_edges(self):
        return self.nodes, self.edges


_memory_graph = InMemoryFallbackGraph()


def is_falkordb_connected() -> bool:
    global _falkordb_driver, _falkordb_available
    if _falkordb_driver is None:
        try:
            _falkordb_driver = create_falkordb_client()
            _falkordb_available = True
        except Exception:
            _falkordb_available = False
    return _falkordb_available


def get_graph():
    if is_falkordb_connected():
        return _falkordb_driver.select_graph(GRAPH_NAME)
    return None


def execute_cypher(query: str, params: Optional[Dict[str, Any]] = None) -> Any:
    graph = get_graph()
    if graph is not None:
        try:
            return graph.query(query, params or {})
        except Exception as e:
            print(f"[DB] Cypher execution error in FalkorDB: {e}")
            raise
    else:
        # Fallback simulator for graph queries
        return None


def get_memory_graph() -> InMemoryFallbackGraph:
    return _memory_graph
