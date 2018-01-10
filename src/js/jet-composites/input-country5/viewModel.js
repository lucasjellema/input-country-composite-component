

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

                self.map = new ol.Map({
                    layers: [new ol.layer.Tile({
                        id: "world",
                        source: new ol.source.OSM()
                    }),
                    new ol.layer.Vector({
                        id: "countries",
                        renderMode: 'image',
                        source: self.countriesVector,
                        style: function (feature) {
                            style.getText().setText(feature.get('name'));
                            return style;
                        }
                    })

                    ],
                    target: 'mapContainer'+self.unique,
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
                            color: 'rgba(255,0,0,0.1)'
                        })
                    })
                });

                var highlight;

                // function to get hold of the feature under the current mouse position;
                // the country associated with that feature is displayed in the info box
                // the feature itself is highlighted (added to the featureOverlay defined just ovehead)
                var displayFeatureInfo = function (pixel) {
                    var feature = self.map.forEachFeatureAtPixel(pixel, function (feature) {
                        return feature;
                    });

                    var info = document.getElementById('countryInfo'+self.unique);
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

                self.map.getInteractions().extend([self.selectInteraction]);

                // add an event handler to the interaction
                self.selectInteraction.on('select', function (e) {
                    //to ensure only a single country can be selected at any given time
                    // find the most recently selected feature, clear the set of selected features and add the selected the feature (as the only one)
                    var f = self.selectInteraction.getFeatures()
                    var selectedFeature = f.getArray()[f.getLength() - 1]
                    self.selectInteraction.getFeatures().clear();
                    self.selectInteraction.getFeatures().push(selectedFeature);
                    self.countrySelection = { "code": selectedFeature.id_, "name": selectedFeature.values_.name };
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