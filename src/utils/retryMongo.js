const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryMongoInsert = async (operation, retries = 3, delay = 500) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;

      console.error(`Mongo attempt ${attempt} failed:`, err.message);

      if (attempt >= retries) {
        throw err;
      }

      // exponential backoff
      await sleep(delay * attempt);
    }
  }
};

module.exports = retryMongoInsert;