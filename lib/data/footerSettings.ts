import { enhancedStorage } from "@/lib/database/persistenceAPI";

const STORAGE_KEY = "footer_settings";

/** Server-side read of footer settings (same source as /api/admin/footer), for SSR. */
export async function getFooterSettings(): Promise<any | null> {
  try {
    if (!enhancedStorage) return null;
    return await enhancedStorage.readData(STORAGE_KEY, null);
  } catch {
    return null;
  }
}
