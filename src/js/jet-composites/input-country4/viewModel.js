

/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(
    ['ojs/ojcore', 'knockout', 'jquery',  './libs/openlayers/ol-debug', 'ojs/ojbutton', 'ojs/ojpopup'], function (oj, ko, $, ol) {
        'use strict';

        function InputCountryComponentModel(context) {
            var self = this;
            // save a reference to the unique identity of the composite component instance - also used in generating the element id values in view.html
            // see https://blogs.oracle.com/groundside/jet-composite-components-xvii-beware-the-ids for reference 
            self.unique = context.unique;
            self.composite = context.element;

            self.openPopup = function () {
                $('#countrySelectionPopup' + self.unique).ojPopup("open");
                // if the map has not yet been initialized, then do the initialization now (this is the case the first time the popup opens)
                if (!self.map) initMap();
            }//openPopup

            self.startAnimationListener = function (data, event) {
                var ui = event.detail;
                if (!$(event.target).is("#countrySelectionPopup" + self.unique))
                    return;

                if ("open" === ui.action) {
                    event.preventDefault();
                    var options = { "direction": "top" };
                    oj.AnimationUtils.slideIn(ui.element, options).then(ui.endCallback);
                    // if the map has not yet been initialized, then do the initialization now (this is the case the first time the popup opens)
                    if (!self.map) initMap();

                }
                else if ("close" === ui.action) {
                    event.preventDefault();
                    ui.endCallback();
                }
            }

            function initMap() {
                self.map = new ol.Map({
                    layers: [
                        new ol.layer.Tile({
                            id: "world",
                            source: new ol.source.OSM()
                        })
                    ],
                    target: 'mapContainer' + self.unique,
                    view: new ol.View({
                        center: [0, 0],
                        zoom: 2
                    })
                });
            }//initMap
        };

        //Lifecycle methods - uncomment and implement if necessary 
        //ExampleComponentModel.prototype.activated = function(context){
        //};

        //ExampleComponentModel.prototype.attached = function(context){
        //};

        //ExampleComponentModel.prototype.bindingsApplied = function(context){
        //};

        //ExampleComponentModel.prototype.detached = function(context){
        //};

        return InputCountryComponentModel;
    });