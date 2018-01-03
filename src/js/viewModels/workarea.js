define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojinputtext', 'jet-composites/input-country/loader'],
    function (oj, ko, $) {
        'use strict';
        function WorkareaViewModel() {
            var self = this;
            // initialize two country observables
            self.country = ko.observable("Italy");
            self.country2 = ko.observable("Indonesia");
            self.upperCountry = ko.computed(function() {
                return this.country().toUpperCase();                
            }, self);


            self.handleCountrySelection= function (selectedCountryName, selectedCountryCode) {
                console.log(`Callback Function to Handle Country Selection name ${selectedCountryName} and code ${selectedCountryCode}`);
            }
            self.handleCountry2Selection= function (selectedCountryName, selectedCountryCode) {
                console.log(`Callback Function to Handle Country 2 Selection name ${selectedCountryName} and code ${selectedCountryCode}`);
            }

            self.countrySelectedHandler = function(e) {
                console.log("countrySelectedHandler - to handle countrySelected event "+JSON.stringify(e.detail))
            }

            }

        return new WorkareaViewModel();
    }
);