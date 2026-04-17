import { createDependencies } from "./composition-root/CompositionRoot.ts";
import { CliTaskController } from "./feature/Task/handler/CliTaskController.ts";

function main() {
  const { createTaskUseCase, updateTaskUseCase, searchActiveTasksUseCase } = createDependencies("in-memory");
  const controller = new CliTaskController(createTaskUseCase, updateTaskUseCase, searchActiveTasksUseCase);

  controller.main();
}

main();
