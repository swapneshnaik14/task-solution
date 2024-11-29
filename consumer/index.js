const { runConsumer } = require('./consumer');

const start = async () => {
  try {
    await runConsumer();
  } catch (err) {
    console.error('Error starting Kafka consumer:', err);
  }
};

start();
