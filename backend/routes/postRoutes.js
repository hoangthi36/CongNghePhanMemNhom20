import {
  createPost,
  getAllPosts,
  getLatestPosts,
  togglePinPost,
  updatePost,
  deletePost,
  deleteAllPosts,
} from "../controllers/postControllers.js";
import express from "express";
const router = express.Router();

//I.Create post
router.post("/create-post", createPost);
//II.Read posts
//1.---Xem tat ca bai viet
router.get("/posts", getAllPosts);
//2.---Xem bai viet moi nhat
router.get("/posts/latest", getLatestPosts);
//III.Update post
//1.---Ghim/bo ghim bai viet
router.patch("/posts/toggle-pin/:postId", togglePinPost);
//2.---Cap nhat bai viet
router.patch("/posts/update/:postId", updatePost);
//IV.Delete post
router.delete("/posts/delete/:postId", deletePost);
//Xóa tất cả bài viết (chỉ admin)
router.delete("/posts/delete-all", deleteAllPosts);
export default router;
