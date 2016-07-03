$.fn.startMachine = function() {
  return new $.SlotGame(this);
};

$.SlotGame = function() {
  var $el = $("div.reels-container");
  var game = new window.SlotMachine.Game($el);
  game.setUpMachine();
  game.listenForGameStart();
  game.listenForForceWin();
};
