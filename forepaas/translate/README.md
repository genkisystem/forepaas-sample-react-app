# Translate

## Concept
The module translate allows you to use the i18n of your config file.
It will get the key of the i18n and return it depending of the current
language of the application

### Usage
You can pass an Array or an object as options to the translate function
```js
// Config global.json
{
  "i18n": {
    "fr": {
      "application.title": "Titre français : {0}-{1}"
    },
    "en": {
      "application.title": "English title : {0}-{1}"
    }
  }
}
// Code
  import FpTranslate from 'forepaas/translate'

  let title = FpTranslate('application.title', ['Foo', 'Bar'])
  // title = 'Titre français : Foo-Bar' || 'English title : Foo-Bar'

  let keyNotDefined = FpTranslate('application.keyNotDefined', {default: 'Undefined key'})
  // keyNotDefined = 'Undefined key'
```
