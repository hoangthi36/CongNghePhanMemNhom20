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
import { upload } from "../config/multerConfig.js";
const router = express.Router();

//I.Create post
router.post("/posts", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      // Lỗi từ Multer
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File quá lớn, tối đa 5MB" });
      }
      return res
        .status(400)
        .json({ message: "Lỗi upload", error: err.message });
    }
    createPost(req, res);
  });
});
//II.Read posts
//1.---Xem tat ca bai viet
router.get("/getall", getAllPosts);
//2.---Xem bai viet moi nhat
router.get("/posts/latest", getLatestPosts);
//III.Update post
//1.---Ghim/bo ghim bai viet
router.patch("/posts/toggle-pin/:postId", togglePinPost);
//2.---Cap nhat bai viet
router.patch("/update/:postId", updatePost);
//IV.Delete post
router.delete("/delete/:postId", deletePost);
//Xóa tất cả bài viết (chỉ admin)
router.delete("/posts/delete-all", deleteAllPosts);
export default router;
