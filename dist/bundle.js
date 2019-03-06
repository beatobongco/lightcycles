!function(){"use strict";const e=16,t=36*e,n=36*e,o=6,r=3,i=[3,4,6,14,16],s=6,l=4,a=new Two.Vector(-1,0),c=new Two.Vector(1,0),d=new Two.Vector(0,-1),u=new Two.Vector(0,1),p="lightcycles/HISCORE",m=6,g=new Two({width:t,height:n}).appendTo(document.getElementById("stage"));function f(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}function y(e,t,n,o,r,i,l=1,a=3,c=s){const d=[];for(let s=0;s<r;s++){const r=g.makePolygon(e.x+f(-c,c),e.y+f(-c,c),f(l,a),3);r.fill=t,r.noStroke(),r.rotation=f(-10,10),r.translation.addSelf(new Two.Vector(f(n*c,n*i),f(o*c,o*i))),d.push(r)}return g.makeGroup(...d)}function h(e){let t=0,n=0;return"up"===e?n=1:"down"===e?n=-1:"right"===e?t=-1:"left"===e&&(t=1),{oppX:t,oppY:n}}function w(e,t,n=0){const o=e.group._collection[1].getBoundingClientRect();let r=0,i=0,l=0,a=0;const c=s;if("up"===e.direction?i=c:"down"===e.direction?r=c:"left"===e.direction?l=c:"right"===e.direction&&(a=c),!(o.right<t.left+n+l||o.left>t.right-n-a||o.bottom<t.top+n+i||o.top>t.bottom-n-r))return!0}function b(e,t,n=0){if(!(e.right<t.left+n||e.left>t.right-n||e.bottom<t.top+n||e.top>t.bottom-n))return!0}function T(e,t=!1){let n=e,o=null,r=b,i=l/2;e.type&&"player"===e.type&&(n=(o=e).group._collection[1].getBoundingClientRect(),t&&(n=o.group._collection[0].getBoundingClientRect(),i=-4),r=w);const s={didCollide:!1};for(let t=0;t<G.players.length;t++)for(let l=0;l<G.players[t].lightTrails.length;l++){let p=G.players[t].lightTrails[l];if(o&&p.origin.equals(o.currentOrigin))continue;let m=p.getBoundingClientRect();r(e,m,i)&&(s.didCollide=!0,s.color=p.stroke,n.right>m.right?s.oppositeDir=c:n.left<m.left?s.oppositeDir=a:n.bottom>m.bottom?s.oppositeDir=u:n.top<m.top&&(s.oppositeDir=d))}return s}function k(e){const o={didCollide:!1},r=e.group._collection[1].getBoundingClientRect();if(r.right>=t||r.left<=0||r.bottom>=n||r.top<=0)return o.didCollide=!0,o;for(let t=0;t<G.players.length;t++)if(e.name!==G.players[t].name&&b(e.group._collection[1].getBoundingClientRect(),G.players[t].group._collection[1].getBoundingClientRect()))return o.didCollide=!0,o;const i=T(e,!1);if(i.didCollide){if(!e.hasShield)return i;e.corpses.push(y(e.group.translation,i.color,0,0,f(3,3*e.speed),s*e.speed,2,3,2*s)),o.didCollide=!1,o.usedShield=!0}return G.bit&&b(r,G.bit.group.getBoundingClientRect())&&(o.obtainedBit=!0),o}function v(e){const o={didCollide:!1};return e.right>=t||e.left<=0||e.bottom>=n||e.top<=0?(o.didCollide=!0,o):T(e)}const C={"sound/speed1.ogg":!1,"sound/speed2.ogg":!1,"sound/speed3.ogg":!1,"sound/slipstream.ogg":!1,"sound/shiftup.mp3":!1,"sound/rezzin.ogg":!1,"sound/bit_spawn.ogg":!1,"sound/playerjoin.ogg":!1,"sound/derezz.mp3":!1,"sound/timertick.ogg":!1};function E(){G.players.forEach(async function(e){await e.soundPromise,e.sound.pause()})}function O(){const e=document.getElementById("timer").classList;G.gameTimer.timeLeft<=5?(e.contains("time-low")||e.add("time-low"),new Audio("sound/timertick.ogg").play()):e.contains("time-low")&&e.remove("time-low")}const B=(e,t)=>{clearInterval(G.gameTimer.id);const n={id:null,start:null,timeLeft:null,totalTime:e};G.gameTimer=n,G.gameTimer.timeLeft=e,document.getElementById("timer").classList.remove("time-low"),document.getElementById("timer").innerText=e,G.gameTimer.start=Date.now(),O(),G.gameTimer.id=setInterval(()=>{const e=Date.now()-G.gameTimer.start,n=document.getElementById("timer");G.gameTimer.timeLeft=G.gameTimer.totalTime-Math.floor(e/1e3),n.innerText=G.gameTimer.timeLeft,t(G.gameTimer.timeLeft),O()},1e3)};function R(e,t,n){document.getElementById(e).innerHTML=`\n    <h3>${t}</h3>\n    <div class="blink">\n      <p><small class="tiny">PRESS</small></p>\n      <p class="centered">${n}</p>\n      <p><small class="tiny">TO JOIN</small></p>\n    </div>\n  `}function S(e){const{el:t,name:n,wins:o,roundWins:r,speed:i,score:s}=e;let l="",a="",c="";if("2P"===G.mode){let e=['<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>'];for(let t=0;t<r;t++)e[t]='<span class="windot">&#9679;</span>';l=`<p><small>ROUND</small></p>\n    <div class="rounds">${e.join("")}</div>`,a=o>0?`<small class="tiny">\n            WINS: <span id="${n}-wins">${o}</span>\n          </small>`:""}if(c=`<p><small>SCORE</small></p>\n  <p><small>${s}</small></p>`,"1P"===G.mode){const e=localStorage.getItem(p);e>0&&(c+=`<p><small>RECORD</small></p>\n    <p><small>${e}</small></p>`)}document.getElementById(t).innerHTML=`\n    <div>\n      <h3>${n}</h3>\n      ${l}\n      <p><small>SPEED</small></p>\n      <h3 id="${n}-speed">${i}</h3>\n      ${c}\n      ${a}\n    </div>`}function F(e,t,n,o){const r=g.makeCircle(e,t,s);r.stroke=n,r.fill=o,r.linewidth=2;const i=g.makeRectangle(e,t,l,l);i.fill="red",i.noFill(),i.noStroke();const a=g.makeGroup(r,i);return a.center(),a.translation.set(e,t),a}function A(e,t,n,o,r,i,s,l,a,c,d){const u={el:d,name:e,direction:o,directionBuffer:[],lastMoveDist:0,_speed:1,get speed(){return this._speed},set speed(t){document.getElementById(`${e}-speed`).innerText=t,this._speed=t},get wins(){return this._wins},set wins(e){this._wins=e,S(this)},_roundWins:i,get roundWins(){return this._roundWins},set roundWins(e){this._roundWins=e,S(this)},_score:0,get score(){return this._score},set score(e){this._score=e,S(this)},type:"player",isAccelerating:!1,lastDecelerateFrame:0,lastAccelerateFrame:0,alive:!0,_wins:r,group:F(t,n,s,l),fillColor:l,strokeColor:s,originalStroke:s,originalFill:l,turboColor:a,sparkColor:c,currentOrigin:new Two.Vector(t,n),lightTrails:[],corpses:[],sparks:null,sound:new Audio,soundPromise:null};return S(u),u}function P(n=!1){return A("P1",Math.round(t/2),8*e,"down",G.user?G.user.wins:0,n&&G.user?G.user.roundWins:0,"#3498db","#ffffff","#67CBFF","#E7FFFF","userHud")}function D(o=!1){return A("P2",Math.round(t/2),n-8*e,"up",G.enemy?G.enemy.wins:0,o&&G.enemy?G.enemy.roundWins:0,"#e67e22","#000000","#FFB155","#FFFFD5","enemyHud")}function x(e=!1){1===G.noPlayer?(G.enemy=D(0),G.players=[G.enemy],R("userHud","P1","W")):2===G.noPlayer?(G.user=P(0),G.players=[G.user],R("enemyHud","P2",'<span>UP</span> <small class="tiny">ARROW</small>')):(G.user=P(e),G.enemy=D(e),G.players=[G.user,G.enemy])}function I(e){G.bit&&(g.remove(G.bit.group),G.bit=null);let o,r,i,s="#1abc9c",l="#E6FFFF";"shield"===e&&(l="#1B1464",s="#0652DD"),(i=g.makeCircle(0,0,6)).fill=s,i.noStroke(),i.opacity=.9,(r=g.makeCircle(0,0,4)).fill=l,r.noStroke(),(o=g.makeGroup(i,r)).center(),o.translation.set(f(0,t),f(0,n)),G.bit={group:o,direction:null,spawnedAt:G.gameTimer.timeLeft},v(G.bit.group.getBoundingClientRect()).didCollide?I(e):new Audio("sound/bit_spawn.ogg").play()}const $="KeyT",W="BracketRight",M="Numpad1";function _(e,t){const n=e.directionBuffer;2===n.length&&n.shift(),n.push(t)}function L(e){e.isAccelerating||new Audio("sound/shiftup.mp3").play(),e.isAccelerating=!0}function q(){new Audio("sound/playerjoin.ogg").play(),G.firstRun=!0,G.noPlayer=null,G.mode="2P",G.roundTime=30,z()}function z(){document.getElementsByClassName("controls")[0].style.display="none",g.pause(),G.players.length>0&&(G.players.forEach(e=>{g.remove(e.group),e.corpses.forEach(e=>{g.remove(e)}),g.remove(e.sparks),e.lightTrails.forEach(e=>{g.remove(e)})}),E()),G.bit&&(g.remove(G.bit.group),G.bit=null),G.gameOverText=null,G.gameOver=!1,document.getElementById("gameOverContainer").style.display="none",!G.players||G.players.some(e=>3===e.roundWins)?x():x(!0),g.update(),E(),new Audio("sound/rezzin.ogg").play(),B(3,e=>{e<=0&&(B(G.roundTime,e=>{if(e<=0&&(G.gameOver=!0),G.bit&&G.bit.spawnedAt-e>=10&&(g.remove(G.bit.group),G.bit=null),e%5==0&&!G.bit){0===f(0,3)&&I("shield")}}),G.noPlayer&&I(),G.players.forEach(e=>{e.sound.src="sound/speed1.ogg",e.soundPromise=e.sound.play().catch(e=>{})}),G.instance.play())})}function H(e,t){return("up"!==e&&"down"!==e||"up"!==t.direction&&"down"!==t.direction)&&("left"!==e&&"right"!==e||"left"!==t.direction&&"right"!==t.direction)}function N(e){const t=g.makeLine(e.currentOrigin.x,e.currentOrigin.y,e.group.translation.x,e.group.translation.y);if(t.stroke=e.strokeColor,t.linewidth=m,t.opacity=.9,t.origin=e.currentOrigin,e.lightTrails.length>0){const n=e.lightTrails[e.lightTrails.length-1];n.origin.equals(t.origin)&&n.stroke===t.stroke&&g.remove(e.lightTrails.pop())}e.lightTrails.push(t)}function K(e,t){let n=0;e.isAccelerating?e.speed<o&&t-e.lastAccelerateFrame>i[e.speed-1]&&(e.speed+=1,e.lastAccelerateFrame=t):t-e.lastDecelerateFrame>r&&e.speed>1&&(e.speed-=1,e.lastDecelerateFrame=t);const l=T(e,!0);l.didCollide&&(n=Math.ceil(.5*e.speed),e.strokeColor!==e.turboColor&&e.speed+n>o&&(e.strokeColor=e.turboColor,e.currentOrigin=e.group.translation.clone())),e.strokeColor===e.turboColor&&e.speed+n<=o&&(e.strokeColor=e.originalStroke,e.currentOrigin=e.group.translation.clone());const p=e.group.translation,m=s/2+1;let w=!1;for(let t=0;t<e.speed+n;t++){if("2P"===G.mode&&(e.score+=1),e.directionBuffer.length>0&&e.lastMoveDist>m){const t=e.directionBuffer.shift();H(t,e)&&(e.direction=t,e.lastMoveDist=0,e.currentOrigin=e.group.translation.clone(),e.sound.currentTime=0)}switch(e.lastMoveDist+=1,e.direction){case"left":p.addSelf(a);break;case"right":p.addSelf(c);break;case"up":p.addSelf(d);break;case"down":p.addSelf(u)}const t=k(e);if(t.didCollide){new Audio("sound/derezz.mp3").play(),e.alive=!1,g.remove(e.group);const{oppX:t,oppY:n}=h(e.direction);return void e.corpses.push(y(e.group.translation,e.originalFill,t,n,f(3,3*e.speed),s*e.speed*(e.speed/2),2,3))}t.obtainedBit&&("1P"===G.mode?(e.score+=250,b=Math.max(10-Math.floor(e.score/2e3),5),G.gameTimer.start=Date.now(),G.gameTimer.totalTime=b,document.getElementById("timer").innerText=b,O(),I()):(e.score+=1e3,e.hasShield=!0,e.fillColor="#0652DD",g.remove(G.bit.group),G.bit=null)),t.usedShield&&(w=!0)}var b;if(w&&(e.hasShield=!1,e.fillColor=e.originalFill),function(e,t){async function n(e,t){const n=e.sound.src.split("/");t!==n.slice(n.length-2,n.length).join("/")&&(await e.soundPromise,e.sound.src=t,e.soundPromise=e.sound.play().catch(e=>{}))}e.isAccelerating&&!e.isBraking?e.speed+t>o?n(e,"sound/slipstream.ogg"):e.speed===o?n(e,"sound/speed3.ogg"):n(e,"sound/speed2.ogg"):n(e,"sound/speed1.ogg")}(e,n),G.toggleTrails?e.isAccelerating?N(e):e.currentOrigin=e.group.translation.clone():N(e),g.remove(e.sparks),l.didCollide){const t=1+e.speed,{x:n,y:o}=l.oppositeDir||{x:0,y:0},{oppX:r,oppY:i}=h(e.direction);e.sparks=y(e.group.translation,e.sparkColor,n+r*t,o+i*t,f(3,3+e.speed),1+Math.round(2*e.speed),2,2,s/2)}g.remove(e.group),e.group=F(p.x,p.y,e.strokeColor,e.fillColor)}Object.keys(C).forEach(e=>{var t=new Audio;t.addEventListener("canplaythrough",()=>{C[e]=!0}),t.src=e}),function(){const o=g.makeRectangle(t/2,n/2,t,n);o.fill="#2c3e50",o.stroke="#ecf0f1",o.linewidth=3;for(let o=0;o<=t;o+=e)g.makeLine(o,0,o,n).stroke="#fff";for(let o=0;o<=n;o+=e)g.makeLine(0,o,t,o).stroke="#fff";g.update()}(),document.body.onkeydown=(e=>{if("KeyR"===e.code){const e=document.documentElement;e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen(),G.gameOver&&z()}else if("Pause"===e.code&&G.pauseEnabled)G.instance.playing?G.instance.pause():G.instance.play();else if(!G.enemy&&"ArrowUp"===e.code||!G.user&&"KeyW"===e.code)q();else if(!G.gameOver){if(G.user)switch(e.code){case"KeyS":_(G.user,"down");break;case"KeyW":_(G.user,"up");break;case"KeyA":_(G.user,"left");break;case"KeyD":_(G.user,"right");break;case $:L(G.user)}if(G.enemy)switch(e.code){case"ArrowDown":_(G.enemy,"down");break;case"ArrowUp":_(G.enemy,"up");break;case"ArrowLeft":_(G.enemy,"left");break;case"ArrowRight":_(G.enemy,"right");break;case W:case M:L(G.enemy)}}}),document.body.onkeyup=(e=>{if(!G.gameOver)switch(e.code){case $:G.user&&(G.user.isAccelerating=!1);break;case W:case M:G.enemy&&(G.enemy.isAccelerating=!1)}}),G.instance=g.bind("update",e=>{if(stats.begin(),G.gameOver){document.getElementsByClassName("controls")[0].style.display="block",clearInterval(G.gameTimer.id);let e="Press `R` to play next round.";if("1P"===G.mode){const t=G.players[0];t.alive?G.gameTimer.timeLeft<=0&&(G.gameOverText="TIME UP!"):G.gameOverText="YOU DEREZZED";let n=t.score;n>(localStorage.getItem(p)||0)?(localStorage.setItem(p,n),e=`You set a new record, ${n} pts!`):e=`You got ${n} pts!`,e+="<p>Press `R` to try again. </p>"}else if("2P"===G.mode)if(G.players.every(e=>!e.alive))G.gameOverText="DRAW";else if(G.gameTimer.timeLeft<=0){G.gameOverText="TIME UP";let t=null,n=0,o="";G.players.forEach(e=>{o+=`<p>${e.name}: ${e.score} pts</p>`,e.score>n?(n=e.score,t=e):e.score===n&&(t=null)}),t?(t.roundWins+=1,o+=`<p> ${t.name} WINS </p>`):o="<p>DRAW.</p>",e=`${o} ${e}`}else G.players.some(e=>{if(e.alive)return G.gameOverText=`${e.name} WINS`,e.roundWins+=1,!0});document.getElementById("gameOverSubtext").innerHTML=e,G.players.some(e=>{if(3===e.roundWins)return e.wins+=1,G.gameOverText=`${e.name} WINS THE MATCH`,document.getElementById("gameOverSubtext").innerText="Press `R` for rematch.",!0}),document.getElementById("gameOverContainer").style.display="flex",document.getElementById("gameOverText").innerText=G.gameOverText,E(),g.pause()}else{for(let t=0;t<G.players.length;t++){K(G.players[t],e)}if("1P"===G.mode&&G.bit){const e=G.players[0],o=f(0,e.score/2e3);G.bit.direction&&0!==o&&function(){const e=G.bit.group.translation.clone();return e.addSelf(G.bit.direction),!(e.x>t-0||e.x<0||e.y>n-0||e.y<0)}()||function(){const e=[d,u,a,c][f(0,3)];G.bit.direction=e}(),G.bit.group.translation.addSelf(G.bit.direction),v(G.bit.group._collection[0].getBoundingClientRect()).didCollide&&(e.score+=250,I())}for(let e=0;e<G.players.length;e++)G.players[e].alive||(G.gameOver=!0)}stats.end()})}();
