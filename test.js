const GlovoAPI = require("./index");

const glovo = new GlovoAPI();

// glovo.trackOrder(12345).then((result) => {
//     console.log(result);
//     // last order is result[0]
//     // console.log(JSON.stringify(result[0], null, 2));
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