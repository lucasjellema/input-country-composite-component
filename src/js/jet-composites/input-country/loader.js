/*
requirejs.config(
  {
    // Path mappings for the logical module names
    // Update the main-release-paths.json for release mode when updating the mappings
    paths:
    //injector:mainReleasePaths
    { 'ol': './jet-composites/input-country/libs/openlayers/ol-debug'
    }
    //endinjector
    ,
    // Shim configurations for modules that do not expose AMD
    shim:
    { 'ol':
      {
        exports: ['ol']
      }
    }
  }
  );
  */

/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcore', 'text!./view.html', './viewModel', 'text!./component.json','./libs/openlayers/ol-debug', 'css!./styles', 'css!./libs/openlayers/ol', 'ojs/ojcomposite', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojbutton',
'ojs/ojpopup'],
  function(oj, view, viewModel, metadata,ol) {
    console.log("Register composite comp with "+ol);
    oj.Composite.register('input-country', {
      view: {inline: view}, 
      viewModel: {inline: viewModel}, 
      metadata: {inline: JSON.parse(metadata)}
    });
  }
);