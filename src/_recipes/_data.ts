// src/_recipes/_data.ts
// Import the function that fetches recipes from Prismic
// Adjust the relative path as needed. '../..' goes up from src/_recipes/ to the project root
import getRecipes from "../../_data/recipes.ts";

// Export the data directly. Lume will iterate over this array
// to generate pages using _recipes/index.vto
export default async function() {
  console.log("Fetching recipes for individual pages...");
  const recipesData = await getRecipes();
  console.log(`Fetched ${recipesData.length} recipes for individual page generation.`);
  // The returned array is what Lume iterates over
  return recipesData;
}