export async function handleMelaAction(actionName: string, params: Record<string, unknown>) {
  return { actionName, params, success: true };
}
