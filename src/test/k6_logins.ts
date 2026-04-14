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
};

const BASE_URL = (__ENV.BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const USERS_FILE = __ENV.USERS_FILE || "seed_users.generated.json";
const FALLBACK_EMAIL = __ENV.LOGIN_EMAIL;
const FALLBACK_PASSWORD = __ENV.LOGIN_PASSWORD || "WeakestPassOf2026??";

const seededUsers = USERS_FILE
    ? new SharedArray("seeded users", () => JSON.parse(open(USERS_FILE)) as LoginUser[])
    : null;

if (seededUsers && seededUsers.length === 0) {
    throw new Error(`No users found in ${USERS_FILE}`);
}

export const options = seededUsers
    ? {
        scenarios: {
            login_only: {
                executor: "shared-iterations",
                vus: Math.min(50, seededUsers.length),
                iterations: seededUsers.length,
                maxDuration: "30m"
            }
        },
        thresholds: {
            http_req_failed: ["rate<0.02"],
            http_req_duration: ["p(95)<1500"]
        }
    }
    : {
        scenarios: {
            login_only: {
                executor: "ramping-vus",
                startVUs: 1,
                stages: [
                    { duration: "30s", target: 10 },
                    { duration: "2m", target: 50 },
                    { duration: "30s", target: 0 }
                ],
                gracefulRampDown: "10s"
            }
        },
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

function getLoginUser(): LoginUser {
    if (seededUsers) {
        const index = exec.scenario.iterationInTest % seededUsers.length;
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
    const remoteMatch = action.match(/[?&]\/remote=([^&]+)/);
    if (!remoteMatch) {
        fail("Could not parse remote function id from login form action.");
    }

    const remoteId = remoteMatch[1];
    const actionUrl = `${resolvedBaseUrl}/_app/remote/${remoteId}`;

    return {
        baseUrl: resolvedBaseUrl,
        remoteId,
        actionUrl
    } satisfies SetupData;
}

export default function (data: SetupData) {
    const user = getLoginUser();

    const res = http.post(data.actionUrl, {
        email: user.email,
        _password: user.password
    }, {
        redirects: 0,
        responseType: "text",
        tags: { endpoint: "login" }
    }) as K6TextRes;

    const setCookie = getSetCookieHeader(res);
    const payload = (res.body && typeof res.body === "string") ? JSON.parse(res.body) as {
        type?: string;
        location?: string;
        status?: number;
        error?: { message?: string };
    } : {};

    check(res, {
        "login call returns 200": (r) => r.status === 200,
        "auth cookie is set": () => setCookie.includes("authorization="),
        "result type is redirect": () => payload.type === "redirect",
        "redirects to app": () => (payload.location || "").includes("/in/overview")
    });
}