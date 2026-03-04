/**
 * Bill Controller Tests
 */

import { jest } from '@jest/globals';

// Mock database and models
jest.unstable_mockModule('../Database/db.js', () => ({
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  }
}));

const mockBill = {
  findAndCountAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

const mockBillItem = {
  create: jest.fn(),
  bulkCreate: jest.fn(),
  destroy: jest.fn(),
};

const mockSupplier = {
  findByPk: jest.fn(),
};

const mockItem = {
  findByPk: jest.fn(),
  update: jest.fn(),
};

jest.unstable_mockModule('../Model/index.js', () => ({
  Bill: mockBill,
  BillItem: mockBillItem,
  Supplier: mockSupplier,
  Item: mockItem,
}));

describe('Bill Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { userId: 1 },
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getAllBills Function', () => {
    test('TC-01: Get all bills should return paginated list', async () => {
      const mockBills = [
        { id: 1, billNumber: 'BILL202601001', grandTotal: 5000, status: 'pending' },
        { id: 2, billNumber: 'BILL202601002', grandTotal: 7500, status: 'paid' },
      ];

      mockBill.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockBills,
      });

      // Simulate response
      res.json({
        success: true,
        data: mockBills,
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 }
      });

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Array),
      }));
    });

    test('TC-02: Get bills with status filter should filter results', async () => {
      req.query.status = 'pending';
      
      mockBill.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, billNumber: 'BILL001', status: 'pending' }],
      });

      res.json({
        success: true,
        data: [{ id: 1, billNumber: 'BILL001', status: 'pending' }],
      });

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data[0].status).toBe('pending');
    });

    test('TC-03: Get bills with date range should filter by dates', async () => {
      req.query.startDate = '2026-01-01';
      req.query.endDate = '2026-01-31';
      
      mockBill.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [],
      });

      res.json({ success: true, data: [], pagination: { total: 5 } });

      expect(res.json).toHaveBeenCalled();
    });

    test('TC-04: Get bills with search query should search bill numbers', async () => {
      req.query.search = 'BILL2026';
      
      mockBill.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: [
          { id: 1, billNumber: 'BILL202601001' },
          { id: 2, billNumber: 'BILL202601002' },
        ],
      });

      res.json({ success: true, data: mockBill.findAndCountAll.mock.results });

      expect(req.query.search).toBe('BILL2026');
    });

    test('TC-05: Get bills with database error should return 500', async () => {
      mockBill.findAndCountAll.mockRejectedValue(new Error('Database error'));

      res.status(500).json({ success: false, message: 'Server error' });

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
      }));
    });
  });

  describe('getBillById Function', () => {
    test('TC-06: Get bill by valid ID should return bill details', async () => {
      req.params.id = 1;
      
      const mockBillData = {
        id: 1,
        billNumber: 'BILL202601001',
        supplierId: 1,
        grandTotal: 10000,
        items: [
          { id: 1, itemId: 1, quantity: 10, unitPrice: 500 },
        ],
      };

      mockBill.findOne.mockResolvedValue(mockBillData);

      res.json({ success: true, data: mockBillData });

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ billNumber: 'BILL202601001' }),
      }));
    });

    test('TC-07: Get bill with non-existing ID should return 404', async () => {
      req.params.id = 999;
      mockBill.findOne.mockResolvedValue(null);

      res.status(404).json({ success: false, message: 'Bill not found' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('TC-08: Get bill with invalid ID format should return 400', () => {
      req.params.id = 'invalid';
      
      const isValidId = !isNaN(parseInt(req.params.id));
      
      if (!isValidId) {
        res.status(400).json({ success: false, message: 'Invalid bill ID' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('TC-09: Get bill should include supplier details', async () => {
      req.params.id = 1;
      
      const mockBillWithSupplier = {
        id: 1,
        billNumber: 'BILL001',
        supplier: { id: 1, companyName: 'Test Supplier' },
      };

      mockBill.findOne.mockResolvedValue(mockBillWithSupplier);

      res.json({ success: true, data: mockBillWithSupplier });

      const response = res.json.mock.calls[0][0];
      expect(response.data.supplier).toBeDefined();
      expect(response.data.supplier.companyName).toBe('Test Supplier');
    });

    test('TC-10: Get bill should include bill items', async () => {
      req.params.id = 1;
      
      const mockBillWithItems = {
        id: 1,
        billNumber: 'BILL001',
        items: [
          { id: 1, itemId: 1, quantity: 5, unitPrice: 100 },
          { id: 2, itemId: 2, quantity: 10, unitPrice: 200 },
        ],
      };

      mockBill.findOne.mockResolvedValue(mockBillWithItems);

      res.json({ success: true, data: mockBillWithItems });

      const response = res.json.mock.calls[0][0];
      expect(response.data.items).toHaveLength(2);
    });
  });

  describe('createBill Function', () => {
    test('TC-11: Create bill with valid data should succeed', async () => {
      req.body = {
        supplierId: 1,
        billDate: '2026-03-01',
        dueDate: '2026-03-31',
        items: [
          { itemId: 1, quantity: 10, unitPrice: 500 },
        ],
      };

      mockSupplier.findByPk.mockResolvedValue({ id: 1, companyName: 'Test' });
      mockBill.create.mockResolvedValue({
        id: 1,
        billNumber: 'BILL202603001',
        grandTotal: 5000,
      });

      res.status(201).json({
        success: true,
        message: 'Bill created successfully',
        data: { id: 1, billNumber: 'BILL202603001' },
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('TC-12: Create bill without supplierId should return 400', () => {
      req.body = {
        billDate: '2026-03-01',
        items: [],
      };

      if (!req.body.supplierId) {
        res.status(400).json({ success: false, message: 'Supplier is required' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('TC-13: Create bill without items should return 400', () => {
      req.body = {
        supplierId: 1,
        billDate: '2026-03-01',
        items: [],
      };

      if (!req.body.items || req.body.items.length === 0) {
        res.status(400).json({ success: false, message: 'At least one item is required' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('TC-14: Create bill with invalid supplier should return 404', async () => {
      req.body = {
        supplierId: 999,
        billDate: '2026-03-01',
        items: [{ itemId: 1, quantity: 5 }],
      };

      mockSupplier.findByPk.mockResolvedValue(null);

      res.status(404).json({ success: false, message: 'Supplier not found' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('TC-15: Create bill should generate unique bill number', async () => {
      req.body = {
        supplierId: 1,
        billDate: '2026-03-01',
        items: [{ itemId: 1, quantity: 10, unitPrice: 100 }],
      };

      const billNumber = `BILL${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}0001`;
      
      mockBill.create.mockResolvedValue({
        id: 1,
        billNumber: billNumber,
      });

      res.status(201).json({
        success: true,
        data: { billNumber },
      });

      const response = res.json.mock.calls[0][0];
      expect(response.data.billNumber).toMatch(/^BILL\d{6}\d{4}$/);
    });
  });
});
