

/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojbutton', 'ojs/ojpopup'], function (oj, ko, $) {
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

                // property countrySelectionHandler may contain a function to be called when a country has been selected by the user
                self.callbackHandler = self.properties['countrySelectionHandler'];
            });



            // this function writes the selected country name to the two way bound countryName property, calls the callback function and publishes the countrySelected event
            // (based on the currently selected country in self.countrySelection)
            self.save = function () {
                if (self.countrySelection && self.countrySelection.name) {
                    // set selected country name on the observable
                    self.properties['countryName'] = self.countrySelection.name;
                    // notify the world about this change
                    if (self.callbackHandler) { self.callbackHandler(self.countrySelection.name, self.countrySelection.code) }
                    // report the country selection event
                    self.raiseCountrySelectedEvent(self.countrySelection.name, self.countrySelection.code);
                }
                // close popup
                $('#countrySelectionPopup' + self.unique).ojPopup("close");
            }//save


            self.popupFirstTime = true;
            self.openPopup = function () {
                $('#countrySelectionPopup' + self.unique).ojPopup("open");
                // if the map has not yet been initialized, then do the initialization now (this is the case the first time the popup opens)
                if (!self.map) initMap();
                // set the currently selected country - but only if this is not the first time the popup opens (and we can be sure that the country vector has been loaded)
                // note: as soon as the vector has finished loading, a listener fires () and sets the currently selected country ; see var listenerKey in function initMap();
                if (!self.popupFirstTime) {
                    self.selectInteraction.getFeatures().clear();
                    if (self.properties['countryName'])
                        self.setSelectedFeature(self.properties['countryName'])
                } else
                    self.popupFirstTime = false;
            }//openPopup

            self.setSelectedFeature = function (featureId) {
                //programmatic selection of a feature; based on the name, a feature is searched for in countriesVector and when found is highlighted
                var features = self.citiesVector.getFeatures();
                var c = features.filter(function (feature) { return feature.id_ == featureId });
                if (c[0]) {
                   self.selectInteraction.getFeatures().push(c[0]);
                }
            }


            self.raiseCountrySelectedEvent = function (countryName, countryCode) {
                var eventParams = {
                    'bubbles': true,
                    'cancelable': false,
                    'detail': {
                        'countryName': countryName
                        , 'countryCode': countryCode
                    }
                };
                //Raise the custom event on the composite component
                self.composite.dispatchEvent(new CustomEvent('countrySelected',
                    eventParams));
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
                    url: require.toUrl('input-country/countries.geo.json'),
                    format: new ol.format.GeoJSON()
                });
                // register a listener on the vector; as soon as it has loaded, we can select the feature for the currently selected country
                // var listenerKey = self.countriesVector.on('change', function (e) {
                //     if (self.countriesVector.getState() == 'ready') {
                //         // and unregister the "change" listener 
                //         ol.Observable.unByKey(listenerKey);
                //         if (self.properties['countryName'])
                //             self.setSelectedCountry(self.properties['countryName'])
                //     }
                // });

                self.citiesVector = new ol.source.Vector({
                    url: require.toUrl('input-country/cities.geojson'),
                    format: new ol.format.GeoJSON()
                });

                var fill = new ol.style.Fill({
                    color: 'rgba(0,0,0,0.2)'
                });
                var selectedfill = new ol.style.Fill({
                    color: 'red'
                });
                var selectedCityfill = new ol.style.Fill({
                    color: 'green'
                });
                var stroke = new ol.style.Stroke({
                    color: 'rgba(0,0,0,0.4)'
                });
                var circle = new ol.style.Circle({
                    radius: 6,
                    fill: fill,
                    stroke: stroke
                });

                var highlighCircle = new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({
                        color: 'green'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.4)'
                    })
                });

                var cityStyle = new ol.style.Style({
                    fill: fill,
                    stroke: stroke,
                    image: circle
                });

                var highlightCityStyle = new ol.style.Style({
                    fill: selectedCityfill,
                    stroke: stroke,
                    image: highlighCircle
                });


                var selectedCityStyle = new ol.style.Style({
                    fill: selectedCityfill,
                    stroke: stroke,
                    image: new ol.style.Circle({
                        radius: 14,
                        fill: selectedfill,
                        stroke: stroke
                    })
                });

                self.map = new ol.Map({
                    layers: [
                        new ol.layer.Tile({
                            id: "world",
                            source: new ol.source.OSM()
                        }),
                        new ol.layer.Vector({
                            id: "cities",
                            renderMode: 'image',
                            source: self.citiesVector,
                            style: function (feature, resolution) {
                                return cityStyle;
                            }
                        })


                    ],
                    target: 'mapContainer' + self.unique,
                    view: new ol.View({
                        center: [0, 0],
                        zoom: 2
                    })
                });


                // layer to hold (and highlight) currently hovered over highlighted (not yet selected) feature(s) 
                var featureOverlay = new ol.layer.Vector({
                    source: new ol.source.Vector(),
                    map: self.map,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#f00',
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            color: 'gold'
                        })
                        , image: highlighCircle
                    })
                });

                var highlight;

                // function to get hold of the feature under the current mouse position;
                // the country associated with that feature is displayed in the info box
                // the feature itself is highlighted (added to the featureOverlay defined just ovehead)
                var displayFeatureInfo = function (pixel) {
                    var features = [];
                    self.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                        if (layer && layer.values_.id == 'cities') features.push(feature);
                    });

                    var info = document.getElementById('countryInfo' + self.unique);
                    if (features[0]) {
                        //  info.innerHTML = features[0].getId() + ': ' + features[0].get('name');
                        info.innerHTML = features[0].getId() + ': ' + features[0].get('city');
                    } else {
                        info.innerHTML = '&nbsp;';
                    }

                    if (features[0] !== highlight) {
                        if (highlight) {
                            featureOverlay.getSource().removeFeature(highlight);
                        }
                        if (features[0]) {
                            featureOverlay.getSource().addFeature(features[0]);
                        }
                        highlight = features[0];
                    }

                };

                self.map.on('pointermove', function (evt) {
                    if (evt.dragging) {
                        return;
                    }
                    var pixel = self.map.getEventPixel(evt.originalEvent);
                    displayFeatureInfo(pixel);
                });

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
                        //                        return layer.get('id') == 'countries';
                        return layer.get('id') == 'cities';
                    },
