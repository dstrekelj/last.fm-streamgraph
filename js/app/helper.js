/**
 * Helper module intended for frontend utility methods.
 */
define(function() {
    
  /**
   * Adds `Text` option of `Value` value to select element with `Parent` ID.
   * @param `Parent`  ID of parent HTML select element
   * @param `Text`    Text of new option
   * @param `Value`   value of new option
   */
  function addOption(Parent, Text, Value) {
    var option = document.createElement('option');
    var text = document.createTextNode(Text);
    option.setAttribute('value', Value);
    // Firefox doesn't do well with `innerText`, so we append a text node
    // option.innerText = Text;
    option.appendChild(text);
    document.getElementById(Parent).appendChild(option);
  }
  
  /**
   * Parses `Form` data into object.
   * @param `Form`  DOM element
   * @return  Object of key-value pairs based on form element name and value
   */
  this.parseForm = function parseForm(Form) {
    var formElements  = Form.elements,
        formData      = {};

    for (var i = 0; i < formElements.length; i++) {
      var element = formElements[i];
      if (element.value !== "") {
        formData[element.name] = element.value;
      }
    }

    return formData;
  };
  
  /**
   * Populates select elements with year, month, and date. Quick and dirty.
   * NOTE: Don't make this reusable. Make `addOption()` visible instead.
   */
  this.populateDropdown = function populateDropdown() {
    var currentDate = new Date(Date.now()),
    monthNames  = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];

    for (var year = 2006; year <= currentDate.getFullYear(); year++) {
      addOption('fromY', year, year);
      addOption('toY', year, year);
    }

    for (var month = 0; month < 12; month++) {
      addOption('fromM', monthNames[month], month);
      addOption('toM', monthNames[month], month);
    }

    for (var date = 1; date <= 31; date++) {
      addOption('fromD', date, date);
      addOption('toD', date, date);
    }
  };
  
  return this;
  
});