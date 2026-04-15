import { authOptions } from "./auth";
import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { getServerSession } from "next-auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-min-32-characters",
);

export interface JWTPayload {
  userId: string;
  email: string;
  name?: string | null;
  iat?: number;
  exp?: number;
}

export async function createJWT(
  payload: Omit<JWTPayload, "iat" | "exp">,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSessionToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as
    | {
        id?: string;
        email?: string | null;
        name?: string | null;
      }
    | undefined;

  if (!sessionUser?.id) return null;

  return createJWT({
    userId: sessionUser.id,
    email: sessionUser.email || "",
    name: sessionUser.name,
  });
}

export async function validateRequest(
  request: Request,
): Promise<JWTPayload | null> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  return verifyJWT(token);
}

export function withAuth(
  handler: (req: Request, user: JWTPayload) => Promise<Response>,
) {
  return async (req: Request): Promise<Response> => {
    const user = await validateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, user);
  };
}
