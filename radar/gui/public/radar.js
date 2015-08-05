$(function() {

    demoTracks = [trackToDisplay];
    // Get start/end times
    var startTime = new Date(demoTracks[0].properties.time[0]);
    var endTime = new Date(demoTracks[0].properties.time[demoTracks[0].properties.time.length - 1]);

    // Create a DataSet with data
    var timelineData = new vis.DataSet([{start: startTime, end: endTime, content: trackName}]);

    // Set timeline options
    var timelineOptions = {
        "width": "100%",
        "height": "120px",
        "style": "box",
        "axisOnTop": true,
        "showCustomTime": true
    };

    // Setup timeline
    var timeline = new vis.Timeline(document.getElementById('timeline'), timelineData, timelineOptions);

    // Set custom time marker (blue)
    timeline.setCustomTime(startTime);

    // Setup leaflet map
    map = new L.Map('map');

    var basemapLayer = new L.TileLayer('http://freemap.sk/C/{z}/{x}/{y}.png');

    // Center map and default zoom level
    map.setView([48.2713, 17.1346], 11);

    // Adds the background layer to the map
    map.addLayer(basemapLayer);


    // =====================================================
    // =============== Playback ============================
    // =====================================================

    // Playback options
    var playbackOptions = {
        //playControl: true,
        dateControl: true,
        // layer and marker options
        layer: {
            pointToLayer: function(featureData, latlng) {
                var result = {};

                if (featureData && featureData.properties && featureData.properties.path_options) {
                    result = featureData.properties.path_options;
                }

                if (!result.radius) {
                    result.radius = 2;
                }

                return new L.CircleMarker(latlng, result);
            }
        },
        marker: {
            getPopup: function(featureData) {
                var result = '';

                if (featureData && featureData.properties && featureData.properties.title) {
                    result = featureData.properties.title;
                }

                return result;
            }
        }

    };

    // Initialize playback
    var playback = new L.Playback(map, null, onPlaybackTimeChange, playbackOptions);

    playback.setData(demoTracks);
    playback.addData(trackToDisplay);

    // Uncomment to test data reset;
    //playback.setData(blueMountain);    

    // Set timeline time change event, so cursor is set after moving custom time (blue)
    timeline.on('timechange', onCustomTimeChange);

    // A callback so timeline is set after changing playback time
    function onPlaybackTimeChange(ms) {
        timeline.setCustomTime(new Date(ms));
    }
    ;

    radarImageUrl = 'file:///home/peter/Repositories/shmu/radar/images/20150804/20150804_175.png';
    imageBounds = [[46.449212403852584, 16.21358871459961], [49.92602987536322, 22.70427703857422]];

    current_radar_frame_timestamp = null;
    next_radar_frame_timestamp = null;
    current_radar_overlay = null;

    function onCustomTimeChange(properties) {
        if (!playback.isPlaying()) {
            millis = properties.time.getTime();
            playback.setCursor(millis);
            seconds_since_linux_epoch = parseInt(millis / 1000);
            next_radar_frame_timestamp = seconds_since_linux_epoch - (seconds_since_linux_epoch % 300);
            if (current_radar_frame_timestamp !== next_radar_frame_timestamp) {
                current_radar_frame_timestamp = next_radar_frame_timestamp;

                radarImageUrl = '../radar_image/' + current_radar_frame_timestamp;
                next_radar_overlay = L.imageOverlay(radarImageUrl, imageBounds);
                next_radar_overlay.addTo(map).setOpacity(0.5);
                if (current_radar_overlay !== null) {
                    map.removeLayer(current_radar_overlay);
                }
                current_radar_overlay = next_radar_overlay;

            }
        }
    }
});

