//
// LIGHT STATE METHODS
//
function setGroupOn(user, isOn) {
  console.log('Setting on/off');
  user.setGroupState(0,
  {
    "on": isOn,
  },
  function(data) {
    console.log('On/off set');
  },
  function(data) {
    console.log('Set group failed: ', JSON.stringify(data));
  });
}

function setGroupColor(user, XY) {
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

function setGroupColorGelIndex(user, index) {
  var theGel = gelsData[index];
  var theRGB = [theGel.Red, theGel.Green, theGel.Blue];
  setGroupColorRGB(user, theRGB);
}

function setGroupColorRGB(user, theRGB) {
  var theXY = convertRGBtoXY(theRGB, 'LCT001');
  console.log('RGB: ' + JSON.stringify(theRGB) + ' XY: ' + JSON.stringify(theXY));
  setGroupColor(user, theXY);
}

//
// GALLERY
//
function getIndexForMfg(name)
{
  var index = 0;

  switch (name) {
    case 'lee':
      index = 169; // temp
      break;

    case 'gam':
      index = 321; // temp
      break;

    case 'random':
      index = Math.floor(Math.random() * gelsData.length); // Temp
      break;

    default:
      index = 0; // rosco
  }

  return index;
}

// HELPER METHODS
//
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
// USER
//

// Try to connect the user to the bridge
// bridge Hue bridge object to use
// myUser string username to test
// didConnectUser callback for success result function(username)
function tryConnectUser(bridge, myUser, didConnectUser) {
  if (typeof(myUser) == 'string') {
    user = bridge.user(myUser);
    console.log('Testing username: ', myUser);

    // Check for connection to Bridge by getting configuration and
    // testing for a field that is only available when authenticated
    user.getConfig(function(data) {
      console.log(data.linkbutton);
      if (typeof(data.linkbutton) != 'undefined') {
        console.log('Authenticated bridge and user from cookie');
        didConnectUser(myUser);
      }
      else {
        console.log('Could not authenticate bridge with cookie');       }
    },
    function(data) {
      // Call failed
      console.log('Failure getting config to validate connection');
    });
  }
}

// Clear cookies to forget the bridge
function forgetBridge() {

  // Get cookies
  var myBridgeIP = Cookies.get('bridgeIp');
  var myUsername = Cookies.get('username');

  // Bridge instance just for this, so it always works
  var theHue = jsHue();
  theBridge = theHue.bridge(myBridgeIP);
  theUser = theBridge.user(myUsername);

  // Delete user from bridge
  user.deleteUser(myUsername, function() {
    console.log('User deleted from Bridge whitelist: ', myUsername);
  });

  // Clear cookies & refresh
  Cookies.remove('bridgeIp');
  Cookies.remove('username');
  location.reload(true);

}
