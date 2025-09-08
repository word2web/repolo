import getRecipes from "../_data/recipes.ts";

export default async function () {
  const recipes = await getRecipes();
  return recipes.map((recipe) => ({
    url: `/recipes/${recipe.slug}/`,
    layout: "recipe.vto",
    title: recipe.title,
    recipe,
  }));
}