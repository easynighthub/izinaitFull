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

    .controller('codigoCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function($scope, $firebaseObject, $firebaseArray, $filter, $rootScope) {


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
                            provider: provider,
                            type: 'Free',
                            age: response.age_range.min,
                            birthday: response.birthday || "11/11/1111",
                            firstName: response.first_name,
                            facebookId: response.id,
                            lastName: response.last_name,
                            gender : response.gender
                        });
                }

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

                        writeUserData(response);
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

                            $.ajax({
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
                            });

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
                        console.log(exists);
                        userExistsCallback(exists, response);
                    });
                }
            });


            var signOutButton = document.getElementById('salir');
            signOutButton.addEventListener('click', function () {
                firebase.auth().signOut();
                window.currentApp ="";
                var usuarioLogeado = "";
                window.location.href = '#view1';


            });



// muestro datos en la pantalla


        }]);