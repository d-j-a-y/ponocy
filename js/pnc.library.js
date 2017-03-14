//TODO LIST
// * pb canceling new pnc near existing point (markers cluster group pb)
// * cluster by pnc type ?
// poo ?
// How to signal a pnc SOLVED !
// print list
// Multiple solution proposition ? <bd>!
// form validations?
// Center point has coordinate
// CEnter point from GPS
// Add image layer relating danger info
// Form Aide dans les champs "Une phrase décrivant le prb"

//KNOWN BUGs
// create a pnc near existing one, a cluster is created, if creation canceled, only the cluster is removed (db is safe!)

// !!!!! https://github.com/wwwouaiebe/leaflet.marker.pin
//http://wiki.openstreetmap.org/wiki/Nominatim

var map;
var lastmarker = null;
var pnctarget = null;
var markers;
var updating_marker = false;

var tiles;
var points = [{ lat: 43.69692, lon: 7.25973 }];

var pnclistdata = new Array();

var PCNTYPE_STATION = 1;
var PCNTYPE_AMENAGE = 2;
var PCNTYPE_AUTRE = 3;

var PCNDANGER_PAS = 1;
var PCNDANGER_PEU = 2;
var PCNDANGER_TRES = 3;

var ICON_SIZE_X = 32;

function pncdata(pnctype, ville, adresse, adresse_num, comment, solution, markerId){
   this.type = pnctype;
   this.ville = ville;
   this.adresse = adresse;
   this.adresse_numero = adresse_num;
   this.comment = comment;
   this.solution = solution;
   this.latitude = "";
   this.longitude = "";
   this.valide = "Y";
   this.markerId = markerId;
   this.markerId_valid = false;
   this.danger = 0;
}

pncdata.prototype.initFromForm = function (datadb) {
   this.latitude = datadb['latitude']; //TODO GLOBAL idem addtodb
   this.longitude = datadb['longitude'];
   this.pnctype = datadb['type'];
}

var PNCIcon = L.Icon.extend({
    options: {
        shadowUrl: './ressource/shadow.png',
        iconSize:     [32, ICON_SIZE_X],
        shadowSize:   [50, 64],
        iconAnchor:   [0, ICON_SIZE_X],
        shadowAnchor: [4, 62],
        popupAnchor:  [16, -32],
        pnctexte: ""
    }
});

var parkingIcon = new PNCIcon({iconUrl: './ressource/pnc_marker_parking.png',
                               iconSize:[32,ICON_SIZE_X]}),
    roadIcon = new PNCIcon({iconUrl: './ressource/pnc_marker_road.png',
                            iconSize:[32,ICON_SIZE_X]}),
    creationIcon = new PNCIcon({iconUrl: './ressource/pnc_marker_creation.png',
                                iconSize:[18,ICON_SIZE_X]});

var DEFAULT_LAT = 43.7033;
var DEFAULT_LONG = 7.2565;
var DEFAULT_ZOOM = 13;

function centermap(latitude, longitude, zoom){
   this.longitude = longitude;
   this.latitude = latitude;
   this.zoom = zoom;
}

var centerMap = new centermap(DEFAULT_LAT, DEFAULT_LONG, DEFAULT_ZOOM);

document.addEventListener("DOMContentLoaded", function(event) {
   getCenterMap();

   map = L.map('pncmap').setView([centerMap.latitude, centerMap.longitude], centerMap.zoom);
   markers = new L.MarkerClusterGroup();
// add an OpenStreetMap tile layer
   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
   }).addTo(map);

   var oReq = new XMLHttpRequest();
   oReq.onload = function() {
   var pnclist = JSON.parse(this.responseText);
      for(var i in pnclist){
         addPncFromDatabase(pnclist[i], i);
      }
   };
   //Don't block the rest of the execution.
   oReq.open("get", "datalib/libpnc.php", true);
   oReq.send();

   map.addLayer(markers);
// map.addLayer(tiles);
   map.on('click', onMapClick);
});


function getCenterMap() {
   if ("geolocation" in navigator) {
//      output.innerHTML = '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>';
      navigator.geolocation.getCurrentPosition(onGeoLocSuccess, onGeoLocError);
   }/* else
   {
      onGeoLocError();
   }*/
}


function onGeoLocSuccess(position) {
   var latitude  = position.coords.latitude;
   var longitude = position.coords.longitude;

   map.setView([centerMap.latitude, centerMap.longitude], 16);
   console.log("succes");
}