//                    style: selectCountryStyle
                    style: selectedCityStyle

                });

                self.map.getInteractions().extend([self.selectInteraction]);

                // add an event handler to the interaction
                self.selectInteraction.on('select', function (e) {
                    //to ensure only a single country can be selected at any given time
                    // find the most recently selected feature, clear the set of selected features and add the selected the feature (as the only one)
                    var f = self.selectInteraction.getFeatures()
                    var selectedFeature = f.getArray()[f.getLength() - 1]
                    self.selectInteraction.getFeatures().clear();
                    if (selectedFeature) {
                    self.selectInteraction.getFeatures().push(selectedFeature);
                    //                    self.countrySelection = { "code": selectedFeature.id_, "name": selectedFeature.values_.name };
                    self.countrySelection = { "code": selectedFeature.id_, "name": selectedFeature.values_.city };
                    }
                });

                // handle the singleclick event- in case a country is clicked that is already selected
                self.map.on('singleclick', function (evt) {
                    var feature = self.map.forEachFeatureAtPixel(evt.pixel,
                        function (feature, layer) {
//                            var clickCountrySelection = { "code": feature.id_, "name": feature.values_.name };
                            var clickCountrySelection = { "code": feature.id_, "name": feature.values_.city };
                            if (self.countrySelection && self.countrySelection.name && (self.countrySelection.name == clickCountrySelection.name)) {
                                // the current selection is confirmed (clicked on a second time). We interpret this as: Save the selected country and close the popup  
                                self.save();
                                return;
                            }
                            return [feature, layer];
                        });
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