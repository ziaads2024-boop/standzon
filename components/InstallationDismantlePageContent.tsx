import ServiceDetailPage from "@/components/ServiceDetailPage";
import { installationDismantleContent } from "@/lib/data/servicePagesContent";
import { getServerPageContent } from "@/lib/data/serverPageContent";

export default async function InstallationDismantlePageContent() {
  const saved = await getServerPageContent(installationDismantleContent.cmsPath.replace(/^\//, ""));
  return <ServiceDetailPage content={installationDismantleContent} initialSaved={saved} />;
}
