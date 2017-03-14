/*PNC - Utils */


/* form data validation */

function checkLength(len,ele){
  var fieldLength = ele.value.length;
  if(fieldLength <= len){
    return true;
  }
  else
  {
    var str = ele.value;
    str = str.substring(0, str.length - 1);
    ele.value = str;
  }
}

function checkNum(e,value)
{
    //Check Character
    var unicode=e.charCode? e.charCode : e.keyCode;
    if(unicode == 37||unicode == 39||unicode == 9) //ok for arrows
      return true;
//    if (value.indexOf(".") != -1)
//      if( unicode == 46 )return false;

    if (unicode!=8)
      if(unicode<48||unicode>57)//&&unicode!=46)
         return false;
}

function geoFindMe(success, error) {
//  var output = document.getElementById("out");

  if (!navigator.geolocation){
    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    return;
  }

//  output.innerHTML = "<p>Locating…</p>";

  navigator.geolocation.getCurrentPosition(success, error);

  
}
