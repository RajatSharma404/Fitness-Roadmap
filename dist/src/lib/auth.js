"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const next_auth_1 = __importDefault(require("next-auth"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const prisma_adapter_1 = require("@auth/prisma-adapter");
const prisma_1 = require("./prisma");
exports.authOptions = {
    adapter: (0, prisma_adapter_1.PrismaAdapter)(prisma_1.prisma),
    providers: [
        (0, google_1.default)({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: process.env.ALLOW_DANGEROUS_EMAIL_LINKING === "true",
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            var _a, _b, _c, _d;
            if (token === null || token === void 0 ? void 0 : token.id) {
                session.user = Object.assign(Object.assign({}, ((_a = session.user) !== null && _a !== void 0 ? _a : {})), { id: String(token.id), email: (_b = token.email) !== null && _b !== void 0 ? _b : null, name: (_c = token.name) !== null && _c !== void 0 ? _c : null, image: (_d = token.picture) !== null && _d !== void 0 ? _d : null });
            }
            return session;
        },
    },
    events: {
        async signIn({ user }) {
            // Check if user needs onboarding
            const dbUser = await prisma_1.prisma.user.findUnique({
                where: { id: user.id },
                select: { goal: true, bodyweight: true },
            });
            // Mark as needing onboarding if goal/bodyweight not set
            if (!(dbUser === null || dbUser === void 0 ? void 0 : dbUser.goal) || !(dbUser === null || dbUser === void 0 ? void 0 : dbUser.bodyweight)) {
                // This will be handled by the client
            }
        },
    },
    pages: {
        signIn: "/",
        error: "/",
    },
};
exports.default = (0, next_auth_1.default)(exports.authOptions);
