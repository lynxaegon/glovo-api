const fs = require('fs');
const axiosCls = require('axios');

const _private = {
    obj: {
        options: Symbol('options')
    }
};
let axios;

let accessToken = false;
let refreshToken = false;
let expiresAt = false;

module.exports = class GlovoAPI {
    constructor() {
        this[_private.obj.options] = {
             BASE_URL: "https://api.glovoapp.com"
        };

        axios = axiosCls.create({
            withCredentials: true,
            gzip: true,
            headers: {
                "Connection": "keep-alive",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
            }
        });

        this._readTokens();
    }

    /**
     * This is automatic for every call that requires auth
     * @returns {Promise<>}
     */
    auth() {
        return new Promise((resolve, reject) => {
            if(this._didTokenExpire()) {
                this._refreshToken().then(resolve).catch(reject);
            } else {
                resolve();
            }
        });
    }

    /**
     * Returns lat,lng for the specified address
     * @param city required
     * @param address required
     * @returns {Promise<LatLngObject|false>}
     */
    getLatLngFromAddress(city, address) {
        return new Promise((resolve, reject) => {
            axios.get("https://nominatim.openstreetmap.org/search/" + encodeURI(address + " " + city) + "?format=json&limit=1").then(res => {
                if(res.data){
                    resolve({
                        lat: res.data[0].lat,
                        lng: res.data[0].lon
                    });
                } else {
                    resolve(false);
                }
            }).catch(res => {
                reject(res.response.data);
            });
        });
    }


    /**
     * Returns all stores that are in range of the lat,lng
     * @param options
     * @returns {Promise<Stores>}
     */
    getStores(options) {
        // NO AUTH required
        options = Object.assign({
            category: "RESTAURANT"
        }, options);
        // TODO: change lat/lng to autodetect
        const lat = options.lat;
        const lng = options.lng;
        delete options.lat;
        delete options.lng;

        return new Promise((resolve, reject) => {
            // const lat = ;
            // const lng = ;
            axios.get(this[_private.obj.options].BASE_URL + "/v3/stores", {
                headers: {
                    "glovo-delivery-location-accuracy": 0,
                    "glovo-delivery-location-latitude": lat,
                    "glovo-delivery-location-longitude": lng,
                    "glovo-delivery-location-timestamp": (new Date()).getTime()
                },
                params: options
            }).then(res => {
                resolve(res.data);
            }).catch(res => {
                reject(res.response.data);
            });
        });
    }

    /**
     * Returns last 12 orders descending (result[0] = last order)
     * @returns {Promise<Order>}
     */
    getOrders() {
        return new Promise((resolve, reject) => {
            this.auth().then(() => {
                const options = {
                    offset: 0,
                    limit: 12,
                    sort: 'desc'
                };
                axios.get(this[_private.obj.options].BASE_URL + "/v3/customer/orders", {
                    headers: {
                        authorization: this._getAccessToken()
                    },
                    params: options
                }).then(res => {
                    resolve(res.data);
                }).catch(res => {
                    reject(res.response.data);
                });
            }).catch(reject);
        });
    }

    /**
     * Returns order tracking for the specified orderId
     * @param orderId required
     * @returns {Promise<OrderTracking>}
     */
    trackOrder(orderId) {
        return new Promise((resolve, reject) => {
            this.auth().then(() => {
                axios.get(this[_private.obj.options].BASE_URL + "/v3/eta/orders/"+ orderId +"/tracking", {
                    headers: {
                        authorization: this._getAccessToken()
                    }
                }).then(res => {
                    resolve(res.data);
                }).catch(res => {
                    reject(res.response.data);
                });
            }).catch(reject);
        });
    }

    // private functions
    _didTokenExpire() {
        const now = Math.floor((new Date()).getTime() / 1000);
        return !expiresAt || now >= expiresAt;
    }

    _getAccessToken() {
        return accessToken;
    }

    _getRefreshToken() {
        return refreshToken;
    }

    _readTokens() {
        try {
            let data = fs.readFileSync("./token.json", 'utf8');
            data = JSON.parse(data);
            refreshToken = data.refreshToken;
            accessToken = data.accessToken;
            expiresAt = data.expiresAt;
        } catch {
            this._writeTokens();
            throw new Error("Refresh token is required! Please update './token.json' file!");
        }
    }

    _writeTokens() {
        fs.writeFileSync("./token.json", JSON.stringify({
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresAt: expiresAt
        }, null, 2));
    }

    _refreshToken() {
        return new Promise((resolve, reject) => {
            let options = {
                refreshToken: this._getRefreshToken()
            };

            axios.post(this[_private.obj.options].BASE_URL + "/oauth/refresh", options).then(res => {
                accessToken = res.data.accessToken;
                refreshToken = res.data.refreshToken;
                expiresAt = Math.floor((new Date()).getTime() / 1000) + res.data.expiresIn;

                this._writeTokens();

                resolve();
            }).catch(res => {
                reject(res.response.data);
            });
        });
    }
};