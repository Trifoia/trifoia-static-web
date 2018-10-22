/**
 * Options passed to pug when rendering
 * 
 * NOTE: The following options are reserved, and WILL be overwritten when processing
 * - style
 * - filename
 */
module.exports = {
  // The name of the file being compiled. Used in exceptions, and required for relative include\s and extend\s.
  // Defaults to 'Pug'.
  // filename: RESERVED,

  // The root directory of all absolute inclusion.
  // basedir: string,

  // If the doctype is not specified as part of the template, you can specify it here. It is sometimes useful to get
  // self-closing tags and remove mirroring of boolean attributes. See doctype documentation for more information.
  // doctype: string,

  // [Deprecated.] Adds whitespace to the resulting HTML to make it easier for a human to read using '  ' as
  // indentation. If a string is specified, that will be used as indentation instead (e.g. '\t'). We strongly recommend
  // against using this option. Too often, it creates subtle bugs in your templates because of the way it alters the
  // interpretation and rendering of whitespace, and so this feature is going to be removed. Defaults to false.
  // pretty: boolean | string,

  // Hash table of custom filters. Defaults to undefined.
  // filters: object,

  // Use a self namespace to hold the locals. It will speed up the compilation, but instead of writing variable you will
  // have to write self.variable to access a property of the locals object. Defaults to false.
  // self: boolean,

  // If set to true, the tokens and function body are logged to stdout.
  // debug: boolean,

  // If set to true, the function source will be included in the compiled template for better error messages (sometimes
  // useful in development). It is enabled by default, unless used with Express in production mode.
  // compileDebug: boolean,

  // Add a list of global names to make accessible in templates.
  // globals: string[],

  // If set to true, compiled functions are cached. filename must be set as the cache key. Only applies to render
  // functions. Defaults to false.
  // cache: boolean,

  // Inline runtime functions instead of require-ing them from a shared version. For compileClient functions, the
  // default is true (so that one does not have to include the runtime). For all other compilation or rendering types,
  // the default is false.
  // inlineRuntimeFunctions: boolean,

  // The name of the template function. Only applies to compileClient functions. Defaults to 'template'.
  // name: string,
};
