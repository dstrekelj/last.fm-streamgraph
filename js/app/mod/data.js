define(function() {
  
  var data = [];
  
  var minimumPlays = 0;
  
  /**
   * Filters data by play limit (high-pass filter).
   * @param   Limit   Limit to impose (minimum play amount)
   * @return  Array of artists with `value.y` > `Limit`
   */
  function filterByPlays(Data, Limit) {
    var key =     0,
        keys =    Data.length,
        result =  [];
    
    for (key; key < keys; key++) {
      if (overLimit(Data[key].value, Limit)) result.push(Data[key]);
    }
    
    return result;
  };
  
  /**
   * Finds largest number of plays in a day in observed period.
   * @return  Number of plays
   */
  function findMaxY(Data) {
    var key   = 0,
        keys  = Data.length,
        val   = 0,
        vals  = Data[0].value.length,
        sum   = 0;
    
    for (val; val < vals; val++) {
      var newSum = 0, key = 0;
      
      for (key; key < keys; key++) {
        newSum += Data[key].value[val].y;
      }
      
      if (newSum > sum) sum = newSum;
    }
    
    return sum;
  };  
  
  /**
   * Checks if `Values` array has a value greater than `Limit`.
   * @param   Values  Array of values
   * @param   Limit   Lower limit
   * @return  `true` if it has, `false` if not
   */
  function overLimit(Values, Limit) {
    var play  = 0,
        plays = Values.length;
    
    for (play; play < plays; play++) {
      if (Values[play].y > Limit) return true;
    }
    
    return false;
  };
  
  return {
    data :          data,
    minimumPlays :  minimumPlays,
    filterByPlays : filterByPlays,
    findMaxY :      findMaxY
  };
  
});