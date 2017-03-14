<?php
header('Content-Type: text/xml');
echo "<?xml version=\"1.0\"?>\n";

include("libpncbase.php");

$mysqli="null";
$sql_result;
$stmt = "null";
//$strSQL;

   if(isset($_POST["type"])){
      $mysqli = new mysqli(MYHOST, MYUSER, MYPASS, MYDATABASE);
//   if($mysqli === false) { //TODO
      if(isset($_POST["update"])) {
         if (!($stmt = $mysqli->prepare("UPDATE pointnoirs SET ".
                                       "type = ?,".
                                       "ville = ?,".
                                       "commentaire = ?,".
                                       "adresse = ?,".
                                       "adresse_numero = ?,".
                                       "solution = ?,".
                                       "danger = ? ".
                                       "WHERE id_pnc = ? "))) {
            echo "Prepare failed: (" . $mysqli->erro . ") " . $mysqli->error;
            return;
         }
         $type_id = $_POST["type"];
         $ville_id = $_POST["ville"];
         $commentaire_id = $_POST["commentaire"];
         $adresse_id = $_POST["adresse"];
         $adresse_numero_id = $_POST["adresse_numero"];
         $solution_id = $_POST["solution"];
         $danger_id = $_POST["danger"];
         $pnc_id = $_POST["ID"];
//         $valide_id = 1;
         if (!$stmt->bind_param("isssisii", $type_id,
                                            $ville_id,
                                            $commentaire_id,
                                            $adresse_id,
                                            $adresse_numero_id,
                                            $solution_id,
                                            $danger_id,
                                            $pnc_id)) {
            echo "Binding parameters failed: (" . $mysqli->erro . ") " . $mysqli->error;
            return;
         }
      }else
      {
         if (!($stmt = $mysqli->prepare("INSERT INTO pointnoirs (".
                                       "type,".
                                       "ville,".
                                       "latitude,".
                                       "longitude,".
                                       "commentaire,".
                                       "adresse,".
                                       "adresse_numero,".
                                       "danger,".
                                       "solution) ".
                                       "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"))) {
            echo "Prepare failed: (" . $mysqli->erro . ") " . $mysqli->error;
            return;
         }
         $type_id = $_POST["type"];
         $ville_id = $_POST["ville"];
         $latitude_id = $_POST["latitude"];
         $longitude_id = $_POST["longitude"];
         $commentaire_id = $_POST["commentaire"];
         $adresse_id = $_POST["adresse"];
         $adresse_numero_id = $_POST["adresse_numero"];
         $solution_id = $_POST["solution"];
         $danger_id = $_POST["danger"];

         if (!$stmt->bind_param("isddssiis", $type_id,
                                             $ville_id,
                                             $latitude_id,
                                             $longitude_id,
                                             $commentaire_id,
                                             $adresse_id,
                                             $adresse_numero_id,
                                             $danger_id,
                                             $solution_id)) {
            echo "Binding parameters failed: (" . $mysqli->erro . ") " . $mysqli->error;
            return;
         }
      }
      if (!$stmt->execute()) {
         echo "Execute query failed: (" . $mysqli->erro . ") " . $mysqli->error;
      }
//      $sql_result = $mysqli->query($strSQL);
//      echo "<donnee>" . $sql_result. "</donnee>\n";
      if($sql_result)$sql_result->free();
      if($stmt)$stmt->close();
      if($mysqli)$mysqli->close();
   }

?>
