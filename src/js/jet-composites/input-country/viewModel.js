

/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(
    ['ojs/ojcore', 'knockout', 'jquery', './libs/openlayers/ol-debug', 'css!./libs/openlayers/ol', 'ojs/ojinputtext', 'ojs/ojlabel', 'ojs/ojbutton', 'ojs/ojpopup'], function (oj, ko, $, ol) {
        'use strict';

        function InputCountryComponentModel(context) {
            var self = this;
            // save a reference to the unique identity of the composite component instance - also used in generating the element id values in view.html
            // see https://blogs.oracle.com/groundside/jet-composite-components-xvii-beware-the-ids for reference 
            self.unique = context.unique;
            self.composite = context.element;

            context.props.then(function (propertyMap) {
                //Store a reference to the properties for any later use
                self.properties = propertyMap;
                //Parse your component properties here 
                self.selectedCountry = self.properties['countryName'];
//                self.selectedCountry = ko.observable(self.properties['countryName']);
                self.callbackHandler = self.properties['countrySelectionHandler'];                
            });

            self.popupOpenCount = 0;
            self.openPopup = function () {
                $('#countrySelectionPopup' + self.unique).ojPopup("open");
                // if the map has not yet been initialized, then do the initialization now (this is the case the first time the popup opens)
                if (!self.map) initMap();
                // set the currently selected country - but only if this is not the first time the popup opens (and we can be sure that the country vector has been loaded)
                // note: as soon as the vector has finished loading, a listener fires () and sets the currently selected country ; see var listenerKey in function initMap();
                if (self.popupOpenCount > 0) {
                    self.selectInteraction.getFeatures().clear();
                    self.setSelectedCountry (self.properties['countryName'])
//                    self.setSelectedCountry(self.selectedCountry())
                }
                self.popupOpenCount++;
            }

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

            self.setSelectedCountry = function (country) {
                //programmatic selection of a feature
                var countryFeatures = self.countriesVector.getFeatures();
                var c = self.countriesVector.getFeatures().filter(function (feature) { return feature.values_.name == country });
                self.selectInteraction.getFeatures().push(c[0]);
            }


            // define the style to apply to selected countries
            var selectCountryStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#ff0000',
                    width: 2
                })
                , fill: new ol.style.Fill({
                    color: 'red'
                })
            });
            self.selectInteraction = new ol.interaction.Select({
                condition: ol.events.condition.singleClick,
                toggleCondition: ol.events.condition.shiftKeyOnly,
                layers: function (layer) {
                    return layer.get('id') == 'countries';
                },
                style: selectCountryStyle

            });
            // add an event handler to the interaction
            self.selectInteraction.on('select', function (e) {
                //to ensure only a single country can be selected at any given time
                // find the most recently selected feature, clear the set of selected features and add the selected the feature (as the only one)
                var f = self.selectInteraction.getFeatures()
                var selectedFeature = f.getArray()[f.getLength() - 1]
                self.selectInteraction.getFeatures().clear();
                self.selectInteraction.getFeatures().push(selectedFeature);
                var selectedCountry = { "code": selectedFeature.id_, "name": selectedFeature.values_.name };
                // set selected country name on the observable
//                self.selectedCountry(self.properties['countryName']);
                self.properties['countryName']= selectedCountry.name;
                // notify the world about this change
                if (self.callbackHandler) { self.callbackHandler(selectedCountry.name, selectedCountry.code)}
  //              self.selectedCountry.valueHasMutated();   
            });



            function initMap() {
                var style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.6)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#319FD3',
                        width: 1
                    }),
                    text: new ol.style.Text()
                }); //style

                self.countriesVector = new ol.source.Vector({
                    url: 'js/jet-composites/input-country/countries.geo.json',
                    format: new ol.format.GeoJSON()
                });


                // register a listener on the vector; as soon as it has loaded, we can select the feature for the currently selected country
                var listenerKey = self.countriesVector.on('change', function (e) {
                    if (self.countriesVector.getState() == 'ready') {
                        console.log("loading dione");
                        // and unregister the "change" listener 
                        ol.Observable.unByKey(listenerKey);
                        
                        self.setSelectedCountry(self.properties['countryName'])
//                        self.setSelectedCountry(self.selectedCountry())
                    }
                });
                self.map = new ol.Map({
                    layers: [
                        new ol.layer.Vector({
                            id: "countries",
                            renderMode: 'image',
                            source: self.countriesVector,
                            style: function (feature) {
                                style.getText().setText(feature.get('name'));
                                return style;
                            }
                        })
                        , new ol.layer.Tile({
                            id: "world",
                            source: new ol.source.OSM()
                        })
                    ],
                    target: 'mapContainer',
                    view: new ol.View({
                        center: [0, 0],
                        zoom: 2
                    })
                });
                self.map.getInteractions().extend([self.selectInteraction]);


                // layer to hold (and highlight) currently selected feature(s) 
                var featureOverlay = new ol.layer.Vector({
                    source: new ol.source.Vector(),
                    map: self.map,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#f00',
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255,0,0,0.1)'
                        })
                    })
                });

                var highlight;
                var displayFeatureInfo = function (pixel) {

                    var feature = self.map.forEachFeatureAtPixel(pixel, function (feature) {
                        return feature;
                    });

                    var info = document.getElementById('countryInfo');
                    if (feature) {
                        info.innerHTML = feature.getId() + ': ' + feature.get('name');
                    } else {
                        info.innerHTML = '&nbsp;';
                    }

                    if (feature !== highlight) {
                        if (highlight) {
                            featureOverlay.getSource().removeFeature(highlight);
                        }
                        if (feature) {
                            featureOverlay.getSource().addFeature(feature);
                        }
                        highlight = feature;
                    }

                };

                self.map.on('pointermove', function (evt) {
                    if (evt.dragging) {
                        return;
                    }
                    var pixel = self.map.getEventPixel(evt.originalEvent);
                    displayFeatureInfo(pixel);
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