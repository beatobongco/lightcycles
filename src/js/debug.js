const url = new URL(window.location.href);
const params = url.searchParams;
let pauseEnabled = params.get('enablePause');

if (params.get('showStats')) {
  document.getElementById('fps').style.display = 'block';
}
