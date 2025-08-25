const prisma = require("../../config/prismaConfig");
const { BadRequestError, ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const uploadFileWithFolder = require("../../utils/s3Upload");
const fs = require('fs');

const createPost = async (req, res, next) => {
  try {
    const { postTitle, postContent } = req.body;
    const { id } = req.user;
    const file = req.file;
    const { categoryId } = req.params;
    if (!file) {
      throw new BadRequestError("please provide blog image");
    }

    const findcategory = await prisma.interest.findUnique({ where: { id: categoryId } })


    if (!findcategory) {
      throw new NotFoundError("blog category not found")
    }
    // const filePath = file.filename; // use filename instead of path
    // const basePath = `http://${req.get("host")}/public/uploads/`;
    // const blogImage = `${basePath}${filePath}`;

    const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = file.filename; // The filename of the uploaded file
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = fs.readFileSync(filePath);

    const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);


    const createpost = await prisma.post.create({
      data: {
        title: postTitle,
        content: postContent,
        adminId: id,
        image: s3ImageUrl,
        categoryId: findcategory.id
      },
      include: {
        category: true
      }
    });

    if (!createPost) {
      throw new ValidationError("post not create")
    }

    handlerOk(res, 200, createpost, 'post created successfully');
  } catch (error) {
    next(error)
  }
}

const getAllPosts = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findpost = await prisma.post.findMany({ where: { adminId: id }, include: { category: true } });

    if (!findpost) {
      throw new NotFoundError("post not found")
    }

    handlerOk(res, 200, findpost, 'posts found successfully')
  } catch (error) {
    next(error)
  }
}

const updatePost = async (req, res, next) => {
  try {
    const { postTitle, postContent } = req.body;
    const { id } = req.user;
    const file = req.file;
    const { postId } = req.params;
    const updatedObj = {};

    const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = file.filename; // The filename of the uploaded file
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = fs.readFileSync(filePath);

    const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);

    const findpost = await prisma.post.findFirst({
      where: {
        id: postId,
        adminId: id
      }
    });

    if (!findpost) {
      throw new NotFoundError("post not found")
    }

    if (postTitle) {
      updatedObj.title = postTitle
    }

    if (postContent) {
      updatedObj.content = postContent
    }

    if (file) {
      // const filePath = file.filename; // use filename instead of path
      // const basePath = `http://${req.get("host")}/public/uploads/`;
      // const image = `${basePath}${filePath}`;
      updatedObj.image = s3ImageUrl;
    }

    const updatePost = await prisma.post.update({
      where: {
        id: postId,
        adminId: id
      },
      data: updatedObj
    });

    if (!updatePost) {
      throw new ValidationError("post not updated")
    }

    handlerOk(res, 200, updatePost, 'post updated successfully')
  } catch (error) {
    next(error)
  }
}

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { postId } = req.params;

    const findPost = await prisma.post.findFirst({
      where: {
        id: postId,
        adminId: id
      }
    });

    if (!findPost) {
      throw new NotFoundError("post not found")
    }

    const deletepost = await prisma.post.delete({
      where: {
        id: postId,
        adminId: id
      }
    });

    if (!deletepost) {
      throw new ValidationError("post not delete")
    }

    handlerOk(res, 200, null, 'post deleted successfully')

  } catch (error) {
    next(error)
  }
}

module.exports = {
  createPost,
  getAllPosts,
  updatePost,
  deletePost
}