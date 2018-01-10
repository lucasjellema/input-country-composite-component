requirejs.config(
  {
    paths:
    { 'input-country/ol': '../'+require.toUrl('input-country/libs/openlayers/ol-debug')
    }   
  }
  );
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcore', 'text!./view.html', './viewModel', 'text!./component.json','inputCountry/ol', 'css!./styles', 'css!./libs/openlayers/ol', 'ojs/ojcomposite'],
  function(oj, view, viewModel, metadata,ol) {
    oj.Composite.register('input-country7', {
      view: {inline: view}, 
      viewModel: {inline: viewModel}, 
      metadata: {inline: JSON.parse(metadata)}
    });
  }
);