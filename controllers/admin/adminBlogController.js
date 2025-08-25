const prisma = require("../../config/prismaConfig");
const { BadRequestError, ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const uploadFileWithFolder = require("../../utils/s3Upload");
const fs = require('fs');

const createBlog = async (req, res, next) => {
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

    const createblog = await prisma.blog.create({
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

    if (!createblog) {
      throw new ValidationError("blog post not create")
    }

    handlerOk(res, 200, createblog, 'blog created successfully');
  } catch (error) {
    next(error)
  }
}

const getAllBlogs = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findblog = await prisma.blog.findMany({ where: { adminId: id }, include: { category: true } });

    if (!findblog) {
      throw new NotFoundError("blog not found")
    }

    handlerOk(res, 200, findblog, 'blog posts found successfully')
  } catch (error) {
    next(error)
  }
}

const updateBlog = async (req, res, next) => {
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

    const findblog = await prisma.blog.findFirst({
      where: {
        id: postId,
        adminId: id
      }
    });

    if (!findblog) {
      throw new NotFoundError("blog not found")
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

    const updateBlog = await prisma.blog.update({
      where: {
        id: postId,
        adminId: id
      },
      data: updatedObj
    });

    if (!updateBlog) {
      throw new ValidationError("blog not updated")
    }

    handlerOk(res, 200, updateBlog, 'blog updated successfully')
  } catch (error) {
    next(error)
  }
}

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { postId } = req.params;

    const findBlog = await prisma.blog.findFirst({
      where: {
        id: postId,
        adminId: id
      }
    });

    if (!findBlog) {
      throw new NotFoundError("blog not found")
    }

    const deleteblog = await prisma.blog.delete({
      where: {
        id: postId,
        adminId: id
      }
    });

    if (!deleteblog) {
      throw new ValidationError("blog not delete")
    }

    handlerOk(res, 200, null, 'blog deleted successfully')

  } catch (error) {
    next(error)
  }
}

module.exports = {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog
}