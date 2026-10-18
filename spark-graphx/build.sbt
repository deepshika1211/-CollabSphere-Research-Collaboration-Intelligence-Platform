name := "collabsphere-graphx"

version := "1.0.0"

scalaVersion := "2.12.18"

val sparkVersion = "3.5.9"

libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-core" % sparkVersion % "provided",
  "org.apache.spark" %% "spark-sql" % sparkVersion % "provided",
  "org.apache.spark" %% "spark-graphx" % sparkVersion % "provided",
  "org.scalatest" %% "scalatest" % "3.2.17" % "test"
)

// Configure assembly / packaging
assembly / assemblyMergeStrategy := {
  case PathList("META-INF", xs @ _*) => MergeStrategy.discard
  case x => MergeStrategy.first
}
