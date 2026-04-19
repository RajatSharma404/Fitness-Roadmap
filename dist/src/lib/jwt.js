"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJWT = createJWT;
exports.verifyJWT = verifyJWT;
exports.getSessionToken = getSessionToken;
exports.validateRequest = validateRequest;
exports.withAuth = withAuth;
const auth_1 = require("./auth");
const server_1 = require("next/server");
const jose_1 = require("jose");
const next_auth_1 = require("next-auth");
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key-min-32-characters");
async function createJWT(payload) {
    return new jose_1.SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(JWT_SECRET);
}
async function verifyJWT(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, JWT_SECRET);
        return payload;
    }
    catch (_a) {
        return null;
    }
}
async function getSessionToken() {
    const session = await (0, next_auth_1.getServerSession)(auth_1.authOptions);
    const sessionUser = session === null || session === void 0 ? void 0 : session.user;
    if (!(sessionUser === null || sessionUser === void 0 ? void 0 : sessionUser.id))
        return null;
    return createJWT({
        userId: sessionUser.id,
        email: sessionUser.email || "",
        name: sessionUser.name,
    });
}
async function validateRequest(request) {
    var _a;
    const token = (_a = request.headers.get("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (!token)
        return null;
    return verifyJWT(token);
}
function withAuth(handler) {
    return async (req) => {
        const user = await validateRequest(req);
        if (!user) {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return handler(req, user);
    };
}
