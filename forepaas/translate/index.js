import FpSdk from 'forepaas/sdk'

/**
 * Parse the string and replace {n} by args[n]
 * n behing the index of args
 * @param {String} key Value of the translate key
 * @param {Array} args Array of value to replace {n} by
 * @return {String} Value trasnlated with args
 */
function parseString (key, args) {
  let found = key.replace(/\{([0-9])\}/gmi, (match) => {
    match = match.replace(/({|})/gmi, '')
    return translate(args[match])
  })
  return found
}

/**
 * Translate a key and returns the key value of your i18n config
 * depending of the lang the user choosed
 * @param {String} word The key to be translated
 * @param {Object|Array} [options] Can pass arguments to the trad value
 * @param {String} [lang] Force the lang returned
 * @return {String} Word trasnlated
 */
function translate (word, options, lang) {
  let i18n = FpSdk.config.i18n
  if (!lang) {
    if (
      FpSdk.modules.store &&
      FpSdk.modules.store.getState &&
      FpSdk.modules.store.getState().local &&
      FpSdk.modules.store.getState().local.lang
    ) {
      lang = FpSdk.modules.store.getState().local.lang
    } else {
      lang = FpSdk.config.lang || Object.keys(i18n)[0]
    }
    if (!i18n[lang] || !lang) {
      lang = Object.keys(i18n)[0]
    }
  }
  if (
    options &&
      typeof options.i18n === 'object' &&
      options.i18n[lang] &&
      (typeof options.i18n[lang][word] !== 'undefined' || typeof options.i18n[lang][options.default] !== 'undefined')
  ) {
    i18n = options.i18n
  }
  let translate = i18n[lang][word]
  if (typeof translate === 'undefined') {
    if (options && typeof options.default !== 'undefined') {
      translate = i18n[lang][options.default] || options.default
    } else {
      translate = word
    }
  }
  if (Array.isArray(options)) {
    translate = parseString(translate, options)
  }
  return translate
}

export default translate
