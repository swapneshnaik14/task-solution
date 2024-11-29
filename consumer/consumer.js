require('dotenv').config(); // Load environment variables from .env file
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { createConsumer } = require("../app/kafka.init");
const { createUsersInBatch } = require("../app/service/user.service");
const { parseCSVRow } = require("../app/utils/user.utils");
const sequelize = require("../app/postgres.init");

// Initialize Kafka consumer with group 'test-group'
const consumer = createConsumer("test-group");

// Function to process a CSV file, parse rows, and insert users in batches
const processCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, "utf8"); // Read file as a stream
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity, // Handle line breaks properly
    });

    let headers = []; // Store CSV headers
    let result = []; // Store successfully parsed rows
    let errorDocuments = []; // Store rows that have errors
    let batch = []; // Temporary array to store users for batch insertion
    const batchSize = 100; // Set the batch size for bulk insert
    let lineIndex = 0; // Counter for the current line in CSV

    // Process each line in the CSV file
    rl.on("line", (line) => {
      lineIndex++;
      // First line is for headers
      if (lineIndex === 1) {
        headers = line.split(",").map((header) => header.trim()); // Parse headers
      } else {
        // Parse the CSV row and check for errors
        const { obj, errors } = parseCSVRow(line, headers);

        if (errors.length > 0) {
          // If there are errors, push the row to the errorDocuments array
          errorDocuments.push(
            JSON.stringify({ rowIndex: lineIndex, errors, data: obj })
          );
        } else {
          // Otherwise, add the user object to the batch
          batch.push(obj);
        }

        // If the batch size is reached, insert the batch of users
        if (batch.length >= batchSize) {
          result.push(...batch); // Add the batch to the result array
          createUsersInBatch(batch) // Call the function to insert users in the batch
            .then(() => {
              console.log("Inserted batch");
            })
            .catch((err) => {
              console.error("Error inserting batch:", err);
            });
          batch = []; // Clear the batch for the next set of users
        }
      }
    });

    // When the file is fully read, insert any remaining users in the last batch
    rl.on("close", async () => {
      if (batch.length > 0) {
        result.push(...batch);
        try {
          await createUsersInBatch(batch); // Insert remaining users in batch
        } catch (err) {
          console.error("Error inserting remaining users:", err);
        }
      }
      resolve({ errors: errorDocuments }); // Resolve the promise with error details
    });

    // Handle any errors during file reading
    rl.on("error", (err) => {
      reject(new Error("Error processing the CSV file"));
    });
  });
};

// Function to run the Kafka consumer, listen to messages and process CSV files
const runConsumer = async () => {
  await consumer.connect(); // Connect the Kafka consumer
  console.log("Consumer connected");
  await consumer.subscribe({ topic: "user-create", fromBeginning: true }); // Subscribe to the 'user-create' topic

  // Define the logic for handling each incoming Kafka message
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        // Parse the Kafka message and extract the file path to the CSV
        const parsedMessage = JSON.parse(message.value.toString());
        const filePath = path.resolve(__dirname, parsedMessage.pathToCsv);

        // Process the CSV file and handle errors
        const result = await processCSVFile(filePath);

        // Run a SQL query to get the distribution of users across different age groups
        const [ageGroupPercentages] = await sequelize.query(`
          WITH total_users AS (
              SELECT COUNT(*) AS total FROM users
          )
          SELECT
              ag.Age_Group,
              COALESCE((uc.user_count * 100.0) / tu.total, 0) AS Distribution
          FROM (
              VALUES 
                  ('Under 20'),
                  ('20 to 40'),
                  ('40 to 60'),
                  ('Above 60')
          ) AS ag(Age_Group)
          LEFT JOIN (
              SELECT
                  CASE
                      WHEN age < 20 THEN 'Under 20'
                      WHEN age BETWEEN 20 AND 40 THEN '20 to 40'
                      WHEN age BETWEEN 40 AND 60 THEN '40 to 60'
                      WHEN age > 60 THEN 'Above 60'
                  END AS Age_Group,
                  COUNT(*) AS user_count
              FROM users
              GROUP BY Age_Group
          ) uc ON ag.Age_Group = uc.Age_Group
          JOIN total_users tu ON 1 = 1;
        `);
      
        console.log("Errors", result); // Log the results of the CSV file processing
        console.log(ageGroupPercentages); // Log the age group distribution
      } catch (err) {
        console.error("Error processing message:", err); // Handle any errors during message processing
      }
    },
  });
};

module.exports = { runConsumer };
