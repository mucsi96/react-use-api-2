const names = require("./names.json");

function parseCookies(cookie) {
  if (!cookie) {
    return {};
  }

  return cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    return { ...acc, [key.trim()]: value.trim() };
  }, {});
}

module.exports = function (app) {
  app.get("/api/names", (req, res) => {
    const { "X-Delay": delay = "0", "X-Fail": fail = false } = parseCookies(
      req.headers.cookie
    );

    if (fail) {
      return res.status(501).send({ error: "Error on server" });
    }

    setTimeout(() => {
      const start = parseInt(req.query.start || "0");
      res.send({
        names: names.slice(start, start + 10),
        ...(start < 50 && {
          loadMoreUrl: `${req.path}?start=${start + 10}`,
        }),
      });
    }, parseInt(delay));
  });
};
