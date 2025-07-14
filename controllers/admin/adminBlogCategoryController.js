const prisma = require("../../config/prismaConfig");
const { ConflictError, ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");



// const createPostCategory = async (req, res, next) => {
//   try {
//     const { postCategory } = req.body;
//     const { id } = req.user;

//     const findcategory = await prisma.blogCategory.findFirst({
//       where: {
//         name: postCategory,
//         adminId: id
//       }
//     });

//     if (findcategory) {
//       throw new ConflictError("category already exist");
//     }

//     const createcategory = await prisma.blogCategory.create({
//       data: {
//         name: postCategory,
//         adminId: id
//       }
//     });

//     if (!createcategory) {
//       throw new ValidationError("category not create")
//     }

//     handlerOk(res, 200, createcategory, 'category created successfully')

//   } catch (error) {
//     next(error)
//   }
// }

// const getPostCategory = async (req, res, next) => {
//   try {
//     const { id } = req.user;

//     const findpostcategory = await prisma.blogCategory.findMany({
//       where: {
//         adminId: id
//       }
//     });

//     if (findpostcategory.length === 0) {
//       throw new NotFoundError("post category not found");

//     }
//     handlerOk(res, 200, findpostcategory, 'category found successfully')


//   } catch (error) {
//     next(error)
//   }
// }

// const updatePostCategory = async (req, res, next) => {
//   try {
//     const { categoryId } = req.params;
//     const { postCategory } = req.body;
//     const { id } = req.user;

//     const findcategory = await prisma.blogCategory.findFirst({
//       where: {
//         id: parseInt(categoryId),
//         adminId: id
//       }
//     });

//     if (!findcategory) {
//       throw new NotFoundError("post category not found")
//     }

//     const updatepostcategory = await prisma.blogCategory.update({
//       where: {
//         id: parseInt(categoryId),
//         adminId: id
//       },

//       data: {
//         name: postCategory
//       }
//     });

//     if (!updatepostcategory) {
//       throw new ValidationError("post category not update")
//     }

//     handlerOk(res, 200, updatepostcategory, 'post category updated successfully')
//   } catch (error) {
//     next(error)
//   }
// }

// const deletePostCategory = async (req, res, next) => {
//   try {
//     const { categoryId } = req.params;
//     const { id } = req.user;

//     const findcategory = await prisma.blogCategory.findFirst({
//       where: {
//         id: parseInt(categoryId),
//         adminId: id
//       }
//     });

//     if (!findcategory) {
//       throw new NotFoundError("post category not found")
//     }

//     const updatepostcategory = await prisma.blogCategory.delete({
//       where: {
//         id: parseInt(categoryId),
//         adminId: id
//       }
//     });

//     if (!updatepostcategory) {
//       throw new ValidationError("post category not delete")
//     }

//     handlerOk(res, 200, null, 'post category deleted successfully')
//   } catch (error) {
//     next(error)
//   }
// }




module.exports = {
  // createPostCategory,
  // getPostCategory,
  // updatePostCategory,
  // deletePostCategory,
}