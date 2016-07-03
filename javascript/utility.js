(function() {
  if (typeof SlotMachine === "undefined") {
    window.SlotMachine = {};
  }

  var Utility = SlotMachine.Utility = function() {

  };

  Utility.compareArrayElements = function(arr, itemTypes) {
    // return the itemType that's in every element in the array
    // e.g. arr = ['tea-pot', 'tea-leaves'], itemTypes = ['tea', 'coffee'] --> returns 'tea'
    var itemTypesHash = {};
    for (var i = 0; i < itemTypes.length; i++) {
      itemTypesHash[itemTypes[i]] = [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].indexOf(itemTypes[i]) > -1) {
          itemTypesHash[itemTypes[i]].push(arr[j]);
        }
      }
    }
    for (item in itemTypesHash) {
      if (itemTypesHash[item].length === arr.length) {
        return item;
      }
    }
    return null;
  };

})();
