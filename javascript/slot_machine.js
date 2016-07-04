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
    var reelTemplate = "<ul id='reelNum' class='reel'>";
    var itemTemplate = "<li id='itemType' class='reel-item'>";
    var imageTemplate = "<img src='./images/itemType.png'>";
    var introModalTexts = ['Click On', 'Lever Nob', 'To Start'];
    for (var reelIdx = 0; reelIdx < 3; reelIdx++) {
      var $reel = $(reelTemplate.replace('reelNum', 'reel' + reelIdx));
      var $introModal = $("<div class='reel-modal intro-modal'>");
      var $modalText = $("<p class='modal-text'>");
      $modalText.text(introModalTexts[reelIdx]);
      $introModal.append($modalText);
      $reel.append($introModal);
      for (var itemIdx = 0; itemIdx < 3; itemIdx++) {
        var currentItem = this.items[reelIdx][itemIdx];
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
      if (this.reelSpinning) {
        return;
      } else {
        if (this.forceWin) {
          console.log('This game is no longer rigged!');
          $(event.currentTarget).text('Click to Force Win');
          $(event.currentTarget).parent().attr('class', 'force-win');
          this.forceWin = false;
        } else {
          console.log('This game is now rigged!');
          $(event.currentTarget).text('Force Winning');
          $(event.currentTarget).parent().attr('class', 'force-clicked');
          this.forceWin = true;
        }
      }
    }.bind(this));
  };

  Game.prototype.setReelTimeOut = function() {
    this.reelSpinning = true;
    $('.lever a').attr('class', 'lever-on');
    $('.event-description h3').text('The lever is spinning, Please wait...');
    var $spinningGif = $("<img src='https://www.easytrip.ie/wp-content/themes/easytrip/images/loader.gif'>");
    $('.event-description').append($spinningGif);
  };

  Game.prototype.removeReelTimeOut = function() {
    this.reelSpinning = false;
    $('.lever a').attr('class', 'lever-off');
  };

  Game.prototype.startGame = function() {
    $('.reel-modal').remove(); // remove modal
    $('.event-description p').remove(); // remove end text from previous round
    if (this.forceWin) {
      this.getMatchingItems(120);
    } else {
      var counters = [];
      for (var i = 0; i < 3; i++) {
        counters.push(Math.floor(Math.random() * 8) + 8);
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
        that.spinReel(spinTime, counters);
        spinTime += 20;
        timer = setTimeout(repeat, spinTime);
      } else {
        that.handleGameOver();
      }
    })();
  };

  Game.prototype.getMatchingItems = function(time) {
    var timer;
    var that = this;
    var counter = 7; // forces reels to spin at least 7 times
    (function getMatch() {
      if (--counter >= 0) {
        that.spinReel(time, [counter, counter, counter]);
        time += 20;
        timer = setTimeout(getMatch, time);
      } else {
        var item = $('#reel0').children()[0].id.split('-')[0];
        if (!that.resultsMatch(item)) {
          for (var reelIdx = 1; reelIdx < $('.reel').length; reelIdx++) {
            var firstItem = $($('.reel')[reelIdx]).children()[0];
            if (firstItem.id.indexOf(item) < 0) {
              that.animateSpinning($('.reel')[reelIdx], firstItem, time);
            }
          }
          timer = setTimeout(getMatch, time);
        } else {
          that.handleGameOver();
        }
      }
    })()
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
    this.animateResultModals();
    setTimeout(this.removeReelTimeOut.bind(this, matchedItem), 0);
    if (this.forceWin) {
      this.removeForceWin();
    }
    console.log('game over!')
  };

  Game.prototype.removeForceWin = function() {
    this.forceWin = false;
    $('.force-win-link').parent().attr('class', 'force-win');
    $('.force-win-link').text('Click to Force Win');
  };

  Game.prototype.animateResultModals = function() {
    var reels = $('.reel');
    for (var i = 0; i < reels.length; i++) {
      var $modalTemplate = $("<div class='itemType'>");
      var $text = $("<p class='modal-text'>");
      var itemType = $(reels[i]).children()[0].id.split('-')[0];
      $text.text(itemType.toUpperCase());
      $modalTemplate.append($text);
      $modalTemplate.attr('class', 'reel-modal-' + itemType + ' reel-modal');
      $(reels[i]).append($modalTemplate);
      $modalTemplate.show('fast');
    }
  };

  Game.prototype.animateWinning = function(matchedItem) {
    $('.event-description img').remove();
    var $text = $('<p>');
    $text.text('You have won: ' + matchedItem.toUpperCase());
    $('.event-description h3').text('CONGRATULATIONS!!!');
    $('.event-description').append($text);
  };

  Game.prototype.animateLosing = function() {
    $('.event-description img').remove();
    var $text = $('<p>');
    $text.text('better luck next time!');
    $('.event-description h3').text('TRY AGAIN');
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

  Game.prototype.spinReel = function(time, counters) {
    for (var i = 0; i < counters.length; i++) {
      if (counters[i] > 0) {
        var matchingReel = $('ul.reel')[i]
        var firstItem = $(matchingReel).children()[0];
        this.animateSpinning(matchingReel, firstItem, time);
      }
    }
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
