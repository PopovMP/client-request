# Client-request

A simple client request library for node.js.

It parses the body according to the content type.

### GET request

`async function requestGet(url, headers)`

```javascript
const url     = "https://httpbin.org/get?foo=bar";
const headers = {"Accept": "application/json"};

const res = await requestGet(url, headers);
```

### POST request

`async function requestPost(url, data, headers)`

```javascript
const url     = "https://httpbin.org/post?foo=bar";
const body    = "Hello, World!";
const headers = {"Content-Type": "text/plain"};

const res  = await requestPost(url, body, headers);
```

### PUT Request

`async function requestPut(url, data, headers)`

Same as POST request.

### POST Json request

`async function requestJson(url, data, headers)`

```javascript
const url     = "https://httpbin.org/post?foo=bar";
const json    = {number: 42, text: "foo", list: [1, 2], object: {bar: "baz"}};
const headers = {Client: "request-service"};

const res  = await requestJson(url, json, headers);
```

### POST form URL encoded request

`async function requestForm(url, formData, headers)`

```javascript
const url     = "https://httpbin.org/post?foo=bar";
const form    = {number: 42, text: "foo", list: [1, 2]};
const headers = {Client: "request-service"};

const res  = await requestForm(url, form, headers);
```
