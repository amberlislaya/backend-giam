const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongodbId");



const createProduct = asyncHandler(async (req, res) => {
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
    }
const newProduct = await Product.create(req.body);
      res.json(newProduct);
} catch (error) {
    throw new Error(error);
}
});


const updateProduct = asyncHandler(async (req, res) => {
const id = req.params;
  //validateMongoDbId(id);
try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
}
const updateProduct = await Product.findOneAndUpdate({ id }, req.body, {
      new: true,
});
    res.json(updateProduct);
} catch (error) {
    throw new Error(error);
}
});


const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findOneAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});


const getaProduct = asyncHandler(async (req, res) => {
const { id } = req.params;
    //validateMongoDbId(id);
try {
const findProduct = await Product.findById(id).populate("color");
      res.json(findProduct);
} catch (error) {
      throw new Error(error);
}
});


const getAllProduct = asyncHandler(async (req, res) => {
    try {
      // Filtering
const queryObj = { ...req.query };
const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
  let query = Product.find(JSON.parse(queryStr));
  
      // Sorting
  
  if (req.query.sort) {
const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
} else {
    query = query.sort("-createdAt");
}
 // limiting the fields

 if (req.query.fields) {
const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
} else {
    query = query.select("-__v");
}

  // pagination

const page = req.query.page;
const limit = req.query.limit;
const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);
  if (req.query.page) {
const productCount = await Product.countDocuments();
    if (skip >= productCount) throw new Error("Esta pagina no existe");
}
const product = await query;
  res.json(product);
} catch (error) {
  throw new Error(error);
}
});
  
  

const addToWishlist = asyncHandler(async (req, res) => {
const userId = req.params.id;
const {productId} = req.body;
console.log(productId);

  try {

    const usuarioActualizado = await User.findByIdAndUpdate(userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    );


    res.json(usuarioActualizado);

     }
 catch (error) {
    throw new Error(error);
}
});



/////////////////////////////////////////////////////////////// COMPARE
const addToCompare = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;

  try {
    // Buscar al usuario
    const user = await User.findById(_id);

    // Verificar si el producto ya está en la lista de comparación del usuario
    const alreadyAdded = user.compare.find(id => id.toString() === prodId);

    if (alreadyAdded) {
      return res.status(400).json({ message: "El producto ya está en la lista de comparación" });
    }

    // Agregar el producto a la lista de comparación del usuario
    user.compare.push(prodId);
    await user.save();

    // Retornar la respuesta con el usuario actualizado
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al agregar producto a comparación", error: error.message });
  }
});




const rating = asyncHandler(async (req, res) => {
//const { _id } = req.user;
 console.log("gaaa");
const _id = req.params.id;
console.log(_id);
console.log(req.body);
const { star, prodId, comment } = req.body;
  try {
const product = await Product.findById(prodId);
  let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
);
  if (alreadyRated) {
const updateRating = await Product.updateOne(
{
    ratings: { $elemMatch: alreadyRated },
},
{
    $set: { "ratings.$.star": star, "ratings.$.comment": comment },
},
{
    new: true,
}
);
} else {
const rateProduct = await Product.findByIdAndUpdate(
     prodId,
{
  $push: {
  ratings: {
  star: star,
  comment: comment,
  postedby: _id,
},
},
},
{
    new: true,
}
);
}
const getallratings = await Product.findById(prodId);
let totalRating = getallratings.ratings.length;
let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
let actualRating = Math.round(ratingsum / totalRating);
let finalproduct = await Product.findByIdAndUpdate(
      prodId,
{
        totalrating: actualRating,
},
{ new: true }
);
    res.json(finalproduct);
} catch (error) {
    throw new Error(error);
}
});





module.exports = {createProduct, getaProduct, getAllProduct,
   updateProduct, deleteProduct, addToWishlist, rating, addToCompare,
  
  }