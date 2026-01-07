import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { createSession } from "../auth";

// Mock next/headers
const mockSet = vi.fn();
const mockCookies = vi.fn(() => ({
  set: mockSet,
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

// Mock jose
const mockSign = vi.fn().mockResolvedValue("mocked-jwt-token");
const mockSetProtectedHeader = vi.fn().mockReturnThis();
const mockSetExpirationTime = vi.fn().mockReturnThis();
const mockSetIssuedAt = vi.fn().mockReturnThis();

const MockSignJWT = vi.fn(() => ({
  setProtectedHeader: mockSetProtectedHeader,
  setExpirationTime: mockSetExpirationTime,
  setIssuedAt: mockSetIssuedAt,
  sign: mockSign,
}));

vi.mock("jose", () => ({
  SignJWT: MockSignJWT,
}));

describe("createSession", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to a known state
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  test("should create a session with valid JWT token and set cookie", async () => {
    const userId = "user-123";
    const email = "test@example.com";

    await createSession(userId, email);

    // Verify SignJWT was called with correct payload
    expect(MockSignJWT).toHaveBeenCalledTimes(1);
    const jwtPayload = MockSignJWT.mock.calls[0][0];
    expect(jwtPayload).toHaveProperty("userId", userId);
    expect(jwtPayload).toHaveProperty("email", email);
    expect(jwtPayload).toHaveProperty("expiresAt");
    expect(jwtPayload.expiresAt).toBeInstanceOf(Date);

    // Verify JWT methods were called in correct order
    expect(mockSetProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
    expect(mockSetExpirationTime).toHaveBeenCalledWith("7d");
    expect(mockSetIssuedAt).toHaveBeenCalled();
    expect(mockSign).toHaveBeenCalled();

    // Verify cookies API was called
    expect(mockCookies).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledTimes(1);

    // Verify cookie was set with correct parameters
    const [cookieName, token, options] = mockSet.mock.calls[0];
    expect(cookieName).toBe("auth-token");
    expect(token).toBe("mocked-jwt-token");
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    expect(options.expires).toBeInstanceOf(Date);
  });

  test("should set secure flag to true in production environment", async () => {
    process.env.NODE_ENV = "production";

    await createSession("user-123", "test@example.com");

    const [, , options] = mockSet.mock.calls[0];
    expect(options.secure).toBe(true);
  });

  test("should set secure flag to false in development environment", async () => {
    process.env.NODE_ENV = "development";

    await createSession("user-123", "test@example.com");

    const [, , options] = mockSet.mock.calls[0];
    expect(options.secure).toBe(false);
  });

  test("should include correct data in JWT payload", async () => {
    const userId = "user-456";
    const email = "user@test.com";
    const beforeCall = Date.now();

    await createSession(userId, email);

    const afterCall = Date.now();

    const jwtPayload = MockSignJWT.mock.calls[0][0];

    // Verify userId and email
    expect(jwtPayload.userId).toBe(userId);
    expect(jwtPayload.email).toBe(email);

    // Verify expiresAt is approximately 7 days from now
    const expiresAt = jwtPayload.expiresAt;
    expect(expiresAt).toBeInstanceOf(Date);

    const expectedExpiry = beforeCall + 7 * 24 * 60 * 60 * 1000;
    const actualExpiry = expiresAt.getTime();

    // Allow 1 second tolerance for test execution time
    expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry);
    expect(actualExpiry).toBeLessThanOrEqual(afterCall + 7 * 24 * 60 * 60 * 1000);

    // Verify JWT methods were called
    expect(mockSetExpirationTime).toHaveBeenCalledWith("7d");
    expect(mockSetIssuedAt).toHaveBeenCalled();
  });

  test("should handle empty userId", async () => {
    const email = "test@example.com";

    await expect(createSession("", email)).resolves.not.toThrow();

    const jwtPayload = MockSignJWT.mock.calls[0][0];
    expect(jwtPayload.userId).toBe("");
    expect(jwtPayload.email).toBe(email);
  });

  test("should handle empty email", async () => {
    const userId = "user-789";

    await expect(createSession(userId, "")).resolves.not.toThrow();

    const jwtPayload = MockSignJWT.mock.calls[0][0];
    expect(jwtPayload.userId).toBe(userId);
    expect(jwtPayload.email).toBe("");
  });

  test("should handle email with special characters", async () => {
    const userId = "user-special";
    const email = "user+tag@example.co.uk";

    await expect(createSession(userId, email)).resolves.not.toThrow();

    const jwtPayload = MockSignJWT.mock.calls[0][0];
    expect(jwtPayload.userId).toBe(userId);
    expect(jwtPayload.email).toBe(email);
    expect(mockSign).toHaveBeenCalled();
  });

  test("should set cookie expiration to match session expiration", async () => {
    const beforeCall = Date.now();

    await createSession("user-123", "test@example.com");

    const afterCall = Date.now();

    const [, , options] = mockSet.mock.calls[0];
    const jwtPayload = MockSignJWT.mock.calls[0][0];

    // Cookie expiration should match JWT payload expiration
    expect(options.expires).toEqual(jwtPayload.expiresAt);

    // Verify it's 7 days from now
    const cookieExpiry = options.expires.getTime();
    const expectedExpiry = beforeCall + 7 * 24 * 60 * 60 * 1000;

    expect(cookieExpiry).toBeGreaterThanOrEqual(expectedExpiry);
    expect(cookieExpiry).toBeLessThanOrEqual(afterCall + 7 * 24 * 60 * 60 * 1000);
  });

  test("should handle very long userId", async () => {
    const longUserId = "a".repeat(1000);
    const email = "test@example.com";

    await expect(createSession(longUserId, email)).resolves.not.toThrow();

    const jwtPayload = MockSignJWT.mock.calls[0][0];
    expect(jwtPayload.userId).toBe(longUserId);
  });

  test("should handle very long email", async () => {
    const userId = "user-123";
    const longEmail = "a".repeat(500) + "@example.com";

    await expect(createSession(userId, longEmail)).resolves.not.toThrow();

    const jwtPayload = MockSignJWT.mock.calls[0][0];
    expect(jwtPayload.email).toBe(longEmail);
  });
});
