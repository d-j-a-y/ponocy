<html lang="fr">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" />

      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.0.3/dist/MarkerCluster.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.0.3/dist/MarkerCluster.Default.css" />

      <script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.markercluster@1.0.3/dist/leaflet.markercluster.js"></script>

      <link rel="stylesheet" href="css/pnc.css" />
   </head>
<body>

<!--
Incivilités routières

La catégorie "Incivilités routières" permet de signaler les comportements dangereux récurrents que vous ressentez lors du partage de la voirie avec d'autres usagers (voiture, bus, motos, piétons...) : non-respect de la signalisation ou des priorités, manque de vigilance, voitures garées sur les pistes cyclables, motos à contresens sur les pistes cyclables...
	

Voirie inadaptée

La catégorie "Voiries inadaptée" correspond aux aménagements cyclistes urbains inadaptés ou dangereux pour les vélos : pistes cyclables trop étroites, manque de visibilité des cyclistes par les voitures devant céder la priorité...
-->

   <div id="filigrane">
      <p>Cette carte est un bac à sable, ne pas hésitez à créer des points comme des enfants ;-)</p>
   </div>

   <div id="pncmap" style="width:100%; height:100%; background: #bbccdd"></div>
   <div class="pnc_userinterface" id="slideout">
      <div id="pnc_help_text">?</div>
      <div class="pnc_userinterface pnc_help_instruction" id="slideout_inner">
         <h4>Créer un PNC</h4>
         <div>Click sur la carte. 
         Remplir les informations concernant le nouveau point noir cyclable.</div>
         <h4>Modifier un PNC</h4>
         <div>Double-Click sur un point déjà existant.</div>
      </div>
   </div>

   <div id="pnc-userinterface" class="hiddenform pnc_userinterface">
      <form id="pncform" name="pncform">
         Type de point noir :</br> <!-- TODO on_change update marker icon -->
         <input type="radio" name="pnc_type" id="pnc_type_station" value="stationnement" >Stationnement</br>
         <input type="radio" name="pnc_type" id="pnc_type_amenag" value="amenagement">Voiries inadaptée</br>
         <input type="radio" name="pnc_type" id="pnc_type_autre" value="autres">Autres</br>
         Commentaire :</br>
         <cite>(surtout lorsque le problème est lié à la voirie)</cite></br>
         <input type="text" id="pnc_commentaire" name="commentaire"></br>
         <input type="radio" name="pnc_danger" id="pnc_danger_pas" value="1" >Pas de danger</br>
         <input type="radio" name="pnc_danger" id="pnc_danger_peu" value="2">Peu dangereux</br>
         <input type="radio" name="pnc_danger" id="pnc_danger_tres" value="3">Très dangereux</br>

         Proposition de solution :</br>
         <input type="text" id="pnc_solution" name="solution"></br>

         </br>Ville <input type="text" id="pnc_ville" name="ville"></br>
         Numéro <input type="text" size="4"  onKeyPress="return checkNum(event,value)" onInput="checkLength(5,this)"  id="pnc_adresse_numero" name="adresse_numero"></br>
         Rue / Avenue</br>
         <input type="text" id="pnc_adresse" name="adresse"></br>

         <br style="clear: both;">
         <div style="float:left;" ><a href="javascript: submitPNCForm()">[Envoyer]</a></div>
         <div style="float: right;"><a href="javascript: cancelPNCForm()">[Annuler]</a></div>
      </form>
   </div>

   <div id="pnc-userchoice" class="hiddenform pnc_userinterface">
      <input type="button" value="Éditer" onclick="editPNC(event);"/>
      <input type="button" value="Supprimer" onclick="removePNC(event);" disabled/>
   </div>

   <script src="js/pnc.utils.js"></script>
   <script src="js/pnc.library.js"></script>
</body>
</html>
