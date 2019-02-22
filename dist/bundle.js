!function(){"use strict";const e=16,t=36*e,n=36*e,r=6,o=3,s=[3,4,6,14,16],i=6,l=4,a=new Two.Vector(-1,0),c=new Two.Vector(1,0),u=new Two.Vector(0,-1),d=new Two.Vector(0,1),p=new Two({width:t,height:n}).appendTo(document.getElementById("stage"));function m(e,r=null,o=2){function s(e,t,n=0){if(!(e.right<t.left+n||e.left>t.right-n||e.bottom<t.top+n||e.top>t.bottom-n))return!0}const i={didCollide:!1};if(G.bit&&s(e,G.bit.getBoundingClientRect())&&(i.obtainedBit=!0),e.right>=t||e.left<=0||e.bottom>=n||e.top<=0)return i.didCollide=!0,i;const l=r?r.lightTrails:[];for(let t=0;t<G.players.length;t++){if(r&&r.name!==G.players[t].name&&s(e,G.players[t].group._collection[1].getBoundingClientRect(),o))return i.didCollide=!0,i;for(let n=0;n<G.players[t].lightTrails.length;n++){let p=G.players[t].lightTrails[n];if(r&&(l[l.length-1]&&l[l.length-1].id===p.id||l[l.length-2]&&l[l.length-2].id===p.id))continue;let m=p.getBoundingClientRect();s(e,m,o)&&(i.didCollide=!0,e.right>m.right?i.oppositeDir=c:e.left<m.left?i.oppositeDir=a:e.bottom>m.bottom?i.oppositeDir=d:e.top<m.top&&(i.oppositeDir=u))}}return i}function g(e,t){return m(e.group._collection[1].getBoundingClientRect(),e,t)}function f(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}function y(e,t,n,r,o,s,l=1,a=3,c=i){const u=[];for(let i=0;i<o;i++){const o=p.makePolygon(e.x+f(-c,c),e.y+f(-c,c),f(l,a),3);o.fill=t,o.noStroke(),o.rotation=f(-10,10),o.translation.addSelf(new Two.Vector(f(n*c,n*s),f(r*c,r*s))),u.push(o)}return p.makeGroup(...u)}function h(e){let t=0,n=0;return"up"===e?n=1:"down"===e?n=-1:"right"===e?t=-1:"left"===e&&(t=1),{oppX:t,oppY:n}}let w=null;const k=()=>(clearInterval(G.gameTimer),G.timeLeft=G.roundTime,document.getElementById("timer").innerText=G.roundTime,w=Date.now(),setInterval(function(){const e=Date.now()-w,t=document.getElementById("timer");G.timeLeft=G.roundTime-Math.floor(e/1e3),t.innerText=G.timeLeft,G.timeLeft<=0&&(G.gameOver=!0,clearInterval(G.gameTimer));const n=t.classList;G.timeLeft<=5?(n.contains("time-low")||n.add("time-low"),new Audio("sound/timertick.ogg").play()):n.contains("time-low")&&n.remove("time-low")},1e3));function v(e){const{el:t,name:n,wins:r,roundWins:o,speed:s,score:i}=e;let l="",a="",c="";if("2P"===G.mode){let e=['<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>'];for(let t=0;t<o;t++)e[t]='<span class="windot">&#9679;</span>';l=`<p><small>ROUND</small></p>\n    <div class="rounds">${e.join("")}</div>`,a=r>0?`<small class="tiny">\n            WINS: <span id="${n}-wins">${r}</span>\n          </small>`:""}else"1P"===G.mode&&(c=`<p><small>SCORE</small></p>\n    <p><small>${i}</small></p>`);document.getElementById(t).innerHTML=`\n    <div class="hud">\n      <h3>${n}</h3>\n      ${l}\n      <p><small>SPEED</small></p>\n      <h3 id="${n}-speed">${s}</h3>\n      ${c}\n      ${a}\n    </div>`}function T(e,t,n,r){const o=p.makeCircle(e,t,i);o.stroke=n,o.fill=r,o.linewidth=2;const s=p.makeRectangle(e,t,l,l);s.fill="red",s.noFill(),s.noStroke();const a=p.makeGroup(o,s);return a.center(),a.translation.set(e,t),a}function b(e,t,n,r,o,s,i,l,a,c,u){const d={el:u,name:e,prevDirection:r,direction:r,lastMoveFrame:0,_speed:1,get speed(){return this._speed},set speed(t){document.getElementById(`${e}-speed`).innerText=t,this._speed=t},get wins(){return this._wins},set wins(e){this._wins=e,v(this)},_roundWins:s,get roundWins(){return this._roundWins},set roundWins(e){this._roundWins=e,v(this)},_score:0,get score(){return this._score},set score(e){this._score=e,v(this)},isAccelerating:!1,isBraking:!1,lastDecelerateFrame:0,lastAccelerateFrame:0,lastBrakeFrame:0,alive:!0,_wins:o,group:T(t,n,i,l),fillColor:l,strokeColor:i,originalStroke:i,turboColor:a,sparkColor:c,currentOrigin:new Two.Vector(t,n),lightTrails:[],corpse:null,sparks:null,sound:new Audio,soundPromise:null};return v(d),d}function C(n=!1){return b("P1",Math.round(t/2),8*e,"down",G.user?G.user.wins:0,n&&G.user?G.user.roundWins:0,"#3498db","#ffffff","#67CBFF","#E7FFFF","userHud")}function F(r=!1){return b("P2",Math.round(t/2),n-8*e,"up",G.enemy?G.enemy.wins:0,r&&G.enemy?G.enemy.roundWins:0,"#e67e22","#000000","#FFB155","#FFFFD5","enemyHud")}function O(e=!1){1===G.noPlayer?(G.enemy=F(0),G.players=[G.enemy]):2===G.noPlayer?(G.user=C(0),G.players=[G.user]):(G.user=C(e),G.enemy=F(e),G.players=[G.user,G.enemy])}function D(){let e,r,o;G.bit&&p.remove(G.bit),(o=p.makeCircle(0,0,6)).fill="#1abc9c",o.noStroke(),o.opacity=.9,(r=p.makeCircle(0,0,4)).fill="#E6FFFF",r.noStroke(),(e=p.makeGroup(o,r)).center(),e.translation.set(f(0,t),f(0,n)),G.bit=e,m(G.bit.getBoundingClientRect()).didCollide&&(console.log("bit collided"),D())}const E="KeyT",R="BracketRight";function x(e,t){("down"===t&&"up"!==e.prevDirection||"up"===t&&"down"!==e.prevDirection||"right"===t&&"left"!==e.prevDirection||"left"===t&&"right"!==e.prevDirection)&&(e.direction=t)}function B(e){e.isAccelerating||new Audio("sound/shiftup.mp3").play(),e.isAccelerating=!0}function P(){G.gameOverText=null,G.gameTimer=k(),G.gameOver=!1,document.getElementById("gameOverContainer").style.display="none",!G.players||G.players.some(e=>3===e.roundWins)?O():O(!0),G.players.forEach(e=>{e.sound.src="sound/speed1.ogg",e.soundPromise=e.sound.play().catch(e=>{})}),G.noPlayer&&D(),G.instance.play()}function A(e,t){let n=0;e.isAccelerating?e.speed<r&&t-e.lastAccelerateFrame>s[e.speed-1]&&(e.speed+=1,e.lastAccelerateFrame=t):t-e.lastDecelerateFrame>o&&e.speed>1&&(e.speed-=1,e.lastDecelerateFrame=t);const m=g(e,-3);m.didCollide&&(n=Math.ceil(.5*e.speed),e.strokeColor!==e.turboColor&&e.speed+n>r&&(e.strokeColor=e.turboColor,e.currentOrigin=e.group.translation.clone())),e.strokeColor===e.turboColor&&e.speed+n<=r&&(e.strokeColor=e.originalStroke,e.currentOrigin=e.group.translation.clone());let k=Math.round(Math.max(0,6/Math.max(1,e.speed+n)));e.speed===r&&(k=0);let v=e.direction;const b=e.group.translation;for(let r=1;r<=e.speed+n;r++){switch(G.noPlayer||(e.score+=1),e.direction!==e.prevDirection&&t-e.lastMoveFrame>k?(e.currentOrigin=e.group.translation.clone(),e.prevDirection=v,e.lastMoveFrame=t,e.sound.currentTime=0):v=e.prevDirection,v){case"left":b.addSelf(a);break;case"right":b.addSelf(c);break;case"up":b.addSelf(u);break;case"down":b.addSelf(d)}if(1===r||r%l==0){const t=g(e);if(t.didCollide){new Audio("sound/derezz.mp3").play(),e.alive=!1,p.remove(e.group);const{oppX:t,oppY:n}=h(v);return void(e.corpse=y(e.group.translation,e.fillColor,t,n,f(3,3*e.speed),i*e.speed*(e.speed/2),2,3))}t.obtainedBit&&(C=10,w=Date.now(),G.timeLeft=C,e.score+=250,D())}}var C;if(function(e,t){async function n(e,t){const n=e.sound.src.split("/");t!==n.slice(n.length-2,n.length).join("/")&&(await e.soundPromise,e.sound.src=t,e.soundPromise=e.sound.play().catch(e=>{}))}e.isAccelerating&&!e.isBraking?e.speed+t>r?n(e,"sound/slipstream.ogg"):e.speed===r?n(e,"sound/speed3.ogg"):n(e,"sound/speed2.ogg"):n(e,"sound/speed1.ogg")}(e,n),function(e){const t=p.makeLine(e.currentOrigin.x,e.currentOrigin.y,e.group.translation.x,e.group.translation.y);if(t.stroke=e.strokeColor,t.linewidth=6,t.opacity=.9,t.origin=e.currentOrigin,e.lightTrails.length>0){const n=e.lightTrails[e.lightTrails.length-1];n.origin.equals(t.origin)&&n.stroke===t.stroke&&p.remove(e.lightTrails.pop())}e.lightTrails.push(t)}(e),p.remove(e.sparks),m.didCollide){const t=1+e.speed,{x:n,y:r}=m.oppositeDir||{x:0,y:0},{oppX:o,oppY:s}=h(v);e.sparks=y(e.group.translation,e.sparkColor,n+o*t,r+s*t,f(3,3+e.speed),1+Math.round(2*e.speed),2,2,i/2)}return p.remove(e.group),e.group=T(b.x,b.y,e.strokeColor,e.fillColor),v}!function(){const r=p.makeRectangle(t/2,n/2,t,n);r.fill="#2c3e50",r.stroke="#ecf0f1",r.linewidth=3;for(let r=0;r<=t;r+=e)p.makeLine(r,0,r,n).stroke="#fff";for(let r=0;r<=n;r+=e)p.makeLine(0,r,t,r).stroke="#fff";p.update()}(),document.body.onkeydown=(e=>{if("KeyR"===e.code){const e=document.documentElement;e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen(),G.firstRun?(G.firstRun=!1,P()):G.gameOver&&(document.getElementById("timer").classList.remove("time-low"),G.players.forEach(e=>{p.remove(e.group),p.remove(e.corpse),p.remove(e.sparks),e.lightTrails.forEach(e=>{p.remove(e)})}),P())}else if("Pause"===e.code&&G.pauseEnabled)G.instance.playing?G.instance.pause():G.instance.play();else if(!G.gameOver)switch(e.code){case"KeyS":x(G.user,"down");break;case"KeyW":x(G.user,"up");break;case"KeyA":x(G.user,"left");break;case"KeyD":x(G.user,"right");break;case E:B(G.user);break;case"ArrowDown":x(G.enemy,"down");break;case"ArrowUp":x(G.enemy,"up");break;case"ArrowLeft":x(G.enemy,"left");break;case"ArrowRight":x(G.enemy,"right");break;case R:B(G.enemy)}}),document.body.onkeyup=(e=>{if(!G.gameOver)switch(e.code){case E:G.user.isAccelerating=!1;break;case R:G.enemy.isAccelerating=!1}}),G.instance=p.bind("update",e=>{if(stats.begin(),G.gameOver){clearInterval(G.gameTimer);let e="Press `R` to play next round.";if(G.players.every(e=>!e.alive))"2P"===G.mode?G.gameOverText="DRAW":(G.gameOverText="YOU DEREZZED",e=`You got ${G.players[0].score} pts! <p>Press \`R\` to try again. </p>`);else if(G.timeLeft<=0)if(G.gameOverText="TIME UP","2P"===G.mode){let t=null,n=0,r="";G.players.forEach(e=>{r+=`<p>${e.name}: ${e.score} pts</p>`,e.score>n?(n=e.score,t=e):e.score===n&&(t=null)}),t?(t.roundWins+=1,e=`${t.name} WINS <p>${t.name} has a longer jetwall. </p>\n          ${r}\n          <p>${e}</p>`):e=`DRAW. <p>${e} </p>`}else e=`You got ${G.players[0].score} pts! <p>Press \`R\` to try again. </p>`;else G.players.some(e=>{if(e.alive)return G.gameOverText=`${e.name} WINS`,e.roundWins+=1,!0});document.getElementById("gameOverSubtext").innerHTML=e,G.players.some(e=>{if(3===e.roundWins)return e.wins+=1,G.gameOverText=`${e.name} WINS THE MATCH`,document.getElementById("gameOverSubtext").innerText="Press `R` for rematch.",!0}),document.getElementById("gameOverContainer").style.display="flex",document.getElementById("gameOverText").innerText=G.gameOverText,G.players.forEach(async function(e){await e.soundPromise,e.sound.pause()}),p.pause()}else{for(let t=0;t<G.players.length;t++)A(G.players[t],e);for(let e=0;e<G.players.length;e++)G.players[e].alive||(G.gameOver=!0)}stats.end()})}();
