import 'ol/ol.css';
import 'ol-geocoder/dist/ol-geocoder.css';
import Map from 'ol/Map';
import View from 'ol/View';
import MVT from 'ol/format/MVT';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
//import TileDebug from 'ol/source/TileDebug';
import VectorTileSource from 'ol/source/VectorTile';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { transformExtent, fromLonLat } from 'ol/proj';
import chroma from 'chroma-js';
import geocoder from 'ol-geocoder';

//import * as olColor from 'ol/color';
/*
var defaultStyle = new Style({
  fill: new Fill({
    color: 'rgba(250, 250, 250, 1)'
  }),
  stroke: new Stroke({
    color: 'rgba(40, 40, 40, .9)',
    width: 1
  })
});*/

// a javascript object literal can be used to cache
// previously created styles. Its very important for
// performance to cache styles.
var styleCache = {};

const colorScale = chroma.scale(['red', 'orange', 'yellow', 'lime']).domain([1, 9.85]);//puede se bezier 
//var colorScale = chroma.scale(chroma.brewer.RdYlGn).domain([1, 9.85]);
//var colorScale = chroma.scale( chroma.brewer.PiYG );
//var colorScale = chroma.scale( chroma.brewer.RdYlBu );
//var colorScale = chroma.scale( chroma.brewer.BrBG );
//var colorScale = chroma.scale( chroma.brewer.RdBu );
//var colorScale = chroma.scale( chroma.brewer.Spectral );

const scales = [0, 5.735946, 6.161794, 6.458379, 6.737333, 6.929084, 7.151279, 7.372851, 7.655340, 8.134889, 10];

// the style function returns an array of styles
// for the given feature and resolution.
// Return null to hide the feature.
function icvStyle(feature, resolution) {
    const level = feature.get('ICV2010');
    const decile = scales.findIndex(element => element > level);
    const ratio = (level - scales[decile - 1]) / (scales[decile] - scales[decile - 1]);

    const colorLevel = Math.round((decile + ratio) * 10) / 10;
    // console.log("level="+level+" decile="+decile+" ratio="+ratio+" colorLevel="+colorLevel);

    if (!styleCache[colorLevel]) {
        const color = chroma(colorScale(colorLevel).hex()).alpha(.6);
        styleCache[colorLevel] = new Style({
            fill: new Fill({
                color: color
            }),
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, .1)',
                width: 1
            })
            //stroke: defaultStyle.stroke
        });
    }

    //console.log("level="+level+" color="+color);

    return styleCache[colorLevel];
}

const urlParams = new URLSearchParams(window.location.search);
var icvLayer;
if (urlParams.has('raster')) {
    icvLayer = new TileLayer({
        source: new XYZ({
            url: 'https://api.mapbox.com/styles/v1/azunino/ck8nrrf3611nv1jpj33wavtyq/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXp1bmlubyIsImEiOiJjand0czBvc24wZ2l5NDhucnc2Ym9zNXNiIn0.tAtTepUSFqApaOQygq_9iw',
            TRANSPARENT: true
        })
    });
} else {
    icvLayer = new VectorTileLayer({
        //renderMode: "image",
        declutter: false,
        source: new VectorTileSource({
            attributions: "Mapas ICV por <a href='https://igehcs.conicet.gov.ar/'>IGEHCS</a>. Desarrollo App por <a href='http://www.isistan.unicen.edu.ar/'>ISISTAN</a>. © <a href='http://www.conicet.gob.ar'>CONICET</a> & <a href='http://www.unicen.edu.ar'>UNCPBA</a>",
            format: new MVT(),
            url: 'https://icv.conicet.gov.ar/tileserver-php/icv/{z}/{x}/{y}.pbf', maxZoom: 12
            //url: 'https://mapsdata.000webhostapp.com/tileserver-php/icv2/{z}/{x}/{y}.pbf', maxZoom: 10
            //url: 'http://localhost:4000/icv90/{z}/{x}/{y}.pbf', maxZoom: 9
        }),
        style: icvStyle
    });
}

var baseLayer;
if (urlParams.has('basemap')) {
    console.log(urlParams.get('basemap'));
    if (urlParams.get('basemap') == 'ign2') {
        baseLayer = new TileLayer({
            source: new TileWMS({
                //https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png
                //  url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/',
                url: 'https://wms.ign.gob.ar/geoserver/gwc/service/wms',
                params: { 'LAYERS': 'capabaseargenmap', 'TILED': true, 'srs': 'EPSG:3857' },
                serverType: 'geoserver',
                // Countries have transparency, so do not fade tiles:
                transition: 0
            })
        });
    } else if (urlParams.get('basemap') == 'ign') {
        baseLayer = new TileLayer({
            source: new XYZ({
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                'rest/services/Canvas/World_Light_Gray_Base/MapServer">ArcGIS</a>',
                url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png'
            })
        });
    } else if (urlParams.get('basemap') == 'osm') {
        baseLayer = new TileLayer({
            source: new OSM()
        });
    }
} else {
    console.log('default basemap esri');
    baseLayer = new TileLayer({
        source: new XYZ({
            attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
            'rest/services/Canvas/World_Light_Gray_Base/MapServer">ArcGIS</a>',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        })
    });
}

