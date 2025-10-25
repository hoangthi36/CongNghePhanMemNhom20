import Post from "../models/post.js";

//I.Create post

export const createPost = async (req, res) => {
  try {
    const { title, content, isPinned } = req.body;

    // Lấy đường dẫn ảnh từ file upload
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

    const newPost = new Post({ title, content, imageUrl, isPinned });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//II.Read posts

//1.---Xem tat ca bai viet

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // ✅ ĐẾM TOTAL POSTS (không đổi)
    const totalPosts = await Post.countDocuments();

    // ✅ QUAN TRỌNG: Sort GHIM LÊN ĐẦU TRƯỚC, createdAt SAU
    const posts = await Post.find()
      .sort({
        isPinned: -1, // 1. GHIM (true=1) lên ĐẦU
        createdAt: -1, // 2. Trong cùng nhóm → mới nhất trước
      })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching all posts",
      error,
    });
  }
};

//2.---Xem bai viet moi nhat???

export const getLatestPosts = async (req, res) => {
  try {
    const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(latestPosts);
  } catch (error) {
    res.status(500).json({
      message: "Server error while retrieving the latest posts",
      error,
    });
  }
};
//III.Update post

//1.---Ghim/bo ghim bai viet

export const togglePinPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Tìm bài viết theo ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Đảo trạng thái ghim
    post.isPinned = !post.isPinned;

    await post.save();

    res.status(200).json({
      message: post.isPinned
        ? "Post has been pinned successfully"
        : "Post has been unpinned successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating pin status",
      error,
    });
  }
};

//2.---Cap nhat bai viet

export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, imageUrl, isPinned } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, content, imageUrl, isPinned },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while updating the post", error });
  }
};

//IV.Delete post

//1.---Xoa 1 bai viet

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while deleting the post", error });
  }
};

//2.---Xoa tat ca bai viet

export const deleteAllPosts = async (req, res) => {
  try {
    await Post.deleteMany({});
    res.status(200).json({ message: "All posts deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while deleting all posts", error });
  }
};
