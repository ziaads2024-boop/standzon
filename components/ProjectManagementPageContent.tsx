import ServiceDetailPage from "@/components/ServiceDetailPage";
import { projectManagementContent } from "@/lib/data/servicePagesContent";
import { getServerPageContent } from "@/lib/data/serverPageContent";

export default async function ProjectManagementPageContent() {
  const saved = await getServerPageContent(projectManagementContent.cmsPath.replace(/^\//, ""));
  return <ServiceDetailPage content={projectManagementContent} initialSaved={saved} />;
}
