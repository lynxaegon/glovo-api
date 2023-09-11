# Glovo Customer API

An unofficial reversed engineered Glovo Client API

## Installation
```javascript
npm install @lynxaegon/glovo-api
```

### How to obtain access token
1. Go to: https://glovoapp.com/en
2. Login
3. Open developer tools
4. Refresh page
5. Search for XHR request **refresh**
6. Copy **refreshToken** from _request payload_

### API / Examples

#### constructor
```javascript
const GlovoAPI = require("glovo-api");
/** 
    ./tokens.json -> where to save the tokens file
    refresh token is required to be present, login is not implemented!
    tokens.json format:
    {
      "accessToken": false,
      "refreshToken": ___REFRESH_TOKEN_HERE___,
      "expiresAt": false
    }
**/
const glovo = new GlovoAPI("./tokens.json");
```


#### getLatLngFromAddress
```javascript
const GlovoAPI = require("glovo-api");
const glovo = new GlovoAPI("./tokens.json");

glovo.getLatLngFromAddress("Bucharest", "Bulevardul Unirii 1").then((result) => {
    console.log(result.lat, result.lng);
}).catch(console.error);
```

#### getStore
```javascript
const GlovoAPI = require("glovo-api");
const glovo = new GlovoAPI("./tokens.json");

glovo.getLatLngFromAddress("Bucharest", "Bulevardul Unirii 1").then((result) => {
    glovo.setLocation(result);
    // order.id
    glovo.getStore(39537)
        .then(console.log)
        .catch(console.error);
}).catch(console.error);
```
#### getStores
```javascript
const GlovoAPI = require("glovo-api");
const glovo = new GlovoAPI("./tokens.json");

glovo.getLatLngFromAddress("Bucharest", "Bulevardul Unirii 1").then((result) => {
    glovo.setLocation(result);
    glovo.getStores()
        .then(console.log)
        .catch(console.error);
}).catch(console.error);
```

#### getOrders
```javascript
const GlovoAPI = require("glovo-api");
const glovo = new GlovoAPI("./tokens.json");

glovo.getLatLngFromAddress("Bucharest", "Bulevardul Unirii 1").then((result) => {
    glovo.setLocation(result);
    // returns last 12 orders in desceding order (first element is the last order)
    glovo.getOrders()
        .then(console.log)
        .catch(console.error);
}).catch(console.error);
```

#### getOrderDetails
```javascript
const GlovoAPI = require("glovo-api");
const glovo = new GlovoAPI("./tokens.json");

glovo.getLatLngFromAddress("Bucharest", "Bulevardul Unirii 1").then((result) => {
    glovo.setLocation(result);
    glovo.getOrders()
        .then((orders) => {
            // get last order details
            // urn format: glv:order:69624914-5b79-45e8-b7e6-5f5afc9d6bcf
            glovo.getOrderDetails(orders[0].urn)
                .then(console.log)
                .catch(console.error);
        }))
        .catch(console.error);
}).catch(console.error);
```

#### trackOrder
```javascript
const GlovoAPI = require("glovo-api");
const glovo = new GlovoAPI("./tokens.json");

glovo.getLatLngFromAddress("Bucharest", "Bulevardul Unirii 1").then((result) => {
    glovo.setLocation(result);
    // order.id
    glovo.trackOrder(12345)
        .then(console.log)
        .catch(console.error);
}).catch(console.error);
```

##### More in **examples.js**

## License
MIT
