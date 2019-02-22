!function(){"use strict";const e=16,t=36*e,n=36*e,o=6,r=3,s=[3,4,6,14,16],i=6,l=4,a=new Two.Vector(-1,0),c=new Two.Vector(1,0),u=new Two.Vector(0,-1),d=new Two.Vector(0,1),p="lightcycles/HISCORE",m=new Two({width:t,height:n}).appendTo(document.getElementById("stage"));function g(e,o=null,r=2){function s(e,t,n=0){if(!(e.right<t.left+n||e.left>t.right-n||e.bottom<t.top+n||e.top>t.bottom-n))return!0}const i={didCollide:!1};if(G.bit&&s(e,G.bit.getBoundingClientRect())&&(i.obtainedBit=!0),e.right>=t||e.left<=0||e.bottom>=n||e.top<=0)return i.didCollide=!0,i;const l=o?o.lightTrails:[];for(let t=0;t<G.players.length;t++){if(o&&o.name!==G.players[t].name&&s(e,G.players[t].group._collection[1].getBoundingClientRect(),r))return i.didCollide=!0,i;for(let n=0;n<G.players[t].lightTrails.length;n++){let p=G.players[t].lightTrails[n];if(o&&(l[l.length-1]&&l[l.length-1].id===p.id||l[l.length-2]&&l[l.length-2].id===p.id))continue;let m=p.getBoundingClientRect();s(e,m,r)&&(i.didCollide=!0,e.right>m.right?i.oppositeDir=c:e.left<m.left?i.oppositeDir=a:e.bottom>m.bottom?i.oppositeDir=d:e.top<m.top&&(i.oppositeDir=u))}}return i}function f(e,t){return g(e.group._collection[1].getBoundingClientRect(),e,t)}const y={"sound/speed1.ogg":!1,"sound/speed2.ogg":!1,"sound/speed3.ogg":!1,"sound/slipstream.ogg":!1,"sound/shiftup.mp3":!1,"sound/rezzin.ogg":!1,"sound/bit_spawn.ogg":!1,"sound/playerjoin.ogg":!1,"sound/derezz.mp3":!1,"sound/timertick.ogg":!1};function h(){G.players.forEach(async function(e){await e.soundPromise,e.sound.pause()})}function w(){new Audio("sound/bit_spawn.ogg").play()}function k(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}function v(e,t,n,o,r,s,l=1,a=3,c=i){const u=[];for(let i=0;i<r;i++){const r=m.makePolygon(e.x+k(-c,c),e.y+k(-c,c),k(l,a),3);r.fill=t,r.noStroke(),r.rotation=k(-10,10),r.translation.addSelf(new Two.Vector(k(n*c,n*s),k(o*c,o*s))),u.push(r)}return m.makeGroup(...u)}function b(e){let t=0,n=0;return"up"===e?n=1:"down"===e?n=-1:"right"===e?t=-1:"left"===e&&(t=1),{oppX:t,oppY:n}}let T=null;function C(){const e=document.getElementById("timer").classList;G.timeLeft<=5?(e.contains("time-low")||e.add("time-low"),new Audio("sound/timertick.ogg").play()):e.contains("time-low")&&e.remove("time-low")}const E=(e,t)=>{clearInterval(G.gameTimer),G.timeLeft=e,document.getElementById("timer").classList.remove("time-low"),document.getElementById("timer").innerText=e,T=Date.now(),C(),G.gameTimer=setInterval(()=>{const n=Date.now()-T,o=document.getElementById("timer");G.timeLeft=e-Math.floor(n/1e3),o.innerText=G.timeLeft,G.timeLeft<=0&&t&&t(),C()},1e3)};function F(e,t,n){document.getElementById(e).innerHTML=`\n    <h3>${t}</h3>\n    <div class="blink">\n      <p><small class="tiny">PRESS</small></p>\n      <p class="centered">${n}</p>\n      <p><small class="tiny">TO JOIN</small></p>\n    </div>\n  `}function O(e){const{el:t,name:n,wins:o,roundWins:r,speed:s,score:i}=e;let l="",a="",c="";if("2P"===G.mode){let e=['<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>'];for(let t=0;t<r;t++)e[t]='<span class="windot">&#9679;</span>';l=`<p><small>ROUND</small></p>\n    <div class="rounds">${e.join("")}</div>`,a=o>0?`<small class="tiny">\n            WINS: <span id="${n}-wins">${o}</span>\n          </small>`:""}else if("1P"===G.mode){c=`<p><small>SCORE</small></p>\n    <p><small>${i}</small></p>`;const e=localStorage.getItem(p);e>0&&(c+=`<p><small>RECORD</small></p>\n    <p><small>${e}</small></p>`)}document.getElementById(t).innerHTML=`\n    <div>\n      <h3>${n}</h3>\n      ${l}\n      <p><small>SPEED</small></p>\n      <h3 id="${n}-speed">${s}</h3>\n      ${a}\n      ${c}\n    </div>`}function R(e,t,n,o){const r=m.makeCircle(e,t,i);r.stroke=n,r.fill=o,r.linewidth=2;const s=m.makeRectangle(e,t,l,l);s.fill="red",s.noFill(),s.noStroke();const a=m.makeGroup(r,s);return a.center(),a.translation.set(e,t),a}function D(e,t,n,o,r,s,i,l,a,c,u){const d={el:u,name:e,prevDirection:o,direction:o,lastMoveFrame:0,_speed:1,get speed(){return this._speed},set speed(t){document.getElementById(`${e}-speed`).innerText=t,this._speed=t},get wins(){return this._wins},set wins(e){this._wins=e,O(this)},_roundWins:s,get roundWins(){return this._roundWins},set roundWins(e){this._roundWins=e,O(this)},_score:0,get score(){return this._score},set score(e){this._score=e,O(this)},isAccelerating:!1,isBraking:!1,lastDecelerateFrame:0,lastAccelerateFrame:0,lastBrakeFrame:0,alive:!0,_wins:r,group:R(t,n,i,l),fillColor:l,strokeColor:i,originalStroke:i,turboColor:a,sparkColor:c,currentOrigin:new Two.Vector(t,n),lightTrails:[],corpse:null,sparks:null,sound:new Audio,soundPromise:null};return O(d),d}function P(n=!1){return D("P1",Math.round(t/2),8*e,"down",G.user?G.user.wins:0,n&&G.user?G.user.roundWins:0,"#3498db","#ffffff","#67CBFF","#E7FFFF","userHud")}function A(o=!1){return D("P2",Math.round(t/2),n-8*e,"up",G.enemy?G.enemy.wins:0,o&&G.enemy?G.enemy.roundWins:0,"#e67e22","#000000","#FFB155","#FFFFD5","enemyHud")}function S(e=!1){1===G.noPlayer?(G.enemy=A(0),G.players=[G.enemy],F("userHud","P1","W")):2===G.noPlayer?(G.user=P(0),G.players=[G.user],F("enemyHud","P2",'<span>UP</span> <small class="tiny">ARROW</small>')):(G.user=P(e),G.enemy=A(e),G.players=[G.user,G.enemy])}function B(){let e,o,r;G.bit&&m.remove(G.bit),(r=m.makeCircle(0,0,6)).fill="#1abc9c",r.noStroke(),r.opacity=.9,(o=m.makeCircle(0,0,4)).fill="#E6FFFF",o.noStroke(),(e=m.makeGroup(r,o)).center(),e.translation.set(k(0,t),k(0,n)),G.bit=e,g(G.bit.getBoundingClientRect()).didCollide?B():w()}const I="KeyT",x="BracketRight";function $(e,t){("down"===t&&"up"!==e.prevDirection||"up"===t&&"down"!==e.prevDirection||"right"===t&&"left"!==e.prevDirection||"left"===t&&"right"!==e.prevDirection)&&(e.direction=t)}function W(e){e.isAccelerating||new Audio("sound/shiftup.mp3").play(),e.isAccelerating=!0}function M(){new Audio("sound/playerjoin.ogg").play(),G.firstRun=!0,G.noPlayer=null,G.mode="2P",G.roundTime=30,m.remove(G.bit),L()}function L(){m.pause(),G.players.length>0&&(G.players.forEach(e=>{m.remove(e.group),m.remove(e.corpse),m.remove(e.sparks),e.lightTrails.forEach(e=>{m.remove(e)})}),h()),G.bit&&(m.remove(G.bit),G.bit=null),G.gameOverText=null,G.gameOver=!1,document.getElementById("gameOverContainer").style.display="none",!G.players||G.players.some(e=>3===e.roundWins)?S():S(!0),m.update(),h(),new Audio("sound/rezzin.ogg").play(),E(3,()=>{E(G.roundTime,()=>{G.gameOver=!0}),G.noPlayer&&B(),G.players.forEach(e=>{e.sound.src="sound/speed1.ogg",e.soundPromise=e.sound.play().catch(e=>{})}),G.instance.play()})}function _(e,t){let n=0;e.isAccelerating?e.speed<o&&t-e.lastAccelerateFrame>s[e.speed-1]&&(e.speed+=1,e.lastAccelerateFrame=t):t-e.lastDecelerateFrame>r&&e.speed>1&&(e.speed-=1,e.lastDecelerateFrame=t);const p=f(e,-3);p.didCollide&&(n=Math.ceil(.5*e.speed),e.strokeColor!==e.turboColor&&e.speed+n>o&&(e.strokeColor=e.turboColor,e.currentOrigin=e.group.translation.clone())),e.strokeColor===e.turboColor&&e.speed+n<=o&&(e.strokeColor=e.originalStroke,e.currentOrigin=e.group.translation.clone());let g=Math.round(Math.max(0,6/Math.max(1,e.speed+n)));e.speed===o&&(g=0);let y=e.direction;const h=e.group.translation;for(let o=1;o<=e.speed+n;o++){switch("2P"===G.mode&&(e.score+=1),e.direction!==e.prevDirection&&t-e.lastMoveFrame>g?(e.currentOrigin=e.group.translation.clone(),e.prevDirection=y,e.lastMoveFrame=t,e.sound.currentTime=0):y=e.prevDirection,y){case"left":h.addSelf(a);break;case"right":h.addSelf(c);break;case"up":h.addSelf(u);break;case"down":h.addSelf(d)}if(1===o||o%l==0){const t=f(e);if(t.didCollide){new Audio("sound/derezz.mp3").play(),e.alive=!1,m.remove(e.group);const{oppX:t,oppY:n}=b(y);return void(e.corpse=v(e.group.translation,e.fillColor,t,n,k(3,3*e.speed),i*e.speed*(e.speed/2),2,3))}t.obtainedBit&&(C=10,T=Date.now(),G.timeLeft=C,e.score+=250,w(),B())}}var C;if(function(e,t){async function n(e,t){const n=e.sound.src.split("/");t!==n.slice(n.length-2,n.length).join("/")&&(await e.soundPromise,e.sound.src=t,e.soundPromise=e.sound.play().catch(e=>{}))}e.isAccelerating&&!e.isBraking?e.speed+t>o?n(e,"sound/slipstream.ogg"):e.speed===o?n(e,"sound/speed3.ogg"):n(e,"sound/speed2.ogg"):n(e,"sound/speed1.ogg")}(e,n),function(e){const t=m.makeLine(e.currentOrigin.x,e.currentOrigin.y,e.group.translation.x,e.group.translation.y);if(t.stroke=e.strokeColor,t.linewidth=6,t.opacity=.9,t.origin=e.currentOrigin,e.lightTrails.length>0){const n=e.lightTrails[e.lightTrails.length-1];n.origin.equals(t.origin)&&n.stroke===t.stroke&&m.remove(e.lightTrails.pop())}e.lightTrails.push(t)}(e),m.remove(e.sparks),p.didCollide){const t=1+e.speed,{x:n,y:o}=p.oppositeDir||{x:0,y:0},{oppX:r,oppY:s}=b(y);e.sparks=v(e.group.translation,e.sparkColor,n+r*t,o+s*t,k(3,3+e.speed),1+Math.round(2*e.speed),2,2,i/2)}return m.remove(e.group),e.group=R(h.x,h.y,e.strokeColor,e.fillColor),y}Object.keys(y).forEach(e=>{var t=new Audio;t.addEventListener("canplaythrough",()=>{y[e]=!0}),t.src=e}),function(){const o=m.makeRectangle(t/2,n/2,t,n);o.fill="#2c3e50",o.stroke="#ecf0f1",o.linewidth=3;for(let o=0;o<=t;o+=e)m.makeLine(o,0,o,n).stroke="#fff";for(let o=0;o<=n;o+=e)m.makeLine(0,o,t,o).stroke="#fff";m.update()}(),document.body.onkeydown=(e=>{if("KeyR"===e.code){const e=document.documentElement;e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen(),G.gameOver&&L()}else if("Pause"===e.code&&G.pauseEnabled)G.instance.playing?G.instance.pause():G.instance.play();else if(!G.enemy&&"ArrowUp"===e.code||!G.user&&"KeyW"===e.code)M();else if(!G.gameOver){if(G.user)switch(e.code){case"KeyS":$(G.user,"down");break;case"KeyW":$(G.user,"up");break;case"KeyA":$(G.user,"left");break;case"KeyD":$(G.user,"right");break;case I:W(G.user)}if(G.enemy)switch(e.code){case"ArrowDown":$(G.enemy,"down");break;case"ArrowUp":$(G.enemy,"up");break;case"ArrowLeft":$(G.enemy,"left");break;case"ArrowRight":$(G.enemy,"right");break;case x:W(G.enemy)}}}),document.body.onkeyup=(e=>{if(!G.gameOver)switch(e.code){case I:G.user&&(G.user.isAccelerating=!1);break;case x:G.enemy&&(G.enemy.isAccelerating=!1)}}),G.instance=m.bind("update",e=>{if(stats.begin(),G.gameOver){clearInterval(G.gameTimer);let e="Press `R` to play next round.";if("1P"===G.mode){let t=G.players[0].score;t>(localStorage.getItem(p)||0)?(localStorage.setItem(p,t),e=`You set a new record, ${t} pts!`):e=`You got ${t} pts!`,e+="<p>Press `R` to try again. </p>"}if(G.players.every(e=>!e.alive))"2P"===G.mode?G.gameOverText="DRAW":G.gameOverText="YOU DEREZZED";else if(G.timeLeft<=0){if(G.gameOverText="TIME UP","2P"===G.mode){let t=null,n=0,o="";G.players.forEach(e=>{o+=`<p>${e.name}: ${e.score} pts</p>`,e.score>n?(n=e.score,t=e):e.score===n&&(t=null)}),t?(t.roundWins+=1,e=`${t.name} WINS <p>${t.name} has a longer jetwall. </p>\n          ${o}\n          <p>${e}</p>`):e=`DRAW. <p>${e} </p>`}}else G.players.some(e=>{if(e.alive)return G.gameOverText=`${e.name} WINS`,e.roundWins+=1,!0});document.getElementById("gameOverSubtext").innerHTML=e,G.players.some(e=>{if(3===e.roundWins)return e.wins+=1,G.gameOverText=`${e.name} WINS THE MATCH`,document.getElementById("gameOverSubtext").innerText="Press `R` for rematch.",!0}),document.getElementById("gameOverContainer").style.display="flex",document.getElementById("gameOverText").innerText=G.gameOverText,h(),m.pause()}else{for(let t=0;t<G.players.length;t++)_(G.players[t],e);for(let e=0;e<G.players.length;e++)G.players[e].alive||(G.gameOver=!0)}stats.end()})}();
