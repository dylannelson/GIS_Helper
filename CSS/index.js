var curr_page = 0;
var files = data['files'];
var num_pages = files.length;
var new_index;

function populate_page(){
    for (i = 0; i < num_pages; i++) {
        // creates the button to place the image into
        var newButton = document.createElement("button");
        newButton.className = 'progress undecided';
        newButton.id = i;
        newButton.innerHTML=i;
        newButton.setAttribute('onclick', "change_image(this);");
        // places the button in the right row
        document.getElementById(`buttons`).appendChild(newButton);
    }
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
    document.getElementById("content").innerHTML = `<img src="Photos/${files[new_destination]}" alt="image Failed" width = 80%>`;
    document.getElementById(old_destination).style.border = "";
    document.getElementById(new_destination).style.border = "thick solid #000000";

    document.getElementById('location').innerHTML = `<b>Location:</b> ${data['locations'][new_destination]}`;
    document.getElementById('suggestion').innerHTML = `<b>Suggestion:</b> ${data['suggestions'][new_destination]}`;
    curr_page = new_destination;
}
function change_button_type(new_class){
    document.getElementById(curr_page).className = `progress ${new_class}`
}
function export_data(){
    var buttons_list = document.getElementById("buttons");
    // Collecting all accepted edits
    const acc_matches = buttons_list.querySelectorAll("button.accept");
    var accepted_arr = [];
    for (i = 0; i < acc_matches.length; i++) {
        accepted_arr.push(files[acc_matches[i].id]);
    }
    // Collecting all declined edits
    const dec_matches = buttons_list.querySelectorAll("button.decline");
    var declined_arr = [];
    for (i = 0; i < dec_matches.length; i++) {
        declined_arr.push(files[dec_matches[i].id]);
    }
    exportToJsonFile({ 'accepted': accepted_arr, 'declined': declined_arr})
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