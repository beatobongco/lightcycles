function playerHud(el, player) {
  return {
    el: el,
    data() {
      return {
        player: player
      };
    },
    methods: {
      setPlayer(player) {
        this.player = player;
      }
    },
    template: `
    <div class="hud">
      <h3>{{player.name}}</h3>
      <p><small>WINS</small></p>
      <h3>{{player.wins}}</h3>
      <p><small>SPEED</small></p>
      <h3>{{player.speed}}</h3>
    </div>
  `
  };
}

const userHud = new Vue(playerHud('#userHud', user));
const enemyHud = new Vue(playerHud('#enemyHud', enemy));
