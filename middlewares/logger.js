export default (req, res, next) => {
  console.log(`${req.method} | ${req.url}`);
  console.log(`Request body: ${JSON.stringify(req.body) || null} \n`);
  next();
};
