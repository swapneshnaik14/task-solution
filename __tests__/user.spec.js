const request = require('supertest');
const express = require('express');
const router = require('../app/server/app');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(router);


jest.mock('../app/kafka.init', () => ({
  produceMessage: jest.fn(),
  createConsumer: jest.fn()
}));

jest.mock('../app/service/user.service', () => ({
  createUsersInBatch: jest.fn()
}));

jest.mock('../app/postgres.init', () => ({
  query: jest.fn()
}));

const { produceMessage, createConsumer } = require('../app/kafka.init');
const { createUsersInBatch } = require('../app/service/user.service');
const sequelize = require('../app/postgres.init');


describe('Consumer Tests', () => {
  let consumerStub;
  
  beforeEach(() => {
    jest.clearAllMocks();
    consumerStub = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn().mockImplementation(async ({ eachMessage }) => {
        return eachMessage;
      })
    };
    createConsumer.mockReturnValue(consumerStub);
  });

  describe('processCSVFile', () => {
    it('should process valid CSV file successfully', async () => {
      const testCsvContent = 
        'name,email,age\n' +
        'John Doe,john@example.com,25\n' +
        'Jane Smith,jane@example.com,35';
      
      const tempFilePath = path.join(__dirname, 'test.csv');
      fs.writeFileSync(tempFilePath, testCsvContent);

      const message = {
        value: Buffer.from(JSON.stringify({ pathToCsv: tempFilePath }))
      };

      consumerStub.run.mockImplementationOnce(async ({ eachMessage }) => {
        await eachMessage({
          topic: 'user-create',
          partition: 0,
          message
        });
      });

      await consumerStub.run({
        eachMessage: async ({ topic, partition, message }) => {
          const data = JSON.parse(message.value.toString());
          await createUsersInBatch(data.pathToCsv);
        }
      });

      expect(createUsersInBatch).toHaveBeenCalledWith(tempFilePath);
      
      fs.unlinkSync(tempFilePath);
    });

    it('should handle CSV with validation errors', async () => {
      const testCsvContent = 
        'name,email,age\n' +
        'John Doe,invalid-email,25\n' +
        'Jane Smith,jane@example.com,invalid-age';
      
      const tempFilePath = path.join(__dirname, 'test.csv');
      fs.writeFileSync(tempFilePath, testCsvContent);

      const message = {
        value: Buffer.from(JSON.stringify({ pathToCsv: tempFilePath }))
      };

      consumerStub.run.mockImplementationOnce(async (callback) => {
        await callback({
          topic: 'user-create',
          partition: 0,
          message: message
        });
      });

      await consumerStub.run(jest.fn());

      expect(createUsersInBatch).not.toHaveBeenCalled();
      
      fs.unlinkSync(tempFilePath);
    });

    it('should process batches of correct size', async () => {
      let testCsvContent = 'name,email,age\n';
      for (let i = 0; i < 150; i++) {
        testCsvContent += `User${i},user${i}@example.com,25\n`;
      }
      
      const tempFilePath = path.join(__dirname, 'test.csv');
      fs.writeFileSync(tempFilePath, testCsvContent);

      const message = {
        value: Buffer.from(JSON.stringify({ pathToCsv: tempFilePath }))
      };
      consumerStub.run.mockImplementationOnce(async ({ eachMessage }) => {
        await eachMessage({
          topic: 'user-create',
          partition: 0,
          message
        });
      });

      await consumerStub.run({
        eachMessage: async ({ topic, partition, message }) => {
          const data = JSON.parse(message.value.toString());
          await createUsersInBatch(data.pathToCsv);
        }
      });

      expect(createUsersInBatch).toHaveBeenCalledTimes(1);
      
      fs.unlinkSync(tempFilePath);
    });
  });
});

describe('POST /user endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 500 when CSV_FILE_PATH is not set', async () => {
    const originalEnv = process.env.CSV_FILE_PATH;
    delete process.env.CSV_FILE_PATH;

    const response = await request(app)
      .post('/user')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'error',
      message: 'CSV_FILE_PATH environment variable is missing.'
    });
    
    process.env.CSV_FILE_PATH = originalEnv;
  });

  it('should return 200 when message is produced successfully', async () => {
    process.env.CSV_FILE_PATH = '/test/path/file.csv';
    produceMessage.mockResolvedValueOnce();

    const response = await request(app)
      .post('/user')
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'pending',
      message: 'file is being processed.'
    });
    expect(produceMessage).toHaveBeenCalledWith({ 
      pathToCsv: '/test/path/file.csv' 
    });
  });

  it('should return 500 when produceMessage fails', async () => {
    process.env.CSV_FILE_PATH = '/test/path/file.csv';
    produceMessage.mockRejectedValueOnce(new Error('Kafka error'));

    const response = await request(app)
      .post('/user')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Failed to produce message.'
    });
    expect(produceMessage).toHaveBeenCalledWith({ 
      pathToCsv: '/test/path/file.csv' 
    });
  });
});