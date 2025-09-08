// _data/recipes.ts

// Define interfaces based on the actual Prismic API response structure
// For spans, we can define a basic structure or use unknown[] if the content is complex/variable
// Using Record<string, unknown> is slightly better than any for object structures
interface PrismicSpan {
  // Example properties found in Prismic spans (adjust as needed)
  start: number;
  end: number;
  type: string; // e.g., 'strong', 'em', 'hyperlink'
  // For hyperlink spans, there might be a 'data' property
  data?: Record<string, unknown>; // More specific if you know the structure
}

export interface PrismicStructuredTextContent {
  type: string; // e.g., 'heading2', 'paragraph', 'preformatted'
  text: string;
  spans: PrismicSpan[]; // Changed from any[]
  direction?: string; // e.g., 'ltr'
  // Add other potential properties if they exist in your content
}

export interface PrismicImageField {
  dimensions: { width: number; height: number };
  alt: string | null;
  copyright: string | null;
  url: string; // Note: Might have leading/trailing whitespace
  id?: string;
  edit?: { x: number; y: number; zoom: number; background: string };
  // ... other potential image properties
}

// Define types for the parts of the API response we don't fully define but know exist
// Using Record<string, unknown> or specific interfaces if you have examples
type PrismicRef = Record<string, unknown>; // Or a more specific interface if you have the structure
type PrismicLinkedDocument = Record<string, unknown>; // Or a more specific interface
type PrismicAlternateLanguage = Record<string, unknown>; // Or a more specific interface

export interface PrismicRecipe {
  id: string;
  uid: string | null;
  type: string;
  href: string;
  tags: string[];
  first_publication_date: string; // ISO date string
  last_publication_date: string; // ISO date string
  slugs: string[];
  linked_documents: PrismicLinkedDocument[]; // Changed from any[]
  lang: string; // e.g., 'en-gb'
  alternate_languages: PrismicAlternateLanguage[]; // Changed from any[]
  data: {
    title: PrismicStructuredTextContent[]; // Array of content blocks
    "recipe-illustration": PrismicImageField | null;
    text: PrismicStructuredTextContent[]; // Array of content blocks
    // Add other fields as needed
  };
}

// Define the simplified data structure for Lume templates
export interface RecipeData {
  id: string;
  uid: string | null;
  slug: string;
  title: string; // Extracted plain text
  text: string; // Extracted plain text
  image: { url: string; alt: string | null } | null; // Simplified image object
  blocks: PrismicStructuredTextContent[]; // Expose all blocks for template rendering
}

export default async function (): Promise<RecipeData[]> {
  console.log("Fetching data from Prismic..."); // Debug log
  // Remove trailing spaces from the endpoint URL
  const prismicEndpoint = "https://repolo.cdn.prismic.io/api/v2";

  try {
    // 1. Get the API endpoint and master ref
    const apiResponse = await fetch(prismicEndpoint);
    if (!apiResponse.ok) {
      throw new Error(`Failed to fetch Prismic API: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    const apiData = await apiResponse.json();
    // Provide a type hint for apiData or its refs property if possible, or be specific in find
    const masterRef = (apiData as { refs: PrismicRef[] }).refs.find((ref: PrismicRef) => ref.id === "master")?.ref;
    if (!masterRef) {
      throw new Error("Master ref not found in Prismic API response");
    }

    // 2. Fetch the recipe documents
    const documentsUrl = `https://repolo.cdn.prismic.io/api/v2/documents/search?ref=${masterRef}&q=[[at(document.type, "recipe")]]&lang=*`;

    const docsResponse = await fetch(documentsUrl);
    if (!docsResponse.ok) {
      throw new Error(`Failed to fetch Prismic documents: ${docsResponse.status} ${docsResponse.statusText}`);
    }
    const docsData = await docsResponse.json();

    // 3. Process the fetched documents
    // Provide a type hint for docsData or its results property
    const recipes: RecipeData[] = (docsData as { results: PrismicRecipe[] }).results.map((doc: PrismicRecipe) => {
      // --- Extract Title ---
      let title = "Untitled Recipe";
      if (doc.data.title && Array.isArray(doc.data.title) && doc.data.title.length > 0) {
        title = doc.data.title[0].text || title;
      }

      // --- Extract Text ---
      let text = "";
      if (doc.data.text && Array.isArray(doc.data.text) && doc.data.text.length > 0) {
        text = doc.data.text[0].text || text;
      }

      // --- Extract Image ---
      let imageData = null;
      const imageField = doc.data["recipe-illustration"];
      if (imageField) {
        const imageUrl = imageField.url ? imageField.url.trim() : "";
        if (imageUrl) {
          imageData = {
            url: imageUrl,
            alt: imageField.alt
          };
        }
      }

      // --- Expose all blocks for template rendering ---
      const blocks = Array.isArray(doc.data.text) ? doc.data.text : [];

      return {
        id: doc.id,
        uid: doc.uid,
        slug: doc.slugs && doc.slugs.length > 0 ? doc.slugs[0] : (doc.uid ? doc.uid : doc.id),
        title: title,
        text: text,
        image: imageData,
        blocks: blocks
      };
    });

    console.log(`Fetched and processed ${recipes.length} recipes from Prismic.`);
    if (recipes.length > 0) {
      console.log("Sample processed recipe:", recipes[0]);
    } else {
      console.log("No recipes found in Prismic response.");
    }
    return recipes;

  } catch (error) {
    console.error("Error fetching or processing recipes from Prismic:", error);
    // Returning an empty array in case of error is a common pattern
    return [];
  }
}