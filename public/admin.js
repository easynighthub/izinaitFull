/**
 * Created by andro on 11-07-2017.
 */

window.fbAsyncInit = function () {
    FB.init({
        appId: '1138664439526562',
        xfbml: true,
        version: 'v2.8'
    });
    FB.AppEvents.logPageView();
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/es_LA/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


var signInButtonFacebook = document.getElementById('sign-in-facebook');
var token = "";
var user = "";

signInButtonFacebook.addEventListener('click', function() {

    firebase.auth().signOut();
    window.currentAdmin ="";
    var AdminLogeado = "";

    var USERS_LOCATION = 'admins/';
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

    function writeUserData(response) {
        var adminId = user.uid
        database.ref(USERS_LOCATION + user.uid).update({
                displayName: response.name,
                email: response.email || "null@izinait.com",
                picture: response.picture.data.url,
                birthday: response.birthday || "11/11/1111",
                firstName: response.first_name,
                facebookId: response.id,
                lastName: response.last_name,
                gender : response.gender
            });
        database.ref(USERS_LOCATION+user.uid+'/rrpps/'+adminId).update({
            uid:adminId,
            bloqueado:true,
            visible:true
        });
        database.ref(USERS_LOCATION+user.uid+'/rrpps/MD18DcCzYMXPhOQb8U61bWfgzRg2').update({
            uid:'MD18DcCzYMXPhOQb8U61bWfgzRg2',
            bloqueado:true,
            visible:true
        });

        database.ref('rrpps/'+user.uid).update({
            uid:'MD18DcCzYMXPhOQb8U61bWfgzRg2',
            email:response.email || "null@izinait.com", //editable si no existe el correo
            name :response.name,
            nickName:'MD18DcCzYMXPhOQb8U61bWfgzRg2' // editable al momonento de ingresar
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
            setTimeout(function(){window.location.href = 'admin'},500); // 3000ms = 3s
        } else {
            writeUserData(response);
            setTimeout(function(){window.location.href = 'admin'},500); // 3000ms = 3s
        }
    }

    // Tests to see if /users/<userId> has any data.
    function checkIfUserExists(userId, response) {
        var usersRef = database.ref(USERS_LOCATION);
        usersRef.child(userId).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            userExistsCallback(exists, response);
        });
    }
});