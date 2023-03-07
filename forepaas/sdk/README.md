# SDK

## Concept
The sdk is a mendatory module for the app.
It will import all modules from the forepaas.json => FpSdk.modules. And your configuration from the application config/global.json => FpSdk.config

For the configuration you can store it all in your global.json or cut by file. The usage of environments variable is also possible. Exemple :

```js
// config/global.json
{
  "application_name": "{{ENV.APP_NAME || 'ForePaaS'}}",
  "debug": "{{ENV.DEBUG}}",
  "loader": "spinner",
  "animation": "slide",
  "dashboarding": "file://config/dashboards.json"
}

// config/dashboard.json
{
  "/": {},
  "/example": {}
}
```

## Utilisation

To launch the SDK, you only have to copy this code to the index.js(x) file located in the src folder
```js
import React from 'react'
import {render} from 'react-dom'
import FpSdk from 'forepaas/sdk'

FpSdk.start()
  .then(() => {
    var FpAppTemplate = FpSdk.modules.sdk.templates.default
    render(<FpAppTemplate />, document.getElementById('root'))
  })
```

## Template

Template are an essential part of the ForePaaS's SDK.
This is why we let you the possibility to configure your own template for your app (you can also use our own default template).

The default template has all the functionnalies needed for your app to work: authentification (client-authority-manager),
password reset, dashboarding.

To add a template you can use this code
```js
  FpSdk.modules.sdk.templates.example = ExampleComponent
  var FpAppTemplate = FpSdk.modules.sdk.templates.example
  render(<FpAppTemplate />, document.getElementById('root'))
```

## Module

Module are also an essential part of the SDK
We will explain how to create your own module and then use it in your config/global.json

#### Création
You can put all sorts of components in the SDK
For instance you can create a React component :
```js
import React from 'react'

class Demo extends React.component {
  constructor (props) {
    super(props)
  }

  render () {
    return <h3>Un composant de Demo</h3>
  }
}

export default Demo
```

#### Intégration
There is 2 types of component in the Sdk:
  - "Classic" component
  - "Chart" component

Classic : You can name your component as you wish

Chart : You have to preceed the name of your component with 'chart-'
Now you just have to add it to the SDK :
```js
import React from 'react'
import { render } from 'react-dom'
import FpSdk from 'forepaas/sdk'

import Demo from './components/Demo'

FpSdk.start()
  .then(() => {
    var FpAppTemplate = FpSdk.modules.sdk.templates.default

    //Here an example for a classic component
    FpSdk.modules['demo-component'] = Demo

    // And here an example for a chart component
    FpSdk.modules['chart-demo-component'] = Demo

    render(<FpAppTemplate />, document.getElementById('root'))
  })
```

#### Utilisation
To use your newly added module, modify the config/global.json file.

In the dashboarding configuration, you only have to add an item with a type of your module name

Classic:

```js
{
  "type": "demo-component",
  "col": 0,
  "row": 0,
  "sizeX": 12,
  "sizeY": 12
}
```

Chart:
```js
{
  "type": "chart",
  "col": 0,
  "row": 0,
  "sizeX": 12,
  "sizeY": 12,
  "title": "<i class='fp fp-line-chart'></i> Demo Chart",
  "chart": {
    "dynamic-parameters": [],
    "component": "demo-component",
    "request": {
      "id": "Evolution du graphique de demo",
      "data": {
        "fields": {
          "demo-data": ["sum"]
        }
      },
      "scale": {
        "fields": [],
        "axis": {
          "x": [],
          "y": []
        }
      },
      "evol": {
        "scale": "demo"
      }
    },
    "options": {
    }
  }
}
```
