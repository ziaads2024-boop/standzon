import HomeV2 from "@/components/home-v2/HomeV2";

export default function ServerHomePageContent() {
  return (
    <div className="page-container homepage-container">
      <main className="main-content">
        <HomeV2 />
      </main>
      {/* Footer is handled by ServerGlobalLayoutProvider */}
    </div>
  );
}