function onGeoLocError() {
/*
   centerMap.latitude = DEFAULT_LAT;
   centerMap.longitude = DEFAULT_LONG;
   centerMap.zoom = DEFAULT_ZOOM;

   map.setView([centerMap.latitude, centerMap.longitude], centerMap.zoom);

*/   console.log("fail");
}


function addPncFromDatabase(pnc, i) {

   var latitude = pnc['latitude']; //TODO GLOBAL idem addtodb
   var longitude = pnc['longitude'];
   var pnctype = pnc['type'];
   var point = new L.LatLng(latitude, longitude);

   var markericon;
   switch( getPncTypeFromString(pnctype)) {
      case PCNTYPE_STATION:
         markericon = parkingIcon;
      break;
      case PCNTYPE_AMENAGE:
          markericon = roadIcon;
      break;
      case PCNTYPE_AUTRE:
         markericon = creationIcon;
      break;
   }

   lastmarker = L.marker([latitude, longitude], {icon: markericon}).addTo(map).bindPopup(getPncPopup(pnc));
   lastmarker._leaflet_id = pnc['ID'];
   lastmarker.is_valid_id = true;

   addPncEntry(pnctype,
               pnc['adresse'],
               pnc['adresse_numero'],
               pnc['comment'],
               pnc['solution'],
               lastmarker._leaflet_id,
               pnc['ville'],
               latitude,
               longitude,
               pnc['danger'],
               "Y");
   lastmarker.on('dblclick', onMarkerClick);
   markers.addLayer(lastmarker);
   lastmarker = null;
}

function getPncPopup(pnc) {
   return pnc['comment'] + " " + pnc['ville'];
}


function onMapClick(e) {

   if(!e.originalEvent.ctrlKey){
   //   hidePNCForm();
//var point = new L.LatLng(e.latlng.lat, e.latlng.lng);
      if(lastmarker && !updating_marker){
         markers.removeLayer(lastmarker);
         map.removeLayer(lastmarker);
      }
      updating_marker = false;
      displayPNCForm(e.originalEvent.clientX, e.originalEvent.clientY);
      points.push({lat: e.latlng.lat, lon: e.latlng.lng });

      var latitude = e.latlng.lat;
      var longitude =  e.latlng.lng;

      lastmarker = L.marker([latitude, longitude], {icon: creationIcon}).addTo(map); //.bindPopup("wala </br> trop <a href='http://ligne16.net'>del</a> abome");
      lastmarker._leaflet_id = Math.round(Math.random() * 999)+999;
      lastmarker.is_valid_id = false;
      lastmarker.on('click', onMarkerClick);

      markers.addLayer(lastmarker);
   }
}


function onMarkerClick(e) {

   pnctarget = e.target;
   pnctarget.closePopup();
   hidePNCForm();
   var pncui = document.getElementById("pnc-userchoice");
   //early visible, to get the width and height calculated
   pncui.style.display = "inline";

   var clientX = e.originalEvent.clientX;
   var clientY = e.originalEvent.clientY;
   pnctarget.clientX = clientX;
   pnctarget.clientY = clientY;
   var docheight = document.body.clientHeight;
   var docwidth = document.body.clientWidth;
   pncui.style.left = (clientX+ICON_SIZE_X + pncui.clientWidth)> docwidth  ? (clientX - pncui.clientWidth-ICON_SIZE_X) : clientX+ICON_SIZE_X;
   pncui.style.top = (clientY + pncui.offsetHeight) > docheight ? (docheight - pncui.offsetHeight) : clientY ;


   return;

/*   if(!e.originalEvent.ctrlKey){
      var pnc_data = getPncDataFromID(e.target._leaflet_id);

      if(lastmarker){
         markers.removeLayer(lastmarker);
         map.removeLayer(lastmarker);
      }
      lastmarker = e.target;
      updating_marker = true;
      displayPNCForm(e.originalEvent.clientX, e.originalEvent.clientY, pnc_data);

      e.target.closePopup();
   }
*/
}


function editPNC() {

   document.getElementById("pnc-userchoice").style.display = "none";
   var pnc_data = getPncDataFromID(pnctarget._leaflet_id);

   if(lastmarker){
      markers.removeLayer(lastmarker);
      map.removeLayer(lastmarker);
   }
   lastmarker = pnctarget;
   updating_marker = true;
   displayPNCForm(pnctarget.clientX, pnctarget.clientY, pnc_data);
}


