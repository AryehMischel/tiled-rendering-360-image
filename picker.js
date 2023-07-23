const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '763421155078-nnpvg9kp0hpqded2e83i7fg669d3f5lj.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDekhzQ-TUMsLCivTTbMJA8hoAuzpUhOcE';

// TODO(developer): Replace with your own project number from console.developers.google.com.
const APP_ID = 'winter-origin-386003';

let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;
let photoIndex = 0

// document.getElementById('authorize_button').style.visibility = 'hidden';
// document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client:picker', initializePicker);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 **/

async function initializePicker() {
    await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
    pickerInited = true;
    maybeEnableButtons();

                        
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 **/

function maybeEnableButtons() {
    if (pickerInited && gisInited) {
        // document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

/**
 *  Sign in the user upon button click. <-- I SHOULD BE ABLE TO SKIP THIS STEP BY PROVIDING THE ACCESS TOKEN GENERATED EARLIER
 */
function handleAuthClick() {
    photoIndex = 0
    tokenClient.callback = async (response) => {
        if (response.error !== undefined) {
            throw (response);
        }
        accessToken = response.access_token;
        // document.getElementById('signout_button').style.visibility = 'visible';
        // document.getElementById('authorize_button').innerText = 'Refresh';
        await createPicker();
    };

    if (accessToken === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({prompt: ''});
    }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    if (accessToken) {
        accessToken = null;
        google.accounts.oauth2.revoke(accessToken);
        document.getElementById('content').innerText = '';
        // document.getElementById('authorize_button').innerText = 'Authorize';
        // document.getElementById('signout_button').style.visibility = 'hidden';
    }
}

/**
 *  Create and render a Picker object for searching images.
 */
function createPicker() {

        var docsView = new google.picker.DocsView()
        // .addView(google.picker.ViewId.DOCS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);
        docsView.setMimeTypes("image/png,image/jpeg,image/jpg");
       
       var DisplayView = new google.picker.DocsView().setIncludeFolders(true).setSelectFolderEnabled(true);

        var picker = new google.picker.PickerBuilder()
        .setDeveloperKey(API_KEY)
     
        .setAppId(APP_ID)
        .setOAuthToken(accessToken)

        

        .addView(DisplayView)
        .setCallback(pickerCallback)
        .build();

    picker.setVisible(true);
}

/**
 * Displays the file details of the user's selection.
 * @param {object} data - Containers the user selection from the picker
 */
async function pickerCallback(data) {
    if (data.action === google.picker.Action.PICKED) {
      
        const document = data[google.picker.Response.DOCUMENTS][0]; //selected folder
        console.log(document.id)
        await listFiles(document.id).then(()=>console.log("everybody dance now"))  ;

        
    }
}



async function listFiles(folderId) {
    let response;
    try {
        response = await gapi.client.drive.files.list({
            'pageSize': 100,
            'fields': 'files(id, name)',
            'q': `(mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/webp') and '${folderId}' in parents`
                //'and 1pSpskKJ8fX20xh8aDAWd0c2kIMbmeCl9 in parents'
        });
    } catch (err) {
        document.getElementById('content').innerText = err.message;
        return;
    }


    const files = response.result.files;
 
    if (!files || files.length == 0) {
        document.getElementById('content').innerText = 'No files found.';
        return;
    }


   
    getImage(files).then(successCallback, failureCallback);

    function successCallback(){
        console.log("success")
        }
          
          function failureCallback(){
        console.log("failed")
        }
        
       

}


async function getImage(files){
    let filesloaded = 0
    files.forEach(
        file => fetchImage(file.id), console.log(`Loaded: ${filesloaded}/${files.length}`)
        
        )
}





async function fetchImage(fileID){

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileID}?alt=media`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }}).then( response => response.blob())
        .then(blob =>{
            const reader = new FileReader() ;
            reader.onload = function(){
                console.log(`added photo${photoIndex}`)
                photoIndex++;
                addImage(this.result)
            } ; // <--- `this.result` contains a base64 data URI
            return reader.readAsDataURL(blob) ;
        })
}



function changePhoto(src){
    console.log("...executing?")
    document.getElementById('photo').setAttribute("src", src);
}


function addImage(src){
    let image = document.createElement("img")
    
    image.src = src
    crop(src);
    
    //document.querySelector("a-assets").append(image)
}

