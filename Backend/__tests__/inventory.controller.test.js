import { jest } from "@jest/globals";

// Mock models
jest.unstable_mockModule("../Model/Inventory/InventoryAdjustment.js", () => ({
  default: {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule("../Model/Items/Items.js", () => ({
  default: {
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule("../Database/db.js", () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));

const InventoryAdjustment = (await import("../Model/Inventory/InventoryAdjustment.js")).default;
const Item = (await import("../Model/Items/Items.js")).default;
const { sequelize } = await import("../Database/db.js");
const controller = await import("../Controller/Inventory/inventoryController.js");

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

// Mock transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  LOCK: { UPDATE: "UPDATE" },
};

describe("Inventory Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // ==================== GET INVENTORY ADJUSTMENTS TESTS ====================
  describe("getInventoryAdjustments Function", () => {
    test("TC-01: Get all adjustments should return list", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockAdjustments = [
        { id: 1, itemId: 1, type: "Quantity Increase", quantity: 10 },
        { id: 2, itemId: 2, type: "Quantity Decrease", quantity: 5 },
      ];

      InventoryAdjustment.findAll.mockResolvedValue(mockAdjustments);

      await controller.getInventoryAdjustments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAdjustments);
    });

    test("TC-02: Get adjustments with type filter should filter results", async () => {
      const req = mockRequest({}, {}, { type: "Quantity Increase" });
      const res = mockResponse();

      InventoryAdjustment.findAll.mockResolvedValue([]);

      await controller.getInventoryAdjustments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(InventoryAdjustment.findAll).toHaveBeenCalled();
    });

    test("TC-03: Get adjustments with period filter should filter by date", async () => {
      const req = mockRequest({}, {}, { period: "Last 7 Days" });
      const res = mockResponse();

      InventoryAdjustment.findAll.mockResolvedValue([]);

      await controller.getInventoryAdjustments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("TC-04: Get adjustments with empty database should return empty array", async () => {
      const req = mockRequest();
      const res = mockResponse();

      InventoryAdjustment.findAll.mockResolvedValue([]);

      await controller.getInventoryAdjustments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("TC-05: Get adjustments with database error should return 500", async () => {
      const req = mockRequest();
      const res = mockResponse();

      InventoryAdjustment.findAll.mockRejectedValue(new Error("Database error"));

      await controller.getInventoryAdjustments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== ADD INVENTORY ADJUSTMENT TESTS ====================
  describe("addInventoryAdjustment Function", () => {
    test("TC-06: Add adjustment without required fields should return 400", async () => {
      const req = mockRequest({
        itemId: 1,
        // Missing reason, type, createdBy
        quantity: 50,
      });
      const res = mockResponse();

      await controller.addInventoryAdjustment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test("TC-07: Add adjustment without itemId should return 400", async () => {
      const req = mockRequest({
        reason: "Stock received",
        type: "Quantity Increase",
        createdBy: "Admin",
        quantity: 50,
      });
      const res = mockResponse();

      await controller.addInventoryAdjustment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("TC-08: Add adjustment without quantity should return 400", async () => {
      const req = mockRequest({
        itemId: 1,
        reason: "Stock received",
        type: "Quantity Increase",
        createdBy: "Admin",
      });
      const res = mockResponse();

      await controller.addInventoryAdjustment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("TC-09: Add adjustment for non-existing item should return 404", async () => {
      const req = mockRequest({
        itemId: 999,
        reason: "Stock received",
        type: "Quantity Increase",
        createdBy: "Admin",
        quantity: 50,
      });
      const res = mockResponse();

      Item.findOne.mockResolvedValue(null);

      await controller.addInventoryAdjustment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("TC-10: Add adjustment with zero quantity should return 400", async () => {
      const req = mockRequest({
        itemId: 1,
        reason: "Stock received",
        type: "Quantity Increase",
        createdBy: "Admin",
        quantity: 0,
      });
      const res = mockResponse();

      await controller.addInventoryAdjustment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
