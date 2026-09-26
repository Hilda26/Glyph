import { hasDeployedContracts } from "@/lib/contract/addresses";

export function DeploymentBanner() {
  if (hasDeployedContracts()) return null;
  return (
    <div className="border-y border-[#AD8A50]/50 bg-[#F8F0DF] px-4 py-3">
      <div className="mx-auto max-w-7xl text-sm">
        Live Studionet contract addresses are not configured. Fixture pages are labeled previews; writes activate after deployment addresses are supplied in environment variables.
      </div>
    </div>
  );
}

