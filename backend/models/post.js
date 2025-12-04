import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    //Tieu de bai viet
    title: {
      type: String,
      required: true,
    },
    //Noi dung bai viet
    content: {
      type: String,
      required: true,
    },
    //Anh minh hoa bai viet
    imageUrl: {
      type: String,
      required: false,
      default: null,
    },
    //Ghim bai viet len dau trang
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
