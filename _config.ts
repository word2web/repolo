import lume from "lume/mod.ts";
import decapCMS from "lume/plugins/decap_cms.ts";

const site = lume();

site.use(decapCMS(/* Options */));

export default site;