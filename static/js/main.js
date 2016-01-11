var hue = jsHue();
var bridge;
var user;

// A $( document ).ready() block.
$( document ).ready(function() {
    console.log( "ready!" );
    $('#bridgeIp').val(Cookies.get('lastBridgeIp'));
    tryConnectUser();
});

//
// LIGHT STATE METHODS
//
function setGroupOn(isOn) {
  console.log('Setting on/off');
  user.setGroupState(0,
  {
    "on": isOn,
    "bri": 254
  },
  function(data) {
    console.log('On/off set');
  },
  function(data) {
    console.log('Set group failed: ', JSON.stringify(data));
  });
}

function setGroupColor(XY) {
  console.log('Setting color');
  user.setGroupState(0,
  {
    "on": true,
    "xy": XY
  },
  function(data) {
    console.log('Color set');
  },
  function(data) {
    console.log('Set group failed: ', JSON.stringify(data));
  });
}

function setGroupColorGelIndex(index) {
  var theGel = gelsData[index];
  var theRGB = [theGel.Red, theGel.Green, theGel.Blue];
  setGroupColorRGB(theRGB);
}

function setGroupColorRGB(theRGB) {
  var theXY = convertRGBtoXY(theRGB, 'LCT001');
  console.log('RGB: ' + JSON.stringify(theRGB) + ' XY: ' + JSON.stringify(theXY));
  setGroupColor(theXY);
}

// DEBUG
function rawSetGroupColor() {
  console.log('Setting color with jQuery');

  var lightState = {
    "on": true,
    "xy": [0.3, 0.4]
  };

  $.ajax('http://127.0.0.1/api/02650aa99a9ebbc636742f610096478/groups/0/action',
  {
    data: lightState,
    method: 'PUT',
    complete: function(request, stringResponse) {
      alert(stringResponse);
    }
  });
}

//
// GALLERY
//
function selectMfg(name) {

  var index = 0;

  switch (name) {
    case 'lee':
      index = 169; // temp
      break;

    case 'gam':
      index = 321; // temp
      break;

    case 'random':
      index = Math.floor(Math.random() * gelsData.length);
      break;

    default:
      index = 0; // rosco
  }

  // Set the gallery
  $gallery.flickity( 'select', index );
}

// Select a color based on index in the gel array
function selectColorIndex(index) {
  // Set the gallery
  $gallery.flickity( 'select', index );
}

// Select a color based on color code
function selectColorCode(colorCode) {
  var index = findGelIndex(colorCode);

  selectColorIndex(index);
}

// Find the array index of the gel with the given color code
function findGelIndex(colorCode) {
  var index = findElementIndex(gelsData, "ColorCode", colorCode);
  return index;
}

// Find an element in the given array where the property matches the value
function findElement(arr, propName, propValue) {
  for (var i=0; i < arr.length; i++)
    if (arr[i][propName] == propValue)
      return arr[i];

  // will return undefined if not found; you could return a default instead
}

// Find the index an element in the given array where the property
// matches the value
function findElementIndex(arr, propName, propValue) {
  for (var i=0; i < arr.length; i++)
    if (arr[i][propName] == propValue)
      return i;

  // will return undefined if not found; you could return a default instead (??)
}

//
// ADMIN METHODS
//
function tryConnectUser() {
  // Cookie
  var myIp = Cookies.get('bridgeIp');
  var myUser = Cookies.get('username');

  if (typeof(myIp) == 'string') {
    console.log('Cookie IP: ', myIp);

    if (typeof(myUser) == 'string') {
      // Use cookie values
      bridge = hue.bridge(myIp);
      user = bridge.user(myUser);
      console.log('Cookie username: ', myUser);

      // Check for connection to Bridge by getting configuration and
      // testing for a field that is only available when authenticated
      user.getConfig(function(data) {
        console.log(data.linkbutton);
        if (typeof(data.linkbutton) != 'undefined') {
          console.log('Authenticated bridge and user from cookie');
          $('#bridgeConfigPanel').hide();
        }
        else {
          console.log('Could not authenticate bridge with cookie');
          $('#bridgeConfigPanel').show();
        }
      },
      function(data) {
        // Call failed
        console.log('Failure getting config to validate connection');
        $('#bridgeConfigPanel').show();
      });
    }
    else {
      $('#bridgeConfigPanel').show();
    }
  }
  else {
    $('#bridgeConfigPanel').show();
  }
}

// Clear cookies to forget the bridge
function forgetBridge() {
  var strUsername = Cookies.get('username');
  user.deleteUser(strUsername, function() {
    console.log('User deleted from Bridge whitelist: ', strUsername);
  });
  Cookies.remove('bridgeIp');
  Cookies.remove('username');
  location.reload(true);
}


function connectNewUser(ip) {

  bridge = hue.bridge(ip);
  Cookies.set('bridgeIp', ip, { expires: 365 });
  Cookies.set('lastBridgeIp', ip, { expires: 365 });

  // create user account (requires link button to be pressed)
  bridge.createUser('gel2hue', function(data) {
    if (typeof(data[0].error) != 'undefined') {
      console.log("Error creating user:", data[0].error.description);
      alert(data[0].error.description);
      return;
    }

    // extract bridge-generated username from returned data
    var username = data[0].success.username;

    console.log('New username:', username);
    Cookies.set('username', username, { expires: 365 });

    // instantiate user object with username
    user = bridge.user(username);

    // Hide the panel
    console.log('Authenticated the user');
    $('#bridgeConfigPanel').hide();

  });
}
