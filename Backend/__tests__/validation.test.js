import { jest } from "@jest/globals";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  itemSchema,
  customerSchema,
  supplierSchema,
} from "../Validation/schemas.js";

describe("Validation Schema Tests", () => {
  // ==================== REGISTER SCHEMA TESTS ====================
  describe("registerSchema", () => {
    test("TC-01: Valid registration data should pass", () => {
      const validData = {
        pharmacyName: "Test Pharmacy",
        email: "test@pharmacy.com",
        password: "password123",
        phone: "9812345678",
        address: "Kathmandu",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("TC-02: Short pharmacy name should fail", () => {
      const invalidData = {
        pharmacyName: "A",
        email: "test@pharmacy.com",
        password: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-03: Invalid email format should fail", () => {
      const invalidData = {
        pharmacyName: "Test Pharmacy",
        email: "invalid-email",
        password: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-04: Short password should fail", () => {
      const invalidData = {
        pharmacyName: "Test Pharmacy",
        email: "test@pharmacy.com",
        password: "123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-05: Missing required fields should fail", () => {
      const invalidData = {
        pharmacyName: "Test Pharmacy",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ==================== LOGIN SCHEMA TESTS ====================
  describe("loginSchema", () => {
    test("TC-06: Valid login data should pass", () => {
      const validData = {
        email: "test@pharmacy.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("TC-07: Invalid email format should fail", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-08: Empty password should fail", () => {
      const invalidData = {
        email: "test@pharmacy.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-09: Missing email should fail", () => {
      const invalidData = {
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-10: Missing password should fail", () => {
      const invalidData = {
        email: "test@pharmacy.com",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ==================== CHANGE PASSWORD SCHEMA TESTS ====================
  describe("changePasswordSchema", () => {
    test("TC-11: Valid change password data should pass", () => {
      const validData = {
        currentPassword: "oldpassword",
        newPassword: "newpassword123",
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("TC-12: Short new password should fail", () => {
      const invalidData = {
        currentPassword: "oldpassword",
        newPassword: "123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-13: Empty current password should fail", () => {
      const invalidData = {
        currentPassword: "",
        newPassword: "newpassword123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ==================== ITEM SCHEMA TESTS ====================
  describe("itemSchema", () => {
    test("TC-14: Valid item data should pass", () => {
      const validData = {
        name: "Paracetamol",
        unit: "tablet",
        sellingPrice: 50,
        costPrice: 30,
        stockOnHand: 100,
      };

      const result = itemSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("TC-15: Missing item name should fail", () => {
      const invalidData = {
        unit: "tablet",
        sellingPrice: 50,
        costPrice: 30,
      };

      const result = itemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-16: Missing unit should fail", () => {
      const invalidData = {
        name: "Paracetamol",
        sellingPrice: 50,
        costPrice: 30,
      };

      const result = itemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-17: Negative selling price should fail", () => {
      const invalidData = {
        name: "Paracetamol",
        unit: "tablet",
        sellingPrice: -50,
        costPrice: 30,
      };

      const result = itemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-18: String prices should be converted to numbers", () => {
      const validData = {
        name: "Paracetamol",
        unit: "tablet",
        sellingPrice: "50",
        costPrice: "30",
      };

      const result = itemSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ==================== CUSTOMER SCHEMA TESTS ====================
  describe("customerSchema", () => {
    test("TC-19: Valid customer data should pass", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        displayName: "John Doe",
        email: "john@test.com",
      };

      const result = customerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("TC-20: Missing first name should fail", () => {
      const invalidData = {
        displayName: "John Doe",
      };

      const result = customerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-21: Missing display name should fail", () => {
      const invalidData = {
        firstName: "John",
      };

      const result = customerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-22: Invalid email format should fail", () => {
      const invalidData = {
        firstName: "John",
        displayName: "John Doe",
        email: "invalid-email",
      };

      const result = customerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("TC-23: Empty email should pass (optional field)", () => {
      const validData = {
        firstName: "John",
        displayName: "John Doe",
        email: "",
      };

      const result = customerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ==================== SUPPLIER SCHEMA TESTS ====================
  describe("supplierSchema", () => {
    test("TC-24: Valid supplier data should pass", () => {
      const validData = {
        firstName: "Supplier",
        displayName: "Supplier Co.",
        email: "supplier@test.com",
      };

      const result = supplierSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("TC-25: Missing first name should fail", () => {
      const invalidData = {
        displayName: "Supplier Co.",
      };

      const result = supplierSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
