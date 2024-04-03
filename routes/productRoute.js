const express = require("express");
const { createProduct, getaProduct, getAllProduct, updateProduct, 
    deleteProduct,
    addToWishlist,
    rating,
    addToCompare, 
} = require("../controller/productCtrl");
//const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");



const router = express.Router();


router.post("/", createProduct);
router.get("/:id", getaProduct);
router.post("/wishlist/:id", addToWishlist);
router.put("/compare-product", addToCompare);
router.put("/rating/:id", rating);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/", getAllProduct);

module.exports = router;
