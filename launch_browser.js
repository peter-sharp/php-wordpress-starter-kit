var open = require("open");
//load library for editing hosts file
var hostile = require("hostile");

// promise library
var Q = require('q');

var hostName = "wp-test.com";
var ip       = "192.168.33.10";

function checkForHost( host ) {
  var deferred = Q.defer();
  var preserveFormatting = false;
  hostile.get( preserveFormatting, function( error, lines) {
    if( error ) {
      deferred.reject(new Error( error ));
    }

    var matchingHosts = lines.filter( function (line){
      return line.indexOf( host) > -1;
    });


    deferred.resolve( matchingHosts.length );

  });

  return deferred.promise;
}

function createHost ( hostName, ip ) {
  var defferer = Q.defer();
  hostile.set( ip, hostName, function ( error ) {
    if ( error ) {
      deferrer.reject(new Error( error ));
    } else {
      deferrer.resolve( true );
    }
  });
  return deferrer.promise;
}

checkForHost(hostName)
.then(function ( hostsCount ) {
  if ( hostsCount ) {
    open( hostName, "google-chrome" );

  } else {
    createHost( hostName, ip )
    .then(function() {
      open( hostName, "google-chrome" );

    }).catch(function( error ) {
      console.error(error);
    });
  }
}).catch(function (error) {
  console.error(error);
});
