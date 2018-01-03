define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojinputtext', 'jet-composites/input-country/loader'],
    function (oj, ko, $) {
        'use strict';
        function WorkareaViewModel() {
            var self = this;
            self.country = ko.observable("Italy");
            self.country2 = ko.observable("Indonesia");
            self.upperCountry = ko.computed(function() {
                return this.country().toUpperCase();                
            }, self);


            self.handleCountrySelection= function (selectedCountryName, selectedCountryCode) {
                console.log(`Handle Country Selection name ${selectedCountryName} and code ${selectedCountryCode}`);
            }
            self.handleCountry2Selection= function (selectedCountryName, selectedCountryCode) {
                console.log(`Handle Country 2 Selection name ${selectedCountryName} and code ${selectedCountryCode}`);
            }
        
            }

        return new WorkareaViewModel();
    }
);