requirejs.config(
    {
      // create path mapping for input-country module
      paths:
      {
        'input-country':'jet-composites/input-country'
      }
    });
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojinputtext'
    , 'input-country/loader'
],
    function (oj, ko, $) {
        'use strict';
        function WorkareaViewModel() {
            var self = this;
            // initialize two country observables
            self.country = ko.observable("Italy");
            self.country2 = ko.observable("Indonesia");
            // a computed observable, based on the first country observable
            // whenever self.country is updated, this observable is also modified
            self.upperCountry = ko.computed(function() {
                return this.country().toUpperCase();                
            }, self);

            // function to be called back from input-country component
            self.handleCountrySelection= function (selectedCountryName, selectedCountryCode) {
                console.log('Callback Function to Handle Country Selection name '+ selectedCountryName+ ' and code '+ selectedCountryCode);
            }

            // function to be called back from input-country component
            self.handleCountry2Selection= function (selectedCountryName, selectedCountryCode) {
                console.log('Callback Function to Handle Country Selection name '+ selectedCountryName+ ' and code '+ selectedCountryCode);
            }

            // function to handle the countrySelected event that can be published by the input-country component
            self.countrySelectedHandler = function(countrySelectedEvent) {
                console.log("countrySelectedHandler - to handle custom countrySelected event "+JSON.stringify(countrySelectedEvent.detail))
            }

            self.handleCountryNameChangedHandler = function(countryNameChangedEvent) {
                console.log("handleCountryNameChangedHandler - to handle out-of-the-box countryNameChanged event "+JSON.stringify(countryNameChangedEvent.detail))
            }

            }

        return new WorkareaViewModel();
    }
);
