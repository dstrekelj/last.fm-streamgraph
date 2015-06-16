define(function() {
  
  return {
    NO_CHANGE : {
      error :   '1',
      message : 'No change in parameters. No request will be sent.'
    },
    CORRUPT_RESPONSE : {
      error :   '2',
      message : 'Corrupt response. Please try again.'
    },
    EMPTY_RESPONSE : {
      error :   '3',
      message : 'Empty response. No plays in date range or invalid date range.'
    }
  };
  
});