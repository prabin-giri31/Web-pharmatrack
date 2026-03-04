import { jest } from "@jest/globals";

// Mock jsonwebtoken
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn(),
  },
}));

const jwt = (await import("jsonwebtoken")).default;
const { authenticate } = await import("../Middleware/auth.middleware.js");

// Mock response helper
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn();

describe("Auth Middleware Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== AUTHENTICATE MIDDLEWARE TESTS ====================
  describe("authenticate Function", () => {
    test("TC-01: Valid token should call next()", async () => {
      const req = {
        headers: {
          authorization: "Bearer valid-token-123",
        },
      };
      const res = mockResponse();

      jwt.verify.mockReturnValue({ userId: 1, email: "test@test.com" });

      authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toEqual({ userId: 1, email: "test@test.com" });
    });

    test("TC-02: Missing authorization header should return 401", async () => {
      const req = {
        headers: {},
      };
      const res = mockResponse();

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Authentication required" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("TC-03: Authorization header without Bearer should return 401", async () => {
      const req = {
        headers: {
          authorization: "Basic some-token",
        },
      };
      const res = mockResponse();

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("TC-04: Invalid/expired token should return 403", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalid-token",
        },
      };
      const res = mockResponse();

      jwt.verify.mockImplementation(() => {
        throw new Error("jwt expired");
      });

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("TC-05: Empty Bearer token should return 403", async () => {
      const req = {
        headers: {
          authorization: "Bearer ",
        },
      };
      const res = mockResponse();

      jwt.verify.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