function displayPNCForm(clientX, clientY, pnc_data) {

   clearPNCForm();
   var pncui = document.getElementById("pnc-userinterface");
   //early visible, to get the width and height calculated
   pncui.style.display = "inline";
// adjust form position to be always visible
   var docheight = document.body.clientHeight;
   var docwidth = document.body.clientWidth;
   pncui.style.left = (clientX+ICON_SIZE_X + pncui.clientWidth)> docwidth  ? (clientX - pncui.clientWidth-ICON_SIZE_X) : clientX+ICON_SIZE_X;
   pncui.style.top = (clientY + pncui.offsetHeight) > docheight ? (docheight - pncui.offsetHeight) : clientY ;

   //argument check
   if(pnc_data){
      switch(getPncTypeFromString (pnc_data.type)){
         case PCNTYPE_STATION:
            document.getElementById("pnc_type_station").checked = true;
         break;
         case PCNTYPE_AMENAGE:
            document.getElementById("pnc_type_amenag").checked = true;
         break;
         case PCNTYPE_AUTRE:
            document.getElementById("pnc_type_autre").checked = true;
         break;
      }

      switch(getPncTypeFromString (pnc_data.danger)){
         case PCNDANGER_PAS:
            document.getElementById("pnc_danger_pas").checked = true;
         break;
         case PCNDANGER_PEU:
            document.getElementById("pnc_danger_peu").checked = true;
         break;
         case PCNDANGER_TRES:
            document.getElementById("pnc_danger_tres").checked = true;
         break;
      }

      document.getElementById("pnc_ville").value = pnc_data.ville;
      document.getElementById("pnc_adresse").value = pnc_data.adresse;
      document.getElementById("pnc_adresse_numero").value = pnc_data.adresse_numero;
      document.getElementById("pnc_commentaire").value = pnc_data.comment;
      document.getElementById("pnc_solution").value = pnc_data.solution;
   }
}


function clearPNCForm(){

   var frm_elements = document.pncform.elements;
   for (i = 0; i < frm_elements.length; i++){
      field_type = frm_elements[i].type.toLowerCase();
      switch (field_type){
         case "text":
         case "password":
         case "textarea":
         case "hidden":
            frm_elements[i].value = "";
         break;
         case "radio":
         case "checkbox":
         if (frm_elements[i].checked)
            frm_elements[i].checked = false;
         break;
         case "select-one":
         case "select-multi":
            frm_elements[i].selectedIndex = -1;
         break;
         default:
         break;
      }
   }
}

function submitPNCForm() {

   if(lastmarker){
      var form = document.getElementById("pncform");
// TODO Factorize me
      var numberOfEntry = form.pnc_type.length;
      for(var i = 0; i < numberOfEntry; i++){
         var pnctype = form.pnc_type[i];
         if(pnctype.checked){
            break;
         }
      }
      var pnc_type_int = getPncTypeFromString(pnctype.value);
      if(pnc_type_int){
         switch(pnc_type_int){
            case PCNTYPE_STATION:
            	lastmarker.setIcon (parkingIcon);
            break;
            case PCNTYPE_AMENAGE:
            	lastmarker.setIcon (roadIcon);
            break;
            case PCNTYPE_AUTRE:
            	lastmarker.setIcon (creationIcon);
            break;
         }

         numberOfEntry = form.pnc_danger.length;
         for(var i = 0; i < numberOfEntry; i++){
            var pncdanger = form.pnc_danger[i];
            if(pncdanger.checked){
               pncdanger.valid = true;
               break;
            }
         }

         var comment = document.getElementById("pnc_commentaire").value;
         addPncEntry(pnc_type_int,
                     document.getElementById("pnc_adresse").value,
                     document.getElementById("pnc_adresse_numero").value,
                     comment,
                     document.getElementById("pnc_solution").value,
                     lastmarker._leaflet_id,
                     document.getElementById("pnc_ville").value,
                     lastmarker.getLatLng().lat,
                     lastmarker.getLatLng().lng,
                     pncdanger.valid?pncdanger.value:0,
                     "Y");

      //TODO formatPopup()
         lastmarker.bindPopup(comment + "</br>" + lastmarker._leaflet_id + "</br>" + 
               "Latitude : " + lastmarker.getLatLng().lat + "</br>" +
               "Longitude : " + lastmarker.getLatLng().lng + "</br>");
// Add to the marker groups //TODO multiple marker group ?
         markers.addLayer(lastmarker);
// Add to the database
         addPncBasePostEntry();
      }
      else {
         map.removeLayer(lastmarker);
//         markers.removeLayer(lastmarker);
         lastmarker = null;
      }
   }

// Finally hide the form
   hidePNCForm();

	//TO DEBUG
 //if(document.myform.onsubmit())
 {//this check triggers the validations
 //document.myform.submit();
 }

}


