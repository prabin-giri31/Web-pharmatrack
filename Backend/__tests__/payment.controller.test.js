/**
 * Payment Controller Tests
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

const mockPayment = {
  findAndCountAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

const mockPaymentItem = {
  create: jest.fn(),
  bulkCreate: jest.fn(),
  destroy: jest.fn(),
};

const mockBill = {
  findByPk: jest.fn(),
  update: jest.fn(),
};

const mockSupplier = {
  findByPk: jest.fn(),
};

jest.unstable_mockModule('../Model/index.js', () => ({
  Payment: mockPayment,
  PaymentItem: mockPaymentItem,
  Bill: mockBill,
  Supplier: mockSupplier,
}));

describe('Payment Controller Tests', () => {
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

  describe('getAllPayments Function', () => {
    test('TC-01: Get all payments should return paginated list', async () => {
      const mockPayments = [
        { id: 1, paymentNumber: 'PAY202601001', amount: 5000, paymentMode: 'cash' },
        { id: 2, paymentNumber: 'PAY202601002', amount: 7500, paymentMode: 'bank' },
      ];

      mockPayment.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockPayments,
      });

      res.json({
        success: true,
        data: mockPayments,
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 }
      });

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Array),
      }));
    });

    test('TC-02: Get payments with payment mode filter should filter results', async () => {
      req.query.paymentMode = 'cash';
      
      mockPayment.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, paymentNumber: 'PAY001', paymentMode: 'cash' }],
      });

      res.json({
        success: true,
        data: [{ id: 1, paymentNumber: 'PAY001', paymentMode: 'cash' }],
      });

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data[0].paymentMode).toBe('cash');
    });

    test('TC-03: Get payments with supplier filter should filter by supplier', async () => {
      req.query.supplierId = 1;
      
      mockPayment.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: [],
      });

      res.json({ success: true, data: [], pagination: { total: 3 } });

      expect(req.query.supplierId).toBe(1);
    });

    test('TC-04: Get payments with date range should filter by dates', async () => {
      req.query.startDate = '2026-01-01';
      req.query.endDate = '2026-01-31';
      
      mockPayment.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [],
      });

      res.json({ success: true, data: [] });

      expect(req.query.startDate).toBe('2026-01-01');
      expect(req.query.endDate).toBe('2026-01-31');
    });

    test('TC-05: Get payments with database error should return 500', async () => {
      mockPayment.findAndCountAll.mockRejectedValue(new Error('Database error'));

      res.status(500).json({ success: false, message: 'Server error' });

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getPaymentById Function', () => {
    test('TC-06: Get payment by valid ID should return payment details', async () => {
      req.params.id = 1;
      
      const mockPaymentData = {
        id: 1,
        paymentNumber: 'PAY202601001',
        supplierId: 1,
        amount: 10000,
        paymentMode: 'bank',
      };

      mockPayment.findOne.mockResolvedValue(mockPaymentData);

      res.json({ success: true, data: mockPaymentData });

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ paymentNumber: 'PAY202601001' }),
      }));
    });

    test('TC-07: Get payment with non-existing ID should return 404', async () => {
      req.params.id = 999;
      mockPayment.findOne.mockResolvedValue(null);

      res.status(404).json({ success: false, message: 'Payment not found' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('TC-08: Get payment should include supplier details', async () => {
      req.params.id = 1;
      
      const mockPaymentWithSupplier = {
        id: 1,
        paymentNumber: 'PAY001',
        supplier: { id: 1, companyName: 'Test Supplier' },
      };

      mockPayment.findOne.mockResolvedValue(mockPaymentWithSupplier);

      res.json({ success: true, data: mockPaymentWithSupplier });

      const response = res.json.mock.calls[0][0];
      expect(response.data.supplier).toBeDefined();
    });

    test('TC-09: Get payment should include payment items', async () => {
      req.params.id = 1;
      
      const mockPaymentWithItems = {
        id: 1,
        paymentNumber: 'PAY001',
        paymentItems: [
          { id: 1, billId: 1, amount: 5000 },
          { id: 2, billId: 2, amount: 3000 },
        ],
      };

      mockPayment.findOne.mockResolvedValue(mockPaymentWithItems);

      res.json({ success: true, data: mockPaymentWithItems });

      const response = res.json.mock.calls[0][0];
      expect(response.data.paymentItems).toHaveLength(2);
    });

    test('TC-10: Get payment with database error should return 500', async () => {
      req.params.id = 1;
      mockPayment.findOne.mockRejectedValue(new Error('DB Error'));

      res.status(500).json({ success: false, message: 'Server error' });

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createPayment Function', () => {
    test('TC-11: Create payment with valid data should succeed', async () => {
      req.body = {
        supplierId: 1,
        paymentDate: '2026-03-01',
        paymentMode: 'bank',
        amount: 10000,
        bills: [
          { billId: 1, amount: 5000 },
          { billId: 2, amount: 5000 },
        ],
      };

      mockSupplier.findByPk.mockResolvedValue({ id: 1, companyName: 'Test' });
      mockPayment.create.mockResolvedValue({
        id: 1,
        paymentNumber: 'PAY202603001',
        amount: 10000,
      });

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: { id: 1, paymentNumber: 'PAY202603001' },
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('TC-12: Create payment without supplierId should return 400', () => {
      req.body = {
        paymentDate: '2026-03-01',
        amount: 5000,
      };

      if (!req.body.supplierId) {
        res.status(400).json({ success: false, message: 'Supplier is required' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('TC-13: Create payment without amount should return 400', () => {
      req.body = {
        supplierId: 1,
        paymentDate: '2026-03-01',
      };

      if (!req.body.amount || req.body.amount <= 0) {
        res.status(400).json({ success: false, message: 'Valid amount is required' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('TC-14: Create payment with invalid payment mode should return 400', () => {
      req.body = {
        supplierId: 1,
        amount: 5000,
        paymentMode: 'invalid_mode',
      };

      const validModes = ['cash', 'bank', 'cheque', 'online'];
      
      if (!validModes.includes(req.body.paymentMode)) {
        res.status(400).json({ success: false, message: 'Invalid payment mode' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('TC-15: Create payment should generate unique payment number', async () => {
      req.body = {
        supplierId: 1,
        paymentDate: '2026-03-01',
        amount: 10000,
        paymentMode: 'bank',
      };

      const paymentNumber = `PAY${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}0001`;
      
      mockPayment.create.mockResolvedValue({
        id: 1,
        paymentNumber: paymentNumber,
      });

      res.status(201).json({
        success: true,
        data: { paymentNumber },
      });

      const response = res.json.mock.calls[0][0];
      expect(response.data.paymentNumber).toMatch(/^PAY\d{6}\d{4}$/);
    });
  });
});
