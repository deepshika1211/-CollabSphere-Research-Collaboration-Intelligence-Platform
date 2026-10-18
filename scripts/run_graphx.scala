// CollabSphere — Spark GraphX Direct Runner
// Run with: spark-shell -i scripts/run_graphx.scala

import org.apache.spark.graphx._
import org.apache.spark.rdd.RDD
import java.io.{File, PrintWriter}

println("============================================================")
println("  STARTING COLLABSPHERE SPARK GRAPHX COMPUTATION PIPELINE   ")
println("============================================================")

val inputPath = "data/raw/ca-GrQc.txt"
val outputDir = "data/processed"

val outFolder = new File(outputDir)
if (!outFolder.exists()) outFolder.mkdirs()

// REQUIREMENT 1: Load edge list & construct undirected graph
println("\n[Req 1] Loading edge list & constructing undirected graph...")
val rawLines = sc.textFile(inputPath)

val parsedEdges = rawLines.filter(line => !line.startsWith("#") && line.trim.nonEmpty).flatMap { line =>
  val parts = line.trim.split("\\s+")
  if (parts.length >= 2) {
    try {
      Some((parts(0).toLong, parts(1).toLong))
    } catch {
      case _: NumberFormatException => None
    }
  } else None
}

val totalRawRecords = parsedEdges.count()
val nonSelfLoops = parsedEdges.filter { case (u, v) => u != v }
val selfLoopsCount = totalRawRecords - nonSelfLoops.count()

val canonicalUndirectedEdges = nonSelfLoops.map { case (u, v) =>
  if (u < v) (u, v) else (v, u)
}.distinct().cache()

val totalUndirectedEdges = canonicalUndirectedEdges.count()

val verticesRDD: RDD[(VertexId, String)] = canonicalUndirectedEdges.flatMap { case (u, v) =>
  Iterator((u, s"Researcher-$u"), (v, s"Researcher-$v"))
}.distinct()

val totalVertices = verticesRDD.count()

println(s"  * Parsed edge records: $totalRawRecords")
println(s"  * Self-loops eliminated: $selfLoopsCount")
println(s"  * Unique undirected edges: $totalUndirectedEdges")
println(s"  * Total unique vertices: $totalVertices")

val graphEdges: RDD[Edge[Int]] = canonicalUndirectedEdges.flatMap { case (u, v) =>
  Iterator(Edge(u, v, 1), Edge(v, u, 1))
}

val graph: Graph[String, Int] = Graph(verticesRDD, graphEdges).cache()

// REQUIREMENT 2: Calculate degree centrality for every researcher
println("\n[Req 2] Calculating degree centrality...")
val degreesRDD = graph.inDegrees
val fullDegreesRDD = verticesRDD.leftOuterJoin(degreesRDD).map { case (id, (_, degOpt)) =>
  (id, degOpt.getOrElse(0))
}.cache()

val rankedByDegree = fullDegreesRDD.sortBy(_._2, ascending = false).zipWithIndex().map {
  case ((id, degree), zeroBasedRank) => (id, degree, zeroBasedRank + 1)
}.cache()

val maxDegree = rankedByDegree.first()._2
val avgDegree = rankedByDegree.map(_._2.toDouble).sum() / totalVertices
println(f"  * Highest Degree Centrality: $maxDegree")
println(f"  * Average Degree Centrality: $avgDegree%.2f")

// REQUIREMENT 3: Top researchers
println("\n[Req 3] Extracting top researchers by degree...")
val top50Researchers = rankedByDegree.take(50)
top50Researchers.take(5).foreach { case (id, deg, rank) =>
  println(f"    Rank $rank%2d: Researcher $id%6d ($deg%3d collaborators)")
}

// REQUIREMENT 4: Connected Components
println("\n[Req 4] Calculating connected components (WCC)...")
import org.apache.spark.graphx.lib._

val ccGraph = graph.connectedComponents()
val ccVertices = ccGraph.vertices.cache()

val componentSizesRDD: RDD[(VertexId, Long)] = ccVertices.map { case (_, compId) => (compId, 1L) }
  .reduceByKey(_ + _)
  .sortBy(_._2, ascending = false)
  .cache()

val totalComponents = componentSizesRDD.count()
val firstComp: (VertexId, Long) = componentSizesRDD.first()
val largestCompId: VertexId = firstComp._1
val largestCompSize: Long = firstComp._2
val largestFraction: Double = (largestCompSize.toDouble / totalVertices.toDouble) * 100.0

println(s"  * Total components: $totalComponents")
println(f"  * Largest component ID: $largestCompId with $largestCompSize vertices ($largestFraction%.2f%%)")

val compSizeMap = sc.broadcast(componentSizesRDD.collectAsMap())
val vertexComponentInfo = ccVertices.map { case (id, compId) =>
  val size = compSizeMap.value.getOrElse(compId, 1L)
  val isLargest = compId == largestCompId
  (id, compId, size, isLargest)
}.cache()

// REQUIREMENT 5: PageRank
println("\n[Req 5] Computing PageRank (tol = 0.0001, resetProb = 0.15)...")
val prGraph = graph.pageRank(0.0001, 0.15)
val prRDD = prGraph.vertices.cache()

val rankedByPR = prRDD.sortBy(_._2, ascending = false).zipWithIndex().map {
  case ((id, pr), zeroBasedRank) => (id, pr, zeroBasedRank + 1)
}.cache()

val maxPR = rankedByPR.first()._2
val minPR = rankedByPR.map(_._2).min()
println(f"  * Highest PageRank: $maxPR%.4f")
println(f"  * Lowest PageRank: $minPR%.4f")

val degreeMap = rankedByDegree.map { case (id, deg, degRank) => (id, (deg, degRank)) }
val prMap = rankedByPR.map { case (id, pr, prRank) => (id, (pr, prRank)) }

