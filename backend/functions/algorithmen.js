
const ALGORITHMEN = {
  1: ["A", "A", "E", "E", "F", "F"],
  2: ["A", "A", "A", "A", "F", "F", "E", "E", "E", "E","F", "F"],
};

async function getAlgorithmus(id) {
  const algo = ALGORITHMEN[Number(id)];
  if (!algo) {
    throw new Error(`Unbekannter Algorithmus: ${id}`);
  }
  return algo;
}

module.exports = {
  ALGORITHMEN,
  getAlgorithmus,
};
