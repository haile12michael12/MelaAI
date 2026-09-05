export class AutomationEngine {
  async execute(workflowId: string) {
    return { workflowId, status: "success" };
  }
}
