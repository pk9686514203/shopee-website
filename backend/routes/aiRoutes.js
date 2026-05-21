const express = require("express");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), (req, res) => {
  try {
    res.json({
      success: true,

      recommendation: {
        shirt: "Black Shirt",
        pants: "Beige Pants",
        shoes: "White Sneakers",
        watch: "Silver Watch",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
});

module.exports = router;