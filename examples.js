const GlovoAPI = require("./index");

const glovo = new GlovoAPI();

/**
 * IMPORTANT: you must create the token.json in the root folder and add the refreshToken:
 {
  "accessToken": false,
  "refreshToken": ___REFRESH_TOKEN_HERE___,
  "expiresAt": false
 }
 * You can obtain the refresh token this way:
 * 1. Go to: https://glovoapp.com/en
 * 2. Login
 * 3. Open developer tools
 * 4. Refresh page
 * 5. Search for XHR request "refresh"
 * 6. Copy refreshToken from request payload
*/

// glovo.getOrders().then((result) => {
//     // last order is result[0]
//     console.log(JSON.stringify(result[0], null, 2));
// }).catch((err) => {
//     console.error("ERR", err);
// });

// glovo.trackOrder(12345).then((result) => {
//     console.log(result);
// }).catch((err) => {
//     console.error("ERR", err);
// });

// glovo.getStores({
//     lat: 46.123,
//     lng: 23.321
// }).then(result => {
//     console.log(result.filter(store => store.open));
// }).catch(console.error);

// glovo.getLatLngFromAddress("Bucharest", "Bulevardul Unirii 15").then(console.log).catch(console.error);

/**
 * Track last order
 */
let orderId = false;
let orderInterval = false;
glovo.getOrders().then((result) => {
    // last order is result[0]
    orderId = result[0].id;
    // track each minute
    console.log("got order id", orderId);

    trackOrder();
    orderInterval = setInterval(trackOrder, 60 * 1000);
}).catch((err) => {
    console.error("ERR", err);
});


// THIS NEVER STOPS!
function trackOrder() {
    glovo.trackOrder(orderId).then((order) => {
        console.log(JSON.stringify(order, null, 2));
    }).catch((err) => {
        console.error("ERR", err);
    })

    // to stop the order tracking:
    // clearInterval(orderInterval);
}

