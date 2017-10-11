/**
 * Created by andro on 18-06-2017.
 */

'use strict';

angular.module('myApp.codigo', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/codigo', {
            templateUrl: 'codigo/codigo.html',
            controller: 'codigoCtrl'
        });
    }])

    .controller('codigoCtrl', ['$scope','$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog','$http',
        function($scope,$routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog,$http) {


            var uidTarjetaDeCredito = $routeParams.uid || ""  ; // id del evento entregador por url

            $('.main-raised').css("margin-top", "-20px");
            $('.main-raised').css("margin-left", "20px");
            $('.main-raised').css("margin-right", "20px");

            var user = window.currentApp;
            var token = "" ;
            $scope.usuarioLogeado = "";
            $scope.userQvoRQ = "";

            document.getElementById('codigoVisibile').style.display = 'none';
            document.getElementById('pedirCodigo').style.display = 'none';


            firebase.database().ref('users/').child(user.$id || user.uid || 'offline' ).once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/users/').child(user.$id || user.uid);
                    var usersLocal = $firebaseObject(ref);
                    usersLocal.$loaded().then(function () {
                        $scope.usuarioLogeado = usersLocal;
                        window.currentApp = usersLocal;
                        console.log( $scope.usuarioLogeado);
                        update_qrcode();
                        $scope.nombre = $scope.usuarioLogeado.displayName;
                        $scope.email = $scope.usuarioLogeado.email;
                        $scope.foto = $scope.usuarioLogeado.picture;
                        $scope.email = $scope.usuarioLogeado.email;
                        $scope.confirmarCorreo($scope.usuarioLogeado);


                        var userQvo = firebase.database().ref('/userQvo/').child( $scope.usuarioLogeado.$id);
                        var userQvoRQ = $firebaseObject(userQvo);
                        userQvoRQ.$loaded().then(function () {
                            console.log(userQvoRQ);
                            $scope.userQvoRQ = userQvoRQ;






                            if(uidTarjetaDeCredito != "")
                            {

                                var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/obtenerUnaInscripcionDeTarjeta?" +
                                    "userQvo=" +
                                    userQvoRQ.userQvoId +
                                    "&" +
                                    "inscription_uid=" +
                                    uidTarjetaDeCredito;

                                $http({
                                    method: 'GET',
                                    url: url,
                                    crossOrigin: true,
                                }).then(function successCallback(response) {
                                    console.log(response);
                                    if(response.data.status == "succeeded"){
                                        console.log(response.data.status);

                                        firebase.database().ref('userQvo/' +$scope.usuarioLogeado.$id+'/cards/'+  response.data.card.id).set(
                                            response.data.card);
                                        firebase.database().ref('userQvo/' +$scope.usuarioLogeado.$id).update(
                                            { creditCardDefault: response.data.card.id}
                                        );
                                        location.href = "#!/codigo";
                                        location.reload();
                                        //mostrar mensaje de exito!
                                    };
                                    // this callback will be called asynchronously
                                    // when the response is available
                                }, function errorCallback(response) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                });


                                /*  $mdDialog.show({
                                 controller: controllerDialogStatusTarjetaCredito,
                                 templateUrl: 'dialogStatusTarjetaCredito',
                                 parent: angular.element(document.body),
                                 clickOutsideToClose: true,
                                 locals: {
                                 usuarioLogeado: usuarioLogeado,
                                 userQvoRQ:userQvoRQ
                                 }
                                 }); */

                            };

                        });

                        document.getElementById('codigoVisibile').style.display = 'block';
                        $('.codigoAcceder').text("Tú Codigo");
                        $(navigationexample).removeClass( "in" );


                    });
                }
                else {
                    firebase.auth().signOut();
                    window.currentApp = "";
                    $scope.usuarioLogeado = "";
                    $('.codigoAcceder').text("Acceder");
                    document.getElementById('pedirCodigo').style.display = 'block';
                    $(navigationexample).removeClass( "in" );
                }

            });











            $scope.submitNewCreditCard = function () {
                var userQvoSelect;
                var qvo = firebase.database().ref('userQvo/').child($scope.usuarioLogeado.$id);
                var userQvo = $firebaseObject(qvo);
                userQvo.$loaded().then(function () {
                    console.log(userQvo);
                    userQvoSelect = userQvo;
                    console.log(userQvoSelect);
                    return userQvoSelect;

                }).then(function (userQvoSelect) {
                    console.log(userQvoSelect);
                    firebase.database().ref('userQvo/' + $scope.usuarioLogeado.$id +'/tarjeta').set({
                        userQvo : userQvoSelect.customer_id,
                        tarjeta : true

                    });
                });


            };

            $scope.crearCliente = function () {

                var userQvoRQ =  $scope.userQvoRQ;
                var usuarioLogeado =  $scope.usuarioLogeado;


                $mdDialog.show({
                    controller: controllerDialogCrearClienteQvo,
                    templateUrl: 'dialogCrearClienteQvo',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        usuarioLogeado: usuarioLogeado,
                        userQvoRQ:userQvoRQ
                    }
                });

            };

            function controllerDialogCrearClienteQvo($scope, $mdDialog, $timeout, $q, $log,$http, usuarioLogeado,userQvoRQ) {

                $scope.usuarioLogeado = usuarioLogeado;
                $scope.userQvoRQ = userQvoRQ;



                    if($scope.userQvoRQ.userQvoId != undefined){

                     var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/agregarTarjetaUsuarioQvo?userQvo="
                         +$scope.userQvoRQ.userQvoId;
                     $http({
                         method: 'GET',
                         url: url,
                         crossOrigin: true,
                     }).then(function successCallback(response) {
                         console.log(response);
                         location.href = response.data.redirect_url ;
                         // this callback will be called asynchronously
                         // when the response is available
                     }, function errorCallback(response) {
                         // called asynchronously if an error occurs
                         // or server returns response with an error status.
                     });
                            }else {

                     document.getElementById('BarraCargando').style.display = 'block';
                     document.getElementById('datosClienteQvo').style.display = 'none';
                     document.getElementById('barraRedirectUrl').style.display = 'none';

                     var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/createUserQvo?email="
                         +$scope.usuarioLogeado.email
                         +"&name="
                         +$scope.usuarioLogeado.displayName;

                     $http({
                         method: 'GET',
                         url: url,
                         crossOrigin: true,
                     }).then(function successCallback(response) {
                         console.log(response);
                         if(response.data.error != undefined){
                             alert("ESTE CORREO YA EXISTE");
                         }
                         else{
                             firebase.database().ref('userQvo/' + $scope.usuarioLogeado.$id).set(
                                 {
                                     id :$scope.usuarioLogeado.$id,
                                     userQvoEmail : response.data.email,
                                     userQvoId : response.data.id,
                                     userQvoName: response.data.name
                                 }
                             );
                             location.reload();
                         };

                         // this callback will be called asynchronously
                         // when the response is available
                     }, function errorCallback(response) {
                         // called asynchronously if an error occurs
                         // or server returns response with an error status.
                     });


                 }


/*                    firebase.database().ref('userQvo/' + $scope.usuarioLogeado.$id ).update(
                        {
                            email: $scope.usuarioLogeado.email,
                            uid :$scope.usuarioLogeado.$id,
                            qvo :true
                        }
                    ); */






                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };




            var signOutButton = document.getElementById('salir');
            signOutButton.addEventListener('click', function () {
                firebase.auth().signOut();
                window.currentApp ="";
                var usuarioLogeado = "";
                window.location.href = '#!/view1';


            });




