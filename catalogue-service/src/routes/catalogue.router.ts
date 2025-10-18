import { Router } from "express";
import {
  getScrapedProductById,
  getAllScrapedProducts,
  searchProducts,
  filterProducts,
  addProduct,
} from "../controller/catalogue.controller";

const router = Router();

/**
 * @route   GET /products
 * @desc    Get all scraped products (debugging)
 * @access  Public
 */
router.get("/", getAllScrapedProducts);

/**
 * @route   POST /products/add
 * @desc    Add a new product to the catalogue
 * @body    { title: string, price_LKR: number, image_url?: string, currency?: string, source_url?: string, website?: string, source_domain?: string }
 * @access  Seller (should be protected)
 */
router.post("/add", addProduct);

/**
 * @route   POST /products/search
 * @desc    Search products by title with similarity matching
 * @body    { searchTerm: string, limit?: number }
 * @access  Public
 */
router.post("/search", searchProducts);

/**
 * @route   POST /products/filter
 * @desc    Filter products with various conditions (price, website, currency, etc.)
 * @body    { priceMin?: number, priceMax?: number, website?: string, currency?: string, searchTerm?: string, limit?: number, offset?: number }
 * @access  Public
 */
router.post("/filter", filterProducts);

/**
 * @route   GET /products/:id
 * @desc    Get scraped product details by ID
 * @access  Public
 */
router.get("/:id", getScrapedProductById);

export { router as catalogueRouter };
