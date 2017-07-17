'use strict';

angular.module('myApp.doorman', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/doorman', {
    templateUrl: 'doorman/doorman.html',
    controller: 'DoormanCtrl'
  });
}])

.controller('DoormanCtrl', ['$scope', '$rootScope', '$firebaseArray', '$firebaseObject','$mdDialog',
     function($scope, $rootScope, $firebaseArray, $firebaseObject,$mdDialog) {

     $(configuracion).addClass( "active" );
     $(eventos).removeClass( "active" );
     var admin = window.currentAdmin ;
     var adminLogeado = "";
     $scope.doormans = [];

     firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function(snapshot) {
         var exists = (snapshot.val() !== null);
         console.log(exists);
         if (exists == true) {
             var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
             var adminLocal = $firebaseObject(ref);
             adminLocal.$loaded().then(function () {
                 adminLogeado = adminLocal;
                 console.log(adminLogeado);
                 traerDoorman();
                 document.getElementById('BarraCargando').style.display = 'none';
                 document.getElementById('panelPrincipal').style.display = 'block';

                 $('.tituloIziboss').text("Doorman");
             });
         } else {
             window.currentAdmin = "";
             $scope.adminLogeado = "";
             window.location = "https://www.izinait.com/admin.html";
         };

     });

var traerDoorman = function () {
    var doorman = $firebaseArray(firebase.database().ref('admins/'+adminLogeado.$id+'/doormans'));
    doorman.$loaded().then(function(){
        console.log(doorman);
        $scope.doormans = doorman;
    });
};

     $scope.agregarDoorman = function() {
         // Appending dialog to document.body to cover sidenav in docs app
         var confirm = $mdDialog.prompt()
             .title('Cual es el correo de doorman que deseas agregar?')
             .textContent('Si el correo existe se asignara automaticamente, si no, se creeara y se le notificara con correo al doormans ingresado.')
             .placeholder('Correo Electronico')
             .ariaLabel('Correo Electronico')
             .initialValue('')
             .ok('Asignar!')
             .cancel('Cancelar');

         $mdDialog.show(confirm).then(function(result) {
             //exitoso

         }, function() {
             //si no !
         });
     };

	/*var mainFunction = function () {
		var ref1 = firebase.database().ref('/doormans');
		var doormansRequest = $firebaseArray(ref1);
		doormansRequest.$loaded().then(function(){
			var adminDoorman = Object.keys(adminLogeado.doormans);
			console.log(adminDoorman);
			angular.forEach(doormansRequest, function(d){
				if (adminDoorman.indexOf(d.uid) >= 0){
					$scope.doormans.push(d);
				}
			});
		});
	}; */



}]);
