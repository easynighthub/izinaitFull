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
                 if(adminLogeado.idClubWork == false){
                     ObtenerClub (adminLogeado);
                 }else{
                     var clubNombreMostrar = [];
                     var clubNombre = firebase.database().ref().child('clubs');
                     $scope.clubNombre = $firebaseArray(clubNombre);
                     $scope.clubNombre.$loaded().then(function() {

                         clubNombreMostrar = $scope.clubNombre;
                         clubNombreMostrar.forEach(function (x) {
                             if(x.$id == adminLogeado.idClubWork){
                                 $('.clubSelecionado').text(x.name +" ");
                                 $( ".clubSelecionado" ).append( "<b class='caret'> </b>" );
                             }
                         });
                         traerDoorman(adminLogeado.idClubWork);
                     });

                 };
                 console.log(adminLogeado);

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

var traerDoorman = function (clubId) {
    $scope.allDoormans = [];
    $scope.doormans = [];
    var doormans = $firebaseArray(firebase.database().ref('admins/'+adminLogeado.$id+'/doormans'));
    doormans.$loaded().then(function(){
        console.log(doormans);
        $scope.allDoormans = doormans;
        $scope.allDoormans.forEach(function (x) {
            if(x.bloqueado == true){
                    $scope.doormans.push(x);
                
            }else
            {
                if(Object.keys(x.clubs).indexOf(clubId) >= 0){
                    $scope.doormans.push(x);
                }
            }

        })

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

         $mdDialog.show(confirm).then(
             function(result) {
                 if(validateEmail(result)){
                     var existeEnAdmin = false;
                     console.log($scope.doormans);
                     $scope.doormans.forEach(function (doorman) {
                         if(doorman.email == result){
                             existeEnAdmin = true;
                         };
                     });
                     if(existeEnAdmin){
                         alert('ESTE CORREO YA EXISTE');

                     }else
                         {
                             var todosLosDoormans = $firebaseObject(firebase.database().ref('doormans'));
                             todosLosDoormans.$loaded().then(function () {
                                 var existeEnBaseDeDatos = false;
                                 todosLosDoormans.forEach(function (x) {
                                     if(x.email == result){
                                         console.log(x);
                                         firebase.database().ref('admins/'+adminLogeado.$id+'/doormans/'+x.uid).update({
                                             bloqueado:false,
                                             email:x.email,
                                             name :x.name,
                                             uid:x.uid,
                                             visible:true,
                                         });
                                         firebase.database().ref('admins/'
                                             +adminLogeado.$id
                                             +'/doormans/'
                                             +x.uid
                                             +'/clubs/'
                                             +adminLogeado.idClubWork).set(true);
                                         traerDoorman(adminLogeado.idClubWork);
                                         existeEnBaseDeDatos = true;
                                     };
                                 });
                                 if(existeEnBaseDeDatos){
                                     alert('AGREGADO CON EXITO');

                                 }else  // CREAR RELACIONADOR PUBLICO Y ENVIAR CORREO
                                 {

                                 }
                             });

                     }
                 };
             //exitoso result

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

         function validateEmail(email) {
             var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
             return re.test(email);
         };


         $scope.borrarDoormandelClub = function (doormanSelect) {

             var confirm = $mdDialog.confirm()
                 .title('Desea eliminar este Doorman de este club?')
                 .textContent('')
                 .ariaLabel('Lucky day')
                 .targetEvent(doormanSelect)
                 .ok('ELIMINAR')
                 .cancel('CANCELAR');

             $mdDialog.show(confirm).then(function() {
                 console.log((Object.keys(confirm._options.targetEvent.clubs).length));
                 console.log(confirm._options.targetEvent);
                 if(Object.keys(confirm._options.targetEvent.clubs).length >1){
                     firebase.database().ref(
                         'admins/'
                         +adminLogeado.$id
                         +'/doormans/'
                         +confirm._options.targetEvent.$id
                         +'/clubs/'
                         +adminLogeado.idClubWork).set(null);
                     traerDoorman(adminLogeado.idClubWork);

                     $.ajax({
                         url: 'http://www.abcs.cl/correo/contact_me.php',
                         type: "POST",
                         data: {
                             name: '1111',
                             phone: '11111',
                             email: confirm._options.targetEvent.email,
                             message: "fuiste eliminado de rrpp"
                         },
                         cache: false,
                         success: function() {
                             console.log("siiiiiiiiiiiiiiiiiiiiiii");
                         },
                         error: function() {
                             console.log("noooooooooooooooooooooo");
                         },
                     });

                 }else
                 {
                     firebase.database().ref(
                         'admins/'
                         +adminLogeado.$id+
                         '/doormans/'
                         +confirm._options.targetEvent.$id
                     ).set(null);
                     traerDoorman(adminLogeado.idClubWork);
                 }
             }, function() {

             });

         };


     }]);
