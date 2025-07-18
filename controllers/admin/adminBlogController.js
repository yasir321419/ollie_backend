const prisma = require("../../config/prismaConfig");
const { BadRequestError, ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

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
    const filePath = file.filename; // use filename instead of path
    const basePath = `http://${req.get("host")}/public/uploads/`;
    const blogImage = `${basePath}${filePath}`;

    const createpost = await prisma.blog.create({
      data: {
        title: postTitle,
        content: postContent,
        adminId: id,
        image: blogImage,
        categoryId: findcategory.id
      },
      include: {
        category: true
      }
    });

    if (!createPost) {
      throw new ValidationError("blog post not create")
    }

    handlerOk(res, 200, createpost, 'post created successfully');
  } catch (error) {
    next(error)
  }
}

const getAllPosts = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findpost = await prisma.blog.findMany({ where: { adminId: id }, include: { category: true } });

    if (!findpost) {
      throw new NotFoundError("post not found")
    }

    handlerOk(res, 200, findpost, 'blog posts found successfully')
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

    const findpost = await prisma.blog.findFirst({
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
      const filePath = file.filename; // use filename instead of path
      const basePath = `http://${req.get("host")}/public/uploads/`;
      const image = `${basePath}${filePath}`;
      updatedObj.image = image;
    }

    const updatePost = await prisma.blog.update({
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

    const findPost = await prisma.blog.findFirst({
      where: {
        id: postId,
        adminId: id
      }
    });

    if (!findPost) {
      throw new NotFoundError("post not found")
    }

    const deletepost = await prisma.blog.delete({
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