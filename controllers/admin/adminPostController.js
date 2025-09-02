const prisma = require("../../config/prismaConfig");
const { BadRequestError, ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const uploadFileWithFolder = require("../../utils/s3Upload");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require("path");


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

    // const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = file.buffer;

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

    const findpost = await prisma.post.findMany({ where: { adminId: id }, include: { category: true, admin: true } });
    const finduserpost = await prisma.userPost.findMany({
      include: {
        category: true,
        user: true
      }
    });
    if (findpost.length === 0 && finduserpost.length === 0) {
      throw new NotFoundError("posts not found")
    }

    console.log(findpost, 'findpost');
    console.log(finduserpost, 'finduserpost');



    // Normalize shape so frontend can render a single list
    const normalized = [
      ...findpost.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        image: p.image,
        views: p.views,
        isFlagged: p.isFlagged,
        reportCount: p.reportCount,
        isDeleted: p.isDeleted,
        category: p.category,
        isReport: p.isReport,
        created: { id: p.admin.id, name: p.admin.name, email: p.admin.email, role: 'ADMIN' },
        type: 'ADMIN_POST',
        createdAt: p.createdAt,
      })),
      ...finduserpost.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        image: p.image,
        views: p.views,
        isFlagged: p.isFlagged,
        reportCount: p.reportCount,
        isDeleted: p.isDeleted,
        category: p.category,
        isReport: p.isReport,
        author: { id: p.user.id, name: p.user.name, email: p.user.email, role: 'USER' },
        type: 'USER_POST',
        createdAt: p.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    handlerOk(res, 200, normalized, 'posts found successfully')
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

    // const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = file.buffer;

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
    const { postId } = req.params;

    const findPost = await prisma.post.findFirst({
      where: {
        id: postId,
        isReport: true
      }
    });

    if (!findPost) {
      throw new NotFoundError("post not found")
    }

    if (findPost) {
      // throw new NotFoundError("post not found")

      const deletepost = await prisma.post.delete({
        where: {
          id: findPost.id,
        }
      });

      return handlerOk(res, 200, null, 'post deleted successfully')

    }

    const findUserPost = await prisma.userPost.findFirst({
      where: {
        id: postId,
        isReport: true
      }
    });

    if (!findUserPost) {
      throw new NotFoundError("post not found")
    }

    if (findUserPost) {

      const deletepost = await prisma.userPost.delete({
        where: {
          id: postId,
        }
      });

      return handlerOk(res, 200, null, 'post deleted successfully')

    }




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