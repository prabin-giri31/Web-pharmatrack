import { jest } from "@jest/globals";

// Mock Item model
jest.unstable_mockModule("../Model/Items/Items.js", () => ({
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const Item = (await import("../Model/Items/Items.js")).default;
const controller = await import("../Controller/Items/itemController.js");

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

describe("Item Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== ADD ITEM TESTS ====================
  describe("addItem Function", () => {
    test("TC-01: Add item with valid data should succeed", async () => {
      const req = mockRequest({
        name: "Paracetamol",
        sku: "PCM001",
        unit: "tablet",
        category: "Pain Relief",
        sellingPrice: 50,
        costPrice: 30,
        stockOnHand: 100,
        reorderLevel: 20,
      });
      const res = mockResponse();

      Item.create.mockResolvedValue({
        id: 1,
        name: "Paracetamol",
        stockOnHand: 100,
      });

      await controller.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(Item.create).toHaveBeenCalled();
    });

    test("TC-02: Add item without name should return 400", async () => {
      const req = mockRequest({
        unit: "tablet",
        sellingPrice: 50,
        costPrice: 30,
      });
      const res = mockResponse();

      await controller.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Please fill all required fields" });
    });

    test("TC-03: Add item without unit should return 400", async () => {
      const req = mockRequest({
        name: "Paracetamol",
        sellingPrice: 50,
        costPrice: 30,
      });
      const res = mockResponse();

      await controller.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("TC-04: Add item without selling price should return 400", async () => {
      const req = mockRequest({
        name: "Paracetamol",
        unit: "tablet",
        costPrice: 30,
      });
      const res = mockResponse();

      await controller.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("TC-05: Add item with database error should return 500", async () => {
      const req = mockRequest({
        name: "Paracetamol",
        unit: "tablet",
        sellingPrice: 50,
        costPrice: 30,
      });
      const res = mockResponse();

      Item.create.mockRejectedValue(new Error("Database error"));

      await controller.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== GET ITEMS TESTS ====================
  describe("getItems Function", () => {
    test("TC-06: Get all items should return list", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockItems = [
        { id: 1, name: "Paracetamol", stockOnHand: 100 },
        { id: 2, name: "Aspirin", stockOnHand: 50 },
      ];

      Item.findAll.mockResolvedValue(mockItems);

      await controller.getItems(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    test("TC-07: Get items with empty database should return empty array", async () => {
      const req = mockRequest();
      const res = mockResponse();

      Item.findAll.mockResolvedValue([]);

      await controller.getItems(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("TC-08: Get items with database error should return 500", async () => {
      const req = mockRequest();
      const res = mockResponse();

      Item.findAll.mockRejectedValue(new Error("DB Error"));

      await controller.getItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== UPDATE ITEM TESTS ====================
  describe("updateItem Function", () => {
    test("TC-09: Update item with valid data should succeed", async () => {
      const req = mockRequest({ sellingPrice: 60 }, { id: 1 });
      const res = mockResponse();

      const mockItem = {
        id: 1,
        name: "Paracetamol",
        sellingPrice: 50,
        update: jest.fn().mockResolvedValue(true),
      };

      Item.findOne.mockResolvedValue(mockItem);

      await controller.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockItem.update).toHaveBeenCalledWith({ sellingPrice: 60 });
    });

    test("TC-10: Update non-existing item should return 404", async () => {
      const req = mockRequest({ sellingPrice: 60 }, { id: 999 });
      const res = mockResponse();

      Item.findOne.mockResolvedValue(null);

      await controller.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Item not found" });
    });

    test("TC-11: Update item with database error should return 500", async () => {
      const req = mockRequest({ sellingPrice: 60 }, { id: 1 });
      const res = mockResponse();

      Item.findOne.mockRejectedValue(new Error("DB Error"));

      await controller.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== DELETE ITEM TESTS ====================
  describe("deleteItem Function", () => {
    test("TC-12: Delete existing item should succeed", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const mockItem = {
        id: 1,
        name: "Paracetamol",
        destroy: jest.fn().mockResolvedValue(true),
      };

      Item.findOne.mockResolvedValue(mockItem);

      await controller.deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Item deleted successfully" });
    });

    test("TC-13: Delete non-existing item should return 404", async () => {
      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      Item.findOne.mockResolvedValue(null);

      await controller.deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Item not found" });
    });
  });
});
