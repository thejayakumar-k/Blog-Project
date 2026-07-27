const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Prevent mongoose buffering
mongoose.set("bufferCommands", false);

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    isConnected = true;
    console.log("MongoDB Atlas Connected Successfully");
  } catch (err) {
    console.error("Connection Error:", err);
    throw err;
  }
}

// Schema
const blogSchema = new mongoose.Schema({
  newTitle: String,
  newContent: String,
  date: String,
  likes: Number,
});

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

// Test Route
app.get("/", async (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

// Get Blogs
app.get("/api/blogs", async (req, res) => {
  try {
    await connectDB();

    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

// Like Blog
app.patch("/api/blogs/like/:id", async (req, res) => {
  try {
    await connectDB();

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          likes: 1,
        },
      },
      {
        new: true,
      }
    );

    res.json(updatedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

// Add Blog
app.post("/api/blogs", async (req, res) => {
  try {
    await connectDB();

    const blog = new Blog({
      newTitle: req.body.newTitle,
      newContent: req.body.newContent,
      date: req.body.date,
      likes: req.body.likes,
    });

    const newBlog = await blog.save();

    res.status(201).json(newBlog);
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = app;