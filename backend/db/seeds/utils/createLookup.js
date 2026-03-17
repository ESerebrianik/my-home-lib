const createLookup = (array, key, value) => {
  const lookup = {};

  array.forEach((item) => {
    lookup[item[key]] = item[value];
  });

  return lookup;
};

module.exports = createLookup;