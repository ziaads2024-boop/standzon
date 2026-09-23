import ServiceDetailPage from "@/components/ServiceDetailPage";
import { customBoothContent } from "@/lib/data/servicePagesContent";
import { getServerPageContent } from "@/lib/data/serverPageContent";

export default async function CustomBoothPageContent() {
  const saved = await getServerPageContent(customBoothContent.cmsPath.replace(/^\//, ""));
  return <ServiceDetailPage content={customBoothContent} initialSaved={saved} />;
}
