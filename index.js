import express from "express";
import cluster from "cluster";
import os from "os";

const cpuCount = os.availableParallelism();
const port = 3000;

// Flow 1 : Program starts
// Check if worker or master process
if (cluster.isPrimary) {
  console.log("Master process started");
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
    console.log(`Worker ${i} started`);
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.id} exited with code ${code} and signal ${signal}`,
    );
    cluster.fork();
    console.log(`Worker ${worker.id} restarted`);
  });
} else if (cluster.isWorker) {
  const app = express();

  app.get("/", (req, res) => {
    res.send(`Hello World by ${cluster.worker.id}`);
    console.log(`Worker ${cluster.worker.id} received request`);
  });

  app.get("/crash", (req, res) => {
    res.send(`Worker ${cluster.worker.id} crashed`);

    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  app.listen(port, () => {
    console.log(
      `Server running at http://localhost:${port} with ${cpuCount} workers`,
    );
  });

  cluster.on("exit", (worker) => {});
}
