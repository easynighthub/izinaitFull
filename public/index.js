/**
 * Created by andro on 19-06-2017.
 */




var irApp = document.getElementById('irApp');
irApp.addEventListener('click', function () {
    window.location.href = 'app';


});
var irApp2 = document.getElementById('irApp2');
irApp2.addEventListener('click', function () {
    window.location.href = 'app';

});

var irApp3 = document.getElementById('irApp3');
irApp3.addEventListener('click', function () {
    window.location.href = 'app/#!/view2';

});

var config = {
    apiKey: "AIzaSyAN4CNEsxW_EZ5fEQZIi5M2T7DMcpwYa-Y",
    authDomain: "easynight.firebaseapp.com",
    databaseURL: "https://easynight.firebaseio.com",
    storageBucket: "project-8746388695669481444.appspot.com"
};

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.

// The Firebase Admin SDK to access the Firebase Realtime Database.




firebase.initializeApp(config);

$(document).ready(function() {
    $('#Carousel').carousel({
        interval: 5000
    })
});






