import plugins, { Options } from "./plugins.ts";

import "lume/types.ts";

export type { Options } from "./plugins.ts";

export default function (options: Partial<Options> = {}) {
  return (site: Lume.Site) => {
    // Configure the site
    site.use(plugins(options));

    // Add remote files
    const files = [
      "_includes/layouts/base.vto",
      "_includes/layouts/recipe.vto",
      "_includes/layouts/page.vto",
      "_includes/css/reset.css",
       "recipes/_data.yml",
      "pages/_data.yml",
      "_data.yml",
      "_data/i18n.yml",
      "404.md",
      "index.vto",
      "style.css",
      "favicon.png",
    ];

    for (const file of files) {
      site.remoteFile(file, import.meta.resolve(`./src/${file}`));
    }
  };
}