function cancelPNCForm() {

   if(!updating_marker)
      map.removeLayer(lastmarker);
//      markers.removeLayer(lastmarker);
   hidePNCForm();
}


function hidePNCForm() {

   lastmarker = null;
   document.getElementById("pnc-userinterface").style.display = "none";
   document.getElementById("pnc-userchoice").style.display = "none";
}

//TODO pnc from pnc class
function addPncEntry(pnc_type_int,
                     pnc_adresse,
                     pnc_adresse_numero,
                     pnc_comment,
                     pnc_solution,
                     leaflet_id,
                     pnc_ville,
                     pnc_latitude,
                     pnc_longitude,
                     pnc_danger,
                     pnc_valide){

   var pnc_data = getPncDataFromID (leaflet_id);
   var update = true;
   if(!pnc_data){
      update = false;
      pnc_data = new pncdata();
   }

   pnc_data.type = pnc_type_int;
   pnc_data.adresse = pnc_adresse ? pnc_adresse : "";
   pnc_data.adresse_numero = pnc_adresse_numero ? pnc_adresse_numero : "";
   pnc_data.ville = pnc_ville ? pnc_ville : "";
   pnc_data.latitude = pnc_latitude ? pnc_latitude : "";
   pnc_data.longitude = pnc_longitude ? pnc_longitude : "";
   //		pnc_data.valide = pnc_valide ? pnc_valide : "";
   pnc_data.comment = pnc_comment ? pnc_comment : "";
   pnc_data.solution = pnc_solution ? pnc_solution : "";
   pnc_data.danger = pnc_danger;
   if(!update){
      pnc_data.markerId = leaflet_id;
      pnclistdata.push(pnc_data);
   }
}


function addPncBasePostEntry() {

   var postPNC=null;
   if (window.XMLHttpRequest) {
      postPNC = new XMLHttpRequest();
   }else{
      alert("network problem around ajax");
      return;
   }
   //on définit l'appel de la fonction au retour serveur
   postPNC.onreadystatechange = function() { postPNCStateShange(postPNC); };
   postPNC.open("POST","datalib/libpncpost.php",true);
   postPNC.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
// TODO id de l'auteur ?
   var pnc_data = getPncDataFromID(lastmarker._leaflet_id);
   var strUpdate = lastmarker.is_valid_id?"&update=1":"";
   postPNC.send("type="+pnc_data.type+
            "&ville="+pnc_data.ville+
            "&latitude="+pnc_data.latitude+
            "&longitude="+pnc_data.longitude+
            "&adresse="+pnc_data.adresse+
            "&adresse_numero="+pnc_data.adresse_numero+
            strUpdate+
            "&commentaire="+pnc_data.comment+
            "&solution="+pnc_data.solution+
            "&danger="+pnc_data.danger+
            "&ID="+lastmarker._leaflet_id);
}


function postPNCStateShange(postPNC) {

   switch(postPNC.readyState) {
      case 0: //non initialisée
      case 1: // en chargement
      case 2: // chargée
      case 3: // en cours de traitement
      break;
      case 4: // termine
/*			alert(xhr.responseText); //DEBUG AJAX

      	var docXML= xhr.responseXML;
      	var items = docXML.getElementsByTagName("donnee");
      	//on fait juste une boucle sur chaque element "donnee" trouvé
      	for (i=0;i<items.length;i++)
      	{
      		alert (items.item(i).firstChild.data);
      	}
*/   	break;
   }
}


function getPncTypeFromString (pnctype) {

   var pnctypeint = 0;
   switch(pnctype){
      case 1:
      case "1":
      case "stationnement":
      	pnctypeint = PCNTYPE_STATION;
      break;
      case 2:
      case "2":
      case "amenagement":
      	pnctypeint = PCNTYPE_AMENAGE;
      break;
      case 3:
      case "3":
      case "autres":
      	pnctypeint = PCNTYPE_AUTRE;
      break;
   }
   return pnctypeint;
}


function getPncDataFromID(markerId) {

   var index = 0;
   while ( index < pnclistdata.length && pnclistdata[index].markerId != markerId ){
      index++;
   }

   if(index < pnclistdata.length)
      return pnclistdata[index];
   else
      return 0;
}
