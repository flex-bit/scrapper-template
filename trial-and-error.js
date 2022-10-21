var player = require("play-sound")((opts = {}));
player.play("done-scrapper.mp3", function (err) {
  if (err) throw err;
});
player.play("female-im-done.mp3", function (err) {
  if (err) throw err;
});
