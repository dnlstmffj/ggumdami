function isDarkMode() {
  return Cookies.get('darkmode');
}

function darkModeSwitch(status) {
  Cookies.set('darkmode', +status);
  if( status == 1) {
   //document.querySelector('#csslink').setAttribute('href', 'https://unpkg.com/onsenui/css/dark-onsen-css-components.min.css');
  }
  
}

document.addEventListener('DOMContentLoaded', function () {
  const isDm = +isDarkMode();
  if (isDm) darkModeSwitch(1);
});
