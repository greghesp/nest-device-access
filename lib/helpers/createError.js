module.exports = function createError(message, code) {
  const error = new Error(message);
  // error.toJSON = function toJSON() {
  //   return {
  //     message: message,
  //     name: this.name,
  //     code: code,
  //   };
  // };
  throw error;
};
