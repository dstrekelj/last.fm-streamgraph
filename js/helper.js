define(function() {
  
  function defined(Object) {
    return typeof Object != 'undefined';
  };
  
  /**
   * Prepares an array of UTC dates (epoch time) in range `From` - `To`.
   * @param   From  Epoch time (seconds), period start
   * @param   To    Epoch time (seconds), period end
   * @return  Array of UTC dates (epoch time)
   */
  function doDates(From, To) {
    var data  = [],
        date  = doDatesPair(From);

    while(date.local.getTime() / 1000 < To) {
      data.push({x: date.utc.getTime(), y: 0});
      date.local.setDate(date.local.getDate() + 1);
      date = doDatesPair(date.local.getTime() / 1000);
    }
    
    return data;
  };
  
  /**
   * Creates local timezone and UTC Date tuple.
   * @param   Epoch time (in seconds)
   * @return  {local, UTC} Date tuple
   */
  function doDatesPair(Time) {
    var local = new Date(Time * 1000),
        utc = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
    return {local: local, utc: utc};
  };
  
  function equal(A, B) {
    if (typeof A == 'object' && typeof B == 'object') {
      if (A.length == B.length) {
        for (var i = 0; i < A.length; i++)
          if (A[i] != B[i])
            return false;
      } else {
        throw 'Arguments must be of same length';
      }
      return true;
    } else if (typeof A == typeof B) {
      return A == B;
    } else {
      throw 'Arguments must be of same type';
    }
  };
  
  return {
    defined :     defined,
    doDates :     doDates,
    doDatesPair : doDatesPair,
    equal :       equal
  };
  
});