var map = new Map({
    target: 'map',
    layers: [
        baseLayer,
        icvLayer,
        /*   new TileLayer({
         source: new TileDebug()
       })*/
    ],
    view: new View({
        zoomFactor: 1.4,
        //extent: transformExtent([-53.6374515,-21.781168,-73.5605371,-55.1850761], 'EPSG:4326', 'EPSG:3857'),
        center: fromLonLat([-64.9672817, -34.9964963]),
        zoom: 4
    })
});
//tileloadend
//rendercomplete
//icvLayer.getSource().on('tileloadend', function() {
/*
map.on('rendercomplete', function() {
  console.log('rendercomplete');
});
*/
map.getView().fit(transformExtent([-53.6374515, -21.781168, -73.5605371, -55.1850761], 'EPSG:4326', 'EPSG:3857'), map.getSize());

var provider = locationIQSearch({
    url: 'https://us1.locationiq.com/v1/search.php?format=json&key=0e7dd68b4a8a12&accept-language=es&no_annotations=0&countrycodes=AR',
});

var gc = new geocoder('nominatim', {
    provider: provider,
    // key: '__some_key__',
    lang: 'es', //en-US, fr-FR
    placeholder: 'Buscar ...',
    //  targetType: 'text-input',
    limit: 5,
    countrycodes: 'ar',
    autoComplete: true,
    autoCompleteMinLength: 5,
    keepOpen: true
});

const locationParentElement = document.getElementById('location').parentNode;

const animSearch = new URLSearchParams(window.location.search).has('anim') ? 1 : 0;

gc.on('addresschosen', function (evt) {
    console.log(evt.address.details.name);
    var element = document.getElementById('location');
    if (element != null)
        element.parentNode.removeChild(element);

    if (evt.bbox) {
        console.log("bbox: "+JSON.stringify(evt.bbox));
        //    map.getView().fit(transformExtent([-53.6374515, -21.781168, -73.5605371, -55.1850761], 'EPSG:4326', 'EPSG:3857'), map.getSize());
        if (animSearch) {
            map.getView().fit(evt.bbox, { duration: 3000 });//, { duration: 3000 }
        } else {
            map.getView().fit(evt.bbox);
        }

        map.once('rendercomplete', function () {
            console.log('rendercomplete');

            const newElement = document.createElement("div");
            newElement.setAttribute('id', 'location');
            newElement.style.display = "none";
            locationParentElement.appendChild(newElement);

            document.title = evt.address.details.name;
        });
        setTimeout(function () {
            map.renderSync();
        }, 3000);
    } else {
        map.getView().animate({ zoom: 14, center: evt.coordinate });
    }
});
//esto rompe todo con puppeteer en móviles. Ni idea por qué
//map.once('rendercomplete', function () {
map.addControl(gc);
//});

//map.renderSync();


function locationIQSearch(options) {
    var url = options.url;
    return {
        /**
         * Get the url, query string parameters and optional JSONP callback
         * name to be used to perform a search.
         * @param {object} options Options object with query, key, lang,
         * countrycodes and limit properties.
         * @return {object} Parameters for search request
         */
        getParameters: function (opt) {
            return {
                url: url,
                //      callbackName: 'json_callback',
                params: {
                    q: opt.query,
                },
            };
        },
        /**
         * Given the results of performing a search return an array of results
         * @param {object} data returned following a search request
         * @return {Array} Array of search results
         */
        handleResponse: function (results) {
            // The API returns a GeoJSON FeatureCollection
            if (!results.length) return;
            // console.log("response: "+results);
            return results.map(result => ({
                lon: result.lon,
                lat: result.lat,
                address: {
                    // Simply return a name in this case, could also return road,
                    // building, house_number, city, town, village, state,
                    // country
                    name: result.display_name,
                },
                // bbox: [result.boundingbox[2], result.boundingbox[0], result.boundingbox[3], result.boundingbox[1]],
                bbox: result.boundingbox
            }));
        }
    }
}

window.addEventListener('load', (event) => {
    // console.log('The page has fully loaded');
    fetch('/get-user-data') 
  .then(response => response.json())
  .then(data => {
      console.log(data);
      console.log(document.getElementById('nameLogin'));
      document.getElementById('nameLogin').text = 'Bienvenido ' + data.given_name + '!';
      document.getElementById('imgLogin').src = data.picture;
  });
});