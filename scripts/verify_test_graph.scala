// CollabSphere — Part 8 Verification Test on Small Reference Graph
// Run with: spark-shell -i scripts/verify_test_graph.scala

import org.apache.spark.graphx._
import org.apache.spark.rdd.RDD

println("============================================================")
println("  COLLABSPHERE — PART 8 VERIFICATION TEST SUITE             ")
println("============================================================")

val testPath = "data/raw/sample_graph.txt"
val rawLines = sc.textFile(testPath)

val parsedEdges = rawLines.filter(line => !line.startsWith("#") && line.trim.nonEmpty).flatMap { line =>
  val parts = line.trim.split("\\s+")
  if (parts.length >= 2) Some((parts(0).toLong, parts(1).toLong)) else None
}

val nonSelfLoops = parsedEdges.filter { case (u, v) => u != v }
val canonicalUndirected = nonSelfLoops.map { case (u, v) =>
  if (u < v) (u, v) else (v, u)
}.distinct().cache()

val verticesRDD = canonicalUndirected.flatMap { case (u, v) =>
  Iterator((u, s"V$u"), (v, s"V$v"))
}.distinct().cache()

val totalV = verticesRDD.count()
val totalE = canonicalUndirected.count()

println(s"Observed Vertices: $totalV, Expected: 4")
println(s"Observed Undirected Edges: $totalE, Expected: 4")
assert(totalV == 4, s"Failed: Expected 4 vertices, got $totalV")
assert(totalE == 4, s"Failed: Expected 4 undirected edges, got $totalE")

val graphEdges = canonicalUndirected.flatMap { case (u, v) =>
  Iterator(Edge(u, v, 1), Edge(v, u, 1))
}
val graph = Graph(verticesRDD, graphEdges).cache()

// Degree verification
val degMap = graph.inDegrees.collectAsMap()
println(s"Degrees: $degMap")
assert(degMap(1L) == 2, s"Failed: Degree of 1 should be 2, got ${degMap(1L)}")
assert(degMap(2L) == 2, s"Failed: Degree of 2 should be 2, got ${degMap(2L)}")
assert(degMap(3L) == 3, s"Failed: Degree of 3 should be 3, got ${degMap(3L)}")
assert(degMap(4L) == 1, s"Failed: Degree of 4 should be 1, got ${degMap(4L)}")
println("  [PASS] Degree centrality exactly matches expected values!")

// Connected component verification
val ccGraph = graph.connectedComponents()
val ccMap = ccGraph.vertices.collectAsMap()
val uniqueComponents = ccMap.values.toSet
println(s"Components assigned: $ccMap")
assert(uniqueComponents.size == 1, s"Failed: Expected 1 component, got ${uniqueComponents.size}")
println("  [PASS] Connected components exactly matches expected single component!")

// PageRank verification
val prGraph = graph.pageRank(0.0001, 0.15)
val prMap = prGraph.vertices.collectAsMap()
println(s"PageRanks: $prMap")
// Vertex 3 has the most connections and should have the highest PageRank
assert(prMap(3L) > prMap(1L) && prMap(3L) > prMap(4L), "Failed: Hub vertex 3 should have highest PageRank")
println("  [PASS] PageRank correctly assigns highest prestige to vertex 3!")

println("\n============================================================")
println("  [ALL VERIFICATION TESTS PASSED SUCCESSFULLY!]")
println("============================================================")
System.exit(0)
