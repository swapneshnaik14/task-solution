# Project Title
Batch User Proccessing

## Overview

This project leverages **Kafka** to asynchronously process API requests. When an API request is received, the response is sent immediately, while the data is processed by a Kafka consumer and stored in a PostgreSQL database. This approach ensures that the API remains fast and responsive without having to wait for the data processing to complete.

## Requirements

Before you start, make sure you have the following tools and dependencies installed:

- **Node.js** and **npm** for managing dependencies and running the application.
- **Kafka**: Kafka should be installed and running in your local environment to handle message queues.
- **PostgreSQL**: A PostgreSQL database should be set up to store processed data.

## Installation

1. Install the required dependencies for the project:

   ```bash
   npm install
2. Ensure Kafka is installed and started on your machine.
3. define the necessary environment variables in env and run.local.sh
   ```bash
   KAFKA_BROKER=localhost:9092
   KAFKA_TOPIC=your_topic_name
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
4. Run the local setup script to configure your environment:

   ```bash
   ./run.local.sh
5. Start the consumer service to process data asynchronously:
   ```bash
   npm start consumer
6. Run test cases 
   ```bash
   npm run test

7. API Endpoint:

   ```bash
   POST /api/user: This is the main endpoint where data is asynchronously processed and stored in PostgreSQL.can create a separate API to check user data
   GET /api/user/status/:slug: Endpoint to check whether the user's status has been processed or completed.
   


##  Features
1. Validation: An array is used to store all validation errors that occur during the processing of user data.
2. Unique Constraints: For now, the name and age fields are marked as unique to avoid duplicate entries. An index has been added to the database for this purpose. You can easily extend this to include other fields (such as email or phoneNumber) if needed in the future.
3. Asynchronous Processing: By using Kafka, the API can handle requests asynchronously, reducing waiting times and keeping the user experience smooth.
   
##  Considerations
1. Scalability: Kafka is used to handle high-throughput data processing, making the system scalable and efficient for a large number of requests.
2. You can use a separate API to check the status of the operation and retrieve the user data.
3. Error Handling: All validation errors are captured and stored in an array for later review or logging.
4. Database Indexing: To prevent duplicate entries in the database, we have added an index on the name and age fields. This can be extended to other fields if required.
5. Instead of calculating the age group distribution at runtime, use a query to fetch the distribution directly from the database.

<img width="852" alt="image" src="https://github.com/user-attachments/assets/66ecb548-05d3-4a09-8c02-76e67e326a2f">

<img width="636" alt="image" src="https://github.com/user-attachments/assets/7d5b388b-c0dd-4c7b-81f8-27754160c61b">


<img width="485" alt="image" src="https://github.com/user-attachments/assets/6e656cc2-15c5-4174-8db9-ad255bdb1fc9">

