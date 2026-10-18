@echo off
echo ===================================================
echo   Running Apache Spark GraphX Analysis Pipeline
echo ===================================================
spark-shell --master "local[*]" --conf "spark.driver.memory=4g" --conf "spark.ui.enabled=false" -i scripts/run_graphx.scala
pause
