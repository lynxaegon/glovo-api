const GlovoAPI = require("./index");

const glovo = new GlovoAPI();

/*
    glovo.getOrders().then((result) => {
        // last order is result[0]
        console.log(JSON.stringify(result[0], null, 2));
    }).catch((err) => {
        console.error("ERR", err);
    });
*/

/*
    glovo.trackOrder(12345).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.error("ERR", err);
    });
*/

/*
    glovo.getStores({
        lat: 46.123,
        lng: 23.321
    }).then(result => {
        console.log(result.filter(store => store.open));
    }).catch(console.error);
*/

/*
    glovo.getLatLngFromAddress("Bucharest", "Bulevardul Unirii 1")
        .then(console.log)
        .catch(console.error);
*/

/**
 * Track last order
 */

/*
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
*/

/*
    glovo.getLatLngFromAddress("Bucharest", "Nicolae Titulescu 121").then((result) => {
        glovo.setLocation(result);
        glovo.getStore(39537).then(console.log).catch(console.error);
    }).catch(console.error);
*/
