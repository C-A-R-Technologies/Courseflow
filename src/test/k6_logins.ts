import http, { type RefinedResponse } from "k6/http";
import { check, fail } from "k6";
import exec from "k6/execution";
import { SharedArray } from "k6/data";

type K6TextRes = RefinedResponse<"text">;
type LoginUser = {
    email: string;
    password: string;
};
type SetupData = {
    baseUrl: string;
    remoteId: string;
    actionUrl: string;
    cookieHeader: string;
};

type LoginPayload = {
    type?: string;
    location?: string;
    status?: number;
    error?: { message?: string };
};

const BASE_URL = (__ENV.BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const USERS_FILE = __ENV.USERS_FILE || "seed_users.generated.json";
const FALLBACK_EMAIL = __ENV.LOGIN_EMAIL;
const FALLBACK_PASSWORD = __ENV.LOGIN_PASSWORD || "WeakestPassOf2026??";
const START_VUS = Number(__ENV.START_VUS || 10);
const PEAK_VUS = Number(__ENV.PEAK_VUS || 500);
const RAMP_UP = __ENV.RAMP_UP || "2m";
const HOLD_FOR = __ENV.HOLD_FOR || "5m";
const RAMP_DOWN = __ENV.RAMP_DOWN || "1m";
const REQUIRE_UNIQUE_USERS = __ENV.REQUIRE_UNIQUE_USERS === "true";
const DEBUG_FAILURES = __ENV.DEBUG_FAILURES === "true";

const seededUsers = USERS_FILE
    ? new SharedArray("seeded users", () => JSON.parse(open(USERS_FILE)) as LoginUser[])
    : null;

if (seededUsers && seededUsers.length === 0) {
    throw new Error(`No users found in ${USERS_FILE}`);
}

if (seededUsers && REQUIRE_UNIQUE_USERS && PEAK_VUS > seededUsers.length) {
    throw new Error(
        `PEAK_VUS (${PEAK_VUS}) is greater than seeded users (${seededUsers.length}). Add more users or lower PEAK_VUS.`
    );
}

if (!Number.isFinite(START_VUS) || START_VUS < 1) {
    throw new Error(`START_VUS must be a positive number. Received: ${START_VUS}`);
}

if (!Number.isFinite(PEAK_VUS) || PEAK_VUS < START_VUS) {
    throw new Error(`PEAK_VUS must be >= START_VUS. Received: START_VUS=${START_VUS}, PEAK_VUS=${PEAK_VUS}`);
}

export const options = {
    vus: START_VUS,
    stages: [
        { duration: RAMP_UP, target: PEAK_VUS },
        { duration: HOLD_FOR, target: PEAK_VUS },
        { duration: RAMP_DOWN, target: 0 }
    ],
    thresholds: {
        http_req_failed: ["rate<0.02"],
        http_req_duration: ["p(95)<1500"]
    }
};

function getSetCookieHeader(res: K6TextRes) {
    const raw = res.headers["Set-Cookie"];
    if (Array.isArray(raw)) return raw.join("; ");
    return raw || "";
}

function resolveActionUrl(baseUrl: string, action: string): string {
    if (action.startsWith("http://") || action.startsWith("https://")) return action;
    if (action.startsWith("?")) return `${baseUrl}/login${action}`;
    if (action.startsWith("/")) return `${baseUrl}${action}`;
    return `${baseUrl}/${action}`;
}

function parseLoginPayload(res: K6TextRes): LoginPayload {
    const body = res.body;
    if (!body || typeof body !== "string") return {};

    const contentType = String(res.headers["Content-Type"] || res.headers["content-type"] || "");
    if (!contentType.toLowerCase().includes("application/json")) return {};

    try {
        return JSON.parse(body) as LoginPayload;
    } catch {
        return {};
    }
}

function getLoginUser(): LoginUser {
    if (seededUsers) {
        const vuOffset = Math.max(0, exec.vu.idInTest - 1);
        const index = (vuOffset + exec.vu.iterationInScenario) % seededUsers.length;
        return seededUsers[index];
    }

    if (!FALLBACK_EMAIL) {
        throw new Error("Set LOGIN_EMAIL and LOGIN_PASSWORD, or provide USERS_FILE.");
    }

    return {
        email: FALLBACK_EMAIL,
        password: FALLBACK_PASSWORD
    };
}

export function setup() {
    let resolvedBaseUrl = BASE_URL;
    if (resolvedBaseUrl.includes("localhost")) {
        resolvedBaseUrl = resolvedBaseUrl.replace("localhost", "[::1]");
    }

    let pageRes = http.get(resolvedBaseUrl + "/login", { responseType: "text" }) as K6TextRes;

    // macOS dev servers may bind to ::1 only; k6 often resolves localhost to 127.0.0.1.
    if (pageRes.error && resolvedBaseUrl.includes("[::1]")) {
        resolvedBaseUrl = resolvedBaseUrl.replace("[::1]", "localhost");
        pageRes = http.get(resolvedBaseUrl + "/login", { responseType: "text" }) as K6TextRes;
    }

    check(pageRes, {
        "login page is 200": (r) => r.status === 200
    }) || fail("Could not load /login");

    const body = pageRes.body || "";
    const m = body.match(/action="([^"]*\?\/remote=[^"]+)"/);
    if (!m) {
        fail("Could not find remote login form action on /login page.");
    }

    const action = m[1];
    const remoteMatch = action.match(/[?&]\/remote=([^&/]+)/);
    if (!remoteMatch) {
        fail("Could not parse remote function id from login form action.");
    }

    const remoteId = remoteMatch[1];
    const actionUrl = resolveActionUrl(resolvedBaseUrl, action);
    const cookieHeader = getSetCookieHeader(pageRes);

    return {
        baseUrl: resolvedBaseUrl,
        remoteId,
        actionUrl,
        cookieHeader
    } satisfies SetupData;
}

export default function (data: SetupData) {
    const user = getLoginUser();

    const pageRes = http.get(`${data.baseUrl}/login`, {
        responseType: "text",
        headers: { Accept: "text/html" }
    }) as K6TextRes;

    const freshCookie = getSetCookieHeader(pageRes);

    const body = pageRes.body || "";
    const m = body.match(/action="([^"]*\?\/remote=[^"]+)"/);
    if (!m) { fail("Could not find form action"); return; }

    const actionUrl = resolveActionUrl(data.baseUrl, m[1]);

    const headers: Record<string, string> = {
        Origin: data.baseUrl,
        Referer: `${data.baseUrl}/login`,
    };
    if (freshCookie) headers.Cookie = freshCookie;

    const res = http.post(actionUrl, {
        email: user.email,
        _password: user.password,
    }, {
        redirects: 0,
        responseType: "text",
        headers,
        tags: { endpoint: "login" }
    }) as K6TextRes;

    const setCookie = getSetCookieHeader(res);
    const locationHeader = res.headers.Location || res.headers.location || "";
    const payload = parseLoginPayload(res);

    const isOkStatus = res.status === 200 || res.status === 303;
    const hasRedirect = payload.type === "redirect" || String(locationHeader).includes("/in/overview");

    if (DEBUG_FAILURES && (!isOkStatus || !setCookie.includes("authorization=") || !hasRedirect)) {
        console.error(
            `login failure status=${res.status} url=${data.actionUrl} location=${locationHeader} body=${String(res.body || "").slice(0, 200)}`
        );
    }

    check(res, {
        "login call returns success": () => isOkStatus,
        "auth cookie is set": () => setCookie.includes("authorization="),
        "result indicates redirect": () => hasRedirect,
        "redirects to app": () => (payload.location || String(locationHeader)).includes("/in/overview")
    });
}