val comparisonRDD = degreeMap.join(prMap).map { case (id, ((deg, degRank), (pr, prRank))) =>
  val rankDelta = degRank - prRank
  val category = if (rankDelta > 150) "High Prestige Bridge (PR >> Degree)"
                 else if (rankDelta < -150) "Local Dense Cluster (Degree >> PR)"
                 else "Balanced Centrality"
  (id, deg, degRank, pr, prRank, rankDelta, category)
}.cache()

// REQUIREMENT 6: Export CSV & JSON files
println("\n[Req 6] Exporting results to CSV and JSON...")

// 1. degree_centrality.csv
val pwDeg = new PrintWriter(new File(s"$outputDir/degree_centrality.csv"))
pwDeg.println("researcher_id,degree,degree_rank")
rankedByDegree.collect().foreach { case (id, deg, rank) =>
  pwDeg.println(s"$id,$deg,$rank")
}
pwDeg.close()

// 2. pagerank.csv
val pwPR = new PrintWriter(new File(s"$outputDir/pagerank.csv"))
pwPR.println("researcher_id,pagerank,pagerank_rank")
rankedByPR.collect().foreach { case (id, pr, rank) =>
  pwPR.println(f"$id,$pr%.6f,$rank")
}
pwPR.close()

// 3. connected_components.csv
val pwCC = new PrintWriter(new File(s"$outputDir/connected_components.csv"))
pwCC.println("researcher_id,component_id,component_size,is_largest_component")
vertexComponentInfo.collect().foreach { case (id, compId, size, isLargest) =>
  pwCC.println(s"$id,$compId,$size,$isLargest")
}
pwCC.close()

// 4. centrality_comparison.csv
val pwComp = new PrintWriter(new File(s"$outputDir/centrality_comparison.csv"))
pwComp.println("researcher_id,degree,degree_rank,pagerank,pagerank_rank,rank_delta,category")
comparisonRDD.sortBy(_._3).collect().foreach { case (id, deg, degRank, pr, prRank, delta, cat) =>
  pwComp.println(f"$id,$deg,$degRank,$pr%.6f,$prRank,$delta,$cat")
}
pwComp.close()

// 5. top_researchers.csv
val topMap = comparisonRDD.map(c => (c._1, c)).collectAsMap()
val compMap = vertexComponentInfo.map(v => (v._1, v._2)).collectAsMap()

val pwTop = new PrintWriter(new File(s"$outputDir/top_researchers.csv"))
pwTop.println("rank,researcher_id,degree,pagerank,pagerank_rank,component_id")
top50Researchers.foreach { case (id, deg, rank) =>
  val compInfo = topMap.get(id)
  val prVal = compInfo.map(_._4).getOrElse(0.0)
  val prRank = compInfo.map(_._5).getOrElse(0L)
  val compId = compMap.getOrElse(id, 0L)
  pwTop.println(f"$rank,$id,$deg,$prVal%.6f,$prRank,$compId")
}
pwTop.close()

// 6. network_summary.json
val summaryJson =
  s"""{
     |  "total_vertices": $totalVertices,
     |  "total_undirected_edges": $totalUndirectedEdges,
     |  "total_connected_components": $totalComponents,
     |  "largest_component_vertices": $largestCompSize,
     |  "largest_component_fraction": $largestFraction,
     |  "max_degree": $maxDegree,
     |  "avg_degree": $avgDegree,
     |  "max_pagerank": $maxPR,
     |  "min_pagerank": $minPR,
     |  "self_loops_filtered": $selfLoopsCount,
     |  "directed_input_lines": $totalRawRecords,
     |  "dataset": "SNAP ca-GrQc General Relativity & Quantum Cosmology"
     |}""".stripMargin

val pwSum = new PrintWriter(new File(s"$outputDir/network_summary.json"))
pwSum.println(summaryJson)
pwSum.close()

// 7. Graph Sample for Cytoscape (Top 50 hubs and their 1-hop neighborhood)
val topHubIds = top50Researchers.take(45).map(_._1).toSet
val broadcastHubs = sc.broadcast(topHubIds)

val sampleEdges = canonicalUndirectedEdges.filter { case (u, v) =>
  broadcastHubs.value.contains(u) || broadcastHubs.value.contains(v)
}.take(900)

val sampleNodeIds = sampleEdges.flatMap(e => Seq(e._1, e._2)).distinct.toSet
val topHubLookup = topMap

val nodesJsonList = sampleNodeIds.map { id =>
  val dataOpt = topHubLookup.get(id)
  val deg = dataOpt.map(_._2).getOrElse(1)
  val pr = dataOpt.map(_._4).getOrElse(0.15)
  val compId = compMap.getOrElse(id, largestCompId)
  val isHub = topHubIds.contains(id)
  s"""    {"data": {"id": "$id", "label": "$id", "degree": $deg, "pagerank": $pr, "component": $compId, "isHub": $isHub}}"""
}.mkString(",\n")

val edgesJsonList = sampleEdges.zipWithIndex.map { case ((u, v), idx) =>
  s"""    {"data": {"id": "e$idx", "source": "$u", "target": "$v"}}"""
}.mkString(",\n")

val graphJson =
  s"""{
     |  "elements": {
     |    "nodes": [
     |$nodesJsonList
     |    ],
     |    "edges": [
     |$edgesJsonList
     |    ]
     |  }
     |}""".stripMargin

val pwGraph = new PrintWriter(new File(s"$outputDir/graph_sample.json"))
pwGraph.println(graphJson)
pwGraph.close()

println("\n[SUCCESS] GraphX pipeline completed. All outputs written to data/processed/")
System.exit(0)
