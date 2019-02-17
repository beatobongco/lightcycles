const url = new URL(window.location.href);
const params = url.searchParams;
let noPlayer = parseInt(params.get('noPlayer'));

if (params.get('showStats')) {
  document.getElementById('fps').style.display = 'block';
}

if (noPlayer === 1) {
  players = [enemy];
} else if (noPlayer === 2) {
  players = [user];
}
