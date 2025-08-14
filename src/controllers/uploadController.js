const Upload = require('../models/upload');
const { uploadFileToS3, deleteFileFromS3 } = require('../utils/s3');

// Upload multiple files
const uploadFiles = async (req, res) => {
  try {
    const filesData = [];

    for (const file of req.files) {
      const result = await uploadFileToS3(file);
      filesData.push({
        name: file.originalname,
        url: result.url,
        key: result.key,
      });
    }

    const upload = new Upload({
      uploaderName: req.body.uploaderName || 'Anonymous',
      files: filesData,
    });

    await upload.save();
    res.status(201).json({ message: 'Files uploaded successfully', upload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all uploaded file groups
const getAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.find().sort({ uploadedAt: -1 });
    res.status(200).json(uploads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an entire upload group
const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ message: 'Upload not found' });

    for (const file of upload.files) {
      await deleteFileFromS3(file.key);
    }

    await Upload.findByIdAndDelete(id);
    res.status(200).json({ message: 'Upload and files deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a single file from an upload group
const deleteSingleFile = async (req, res) => {
  try {
    const { uploadId, fileId } = req.params;

    const upload = await Upload.findById(uploadId);
    if (!upload) return res.status(404).json({ message: 'Upload not found' });

    const file = upload.files.id(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Delete file from S3
    await deleteFileFromS3(file.key);

    // Remove file from MongoDB subdocument
   upload.files.pull(fileId);
    await upload.save();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadFiles,
  getAllUploads,
  deleteUpload,
  deleteSingleFile, // Export new controller
};
