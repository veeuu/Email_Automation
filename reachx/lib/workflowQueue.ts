import { Queue } from "bullmq";
import { connection } from "./queue";

export const workflowQueue = new Queue("workflow-process", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});
