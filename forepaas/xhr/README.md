# Xhr

## Concept
The module xhr allows you to make request your application's services (authentication, api)

### Usage
```js
  let xhr = new FpXhr()
  let options = {
    url: '/example/url',
    method: 'POST',
    data: {
      foo: 'bar'
    }
  }
  xhr.request(options)
    .then(response => console.info(response.data))
    .catch(err => console.error(err))
```

## Request options
These are the available config options for making requests. Only the `url` is required. Requests will default to `GET` if `method` is not specified.

```js
{
  // `url` is the server URL that will be used for the request
  url: '/user',

  // `method` is the request method to be used when making the request
  method: 'get', // default

  // `baseURL` will be prepended to `url` unless `url` is absolute.
  // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
  // to methods of that instance.
  baseURL: 'https://hq.forepaas.io/dataplant/api',

  // `headers` are custom headers to be sent
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // `queryString` are the URL parameters to be sent with the request
  // Must be a plain object or a URLSearchParams object
  queryString: {
    ID: 12345
  },
  // `data` is the data to be sent as the request body
  // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
  // When no `transformRequest` is set, must be of one of the following types:
  // - string, plain object, ArrayBuffer, ArrayBufferView
  data: {
    firstName: 'Fred'
  },
}
```

## Request methods

##### xhr.request(options)
##### xhr.get(options)
##### xhr.delete(options)
##### xhr.post(options)
##### xhr.put(options)
##### xhr.patch(options)

## Response Schema
The response for a request contains the following information.
```js
{
  // `data` is the response that was provided by the server
  data: {},
  // `status` is the HTTP status code from the server response
  status: 200,
  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',
  // `headers` the headers that the server responded with
  headers: {},
  // `config` is the config that was provided to `axios` for the request
  config: {},
  // `request` is the request that generated this response
  request: {}
}
```

## Interceptors

You can intercept requests or responses or error before they are handled by `then` or `catch`.

```js
  import FpXhr from 'forepaas/xhr'

  let interceptor = {
    onResponse (options, response) {
      return new Promise((resolve, reject) => {
        response.data.foo = 'bar'
        resolve(response)
      })
    },
    onRequest (request) {
      return new Promise((resolve, reject) => {
        request.queryString.foo = 'bar'
        resolve(request)
      })
    },
    onError (options, error) {
      return new Promise((resolve, reject) => {
        error.bar = 'foo'
        reject(error)
      })
    }
  }

  FpXhr.interceptors.push(interceptor)
```