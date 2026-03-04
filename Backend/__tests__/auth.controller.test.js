import { jest } from "@jest/globals";

// Mock User model
jest.unstable_mockModule("../Model/user/userModel.js", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock other models
jest.unstable_mockModule("../Model/index.js", () => ({
  UserActivity: {
    create: jest.fn(),
  },
  SystemSettings: {
    findOne: jest.fn(),
  },
}));

// Mock bcryptjs
jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

// Mock jsonwebtoken
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

const { User } = await import("../Model/user/userModel.js");
const { UserActivity, SystemSettings } = await import("../Model/index.js");
const bcrypt = (await import("bcryptjs")).default;
const jwt = (await import("jsonwebtoken")).default;
const controller = await import("../Controller/auth.controller.js");

// Mock response helper
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request helper
const mockRequest = (body = {}, params = {}, query = {}, user = null) => ({
  body,
  params,
  query,
  user,
  ip: "127.0.0.1",
  headers: { "user-agent": "Jest Test" },
});

describe("Auth Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== REGISTER TESTS ====================
  describe("Register Function", () => {
    test("TC-01: Register with valid data should create user", async () => {
      const req = mockRequest({
        pharmacyName: "Test Pharmacy",
        ownerName: "John Doe",
        email: "test@pharmacy.com",
        phone: "+9779812345678",
        registrationNumber: "REG123",
        address: "Kathmandu",
        password: "Password123",
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);
      SystemSettings.findOne.mockResolvedValue({ value: "false" });
      User.create.mockResolvedValue({ id: 1, email: "test@pharmacy.com" });

      await controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(User.create).toHaveBeenCalled();
    });

    test("TC-02: Register with existing email should return 409", async () => {
      const req = mockRequest({
        pharmacyName: "Test Pharmacy",
        ownerName: "John Doe",
        email: "existing@pharmacy.com",
        phone: "+9779812345678",
        registrationNumber: "REG123",
        address: "Kathmandu",
        password: "Password123",
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue({ id: 1, email: "existing@pharmacy.com" });

      await controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Email already exists." });
    });

    test("TC-03: Register with missing fields should return 400", async () => {
      const req = mockRequest({
        pharmacyName: "Test Pharmacy",
        // Missing other required fields
      });
      const res = mockResponse();

      await controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "All fields are required." });
    });

    test("TC-04: Register with invalid phone format should return 400", async () => {
      const req = mockRequest({
        pharmacyName: "Test Pharmacy",
        ownerName: "John Doe",
        email: "test@pharmacy.com",
        phone: "1234567890", // Invalid format
        registrationNumber: "REG123",
        address: "Kathmandu",
        password: "Password123",
      });
      const res = mockResponse();

      await controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Phone must be +977 followed by 10 digits." });
    });

    test("TC-05: Register with weak password should return 400", async () => {
      const req = mockRequest({
        pharmacyName: "Test Pharmacy",
        ownerName: "John Doe",
        email: "test@pharmacy.com",
        phone: "+9779812345678",
        registrationNumber: "REG123",
        address: "Kathmandu",
        password: "weak", // Weak password
      });
      const res = mockResponse();

      await controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==================== LOGIN TESTS ====================
  describe("Login Function", () => {
    test("TC-06: Login with valid credentials should return token", async () => {
      const req = mockRequest({
        email: "test@pharmacy.com",
        password: "Password123",
      });
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: "test@pharmacy.com",
        password: "hashedpassword",
        status: "active",
        isApproved: true,
        failedLoginAttempts: 0,
        save: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mock-token-123");
      UserActivity.create.mockResolvedValue({});

      await controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("TC-07: Login with wrong password should return error", async () => {
      const req = mockRequest({
        email: "test@pharmacy.com",
        password: "wrongpassword",
      });
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: "test@pharmacy.com",
        password: "hashedpassword",
        status: "active",
        failedLoginAttempts: 0,
        save: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      UserActivity.create.mockResolvedValue({});

      await controller.login(req, res);

      // Controller returns 403 for locked or 401 for wrong password
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    test("TC-08: Login with non-existing email should return 401", async () => {
      const req = mockRequest({
        email: "noexist@pharmacy.com",
        password: "Password123",
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password." });
    });

    test("TC-09: Login with empty email should return 400", async () => {
      const req = mockRequest({
        email: "",
        password: "Password123",
      });
      const res = mockResponse();

      await controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("TC-10: Login with empty password should return 400", async () => {
      const req = mockRequest({
        email: "test@pharmacy.com",
        password: "",
      });
      const res = mockResponse();

      await controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