// muestro datos en la pantalla

            var signInButtonFacebook = document.getElementById('sign-in-facebook');

            window.fbAsyncInit = function() {
                FB.init({
                    appId      : '1138664439526562',
                    xfbml      : true,
                    version    : 'v2.8'
                });
                FB.AppEvents.logPageView();
            };

            (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/es_LA/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));


            signInButtonFacebook.addEventListener('click', function() {

                var USERS_LOCATION = 'users/';
                var database = firebase.database();
                var provider = new firebase.auth.FacebookAuthProvider();


                //se agrega el permiso de cumpleaños
                provider.addScope('user_birthday');
                provider.addScope('email');
                provider.addScope('public_profile');


                firebase.auth().signInWithPopup(provider).then(function(result) {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    token = result.credential.accessToken;
                    // The signed-in user info.
                    user = result.user;
                    console.log(token);
                    console.log(user);

                    firebase.auth().onAuthStateChanged(onAuthStateChanged);
                }).catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                });

                function    writeUserData(response) {
                    database
                        .ref(USERS_LOCATION + user.uid)
                        .update({
                            displayName: response.name,
                            email: response.email || "null@izinait.com",
                            picture: response.picture.data.url,
                            type: 'Free',
                            age: response.age_range.min,
                            birthday: response.birthday || "11/11/1111",
                            firstName: response.first_name,
                            facebookId: response.id,
                            lastName: response.last_name,
                            gender : response.gender
                        });
                };
                function    updateData(response) {
                    database
                        .ref(USERS_LOCATION + user.uid)
                        .update({
                            displayName: response.name,
                            picture: response.picture.data.url,
                            firstName: response.first_name,
                            lastName: response.last_name,
                        });
                };

                function onAuthStateChanged(user) {
                    //cleanupUi();
                    if (user) {
                        FB.api('/me', 'get',
                            {
                                access_token: token,
                                fields: 'id, name, email, first_name, last_name, age_range{min}, picture.type(large), birthday, gender'
                            },
                            function(response) {
                                checkIfUserExists(user.uid, response);
                            });
                    } else {
                        // Display the splash page where you can sign-in.
                    }
                }

                function userExistsCallback(exists, response) {
                    if (exists) {

                        updateData(response);
                        update_qrcode();    // obtengo codigo

                        var ref = firebase.database().ref('/users/').child(user.uid);
                        var usersLocal = $firebaseObject(ref);
                        usersLocal.$loaded().then(function(){
                            window.currentApp = usersLocal;
                            $scope.usuarioLogeado = usersLocal;

                            $scope.nombre = $scope.usuarioLogeado.displayName;
                            $scope.email = $scope.usuarioLogeado.email;
                            $scope.foto = $scope.usuarioLogeado.picture;

                            $scope.confirmarCorreo($scope.usuarioLogeado);
                            document.getElementById('codigoVisibile').style.display = 'block';
                            document.getElementById('pedirCodigo').style.display = 'none';
                            $('.nombreUsuario').text( $scope.usuarioLogeado.displayName);
                            $('.codigoAcceder').text("Tú Codigo");
                        });
                    }
                    else
                        {
                        writeUserData(response);
                        update_qrcode();

                        var ref = firebase.database().ref('/users/').child(user.uid);
                        var usersLocal = $firebaseObject(ref);
                        usersLocal.$loaded().then(function(){
                            window.currentApp = usersLocal;
                            $scope.usuarioLogeado = usersLocal;

                            $scope.nombre = $scope.usuarioLogeado.displayName;
                            $scope.email = $scope.usuarioLogeado.email;
                            $scope.foto = $scope.usuarioLogeado.picture;
                                console.log("entre hasta aca");

                            $scope.confirmarCorreo($scope.usuarioLogeado);
                            document.getElementById('codigoVisibile').style.display = 'block';
                            document.getElementById('pedirCodigo').style.display = 'none';
                            $('.nombreUsuario').text( $scope.usuarioLogeado.displayName);
                            $('.codigoAcceder').text("Tú Codigo");
                        });
                    }
                }
                // Tests to see if /users/<userId> has any data.
                function checkIfUserExists(userId, response) {
                    var usersRef = database.ref(USERS_LOCATION);
                    usersRef.child(userId).once('value', function(snapshot) {
                        var exists = (snapshot.val() !== null);
                        console.log(snapshot.val().facebookId);
                        if(snapshot.val().facebookId == undefined){
                            exists = false;
                            console.log(exists);
                            userExistsCallback(exists, response);
                        }else {
                            console.log(exists);
                            userExistsCallback(exists, response);
                        }

                    });
                }
            });


            $scope.confirmarCorreo = function (user) {

                if(user.email == "null@izinait.com"){
                    // Appending dialog to document.body to cover sidenav in docs app
                    var confirm = $mdDialog.prompt()
                        .title('Confirmanos tu correo')
                        .textContent('Recuerda colocar un correo valido')
                        .placeholder('Correo Electronico')
                        .ariaLabel('Correo Electronico')
                        .initialValue('')
                        .ok('Confirmar!')
                        .cancel('');
                    $mdDialog.show(confirm).then(function(result) {
                        //validar que este correo no exista en la bd
                        var usersTodos = firebase.database().ref('/users/');
                        var usersTodosRQ = $firebaseArray(usersTodos);
                        usersTodosRQ.$loaded().then(function () {

                            console.log(usersTodosRQ);
                            var contador = 0;
                            var existe = false ;
                            angular.forEach(usersTodosRQ ,function (usersRecorridos) {
                                if(usersRecorridos.email == result){
                                    existe = true;
                                };
                                contador+=1;
                                console.log(contador + " es igual a " + usersTodosRQ.length);

                            });

                            if(contador == usersTodosRQ.length)
                            {
                                if(existe != true){
                                    console.log("no existe este correo");
                                    firebase.database().ref('users/' + user.$id).update({
                                     email: result
                                    });
                                    location.reload();

                                }else{
                                    alert("este correo ya existe");
                                    location.reload();
                                }
                            };


                        });








                    }, function() {
                        alert("TIENES QUE CONFIRMARNOS TU CORREO");
                        location.reload();
                    });
                }else{

                    var userQvo = firebase.database().ref('/userQvo/').child(user.$id);
                    var userQvoRQ = $firebaseObject(userQvo);
                    userQvoRQ.$loaded().then(function () {
                        console.log(userQvoRQ);
                        $scope.userQvoRQ = userQvoRQ;
                        if($scope.userQvoRQ.userQvoId != undefined){
                            // el usuario esta perfect.
                            console.log("usuario perfecto");
                        }else{

                            var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/createUserQvo?email="
                                +user.email
                                +"&name="
                                +user.displayName;

                            $http({
                                method: 'GET',
                                url: url,
                                crossOrigin: true,
                            }).then(function successCallback(response) {
                                console.log(response);
                                if(response.data.error != undefined){
                                    alert("ESTE CORREO YA EXISTE");

                                }
                                else{
                                    firebase.database().ref('userQvo/' + user.$id).set(
                                        {
                                            id :user.$id,
                                            userQvoEmail : response.data.email,
                                            userQvoId : response.data.id,
                                            userQvoName: response.data.name
                                        }
                                    );
                                };

                                // this callback will be called asynchronously
                                // when the response is available
                            }, function errorCallback(response) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                            });


                        }
                    });



                }

            };

            $scope.selecionarTarjeta = function (card) {

                firebase.database().ref('userQvo/' +$scope.usuarioLogeado.$id).update(
                    { creditCardDefault: card.id}
                );


            };

            $scope.eliminarTarjeta = function (card, userQvo) {
                console.log("holaaaa");
                    if(card.id == userQvo.creditCardDefault){
                       console.log("DEBE SELECIONAR OTRA TARJETA PREDETERMINADA ANTES DE BORRAR");
                       console.log($scope.userQvoRQ.cards);

                    }else {
                        var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/eliminarTarjetaQvo?userQvo="
                            +userQvo.userQvoId
                            +"&tarjetaUserQvo="
                            +card.id;

                        $http({
                            method: 'GET',
                            url: url,
                            crossOrigin: true,
                        }).then(function successCallback(response) {
                            console.log(response);

                        }, function errorCallback(response) {
                            firebase.database().ref('userQvo/' +$scope.usuarioLogeado.$id +'/cards/' + card.id ).set(null);
                            if($scope.userQvoRQ.cards == undefined) {
                                firebase.database().ref('userQvo/' +$scope.usuarioLogeado.$id +'/creditCardDefault' ).set(null);
                            }



                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        });

                    }

            };



        }]);

