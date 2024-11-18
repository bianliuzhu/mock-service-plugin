/**
 * @url /stream/test
 */
module.exports = function (req, Mock) {
  return [
    { message: "第一条消息" },
    { message: "第二条消息" },
    { message: "第三条消息" },
  ];
};
