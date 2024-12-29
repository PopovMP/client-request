import {describe, it}                     from "node:test";
import {deepStrictEqual, ok, strictEqual} from "node:assert";
import buffer from "node:buffer";
const {Buffer} = buffer;

import {requestGet, requestJson, requestPost, requestForm} from "../index.mjs";

describe("client-request", () => {
  describe("requestGet", () => {
    it("Sends a GET request", async () => {
      const url = "https://httpbin.org/get?foo=bar";
      const res = await requestGet(url, {});

      strictEqual(res.statusCode, 200);
      strictEqual(res.response.args["foo"], "bar");
    });

    it("GETs binary data", async () => {
      const url = "https://datafeed.dukascopy.com/datafeed/EURUSD/2020/07/24/07h_ticks.bi5";

      const res  = await requestGet(url, {});
      const data = res.response;

      strictEqual(res.statusCode, 200);
      ok(Buffer.isBuffer(data));

      const contentLength = parseInt(res.headers["content-length"] || "0");
      strictEqual(data.length, contentLength);
    });
  });

  describe("requestPost", () => {
    it("POST binary data", async () => {
      const url = "https://httpbin.org/post?foo=bar";
      const buf = Buffer.from("foo");

      const res  = await requestPost(url, buf, {});
      const data = res.response;

      strictEqual(res.statusCode, 200);
      strictEqual(data.data, "foo");
    });
  });

  describe("requestJson", () => {
    it("Sends a POST request with JSON", async () => {
      const url     = "https://httpbin.org/post?foo=bar";
      const json    = {number: 42, text: "foo", list: [1, 2], object: {bar: "baz"}};
      const headers = {Client: "request-service"};

      const res  = await requestJson(url, json, headers);
      const data = res.response;

      strictEqual(res.statusCode, 200);
      strictEqual(data.args["foo"], "bar");
      strictEqual(data.json.number, 42);
      strictEqual(data.json.text, "foo");
      deepStrictEqual(data.json.list, [1, 2]);
      deepStrictEqual(data.json.object, {bar: "baz"});
    });
  });

  describe("requestForm", () => {
    it("Sends a POST request with form data", async () => {
      const url     = "https://httpbin.org/post?foo=bar";
      const form    = {number: 42, text: "foo", list: [1, 2]};
      const headers = {Client: "request-service"};

      const res  = await requestForm(url, form, headers);
      const data = res.response;

      strictEqual(res.statusCode, 200);
      strictEqual(data.args["foo"], "bar");
      strictEqual(data.form.number, "42");
      strictEqual(data.form.text, "foo");
    });
  });
});
