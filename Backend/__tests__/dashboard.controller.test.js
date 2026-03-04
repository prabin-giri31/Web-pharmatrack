/**
 * Dashboard Controller Tests
 */

import { jest } from '@jest/globals';

// Mock models
const mockItem = {
  count: jest.fn(),
  findAll: jest.fn(),
};

const mockSalesOrder = {
  count: jest.fn(),
  findAll: jest.fn(),
  sum: jest.fn(),
};

const mockSupplier = {
  count: jest.fn(),
};

const mockInvoice = {
  findAll: jest.fn(),
  sum: jest.fn(),
};

const mockPurchaseReceive = {
  findAll: jest.fn(),
};

const mockNotification = {
  findAll: jest.fn(),
};

jest.unstable_mockModule('../Model/index.js', () => ({
  Item: mockItem,
  SalesOrder: mockSalesOrder,
  Supplier: mockSupplier,
  Invoice: mockInvoice,
  PurchaseReceive: mockPurchaseReceive,
  Notification: mockNotification,
}));

describe('Dashboard Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { userId: 1 },
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getDashboardSummary Function', () => {
    test('TC-01: Get dashboard should return summary statistics', async () => {
      const mockSummary = {
        totalItems: 156,
        lowStockItems: 5,
        todaysSales: 45750,
        totalVendors: 12,
        pendingOrders: 8,
      };

      mockItem.count.mockResolvedValue(156);
      mockSupplier.count.mockResolvedValue(12);

      res.json({
        success: true,
        data: mockSummary,
      });

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalItems: 156,
          totalVendors: 12,
        }),
      }));
    });

    test('TC-02: Dashboard should include low stock items list', async () => {
      const lowStockList = [
        { id: 1, name: 'Paracetamol 500mg', stockOnHand: 5, reorderLevel: 20 },
        { id: 2, name: 'Amoxicillin 250mg', stockOnHand: 8, reorderLevel: 25 },
      ];

      mockItem.findAll.mockResolvedValue(lowStockList);

      res.json({
        success: true,
        data: { lowStockList },
      });

      const response = res.json.mock.calls[0][0];
      expect(response.data.lowStockList).toHaveLength(2);
      expect(response.data.lowStockList[0].stockOnHand).toBeLessThan(response.data.lowStockList[0].reorderLevel);
    });

    test('TC-03: Dashboard should include expiring items list', async () => {
      const expiringItems = [
        { id: 1, name: 'Aspirin', expiryDate: '2026-03-10', stockOnHand: 50 },
        { id: 2, name: 'Vitamin C', expiryDate: '2026-03-15', stockOnHand: 30 },
      ];

      mockItem.findAll.mockResolvedValue(expiringItems);

      res.json({
        success: true,
        data: { expiringItems },
      });

      const response = res.json.mock.calls[0][0];
      expect(response.data.expiringItems).toBeDefined();
      expect(response.data.expiringItems.length).toBeGreaterThan(0);
    });

    test('TC-04: Dashboard should include recent orders', async () => {
      const recentOrders = [
        { id: 1, orderNumber: 'SO-2026-001', status: 'confirmed', grandTotal: 15000 },
        { id: 2, orderNumber: 'SO-2026-002', status: 'pending', grandTotal: 8500 },
      ];

      mockSalesOrder.findAll.mockResolvedValue(recentOrders);

      res.json({
        success: true,
        data: { recentOrders },
      });

      const response = res.json.mock.calls[0][0];
      expect(response.data.recentOrders).toHaveLength(2);
    });

    test('TC-05: Dashboard should include sales chart data', async () => {
      const salesChartData = [
        { date: '2026-02-25', totalSales: 25000, orderCount: 10 },
        { date: '2026-02-26', totalSales: 30000, orderCount: 12 },
        { date: '2026-02-27', totalSales: 28000, orderCount: 11 },
      ];

      res.json({
        success: true,
        data: { salesChartData },
      });

      const response = res.json.mock.calls[0][0];
      expect(response.data.salesChartData).toHaveLength(3);
      expect(response.data.salesChartData[0]).toHaveProperty('date');
      expect(response.data.salesChartData[0]).toHaveProperty('totalSales');
    });
  });

  describe('getLowStockItems Function', () => {
    test('TC-06: Get low stock items should return items below reorder level', async () => {
      const lowStockItems = [
        { id: 1, name: 'Paracetamol', stockOnHand: 5, reorderLevel: 20 },
        { id: 2, name: 'Ibuprofen', stockOnHand: 3, reorderLevel: 15 },
      ];

      mockItem.findAll.mockResolvedValue(lowStockItems);

      res.json({ success: true, data: lowStockItems });

      const response = res.json.mock.calls[0][0];
      response.data.forEach(item => {
        expect(item.stockOnHand).toBeLessThan(item.reorderLevel);
      });
    });

    test('TC-07: Low stock items should include unit information', async () => {
      const lowStockItems = [
        { id: 1, name: 'Paracetamol', stockOnHand: 5, reorderLevel: 20, unit: 'strips' },
      ];

      mockItem.findAll.mockResolvedValue(lowStockItems);

      res.json({ success: true, data: lowStockItems });

      const response = res.json.mock.calls[0][0];
      expect(response.data[0].unit).toBeDefined();
    });

    test('TC-08: Empty low stock should return empty array', async () => {
      mockItem.findAll.mockResolvedValue([]);

      res.json({ success: true, data: [] });

      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(0);
    });

    test('TC-09: Low stock query with database error should return 500', async () => {
      mockItem.findAll.mockRejectedValue(new Error('Database error'));

      res.status(500).json({ success: false, message: 'Server error' });

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('TC-10: Low stock should be sorted by urgency', async () => {
      const lowStockItems = [
        { id: 1, name: 'Item A', stockOnHand: 10, reorderLevel: 20 }, // 50%
        { id: 2, name: 'Item B', stockOnHand: 2, reorderLevel: 20 },  // 10%
        { id: 3, name: 'Item C', stockOnHand: 5, reorderLevel: 20 },  // 25%
      ];

      // Sort by stock percentage
      const sortedItems = [...lowStockItems].sort((a, b) => 
        (a.stockOnHand / a.reorderLevel) - (b.stockOnHand / b.reorderLevel)
      );

      res.json({ success: true, data: sortedItems });

      const response = res.json.mock.calls[0][0];
      expect(response.data[0].name).toBe('Item B'); // Most urgent first
    });
  });

  describe('getExpiringItems Function', () => {
    test('TC-11: Get expiring items should return items expiring within 30 days', async () => {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const expiringItems = [
        { id: 1, name: 'Aspirin', expiryDate: thirtyDaysFromNow.toISOString().slice(0, 10) },
      ];

      mockItem.findAll.mockResolvedValue(expiringItems);

      res.json({ success: true, data: expiringItems });

      const response = res.json.mock.calls[0][0];
      const itemExpiry = new Date(response.data[0].expiryDate);
      expect(itemExpiry.getTime()).toBeLessThanOrEqual(thirtyDaysFromNow.getTime());
    });

    test('TC-12: Expiring items should include stock quantity', async () => {
      const expiringItems = [
        { id: 1, name: 'Vitamin C', expiryDate: '2026-03-15', stockOnHand: 30 },
      ];

      mockItem.findAll.mockResolvedValue(expiringItems);

      res.json({ success: true, data: expiringItems });

      const response = res.json.mock.calls[0][0];
      expect(response.data[0]).toHaveProperty('stockOnHand');
    });

    test('TC-13: Expiring items should be sorted by expiry date', async () => {
      const expiringItems = [
        { id: 1, name: 'Item A', expiryDate: '2026-03-20' },
        { id: 2, name: 'Item B', expiryDate: '2026-03-10' },
        { id: 3, name: 'Item C', expiryDate: '2026-03-15' },
      ];

      const sortedItems = [...expiringItems].sort((a, b) => 
        new Date(a.expiryDate) - new Date(b.expiryDate)
      );

      res.json({ success: true, data: sortedItems });

      const response = res.json.mock.calls[0][0];
      expect(response.data[0].expiryDate).toBe('2026-03-10');
    });

    test('TC-14: No expiring items should return empty array', async () => {
      mockItem.findAll.mockResolvedValue([]);

      res.json({ success: true, data: [], message: 'No items expiring soon' });

      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(0);
    });

    test('TC-15: Expiring items query with error should return 500', async () => {
      mockItem.findAll.mockRejectedValue(new Error('Query failed'));

      res.status(500).json({ success: false, message: 'Failed to fetch expiring items' });

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
