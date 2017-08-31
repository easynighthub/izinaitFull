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

    .controller('codigoCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function($scope, $firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {


            var user = window.currentApp;
            var token = "";
            $scope.usuarioLogeado = "";

            document.getElementById('codigoVisibile').style.display = 'none';
            document.getElementById('pedirCodigo').style.display = 'none';

            firebase.database().ref('users/').child(user.$id || user.uid || 'offline').once('value', function(snapshot) {
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
                        console.log(response);
                        console.log("obtuve el codigo");
                        update_qrcode();    // obtengo codigo

                        $scope.nombre = firebase.auth().currentUser.displayName;

                        var ref = firebase.database().ref('/users/').child(user.uid);
                        var usersLocal = $firebaseObject(ref);
                        usersLocal.$loaded().then(function(){
                            window.currentApp = usersLocal;
                            $scope.usuarioLogeado = usersLocal;

                            $scope.nombre = $scope.usuarioLogeado.displayName;
                            $scope.email = $scope.usuarioLogeado.email;
                            $scope.foto = $scope.usuarioLogeado.picture;

                         /*   $.ajax({
                                url: 'http://www.abcs.cl/correo/contact_me.php',
                                type: "POST",
                                data: {
                                    name: $scope.nombre,
                                    phone: '11111',
                                    email: 'androstoic@gmail.com',
                                    message: "111"
                                },
                                cache: false,
                                success: function() {
                                    console.log("siiiiiiiiiiiiiiiiiiiiiii");
                                },
                                error: function() {
                                    console.log("noooooooooooooooooooooo");
                                },
                            }); */

                            document.getElementById('codigoVisibile').style.display = 'block';
                            document.getElementById('pedirCodigo').style.display = 'none';
                            $('.nombreUsuario').text( $scope.usuarioLogeado.displayName);
                            $('.codigoAcceder').text("Tú Codigo");
                            console.log("obvtuve la foto y el correo");


                        });



                    } else {
                        writeUserData(response);
                        console.log(firebase.auth().currentUser);
                        update_qrcode();    // obtengo codigo

                        $scope.nombre = firebase.auth().currentUser.displayName;

                        var ref = firebase.database().ref('/users/').child(user.uid);
                        var usersLocal = $firebaseObject(ref);
                        usersLocal.$loaded().then(function(){
                            window.currentApp = usersLocal;
                            $scope.usuarioLogeado = usersLocal;

                            $scope.nombre = $scope.usuarioLogeado.displayName;
                            $scope.email = $scope.usuarioLogeado.email;
                            $scope.foto = $scope.usuarioLogeado.picture;

                            $.ajax({
                                url: 'http://www.abcs.cl/correo/contact_me.php',
                                type: "POST",
                                data: {
                                    name: $scope.nombre,
                                    phone: '11111',
                                    email: 'androstoic@gmail.com',
                                    message: "11"
                                },
                                cache: false,
                                success: function() {
                                    console.log("siiiiiiiiiiiiiiiiiiiiiii");
                                },
                                error: function() {
                                    console.log("noooooooooooooooooooooo");
                                },
                            });

                            document.getElementById('codigoVisibile').style.display = 'block';
                            document.getElementById('pedirCodigo').style.display = 'none';
                            $('.nombreUsuario').text( $scope.usuarioLogeado.displayName);
                            $('.codigoAcceder').text("Tú Codigo");
                            console.log("obvtuve la foto y el correo");


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

               var usuarioLogeado =  $scope.usuarioLogeado;
                console.log(usuarioLogeado)
                var userQvo = firebase.database().ref('/userQvo/').child(usuarioLogeado.$id);
                console.log(userQvo);
                var userQvoRQ = $firebaseObject(userQvo);
                userQvoRQ.$loaded().then(function () {
                    console.log(userQvoRQ);
                });

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
              /*  firebase.database().ref('userQvo/' + $scope.usuarioLogeado.$id ).update(
                    {
                        email: $scope.usuarioLogeado.email,
                        uid :$scope.usuarioLogeado.$id,
                        qvo :true
                    }
                );
 */
            };

            function controllerDialogCrearClienteQvo($scope, $mdDialog, $timeout, $q, $log,$http, usuarioLogeado,userQvoRQ) {

                $scope.usuarioLogeado = usuarioLogeado;
                $scope.userQvoRQ = userQvoRQ;

                $scope.crearUsuarioQvo = function () {

                 if($scope.userQvoRQ.userQvoId != undefined){
                        "https://us-central1-project-8746388695669481444.cloudfunctions.net/agregarTarjetaUsuarioQvo?userQvo=cus_sEZGcXEEwjAD_sgj1CsOFA"

                            }else {

                     var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/createUserQvo?email="
                         +$scope.usuarioLogeado.email
                         +"&name="
                         +$scope.usuarioLogeado.displayName

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
                         }

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



                };


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
                window.location.href = '#view1';


            });




// muestro datos en la pantalla


        }]);