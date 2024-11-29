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

3. Run the local setup script to configure your environment:

   ```bash
   ./run.local.sh
4. Start the consumer service to process data asynchronously:

   ```bash
   npm start consumer
4. API Endpoint:

   ```bash
   POST /api/user: This is the main endpoint where user data (e.g., name, age) is submitted. The API responds immediately, while the data is asynchronously processed and stored in PostgreSQL.


##  Features
1. Validation: An array is used to store all validation errors that occur during the processing of user data.
2. Unique Constraints: For now, the name and age fields are marked as unique to avoid duplicate entries. An index has been added to the database for this purpose. You can easily extend this to include other fields (such as email or phoneNumber) if needed in the future.
3. Asynchronous Processing: By using Kafka, the API can handle requests asynchronously, reducing waiting times and keeping the user experience smooth.
   
##  Considerations
1. Scalability: Kafka is used to handle high-throughput data processing, making the system scalable and efficient for a large number of requests.
2. Error Handling: All validation errors are captured and stored in an array for later review or logging.
3. Database Indexing: To prevent duplicate entries in the database, we have added an index on the name and age fields. This can be extended to other fields if required.
