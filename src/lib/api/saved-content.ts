import { searchQuotes } from "./quotes";
import { searchScripture } from "./scripture";

export interface SearchParams {
  query: string;
  type?: "quote" | "scripture" | "all";
  faith?: "Christianity" | "Islam";
  author?: string;
  lengths?: ("short" | "medium" | "long")[];
  limit?: number;
}

export interface UnifiedSearchResult {
  id: string;
  type: "quote" | "scripture";
  content: string;
  citation: string;
  source: string;
  length: "short" | "medium" | "long";
  metadata?: {
    book?: string;
    reference?: string;
    faith?: string;
  };
}

function calculateLength(text: string): "short" | "medium" | "long" {
  if (text.length <= 100) return "short";
  if (text.length <= 200) return "medium";
  return "long";
}

/**
 * Unified search function for quotes and scripture
 * Searches across multiple sources based on parameters
 */
export async function searchContent(
  params: SearchParams
): Promise<UnifiedSearchResult[]> {
  const results: UnifiedSearchResult[] = [];
  
  // Search for quotes
  if (params.type === "quote" || params.type === "all") {
    const quotes = await searchQuotes({
      keyword: params.query,
      author: params.author,
      lengths: params.lengths,
    });
    
    results.push(
      ...quotes.map((q) => ({
        id: crypto.randomUUID(),
        type: "quote" as const,
        content: q.quote,
        citation: q.author,
        source: q.source,
        length: calculateLength(q.quote),
      }))
    );
  }
  
  // Search for scripture
  if ((params.type === "scripture" || params.type === "all") && params.faith) {
    const scripture = await searchScripture({
      keyword: params.query,
      ref: "",
      faith: params.faith,
      limit: params.limit || 50,
    });
    
    results.push(
      ...scripture.map((s) => ({
        id: s.id,
        type: "scripture" as const,
        content: s.text,
        citation: s.ref,
        source: params.faith === "Christianity" ? "Bible" : "Quran",
        length: calculateLength(s.text),
        metadata: {
          book: s.book,
          reference: s.ref,
          faith: params.faith,
        },
      }))
    );
  }
  
  return results;
}
