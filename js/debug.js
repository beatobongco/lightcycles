const url = new URL(window.location.href);
const params = url.searchParams;
let noEnemy = false;

if (params.get('showStats')) {
  document.getElementById('fps').style.display = 'block';
}

if (params.get('noEnemy')) {
  noEnemy = true;
  players = [user];
}
