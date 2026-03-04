import { jest } from "@jest/globals";

// Mock Supplier model
jest.unstable_mockModule("../Model/Supplier/Supplier.js", () => ({
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const Supplier = (await import("../Model/Supplier/Supplier.js")).default;
const controller = await import("../Controller/Supplier/supplierController.js");

// Mock response helper
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request helper
const mockRequest = (body = {}, params = {}, query = {}, user = { userId: 1 }) => ({
  body,
  params,
  query,
  user,
});

describe("Supplier Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET SUPPLIERS TESTS ====================
  describe("getSuppliers Function", () => {
    test("TC-01: Get all suppliers should return list", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockSuppliers = [
        { id: 1, name: "Supplier 1", companyName: "Company A" },
        { id: 2, name: "Supplier 2", companyName: "Company B" },
      ];

      Supplier.findAll.mockResolvedValue(mockSuppliers);

      await controller.getSuppliers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSuppliers);
    });

    test("TC-02: Get suppliers with empty database should return empty array", async () => {
      const req = mockRequest();
      const res = mockResponse();

      Supplier.findAll.mockResolvedValue([]);

      await controller.getSuppliers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("TC-03: Get suppliers with database error should return 500", async () => {
      const req = mockRequest();
      const res = mockResponse();

      Supplier.findAll.mockRejectedValue(new Error("Database error"));

      await controller.getSuppliers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== CREATE SUPPLIER TESTS ====================
  describe("createSupplier Function", () => {
    test("TC-04: Create supplier with valid data should succeed", async () => {
      const req = mockRequest({
        displayName: "New Supplier",
        companyName: "Supplier Co.",
        email: "supplier@test.com",
        phone: "9812345678",
      });
      const res = mockResponse();

      Supplier.create.mockResolvedValue({
        id: 1,
        name: "New Supplier",
        companyName: "Supplier Co.",
      });

      await controller.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("TC-05: Create supplier without display name should return 400", async () => {
      const req = mockRequest({
        email: "supplier@test.com",
        phone: "9812345678",
      });
      const res = mockResponse();

      await controller.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Display name is required" });
    });

    test("TC-06: Create supplier without email should return 400", async () => {
      const req = mockRequest({
        displayName: "New Supplier",
        phone: "9812345678",
      });
      const res = mockResponse();

      await controller.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email address is required" });
    });

    test("TC-07: Create supplier without phone should return 400", async () => {
      const req = mockRequest({
        displayName: "New Supplier",
        email: "supplier@test.com",
      });
      const res = mockResponse();

      await controller.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Phone number is required" });
    });

    test("TC-08: Create supplier with database error should return 500", async () => {
      const req = mockRequest({
        displayName: "New Supplier",
        email: "supplier@test.com",
        phone: "9812345678",
      });
      const res = mockResponse();

      Supplier.create.mockRejectedValue(new Error("DB Error"));

      await controller.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== UPDATE SUPPLIER TESTS ====================
  describe("updateSupplier Function", () => {
    test("TC-09: Update supplier with valid data should succeed", async () => {
      const req = mockRequest({ companyName: "Updated Company" }, { id: 1 });
      const res = mockResponse();

      const mockSupplier = {
        id: 1,
        name: "Supplier",
        update: jest.fn().mockResolvedValue(true),
      };

      Supplier.findOne.mockResolvedValue(mockSupplier);

      await controller.updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("TC-10: Update non-existing supplier should return 404", async () => {
      const req = mockRequest({ companyName: "Updated Company" }, { id: 999 });
      const res = mockResponse();

      Supplier.findOne.mockResolvedValue(null);

      await controller.updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ==================== DELETE SUPPLIER TESTS ====================
  describe("deleteSupplier Function", () => {
    test("TC-11: Delete existing supplier should succeed", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const mockSupplier = {
        id: 1,
        name: "Supplier",
        destroy: jest.fn().mockResolvedValue(true),
      };

      Supplier.findOne.mockResolvedValue(mockSupplier);

      await controller.deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("TC-12: Delete non-existing supplier should return 404", async () => {
      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      Supplier.findOne.mockResolvedValue(null);

      await controller.deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
