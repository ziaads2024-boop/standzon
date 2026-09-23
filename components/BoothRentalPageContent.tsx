import ServiceDetailPage from "@/components/ServiceDetailPage";
import { boothRentalContent } from "@/lib/data/servicePagesContent";
import { getServerPageContent } from "@/lib/data/serverPageContent";

export default async function BoothRentalPageContent() {
  const saved = await getServerPageContent(boothRentalContent.cmsPath.replace(/^\//, ""));
  return <ServiceDetailPage content={boothRentalContent} initialSaved={saved} />;
}
