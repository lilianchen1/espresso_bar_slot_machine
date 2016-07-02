$.fn.startMachine = function() {
  return new $.SlotGame(this);
};

$.SlotGame = function() {
  var $el = $("div.reels-container");
  var view = new window.SLOTMACHINE.View($el);
  view.setUpMachine();
  view.listenForGameStart();
};

(function() {
  if (typeof SLOTMACHINE === "undefined") {
    window.SLOTMACHINE = {};
  }

  var View = SLOTMACHINE.View = function($el) {
    this.$el = $el;
    this.items = [['coffee-maker', 'tea-pot', 'espresso-machine'], ['coffee-filter', 'tea-strainer', 'espresso-tamper'], ['coffee-ground', 'tea-loose', 'espresso-bean']]
  };

  View.prototype.setUpMachine = function() {
    var reelTemplate = "<ul id='reelNum' class='reel'></ul>"
    var itemTemplate = "<li id='itemType' class='reel-item'></li>"
    var imageTemplate = "<img src='./images/itemType.png' />"
    for (var reelIdx = 0; reelIdx < 3; reelIdx++) {
      var $reel = $(reelTemplate.replace('reelNum', 'reel' + reelIdx));
      for (var itemIdx = 0; itemIdx < 3; itemIdx++) {
        var currentItem = this.items[reelIdx][itemIdx]
        var $item = $(itemTemplate.replace('itemType', currentItem));
        $item.append(imageTemplate.replace('itemType', currentItem))

        $reel.append($item);
      }
      this.$el.append($reel);
    }
  };

  View.prototype.listenForGameStart = function() {
    $(".lever a").on("click", function(event) {
      this.startGame();
      // display winning/losing modal
    }.bind(this));
  };

  View.prototype.startGame = function() {
    var slotItems = []
    this.items.forEach(function(reel) {
      var idx = Math.floor(Math.random() * 3);
      slotItems.push(reel[idx]);
    });
    this.revealResult(slotItems);
  };

  View.prototype.revealResult = function(results) {
    var spinTime = 120;
    var timer;
    var that = this;
    var counter = 10;
    (function repeat() {
      if (--counter >= 0) {
        that.spinReelAndShowResults(spinTime, counter, results);
        spinTime += 20;
        timer = setTimeout(repeat, spinTime);
      }
    })();
  };

  View.prototype.animateSpinning = function(reel, item, time) {
    $(item).animate({
      'margin-top': '200px'
    }, time - 20, function() {
      $(item).appendTo($(reel));
      $(item).css('margin-top', '-300px');
      $($(reel).children()[0]).css('margin-top', '10px');
    });
  };

  View.prototype.spinReelAndShowResults = function(time, counter, results) {
    var that = this;
    if (counter > 0) {
      $('ul.reel').map(function(i, reel) {
        var firstItem = $(reel).children()[0];
        that.animateSpinning(reel, firstItem, time);
      });
    } else {
      var timer;
      (function repeat() {
        if (!that.resultsMatch(results)) {
          that.stopAtFinalResults(time, results);
          time += 20;
          timer = setTimeout(repeat, time);
        }
      })();
    }
  };

  View.prototype.resultsMatch = function(results) {
    var shownSlots = Array.prototype.slice.call($('.reel').map(function(idx, reel) {
      return $(reel).children()[0].id;
    }));
    for (var i = 0; i < results.length; i++) {
      if (shownSlots.indexOf(results[i]) < 0) {
        return false
      }
    }
    return true;
  };

  View.prototype.stopAtFinalResults = function(time, results) {
    $('ul.reel').map(function(i, reel) {
      var firstItem = $(reel).children()[0]
      if (results.indexOf(firstItem.id) < 0) {
        this.animateSpinning(reel, firstItem, time);
      }
    }.bind(this));
  };

})();
