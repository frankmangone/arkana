import { getDictionary } from "@/lib/dictionaries";

// Base type that always includes the dictionary
interface BaseStoreData {
  dict: Awaited<ReturnType<typeof getDictionary>>;
}

// Generic server-side store for managing page data
// This provides a centralized way to access and cache data for server components
export class ServerStore<
  TData extends Record<string, unknown> = Record<string, unknown>
> {
  private data: TData & BaseStoreData = {} as TData & BaseStoreData;
  private lang: string | undefined;

  /**
   * Initialize the store with language and dictionary
   */
  async initialize(lang: string): Promise<void> {
    this.lang = lang;

    if (!this.data.dict) {
      this.data.dict = await getDictionary(this.lang);
    }
  }

  /**
   * Get a value from the store by key
   */
  get<K extends keyof (TData & BaseStoreData)>(
    key: K
  ): (TData & BaseStoreData)[K] | undefined {
    return this.data[key];
  }

  /**
   * Set a value in the store
   */
  set<K extends keyof TData>(key: K, value: TData[K]): void {
    (this.data as TData)[key] = value;
  }

  /**
   * Check if a key exists in the store
   */
  has(key: string): boolean {
    return key in this.data;
  }

  /**
   * Get the language
   */
  getLanguage(): string {
    return this.lang!;
  }

  /**
   * Get the dictionary
   */
  getDictionary(): Awaited<ReturnType<typeof getDictionary>> {
    return this.data.dict!;
  }

  /**
   * Get all store data
   */
  getAll(): TData & BaseStoreData {
    return { ...this.data };
  }

  /**
   * Clear the store (keeps dict)
   */
  clear(): void {
    const dict = this.data.dict;
    this.data = { dict } as TData & BaseStoreData;
  }

  /**
   * Check if store is initialized (has dictionary)
   */
  isInitialized(): boolean {
    return this.has("dict");
  }
}

// Convenience functions for common operations
export const createStore = <
  TData extends Record<string, unknown> = Record<string, unknown>
>() => new ServerStore<TData>();
