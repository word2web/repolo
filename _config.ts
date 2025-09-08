import lume from "lume/mod.ts";
import decap_cms from "lume/plugins/decap_cms.ts"; // Note the underscore

const site = lume();

site.use(decap_cms(/* Options */));

export default site;