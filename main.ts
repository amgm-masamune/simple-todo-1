import { createDependencies } from "./composition-root/CompositionRoot.ts";
import { CliTaskController } from "./feature/Task/controller/CliTaskController.ts";

function main() {
  const { taskService } = createDependencies("in-memory");
  const controller = new CliTaskController(taskService);

  controller.main();
}

main();
