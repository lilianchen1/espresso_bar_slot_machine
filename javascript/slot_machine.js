(function() {
  if (typeof SLOTMACHINE === "undefined") {
    window.SLOTMACHINE = {};
  }

  var Game = SLOTMACHINE.Game = function($el) {
    this.$el = $el;
    this.items = [['coffee-maker', 'tea-pot', 'espresso-machine'], ['coffee-filter', 'tea-strainer', 'espresso-tamper'], ['coffee-ground', 'tea-loose', 'espresso-bean']];
    this.reelSpinning = false;
  };

  Game.prototype.setUpMachine = function() {
    var reelTemplate = "<ul id='reelNum' class='reel'></ul>"
    var itemTemplate = "<li id='itemType' class='reel-item'></li>"
    var imageTemplate = "<img src='./images/itemType.png' />"
    for (var reelIdx = 0; reelIdx < 3; reelIdx++) {
      var $reel = $(reelTemplate.replace('reelNum', 'reel' + reelIdx));
      for (var itemIdx = 0; itemIdx < 3; itemIdx++) {
        var currentItem = this.items[reelIdx][itemIdx]
        var $item = $(itemTemplate.replace('itemType', currentItem));
        $item.append(imageTemplate.replace('itemType', currentItem));

        $reel.append($item);
      }
      this.$el.append($reel);
    }
  };

  Game.prototype.listenForGameStart = function() {
    $(".lever a").on("click", function(event) {
      if (!this.reelSpinning) {
        this.setReelTimeOut();
        this.startGame();
      }
    }.bind(this));
  };

  Game.prototype.setReelTimeOut = function() {
    this.reelSpinning = true;
    $('.lever a').attr('class', 'lever-on');
  };

  Game.prototype.removeReelTimeOut = function() {
    this.reelSpinning = false;
    $('.lever a').attr('class', 'lever-off');
  };

  Game.prototype.startGame = function() {
    var counters = [];
    for (var i = 0; i < 3; i++) {
      counters.push(Math.floor(Math.random() * 8) + 8);
    }
    this.revealResult(counters);
  };

  Game.prototype.revealResult = function(counters) {
    var spinTime = 120;
    var timer;
    var that = this;
    (function repeat() {
      --counters[0];
      --counters[1];
      --counters[2];
      if (counters[0] >= 0 || counters[1] >= 0 || counters[2] >= 0) {
        that.spinReelAndShowResults(spinTime, counters);
        spinTime += 20;
        timer = setTimeout(repeat, spinTime);
      } else {
        that.removeReelTimeOut();
      }
    })();
  };

  Game.prototype.animateSpinning = function(reel, item, time) {
    $(item).animate({
      'margin-top': '200px'
    }, time - 20, function() {
      $(item).appendTo($(reel));
      $(item).css('margin-top', '-300px');
      $($(reel).children()[0]).css('margin-top', '10px');
    });
  };

  Game.prototype.spinReelAndShowResults = function(time, counters) {
    var that = this;
    for (var i = 0; i < counters.length; i++) {
      if (counters[i] > 0) {
        var matchingReel = $('ul.reel')[i]
        var firstItem = $(matchingReel).children()[0];
        that.animateSpinning(matchingReel, firstItem, time);
      }
    }
  };
})();
