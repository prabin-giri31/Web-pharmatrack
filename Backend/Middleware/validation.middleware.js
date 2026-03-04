/**
 * Validation middleware factory
 * Creates a middleware that validates request body against a Zod schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Parse and validate the request body
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // Extract error messages
        const errors = result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        
        return res.status(400).json({
          message: "Validation failed",
          errors,
        });
      }
      
      // Replace req.body with parsed/transformed data
      req.body = result.data;
      next();
    } catch (error) {
      console.error("Validation error:", error);
      return res.status(500).json({ message: "Validation error occurred" });
    }
  };
};

/**
 * Validate query parameters
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        
        return res.status(400).json({
          message: "Query validation failed",
          errors,
        });
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      console.error("Query validation error:", error);
      return res.status(500).json({ message: "Query validation error occurred" });
    }
  };
};

/**
 * Validate route parameters
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const errors = result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        
        return res.status(400).json({
          message: "Parameter validation failed",
          errors,
        });
      }
      
      req.params = result.data;
      next();
    } catch (error) {
      console.error("Params validation error:", error);
      return res.status(500).json({ message: "Parameter validation error occurred" });
    }
  };
};

export default validate;
