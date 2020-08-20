const fs = require('fs');
const axiosCls = require('axios');

const _private = {
	obj: {
		options: Symbol('options')
	},
	fnc: {
		didTokenExpire: Symbol('didTokenExpire'),
		getAccessToken: Symbol('getAccessToken'),
		getRefreshToken: Symbol('getRefreshToken'),
		refreshToken: Symbol('refreshToken'),
		readTokens: Symbol('readTokens'),
		writeTokens: Symbol('writeTokens')
	}
};
let axios;

let accessToken = false;
let refreshToken = false;
let expiresAt = false;

module.exports = class GlovoAPI {
	constructor(tokens) {
		this[_private.obj.options] = {
			BASE_URL: "https://api.glovoapp.com"
		};
		this._tokens = tokens || "./tokens.json";
		this.currentLocation = false;
		if(typeof this._tokens == 'object') {
			this._tokens = Object.assign({
				accessToken: false,
				refreshToken: false,
				expiresAt: false
			}, this._tokens);
		}

		axios = axiosCls.create({
			withCredentials: true,
			gzip: true,
			headers: {
				"Connection": "keep-alive",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
				'glovo-app-platform': 'web',
				'glovo-app-type': 'customer',
				'glovo-language-code': 'en'
			}
		});

		this[_private.fnc.readTokens]();
	}

	/**
	 * This is automatic for every call that requires auth
	 * @returns {Promise<>}
	 */
	auth(required) {
		return new Promise((resolve, reject) => {
			if (!required) {
				// do extra checks
				if (!this.currentLocation) {
					reject("Missing current location! Did you forget to setLocation(position)?");
					return;
				}
				resolve();
			} else {
				if (this[_private.fnc.didTokenExpire]()) {
					this[_private.fnc.refreshToken]().then(resolve).catch(reject);
				} else {
					resolve();
				}
			}
		});
	}

	setLocation(position) {
		if (!position.lat || !position.lng)
			throw new Error("Missing lat/lng for location!");

		this.currentLocation = position;
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
				if (res.data && res.data.length > 0) {
					resolve({
						lat: res.data[0].lat,
						lng: res.data[0].lon
					});
				} else {
					reject("Cannot resolve address");
				}
			}).catch(res => {
				reject(res);
			});
		});
	}

	/**
	 * Returns single store
	 * @param id - store id
	 * @returns {Promise<Store>}
	 */
	getStore(id) {
		return new Promise((resolve, reject) => {
			this.auth(false).then(() => {
				axios.get(this[_private.obj.options].BASE_URL + "/v3/stores/" + id, {
					headers: {
						"glovo-delivery-location-accuracy": 0,
						"glovo-delivery-location-latitude": this.currentLocation.lat,
						"glovo-delivery-location-longitude": this.currentLocation.lng,
						"glovo-delivery-location-timestamp": (new Date()).getTime()
					}
				}).then(res => {
					resolve(res.data);
				}).catch(res => {
					reject(res.response.data);
				});
			}).catch(reject);
		});
	}


	/**
	 * Returns all stores that are in range of the lat,lng
	 * @param options
	 * @returns {Promise<Stores>}
	 */
	getStores(options) {
		options = Object.assign({
			category: "RESTAURANT"
		}, options);

		return new Promise((resolve, reject) => {
			this.auth(false).then(() => {
				axios.get(this[_private.obj.options].BASE_URL + "/v3/stores", {
					headers: {
						"glovo-delivery-location-accuracy": 0,
						"glovo-delivery-location-latitude": this.currentLocation.lat,
						"glovo-delivery-location-longitude": this.currentLocation.lng,
						"glovo-delivery-location-timestamp": (new Date()).getTime()
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
	 * Returns last 12 orders descending (result[0] = last order)
	 * @returns {Promise<Order>}
	 */
	getOrders() {
		const options = {
			offset: 0,
			limit: 12,
			sort: 'desc'
		};

		return new Promise((resolve, reject) => {
			this.auth(true).then(() => {
				axios.get(this[_private.obj.options].BASE_URL + "/v3/customer/orders", {
					headers: {
						authorization: this[_private.fnc.getAccessToken]()
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
	 * Returns order details
	 * @Param orderUrn - format: glv:order:{UUIDv4}
	 * @returns {Promise<Order>}
	 */
	getOrderDetails(orderUrn) {
		return new Promise((resolve, reject) => {
			this.auth(true).then(() => {
				axios.get(this[_private.obj.options].BASE_URL + "/v3/orders/" + orderUrn, {
					headers: {
						authorization: this[_private.fnc.getAccessToken]()
					}
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
			this.auth(true).then(() => {
				axios.get(this[_private.obj.options].BASE_URL + "/v3/eta/orders/" + orderId + "/tracking", {
					headers: {
						authorization: this[_private.fnc.getAccessToken]()
					}
				}).then(res => {
					resolve(res.data);
				}).catch(res => {
					reject(res.response.data);
				});
			}).catch(reject);
		});
	}

	// PRIVATE FUNCTIONS //

	[_private.fnc.didTokenExpire]() {
		const now = Math.floor((new Date()).getTime() / 1000);
		return !expiresAt || now >= expiresAt;
	}

	[_private.fnc.getAccessToken]() {
		return accessToken;
	}

	[_private.fnc.getRefreshToken]() {
		return refreshToken;
	}

	[_private.fnc.readTokens]() {
		if(typeof this._tokens == 'object') {
			accessToken = this._tokens.accessToken;
			refreshToken = this._tokens.refreshToken;
			expiresAt = this._tokens.expiresAt;
			return;
		}

		try {
			let data = fs.readFileSync(this._tokens, 'utf8');
			data = JSON.parse(data);

			refreshToken = data.refreshToken;
			accessToken = data.accessToken;
			expiresAt = data.expiresAt;
		} catch {
			// create the dummy file
			this[_private.fnc.writeTokens]();
			throw new Error("Refresh token is required! Please update '" + this._tokens + "' file!");
		}
	}

	[_private.fnc.writeTokens]() {
		if(typeof this._tokens == 'object') {
			this._tokens.accessToken = accessToken;
			this._tokens.refreshToken = refreshToken;
			this._tokens.expiresAt = expiresAt;
			return;
		}

		fs.writeFileSync(this._tokens, JSON.stringify({
			accessToken: accessToken,
			refreshToken: refreshToken,
			expiresAt: expiresAt
		}, null, 2));
	}

	[_private.fnc.refreshToken]() {
		const options = {
			refreshToken: this[_private.fnc.getRefreshToken]()
		};

		return new Promise((resolve, reject) => {
			axios.post(this[_private.obj.options].BASE_URL + "/oauth/refresh", options).then(res => {
				accessToken = res.data.accessToken;
				refreshToken = res.data.refreshToken;
				expiresAt = Math.floor((new Date()).getTime() / 1000) + res.data.expiresIn;

				this[_private.fnc.writeTokens]();

				resolve();
			}).catch(res => {
				reject(res.response.data);
			});
		});
	}
};