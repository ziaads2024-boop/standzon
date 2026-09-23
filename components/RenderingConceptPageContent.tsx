import ServiceDetailPage from "@/components/ServiceDetailPage";
import { renderingConceptContent } from "@/lib/data/servicePagesContent";
import { getServerPageContent } from "@/lib/data/serverPageContent";

export default async function RenderingConceptPageContent() {
  const saved = await getServerPageContent(renderingConceptContent.cmsPath.replace(/^\//, ""));
  return <ServiceDetailPage content={renderingConceptContent} initialSaved={saved} />;
}
