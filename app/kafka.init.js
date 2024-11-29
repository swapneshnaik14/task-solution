const { Kafka , Partitioners} = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  producer: {
    createPartitioner: Partitioners.LegacyPartitioner, 
  },
});


const producer = kafka.producer();


const produceMessage = async (message) => {
  try {
    await producer.connect(); 
    await producer.send({
      topic:  process.env.KAFKA_TOPIC || 'user-create',
      messages: [{
        value: JSON.stringify(message)
      }],
    });
    console.log('Message sent to Kafka:', message);
  } catch (error) {
    console.error('Error in producing message:', error);
  } finally {
    await producer.disconnect();
  }
};


const createConsumer = (groupId) => {
  return kafka.consumer({ groupId });
};

module.exports = { produceMessage, createConsumer };
