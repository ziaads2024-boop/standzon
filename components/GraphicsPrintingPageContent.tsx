import ServiceDetailPage from "@/components/ServiceDetailPage";
import { graphicsPrintingContent } from "@/lib/data/servicePagesContent";
import { getServerPageContent } from "@/lib/data/serverPageContent";

export default async function GraphicsPrintingPageContent() {
  const saved = await getServerPageContent(graphicsPrintingContent.cmsPath.replace(/^\//, ""));
  return <ServiceDetailPage content={graphicsPrintingContent} initialSaved={saved} />;
}
