const express = require("express");
const router = express.Router();
const { produceMessage } = require("../kafka.init");
const UserProcessingStatus = require('../model/user_add_status.model');

router.post("/user", async (req, res) => {
  const csvFilePath = process.env.CSV_FILE_PATH;
  if (!csvFilePath) {
    return res.status(500).send({
      status: "error",
      message: "CSV_FILE_PATH environment variable is missing.",
    });
  }

  try {
    const fileName = csvFilePath.split('/').pop();
    const slug = fileName.split('.')[0];
    
    // Check if record exists
    const existingRecord = await UserProcessingStatus.findOne({
      where: { slug: slug }
    });

    if (existingRecord) {
      // Update existing record
      await existingRecord.update({
        status: 'PROCESSING'
      });
    } else {
      // Create new record
      await UserProcessingStatus.create({
        slug: slug,
        status: 'PROCESSING',
      });
    }
    //handling asynchronous pushing to Kafka and processing the consumed data.
    await produceMessage({ pathToCsv: csvFilePath });
    return res.status(200).send({
      status: "pending",
      message: "file is being processed.",
    });
  } catch (error) {
    console.error("Error producing message:", error);
    return res.status(500).send({
      status: "error",
      message: "Failed to produce message.",
    });
  }
});


router.get("/user/status/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    
    const processingStatus = await UserProcessingStatus.findOne({
      where: { slug }
    });

    if (!processingStatus) {
      return res.status(404).send({
        status: "error",
        message: "No processing record found for this file"
      });
    }

    return res.status(200).send({
      status: "success",
      data: {
        fileName: processingStatus.slug,
        status: processingStatus.status,
        updatedAt: processingStatus.updatedAt
      }
    });

  } catch (error) {
    console.error("Error fetching status:", error);
    return res.status(500).send({
      status: "error",
      message: "Failed to fetch processing status"
    });
  }
});

module.exports = router;
