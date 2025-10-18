import { Request, Response } from "express";
import { PrismaClient } from "@prisma/catalogue-client";

const prisma = new PrismaClient();

/**
 * Get scraped product by ID
 * @route GET /products/:id
 */
export const getScrapedProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log("🔍 Fetching product with ID:", id);

    // Validate ObjectId format (24 hex characters)
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      console.log("❌ Invalid ObjectId format");
      return res.status(400).json({
        success: false,
        error: "Invalid product ID format. Must be a valid MongoDB ObjectId.",
      });
    }

    console.log("✅ ObjectId format valid, querying database...");

    const product = await prisma.catalogue.findUnique({
      where: { id },
    });

    console.log("📦 Query result:", product ? "Found" : "Not found");
    console.log("📊 Product data:", JSON.stringify(product, null, 2));

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all scraped products (for debugging)
 * @route GET /products
 */
export const getAllScrapedProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.catalogue.findMany({
      take: 10, // Limit to 10 for debugging
    });

    console.log(`📦 Found ${products.length} products in database`);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Search products by title using similarity matching
 * @route POST /products/search
 * @body { searchTerm: string, limit?: number }
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { searchTerm, limit = 10 } = req.body;

    if (!searchTerm || typeof searchTerm !== "string") {
      return res.status(400).json({
        success: false,
        error: "searchTerm is required and must be a string",
      });
    }

    console.log(`🔍 Searching for: "${searchTerm}" with limit: ${limit}`);

    // MongoDB text search using regex for similarity
    // This provides basic similarity matching without vector embeddings
    const products = await prisma.catalogue.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      take: Number(limit),
    });

    console.log(`📦 Found ${products.length} matching products`);

    return res.status(200).json({
      success: true,
      count: products.length,
      searchTerm,
      limit: Number(limit),
      data: products,
    });
  } catch (error) {
    console.error("❌ Error searching products:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Filter products with various conditions
 * @route POST /products/filter
 * @body { priceMin?: number, priceMax?: number, website?: string, currency?: string, limit?: number, offset?: number }
 */
export const filterProducts = async (req: Request, res: Response) => {
  try {
    const {
      priceMin,
      priceMax,
      website,
      currency,
      searchTerm,
      limit = 10,
      offset = 0,
    } = req.body;

    console.log("🔍 Filtering products with criteria:", {
      priceMin,
      priceMax,
      website,
      currency,
      searchTerm,
      limit,
      offset,
    });

    // Build filter conditions dynamically
    const whereConditions: any = {};

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      whereConditions.price_LKR = {};
      if (priceMin !== undefined) {
        whereConditions.price_LKR.gte = Number(priceMin);
      }
      if (priceMax !== undefined) {
        whereConditions.price_LKR.lte = Number(priceMax);
      }
    }

    // Website filter
    if (website) {
      whereConditions.website = {
        equals: website,
        mode: "insensitive",
      };
    }

    // Currency filter
    if (currency) {
      whereConditions.currency = {
        equals: currency,
        mode: "insensitive",
      };
    }

    // Title search filter
    if (searchTerm) {
      whereConditions.title = {
        contains: searchTerm,
        mode: "insensitive",
      };
    }

    // Execute query with filters
    const [products, totalCount] = await Promise.all([
      prisma.catalogue.findMany({
        where: whereConditions,
        take: Number(limit),
        skip: Number(offset),
        orderBy: {
          price_LKR: "asc", // Default sort by price
        },
      }),
      prisma.catalogue.count({
        where: whereConditions,
      }),
    ]);

    console.log(`📦 Found ${products.length} products (total: ${totalCount})`);

    return res.status(200).json({
      success: true,
      count: products.length,
      totalCount,
      limit: Number(limit),
      offset: Number(offset),
      filters: {
        priceMin,
        priceMax,
        website,
        currency,
        searchTerm,
      },
      data: products,
    });
  } catch (error) {
    console.error("❌ Error filtering products:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add a new product to the catalogue
 * @route POST /products/add
 * @body { title: string, price_LKR: number, image_url?: string, currency?: string, source_url?: string, website?: string, source_domain?: string }
 */
export const addProduct = async (req: Request, res: Response) => {
  try {
    const {
      title,
      price_LKR,
      image_url,
      currency = "LKR",
      source_url,
      website,
      source_domain,
    } = req.body;

    console.log("➕ Adding new product:", { title, price_LKR, currency });

    // Validate required fields
    if (!title || typeof title !== "string") {
      return res.status(400).json({
        success: false,
        error: "Title is required and must be a string",
      });
    }

    if (!price_LKR || typeof price_LKR !== "number") {
      return res.status(400).json({
        success: false,
        error: "Price (price_LKR) is required and must be a number",
      });
    }

    // Create new product
    const newProduct = await prisma.catalogue.create({
      data: {
        title,
        price_LKR,
        currency,
        image_url: image_url || null,
        source_url: source_url || null,
        website: website || null,
        source_domain: source_domain || null,
        created_at: new Date(),
        last_updated: new Date(),
        scraped_at: new Date(),
      },
    });

    console.log("✅ Product created successfully with ID:", newProduct.id);

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Cleanup Prisma connection on shutdown
 */
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
