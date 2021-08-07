// Used for handling page switching, they are only momentarily not the same
var curr_page = 0;                      //The page currently displayed
var new_index;                          //The Page that WILL be switched to
var all_keys = Object.keys(corr_data);  // Collection of all the keys
var num_pages = all_keys.length;        // Total pages displayed
var selected_data_source = 0;           // Will refer to the INDEX of the correct data source (0,1,2) in the list below
var all_data_sources = [hail_data, corr_data, bias_data];   // The different data sources that can be toggled between
var button_ids = ['hail_button', 'corr_button', 'bias_button'];
var chosen_hours;                       // Hours that will be displayed
var edit_hidden = true;                 // current hidden status of the Edit Button input field
var edit_history = {};                  // Edits that are going to be outputted
var inputted_API_key = '';
var toggled_color = '#4a535e';
var untoggled_color = '#5c6a7a';
var rightMap = false;                   //The right map that is displayed
var leftMap;                            //The left map that is displayed

// Interesting problem, if a error similar to:
// "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT" shows up in console, 
// it is likely ad-blocker. No clue how/why. disabling adblock fixed for me
// it didn't cause any problems, at least from what I saw. Strange

//Intitializtion Function for the site
function populate_page() {
    for (i = 0; i < num_pages; i++) {
        // creates the button to place the image into
        var newButton = document.createElement("button");           // Creates an empty button element
        newButton.className = 'progress undecided';                 // Asigns its CSS classes
        newButton.id = i;                                           // Gives it a unique ID
        newButton.innerHTML = i + 1;                                // Gives it a number to display
        newButton.setAttribute('onclick', "change_image(this);");   // Makes it run a function when clicked
        document.getElementById(`buttons`).appendChild(newButton);  // Places the button in the right Div
        document.getElementById(button_ids[selected_data_source]).style.backgroundColor = toggled_color; // Colors the default map button
    }
    initialize_left_map();
    change_current_page(0, 0);
}
// Allows user input for API key
function api_key() {
    // Help from https://www.w3schools.com/js/js_popup.asp
    let key = prompt("Please enter your Key:");
    inputted_API_key = key;
    // Basically re-intializes the page when a key is entered
    initialize_left_map();
    change_current_page(0, 0);
}
// use "all_data_sources" to refer to what the ID should be
// At the time of making this, hail_data is first in the list so it will have an ID of 0 for the 
// Button I'm making for changing the data source to hail_data
function change_data_source(source_ID){
    document.getElementById(button_ids[selected_data_source]).style.backgroundColor = "";                     // Removes border from prev Location
    document.getElementById(button_ids[source_ID]).style.backgroundColor = toggled_color;  // Adds border to new Location
    selected_data_source = source_ID;
    make_right_map(all_keys[curr_page], chosen_hours);
}
// toggles all the hour buttons appropriately every time a cluster is changed
function reset_hour_buttons(){
    var all_buttons = document.getElementsByClassName("hour_button")
    for (i = 0; i < all_buttons.length; i++) {
        // Buttons that CAN'T be pressed
        all_buttons[i].style.backgroundColor = "#344357";
        all_buttons[i].classList.remove("hour_off");
    }
    for (i = 0; i < chosen_hours.length; i++) {
        // buttons that are ON and CAN be pressed
        document.getElementById(`${chosen_hours[i]}`).style.backgroundColor = untoggled_color;
    }
}
function toggle_hour(given_hour){
    curr_button = document.getElementById(`Hour_${given_hour}`)
    if (curr_button.classList.contains("hour_off")){
        rightMap.addLayer(
            {
                'id': `MAP_ID_${all_keys[curr_page]}_${curr_button.id}`,
                'type': 'fill',
                'source': `MAP_DOMAIN_${all_keys[curr_page]}_${curr_button.id}`,
                'layout': {},
                'paint': {
                    'fill-color': ['get', 'Color'],
                    'fill-opacity': 1
                }
            }
        );
        // Color when ON
        curr_button.style.backgroundColor = untoggled_color
    }
    else{
        rightMap.removeLayer(`MAP_ID_${all_keys[curr_page]}_${curr_button.id}`);
        // color when OFF
        curr_button.style.backgroundColor = toggled_color
    }
    curr_button.classList.toggle("hour_off");
    
}
// Page changing specifically for the BOTTOM buttons
function change_image(given_page) {
    new_index = Number(given_page.id);
    change_current_page(curr_page, new_index);
}
// Page changing specifically for the ARROW buttons
function arrow_button(direction) {
    if (direction) {
        new_index = (Number(curr_page) + 1 + num_pages) % num_pages;}   // Moves to the right (or a lesser number)
    else {
        new_index = (Number(curr_page) - 1 + num_pages) % num_pages;}   // Moves to the left (or a greater number)
    change_current_page(curr_page, new_index);
}
function change_current_page(old_destination, new_destination) {
    chosen_hours = Object.keys(all_data_sources[selected_data_source][all_keys[new_destination]]);               // Assigns new hours to display
    make_right_map(all_keys[new_destination], chosen_hours);                        // Removes border from prev Location
    document.getElementById(old_destination).style.border = "";                     // Removes border from prev Location
    document.getElementById(new_destination).style.border = "thick solid #000000";  // Adds border to new Location
    curr_page = new_destination;

    var center = rightMap.getCenter();  // Gets the right map center and zoom
    var zoom = rightMap.getZoom();
    leftMap.setCenter(center);          // and makes the left map snap to the new location
    leftMap.setZoom(zoom);
    update_polygon();                   // and display the new outline
}
function change_button_type(new_class) {
    if (new_class == "edit") {
        if (edit_hidden) {
            document.getElementById("input_field").style.display = 'block';
            // Hides the edit box
            edit_hidden = false;}
        else {
            document.getElementById("input_field").style.display = 'none';
            // Opens the edit box
            edit_hidden = true;
        }
    }
    else {
        document.getElementById(curr_page).className = `progress ${new_class}`
    }
}
// Submits the form within the edit Box
function submit_form() {
    var edit_category = document.querySelector('input[name="Edit_Type"]:checked').value;    // Looks for the value of the selected radio button
    var edit_amount = Number(document.getElementById("Amount").value);                      // Gets the value in the text box
    edit_history[`ID_${curr_page}`] = [edit_category, edit_amount]                          // asigns it to the output folder
    document.getElementById(curr_page).className = `progress edit`                          // Makes the related button have the 'edit' class
    document.getElementById("input_field").style.display = 'none';                          // Hides the box
    edit_hidden = true;
}


