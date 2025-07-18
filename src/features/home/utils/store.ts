import { getDictionary } from "@/lib/dictionaries";
import { PostPreview } from "@/lib/posts";

// Types for our server-side store
interface ServerStoreData {
  lang: string;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  latestPosts?: PostPreview[];
}

/**
 * Server-side store for managing page data
 * This provides a centralized way to access and cache data for server components
 */
class ServerStore {
  private data: ServerStoreData | null = null;

  /**
   * Initialize the store with language and dictionary
   */
  async initialize(lang: string): Promise<void> {
    if (!this.data || this.data.lang !== lang) {
      const dict = await getDictionary(lang);
      this.data = { lang, dict };
    }
  }

  /**
   * Get the current store data
   */
  getData(): ServerStoreData | null {
    return this.data;
  }

  /**
   * Get the dictionary
   */
  getDictionary() {
    return this.data?.dict;
  }

  /**
   * Get the language
   */
  getLanguage(): string | undefined {
    return this.data?.lang;
  }

  /**
   * Set additional data (like latest posts)
   */
  setData(data: Partial<ServerStoreData>): void {
    if (this.data) {
      this.data = { ...this.data, ...data };
    }
  }

  /**
   * Clear the store
   */
  clear(): void {
    this.data = null;
  }

  /**
   * Check if store is initialized
   */
  isInitialized(): boolean {
    return this.data !== null;
  }
}

// Export the singleton instance
export const serverStore = new ServerStore();

// Convenience functions that use the store
export const initializeStore = (lang: string) => serverStore.initialize(lang);
export const getStoreData = () => serverStore.getData();
export const getStoreDictionary = () => serverStore.getDictionary();
export const getStoreLanguage = () => serverStore.getLanguage();
export const setStoreData = (data: Partial<ServerStoreData>) =>
  serverStore.setData(data);
export const clearStore = () => serverStore.clear();
