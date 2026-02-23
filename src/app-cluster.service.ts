import cluster from "cluster";
import * as os from "os";

const numCPUs = os.cpus().length;

export class AppClusterService {
    /**
     * @description This function will create clusters as per given worker number. If any worker stops then it will be restarted by itself.
     * @param workers Number of workers for your processes
     * @param callback Callback function will call bootstrap function to start process on different processIds
     */
    static createClusters(workers: number, callback): void {
        if (cluster.isPrimary) {
            console.log(`Master server started on ${process.pid}`);

            if (workers > numCPUs) workers = numCPUs;

            for (let i = 0; i < workers; i++) {
                cluster.fork();
            }

            cluster.on("online", function (worker) {
                console.log("Worker %s is online", worker.process.pid);
            });

            cluster.on("exit", (worker) => {
                console.log(`Worker ${worker.process.pid} died. Restarting`);
                cluster.fork();
            });
        } else {
            console.log(`Cluster server started on ${process.pid}`);
            callback();
        }
    }
}
