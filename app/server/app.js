const express = require("express");
const router = express.Router();
const { produceMessage } = require("../kafka.init");

router.post("/user", async (req, res) => {
  const csvFilePath = process.env.CSV_FILE_PATH;
  if (!csvFilePath) {
    return res.status(500).send({
      status: "error",
      message: "CSV_FILE_PATH environment variable is missing.",
    });
  }

  try {
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

module.exports = router;
