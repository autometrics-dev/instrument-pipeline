const awaitableTimeout = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

await awaitableTimeout(1000);
