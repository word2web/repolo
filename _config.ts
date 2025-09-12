import lume from "lume/mod.ts";
import decapCMS from "lume/plugins/decap_cms.ts";
import plugins from "./plugins.ts";


const site = lume({
  src: "./src",
});


site.use(decapCMS(/* Options */));
site.use(plugins());


export default site;