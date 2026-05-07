const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename but ensure it's unique if needed
    // However, usually it's better to timestamp it
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

exports.uploadFiles = (req, res) => {
  upload.array("files", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer Error:", err);
      return res.status(400).json({ success: false, message: "File upload error: " + err.message });
    } else if (err) {
      console.error("Unknown Upload Error:", err);
      return res.status(500).json({ success: false, message: "Internal server error during upload" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploadedFiles = req.files.map((file) => ({
      fileName: file.originalname,
      fileUrl: "/uploads/" + file.filename, // Relative to root
      realPath: file.filename
    }));

    res.status(200).json({ success: true, data: uploadedFiles });
  });
};
