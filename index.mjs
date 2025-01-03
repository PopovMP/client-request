// noinspection JSUnusedGlobalSymbols

import {URL}  from "node:url";
import http   from "node:http";
import https  from "node:https";
import buffer from "node:buffer";

const {Buffer} = buffer;

import {parseRequestBody} from "@popovmp/request-parser";

/** @typedef {import("http").IncomingMessage}     IncomingMessage     */
/** @typedef {import("http").IncomingHttpHeaders} IncomingHttpHeaders */
/** @typedef {import("http").ClientRequest}       ClientRequest       */

/**
 * @typedef {Object} ClientRequestResponse
 *
 * @property {Buffer|string|null|any} response
 * @property {IncomingHttpHeaders}    headers
 * @property {string}                 host
 * @property {string}                 method
 * @property {string}                 path
 * @property {string}                 protocol
 * @property {number}                 statusCode
 * @property {string}                 statusMessage
 */

/** @typedef {Record<string, string>} RequestHeaders */

/**
 * @typedef {Object} RequestOptions
 *
 * @property {string}         hostname
 * @property {string}         path
 * @property {number}         port
 * @property {string}         protocol
 * @property {RequestHeaders} headers
 * @property {string}         method
 */

/** @typedef {Record<string, string|number|any>} FormData */

/**
 * Sends a HEAD request.
 * @param {string}         url
 * @param {RequestHeaders} headers
 * @returns {Promise<ClientRequestResponse>}
 */
export async function requestHead(url, headers) {
    /** @type {RequestOptions} */
    const options = makeReqOptions(url, headers, "HEAD");

    return sendRequest(options, null);
}

/**
 * Sends a GET request.
 * @param {string}         url
 * @param {RequestHeaders} headers
 * @returns {Promise<ClientRequestResponse>}
 */
export async function requestGet(url, headers) {
    /** @type {RequestOptions} */
    const options = makeReqOptions(url, headers, "GET");

    return sendRequest(options, null);
}

/**
 * Sends a POST request.
 * @param {string}         url
 * @param {any}            data
 * @param {RequestHeaders} headers
 * @returns {Promise<ClientRequestResponse>}
 */
export async function requestPost(url, data, headers) {
    /** @type {RequestOptions} */
    return postPut("POST", url, data, headers);
}

/**
 * Sends a PUT request.
 * @param {string}         url
 * @param {any}            data
 * @param {RequestHeaders} headers
 * @returns {Promise<ClientRequestResponse>}
 */
export async function requestPut(url, data, headers) {
    return postPut("PUT", url, data, headers);
}

/**
 * Sends a POST request with "Content-Type: application/json".
 * @param {string}         url
 * @param {any}            data
 * @param {RequestHeaders} headers
 * @returns {Promise<ClientRequestResponse>}
 */
export async function requestJson(url, data, headers) {
    const options  = makeReqOptions(url, headers, "POST");
    const postText = JSON.stringify(data);

    return sendPost(options, postText, "application/json;charset=utf-8");
}

/**
 * Sends a POST request with "Content-Type: application/x-www-form-urlencoded".
 * @param {string}         url
 * @param {FormData}       formData
 * @param {RequestHeaders} headers
 * @returns {Promise<ClientRequestResponse>}
 */
export async function requestForm(url, formData, headers) {
    /** @type {RequestOptions} */
    const options = makeReqOptions(url, headers, "POST");

    /** @type {string[]} */
    const params = [];

    for (const param of Object.keys(formData)) {
        params.push(`${encodeURIComponent(param)}=${encodeURIComponent(formData[param])}`);
    }

    /** @type {string} */
    const queryText = params.join("&");

    /** @type {string} */
    const formHeader = "application/x-www-form-urlencoded";

    return sendPost(options, queryText, formHeader);
}

/**
 * Sends a POST or PUT request.
 * @param {string}         method
 * @param {string}         url
 * @param {any}            data
 * @param {RequestHeaders} headers
 * @returns {Promise<ClientRequestResponse>}
 */
