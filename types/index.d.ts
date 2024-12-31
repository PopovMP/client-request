// types/index.d.ts
// noinspection JSUnusedGlobalSymbols

declare module "@popovmp/client-request" {

    import {IncomingHttpHeaders} from "node:http";

    export type RequestHeaders = Record<string, string>;

    export type FormData = Record<string, string | number | any>;

    export interface ClientRequestResponse {
        response     : Buffer | string | null | any;
        headers      : IncomingHttpHeaders;
        host         : string;
        method       : string;
        path         : string;
        protocol     : string;
        statusCode   : number;
        statusMessage: string;
    }

    export interface RequestOptions {
        hostname: string;
        path    : string;
        port    : number;
        protocol: string;
        headers : RequestHeaders;
        method  : string;
    }

    /**
     * Sends a HEAD request.
     * @param {string}         url
     * @param {RequestHeaders} headers
     * @returns {Promise<ClientRequestResponse>}
     */
    export async function requestHead(url: string, headers: RequestHeaders): Promise<ClientRequestResponse>;

    /**
     * Sends a GET request.
     * @param {string}         url
     * @param {RequestHeaders} headers
     * @returns {Promise<ClientRequestResponse>}
     */
    export async function requestGet(url: string, headers: RequestHeaders): Promise<ClientRequestResponse>;

    /**
     * Sends a POST request.
     * @param {string}         url
     * @param {any}            data
     * @param {RequestHeaders} headers
     * @returns {Promise<ClientRequestResponse>}
     */
    export async function requestPost(url: string, data: any, headers: RequestHeaders): Promise<ClientRequestResponse>;

    /**
     * Sends a PUT request.
     * @param {string}         url
     * @param {any}            data
     * @param {RequestHeaders} headers
     * @returns {Promise<ClientRequestResponse>}
     */
    export async function requestPut(url: string, data: any, headers: RequestHeaders): Promise<ClientRequestResponse>;

    /**
     * Sends a POST request with "Content-Type: application/json".
     * @param {string}         url
     * @param {any}            data
     * @param {RequestHeaders} headers
     * @returns {Promise<ClientRequestResponse>}
     */
    export async function requestJson(url: string, data: any, headers: RequestHeaders): Promise<ClientRequestResponse>;

    /**
     * Sends a POST request with "Content-Type: application/x-www-form-urlencoded".
     * @param {string}         url
     * @param {FormData}       formData
     * @param {RequestHeaders} headers
     * @returns {Promise<ClientRequestResponse>}
     */
    export async function requestForm(url :string, formData: FormDara, headers: RequestHeaders): Promise<ClientRequestResponse>;
}
