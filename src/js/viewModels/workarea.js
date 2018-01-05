define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojinputtext'
    , 'jet-composites/input-country/loader'
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
                console.log(`Callback Function to Handle Country Selection name ${selectedCountryName} and code ${selectedCountryCode}`);
            }

            // function to be called back from input-country component
            self.handleCountry2Selection= function (selectedCountryName, selectedCountryCode) {
                console.log(`Callback Function to Handle Country 2 Selection name ${selectedCountryName} and code ${selectedCountryCode}`);
            }

            // function to handle the countrySelected event that can be published by the input-country component
            self.countrySelectedHandler = function(countrySelectedEvent) {
                console.log("countrySelectedHandler - to handle countrySelected event "+JSON.stringify(countrySelectedEvent.detail))
            }

            }

        return new WorkareaViewModel();
    }
);