function export_data() {
    var buttons_list = document.getElementById("buttons");
    // Collecting all accepted edits
    const acc_matches = buttons_list.querySelectorAll("button.accept");
    var accepted_arr = [];
    for (i = 0; i < acc_matches.length; i++) {
        accepted_arr.push(`ID_${Number(acc_matches[i].id) + 1}`);
    }
    // Collecting all declined edits
    const dec_matches = buttons_list.querySelectorAll("button.decline");
    var declined_arr = [];
    for (i = 0; i < dec_matches.length; i++) {
        declined_arr.push(`ID_${Number(dec_matches[i].id) + 1}`);
    }
    exportToJsonFile({ 'accepted': accepted_arr, 'declined': declined_arr, 'edits': edit_history })
}

// found from https://www.codevoila.com/post/30/export-json-data-to-downloadable-file-using-javascript
function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    let exportFileDefaultName = 'data.json';
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function update_polygon(){
    try {
        // leftMap.removeLayer('LEFT_POLYGON_layer')
        leftMap.removeLayer('LEFT_POLYGON_outline');
        leftMap.removeSource('LEFT_POLYGON_source');
        
    } catch (error) {
        console.log('There was no map/Source to delete');
    }
    leftMap.addSource('LEFT_POLYGON_source', {
        'type': 'geojson',
        'data': clusters[all_keys[curr_page]]
    });

    // The fill for the polygon outline
    // leftMap.addLayer({
    //     'id': 'LEFT_POLYGON_layer',
    //     'type': 'fill',
    //     'source': 'LEFT_POLYGON_source',
    //     'paint': {
    //         'fill-color': '#888888',
    //         'fill-opacity': 0.9
    //     },
    //     'filter': ['==', '$type', 'Polygon']
    // });
    leftMap.addLayer({
        'id': 'LEFT_POLYGON_outline',
        'type': 'line',
        'source': 'LEFT_POLYGON_source',
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 3
        }
    });
    
}
function initialize_left_map(){
    mapboxgl.accessToken = inputted_API_key;
    leftMap = new mapboxgl.Map({
        container: 'left_map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-96.5085809571991, 35.51769231545942],
        zoom: 6
    });

    leftMap.on('load', function () {
        leftMap.addSource('urban-areas', {
            'type': 'geojson',
            'data': left_daily
        });
        leftMap.addLayer(
            {
                'id': 'urban-areas-fill',
                'type': 'fill',
                'source': 'urban-areas',
                'layout': {},
                'paint': {
                    'fill-color': ['get', 'Color'],
                    'fill-opacity': 1
                }
            }
        );
        
        // document.getElementById('fly').addEventListener('click', function () {
        //     leftMap.flyTo({
        //         center: [-92.6, 36.8],
        //         zoom: 5.3,
        //         essential: true // this animation is considered essential with respect to prefers-reduced-motion
        //     });
        // });
        update_polygon();
    });
    
}

function make_right_map(cluster, input_hours) {
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    if (rightMap){
        rightMap.remove()
        console.log('Removed Map')
    }
    
    mapboxgl.accessToken = inputted_API_key;
    rightMap = new mapboxgl.Map({
        container: 'right_map',
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: all_data_sources[selected_data_source][cluster][input_hours[0]]["features"][0]["geometry"]["coordinates"][0][0],
        zoom: 7.5
    });
    rightMap.on('load', function () {
        for (var i = 0; i < chosen_hours.length; i++) {
            rightMap.addSource(`MAP_DOMAIN_${cluster}_${chosen_hours[i]}`, {
                'type': 'geojson',
                'data': all_data_sources[selected_data_source][cluster][input_hours[i]]
            });
            rightMap.addLayer(
                {
                    'id': `MAP_ID_${cluster}_${chosen_hours[i]}`,
                    'type': 'fill',
                    'source': `MAP_DOMAIN_${cluster}_${chosen_hours[i]}`,
                    'layout': {},
                    'paint': {
                        'fill-color': ['get', 'Color'],
                        'fill-opacity': 1
                    }
                }
            );
        }
        // Makes both maps pan together
        var disable = false;
        rightMap.on("move", function () {
            if (!disable) {
                var center = rightMap.getCenter();
                var zoom = rightMap.getZoom();
                var pitch = rightMap.getPitch();
                var bearing = rightMap.getBearing();

                disable = true;
                leftMap.setCenter(center);
                leftMap.setZoom(zoom);
                leftMap.setPitch(pitch);
                leftMap.setBearing(bearing);
                disable = false;
            }
        })

        reset_hour_buttons();
    });
}