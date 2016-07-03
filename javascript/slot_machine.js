(function() {
  if (typeof SlotMachine === "undefined") {
    window.SlotMachine = {};
  }

  var Game = SlotMachine.Game = function($el) {
    this.$el = $el;
    this.itemTypes = ['coffee', 'tea', 'espresso'];
    this.items = [['coffee-maker', 'tea-pot', 'espresso-machine'], ['coffee-filter', 'tea-strainer', 'espresso-tamper'], ['coffee-ground', 'tea-loose', 'espresso-bean']];
    this.reelSpinning = false;
    this.forceWin = false;
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
    $('.lever a').on('click', function(event) {
      if (!this.reelSpinning) {
        this.setReelTimeOut();
        this.startGame();
      }
    }.bind(this));
  };

  Game.prototype.listenForForceWin = function() {
    $('a.force-win-link').on('click', function(event) {
      if (this.forceWin) {
        $(event.currentTarget).text('Click to Force Win');
        this.forceWin = false;
      } else {
        $(event.currentTarget).text('Click to Un-Force Win');
        this.forceWin = true;
      }
    }.bind(this));
  };

  Game.prototype.setReelTimeOut = function() {
    this.reelSpinning = true;
    $('.lever a').attr('class', 'lever-on');
    var $text = $('<p>');
    $text.text('The lever is spinning, Please wait...');
    $('.event-description').html($text);
  };

  Game.prototype.removeReelTimeOut = function() {
    this.reelSpinning = false;
    $('.lever a').attr('class', 'lever-off');
  };

  Game.prototype.startGame = function() {
    // TODO: change logic of force win so that after 5 spins, it will land on one of the items (how i had it before)
    if (this.forceWin) {
      var that = this;
      $.when(that.resolveForceWinning(120)).then(function() {
        that.handleGameOver();
      });
    } else {
      var counters = [];
      for (var i = 0; i < 3; i++) {
        // counters.push(Math.floor(Math.random() * 8) + 8);
        counters.push(Math.floor(Math.random() * 8));
      }
      this.revealResult(counters);
    }
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
        that.handleGameOver();
      }
    })();
  };

  Game.prototype.resolveForceWinning = function(time) {
    var d = $.Deferred();
    var that = this;
    that.getMatchingItems(time, d);
    return d.promise();
  };

  Game.prototype.handleGameOver = function() {
    var shownItems = $('.reel').map(function(idx, reel) {
      return $(reel).children()[0].id;
    });
    var matchedItem = this.matchingItem(shownItems);
    if (matchedItem) {
      this.animateWinning(matchedItem);
    } else {
      this.animateLosing();
    }
    setTimeout(this.removeReelTimeOut.bind(this), 0);
  };

  Game.prototype.animateWinning = function(matchedItem) {
    var $header = $('<h3>');
    $header.text('CONGRATULATIONS');
    var $text = $('<p>');
    $text.text('You have won: ' + matchedItem.toUpperCase());
    $('.event-description').html('');
    $('.event-description').append($header);
    $('.event-description').append($text);
  };

  Game.prototype.animateLosing = function() {
    var $header = $('<h3>');
    $header.text('TRY AGAIN');
    var $text = $('<p>');
    $text.text('better luck next time!');
    $('.event-description').html('');
    $('.event-description').append($header);
    $('.event-description').append($text);
  };

  Game.prototype.matchingItem = function(shownItems) {
    return SlotMachine.Utility.compareArrayElements(shownItems, this.itemTypes);
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
    for (var i = 0; i < counters.length; i++) {
      if (counters[i] > 0) {
        var matchingReel = $('ul.reel')[i]
        var firstItem = $(matchingReel).children()[0];
        this.animateSpinning(matchingReel, firstItem, time);
      }
    }
  };

  Game.prototype.getMatchingItems = function(time, d) {
    var timer;
    var that = this;
    (function getMatch() {
      var item = that.itemTypes[Math.floor(Math.random() * 3)];
      if (!that.resultsMatch(item)) {
        for (var reelIdx = 0; reelIdx < $('.reel').length; reelIdx++) {
          var firstItem = $($('.reel')[reelIdx]).children()[0];
          if (firstItem.id.indexOf(item) < 0) {
            that.animateSpinning($('.reel')[reelIdx], firstItem, time);
          }
        }
        timer = setTimeout(getMatch, time);
      } else {
        d.resolve();
      }
    })()
  };

  Game.prototype.resultsMatch = function(item) {
    var firstItems = $('.reel').map(function(idx, reel) {
      return $(reel).children()[0].id;
    })
    for (var i  = 0; i < firstItems.length; i++) {
      if (firstItems[i].indexOf(item) < 0) {
        return false;
      }
    }
    return true;
  };
})();