async function postPut(method, url, data, headers) {
    /** @type {RequestOptions} */
    const options = makeReqOptions(url, headers, method);

    if (data === null || data === undefined) {
        return sendPost(options, null, "");
    }

    if (Buffer.isBuffer(data)) {
        return sendPost(options, data, "application/octet-stream");
    }

    if (typeof data === "object") {
        return sendPost(options, JSON.stringify(data), "application/json;charset=utf-8");
    }

    if (typeof data === "string") {
        return sendPost(options, data, "text/plain;charset=utf-8");
    }

    return sendPost(options, String(data), "text/plain;charset=utf-8");
}

/**
 * Parses a URL string
 * @param {string}         url
 * @param {RequestHeaders} headers
 * @param {string}         method
 * @returns {RequestOptions}
 */
function makeReqOptions(url, headers, method) {
    /** @type {URL} */
    const urlObj = new URL(url);

    /** @type {number} */
    const port = urlObj.port ? parseInt(urlObj.port)
        : urlObj.protocol === "https:" ? 443 : 80;

    return {
        hostname: urlObj.hostname,
        path    : urlObj.pathname + urlObj.search,
        protocol: urlObj.protocol,
        port,
        headers,
        method,
    };
}

/**
 * Prepares request headers and sends the request
 * @param {RequestOptions}     options
 * @param {Buffer|string|null} data
 * @param {string}             contentType
 * @returns {Promise<ClientRequestResponse>}
 */
async function sendPost(options, data, contentType) {
    if (Buffer.isBuffer(data)) {
        options.headers["Content-Length"] = data.length.toString();
    } else if (typeof data === "string") {
        options.headers["Content-Length"] = Buffer.byteLength(data).toString();
    } else {
        options.headers["Content-Length"] = "0";
    }

    if (contentType && !options.headers["Content-Type"]) {
        options.headers["Content-Type"] = contentType;
    }

    return sendRequest(options, data);
}

/**
 * Sends a request
 * @param {RequestOptions}     options
 * @param {Buffer|string|null} postData
 * @returns {Promise<ClientRequestResponse>}
 */
async function sendRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const transporter = options.protocol === "https:" ? https : http;
        const req = transporter.request(options, reqCallback);

        if (options.headers && typeof options.headers["Request-Timeout"] === "string") {
            const timeoutText = options.headers["Request-Timeout"];
            const timeOut      = parseInt(timeoutText);
            if (!isNaN(timeOut)) {
                // noinspection JSCheckFunctionSignatures
                req.setTimeout(timeOut * 1000);
            }
        }

        req.on("error", (err) => {
            reject(err);
        });

        req.on("timeout", () => {
            // noinspection JSUnresolvedReference
            req.destroy();
            reject(new Error("Request timed out"));
        });

        if (postData) {
            req.write(postData);
        }

        req.end();

        /**
         * @param  { IncomingMessage } res
         */
        function reqCallback(res) {
            /** @type {Buffer[]} */
            const chunks = [];

            res.on("data", (chunk) => {
                chunks.push(chunk);
            });

            res.on("error", (err) => {
                reject(err);
            });

            res.on("end", () => {
                /** @type {string|undefined} */
                const contentType = res.headers["content-type"];
                if (!contentType) {
                    reject(new Error("Content-Type header is missing"));
                    return;
                }

                /** @type {Buffer|string|Object|null|undefined} */
                const body = parseRequestBody(Buffer.concat(chunks), contentType);

                /** @type {ClientRequestResponse} */
                const response = {
                    response     : body,
                    host         : req.host,
                    method       : req.method,
                    path         : req.path,
                    protocol     : req.protocol,
                    headers      : res.headers,
                    statusCode   : res.statusCode || 0,
                    statusMessage: res.statusMessage || "",
                };

                resolve(response);
            });
        }
    });
}
