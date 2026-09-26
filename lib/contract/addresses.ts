export const contractAddresses = {
  tasks: process.env.NEXT_PUBLIC_GLYPHWORK_TASKS_ADDRESS ?? "",
  vault: process.env.NEXT_PUBLIC_GLYPHWORK_VAULT_ADDRESS ?? "",
};

export function hasDeployedContracts() {
  return Boolean(contractAddresses.tasks && contractAddresses.vault);
}

