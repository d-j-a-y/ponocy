<?php

include("libpncbase.php");

//entry point
pnc_get_data();

$mysqli="null";
$recordset="null";
//TODO define pnc class
$PNC = array("ID"=>"null",
             "type"=>"null",
             "danger"=>"null",
             "ville"=>"null",
             "adresse"=>"null",
             "adresse_numero"=>"null",
             "latitude"=>"null",
             "longitude"=>"null",
             "comment"=>"null",
             "solution"=>"null");

function pnc_get_data(){
   global $PNC;

   pnc_session_start();
//TODO while pnc=pnc_next()
   while(pnc_next() != 0){
      $PNCList[] = $PNC;
   }

   echo json_encode($PNCList);

   pnc_session_stop();
}

// Connect to database server and fill the global $recordset with "pointnoirs"
function pnc_session_start(){
   global $recordset, $mysqli;

   $mysqli = new mysqli(MYHOST, MYUSER, MYPASS, MYDATABASE);
//   if($mysqli === false) { //TODO
   $strSQL = "SELECT * FROM pointnoirs";
//   $recordset = mysql_query($strSQL);
   $recordset = $mysqli->query($strSQL);
//   if($recordset === false) //TODO
   return 1;
}

function pnc_next(){
   global $recordset, $PNC;
   $result = 0;
   //todo result = new pnc()
   if($row = $recordset->fetch_array()) {
      $PNC['ID'] = $row['id_pnc'];
      $PNC['type'] = $row['type'];
      $PNC['latitude'] = $row['latitude'];
      $PNC['longitude'] = $row['longitude'];
      $PNC['ville'] = $row['ville'];
      $PNC['adresse'] = $row['adresse'];
      $PNC['adresse_numero'] = $row['adresse_numero'];
      $PNC['comment'] = $row['commentaire'];
      $PNC['solution'] = $row['solution'];
      $PNC['danger'] = $row['danger'];
      $result = 1;
   }
   return $result;
}

// Close the database connection
function pnc_session_stop(){
   global $recordset, $mysqli;
   if($recordset)$recordset->free();
   if($mysqli)$mysqli->close();
}

?>
