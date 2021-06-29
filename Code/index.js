var curr_page = 0;
var all_keys = Object.keys(data);
var num_pages = all_keys.length;
var new_index;
var edit_hidden = true;
var edit_history = {};
var inputted_API_key;

function populate_page(){
    for (i = 0; i < num_pages; i++) {
        // creates the button to place the image into
        var newButton = document.createElement("button");
        newButton.className = 'progress undecided';
        newButton.id = i;
        newButton.innerHTML=i+1;
        newButton.setAttribute('onclick', "change_image(this);");
        // places the button in the right row
        document.getElementById(`buttons`).appendChild(newButton);
    }
    change_current_page(0, 0)
}
function api_key() {
    let key = prompt("Please enter your Key:");
    inputted_API_key = key;
    change_current_page(0,0)
}
function change_image(given_page){
    new_index = Number(given_page.id);
    change_current_page(curr_page, new_index);
}
function arrow_button(direction){
    if (direction){
        // Moves to the right (or a lesser number)
        new_index = (Number(curr_page) + 1 + num_pages) % num_pages;
    }
    else{
        // Moves to the left (or a greater number)
        new_index = (Number(curr_page) - 1 + num_pages) % num_pages;
    }
    change_current_page(curr_page, new_index);
}
function change_current_page(old_destination, new_destination){
    // console.log(`Trying to move from ${old_destination} to ${new_destination}`);
    make_map(new_destination);
    document.getElementById(old_destination).style.border = "";
    document.getElementById(new_destination).style.border = "thick solid #000000";

    document.getElementById('location').innerHTML = `<b>Location:</b> ${data[new_destination]['locations']}`;
    document.getElementById('suggestion').innerHTML = `<b>Suggestion:</b> ${data[new_destination]['suggestions']}`;
    curr_page = new_destination;
}
function change_button_type(new_class){
    if (new_class == "edit"){
        if (edit_hidden){
            document.getElementById("input_field").style.display = 'block';
            edit_hidden = false;
        }
        else{
            document.getElementById("input_field").style.display = 'none';
            edit_hidden = true;
        }
    }
    else{
        document.getElementById(curr_page).className = `progress ${new_class}`
    }
}
function submit_form(){
    var edit_category = document.querySelector('input[name="Edit_Type"]:checked').value;
    var edit_amount = Number(document.getElementById("Amount").value);
    // var nameValue = document.getElementById("input_field").style.display = 'none';
    // edit_hidden = true;
    edit_history[`ID_${data[curr_page]['id']}`] = [edit_category, edit_amount]
    document.getElementById(curr_page).className = `progress edit`
    
    document.getElementById("input_field").style.display = 'none';
    edit_hidden = true;
}


function export_data(){
    var buttons_list = document.getElementById("buttons");
    // Collecting all accepted edits
    const acc_matches = buttons_list.querySelectorAll("button.accept");
    var accepted_arr = [];
    for (i = 0; i < acc_matches.length; i++) {
        accepted_arr.push(`ID_${Number(acc_matches[i].id)+1}`);
    }
    // Collecting all declined edits
    const dec_matches = buttons_list.querySelectorAll("button.decline");
    var declined_arr = [];
    for (i = 0; i < dec_matches.length; i++) {
        declined_arr.push(`ID_${Number(dec_matches[i].id)+1}`);
    }
    exportToJsonFile({ 'accepted': accepted_arr, 'declined': declined_arr, 'edits': edit_history})
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

function make_map(ID){
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    mapboxgl.accessToken = inputted_API_key;
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: data[ID]['centroid'],
        zoom: 6
    });

    map.on('load', function () {
        map.addSource('national-park', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [
                                data[ID]['polygon']
                            ]
                        }
                    },
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': data[ID]['centroid']
                        }
                    }
                    // ,{
                    //     'type': 'Feature',
                    //     'geometry': {
                    //         'type': 'Point',
                    //         'coordinates': [-121.505184, 40.488084]
                    //     }
                    // },
                    // {
                    //     'type': 'Feature',
                    //     'geometry': {
                    //         'type': 'Point',
                    //         'coordinates': [-121.354465, 40.488737]
                    //     }
                    // }
                ]
            }
        });

        map.addLayer({
            'id': 'park-boundary',
            'type': 'fill',
            'source': 'national-park',
            'paint': {
                'fill-color': '#888888',
                'fill-opacity': 0.7
            },
            'filter': ['==', '$type', 'Polygon']
        });

        map.addLayer({
            'id': 'park-volcanoes',
            'type': 'circle',
            'source': 'national-park',
            'paint': {
                'circle-radius': 4,
                'circle-color': '#B42222'
            },
            'filter': ['==', '$type', 'Point']
        });
    });
}