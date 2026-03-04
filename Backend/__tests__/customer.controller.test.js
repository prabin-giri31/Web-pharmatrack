import { jest } from "@jest/globals";

// Mock Customer model
jest.unstable_mockModule("../Model/Customer/Customer.js", () => ({
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}));

const Customer = (await import("../Model/Customer/Customer.js")).default;
const controller = await import("../Controller/Customer/customerController.js");

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

describe("Customer Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET CUSTOMERS TESTS ====================
  describe("getCustomers Function", () => {
    test("TC-01: Get all customers should return list", async () => {
      const req = mockRequest({}, {}, {});
      const res = mockResponse();

      const mockCustomers = [
        { id: 1, name: "Customer 1", email: "c1@test.com" },
        { id: 2, name: "Customer 2", email: "c2@test.com" },
      ];

      Customer.findAll.mockResolvedValue(mockCustomers);

      await controller.getCustomers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCustomers);
    });

    test("TC-02: Get customers with status filter should filter results", async () => {
      const req = mockRequest({}, {}, { status: "active" });
      const res = mockResponse();

      Customer.findAll.mockResolvedValue([{ id: 1, name: "Active Customer", status: "active" }]);

      await controller.getCustomers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(Customer.findAll).toHaveBeenCalled();
    });

    test("TC-03: Get customers with search query should search", async () => {
      const req = mockRequest({}, {}, { search: "john" });
      const res = mockResponse();

      Customer.findAll.mockResolvedValue([{ id: 1, name: "John Doe" }]);

      await controller.getCustomers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("TC-04: Get customers with empty database should return empty array", async () => {
      const req = mockRequest();
      const res = mockResponse();

      Customer.findAll.mockResolvedValue([]);

      await controller.getCustomers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("TC-05: Get customers with database error should return 500", async () => {
      const req = mockRequest();
      const res = mockResponse();

      Customer.findAll.mockRejectedValue(new Error("Database error"));

      await controller.getCustomers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== GET CUSTOMER BY ID TESTS ====================
  describe("getCustomerById Function", () => {
    test("TC-06: Get customer by valid ID should return customer", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const mockCustomer = { id: 1, name: "Test Customer", email: "test@test.com" };
      Customer.findOne.mockResolvedValue(mockCustomer);

      await controller.getCustomerById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });

    test("TC-07: Get customer with non-existing ID should return 404", async () => {
      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      Customer.findOne.mockResolvedValue(null);

      await controller.getCustomerById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Customer not found" });
    });

    test("TC-08: Get customer with database error should return 500", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      Customer.findOne.mockRejectedValue(new Error("DB Error"));

      await controller.getCustomerById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== CREATE CUSTOMER TESTS ====================
  describe("createCustomer Function", () => {
    test("TC-09: Create customer with valid data should succeed", async () => {
      const req = mockRequest({
        name: "New Customer",
        email: "new@customer.com",
        phone: "9812345678",
        address: "Kathmandu",
      });
      const res = mockResponse();

      Customer.findOne.mockResolvedValue(null);
      Customer.create.mockResolvedValue({
        id: 1,
        name: "New Customer",
        email: "new@customer.com",
      });

      await controller.createCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("TC-10: Create customer without name should return 400", async () => {
      const req = mockRequest({
        email: "test@customer.com",
      });
      const res = mockResponse();

      await controller.createCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Name and email are required" });
    });

    test("TC-11: Create customer without email should return 400", async () => {
      const req = mockRequest({
        name: "Test Customer",
      });
      const res = mockResponse();

      await controller.createCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("TC-12: Create customer with duplicate email should return 400", async () => {
      const req = mockRequest({
        name: "New Customer",
        email: "existing@customer.com",
      });
      const res = mockResponse();

      Customer.findOne.mockResolvedValue({ id: 1, email: "existing@customer.com" });

      await controller.createCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "A customer with this email already exists" });
    });

    test("TC-13: Create customer with database error should return 500", async () => {
      const req = mockRequest({
        name: "New Customer",
        email: "new@customer.com",
      });
      const res = mockResponse();

      Customer.findOne.mockResolvedValue(null);
      Customer.create.mockRejectedValue(new Error("DB Error"));

      await controller.createCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
