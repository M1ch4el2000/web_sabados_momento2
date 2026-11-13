import assert from "node:assert/strict";
import { once } from "node:events";
import test, { after, before } from "node:test";
import { app } from "../server.js";

let server;
let baseUrl;

before(async () => {
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    server.close();
    await once(server, "close");
});

test("GET /api/health returns the API status", async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { data: { status: "ok" } });
});

test("GET /api/branches returns the recruitment branches", async () => {
    const response = await fetch(`${baseUrl}/api/branches`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.data.includes("Cuerpo Spartan"));
});

test("POST /api/applications/evaluate approves a candidate meeting the requirements", async () => {
    const response = await fetch(`${baseUrl}/api/applications/evaluate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            id: "UNSC-1001",
            nombre: "Alex",
            apellido: "Recluta",
            edad: 18,
            peso: 56,
            altura: 155,
            rama: "Armada UNSC"
        })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.apto, true);
    assert.deepEqual(body.data.razones, []);
});

test("POST /api/applications/evaluate rejects invalid fields with details", async () => {
    const response = await fetch(`${baseUrl}/api/applications/evaluate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ edad: "18", rama: "UNSC" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
    assert.ok(body.error.details.some(({ field }) => field === "edad"));
    assert.ok(body.error.details.some(({ field }) => field === "rama"));
});

test("POST /api/applications/evaluate explains unmet requirements", async () => {
    const response = await fetch(`${baseUrl}/api/applications/evaluate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            id: "UNSC-1002",
            nombre: "Sam",
            apellido: "Recluta",
            edad: 17,
            peso: 30,
            altura: 150,
            rama: "Cuerpo Spartan"
        })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.apto, false);
    assert.equal(body.data.razones.length, 3);
});

test("malformed JSON returns a JSON 400", async () => {
    const response = await fetch(`${baseUrl}/api/applications/evaluate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{"
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "INVALID_JSON");
});

test("unknown paths return a JSON 404", async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error.code, "NOT_FOUND");
});
