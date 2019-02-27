!function(){"use strict";const e=16,t=36*e,n=36*e,o=6,r=3,i=[3,4,6,14,16],s=6,l=4,a=new Two.Vector(-1,0),c=new Two.Vector(1,0),d=new Two.Vector(0,-1),u=new Two.Vector(0,1),m="lightcycles/HISCORE",p=new Two({width:t,height:n}).appendTo(document.getElementById("stage"));function g(e,o=null,r=0,i=!1){function l(e,t,n=0){let r=0,i=0,l=0,a=0;if(o&&("up"===o.direction?i=s:"down"===o.direction?r=s:"left"===o.direction?l=s:"right"===o.direction&&(a=s)),!(e.right<t.left+n+l||e.left>t.right-n-a||e.bottom<t.top+n+i||e.top>t.bottom-n-r))return!0}const m={didCollide:!1};if(G.bit&&l(e,G.bit.group.getBoundingClientRect())&&(m.obtainedBit=!0),!i&&(e.right>=t||e.left<=0||e.bottom>=n||e.top<=0))return m.didCollide=!0,m;for(let t=0;t<G.players.length;t++){if(o&&o.name!==G.players[t].name&&l(e,G.players[t].group._collection[1].getBoundingClientRect(),r))return m.didCollide=!0,m;for(let n=0;n<G.players[t].lightTrails.length;n++){let i=G.players[t].lightTrails[n];if(o&&i.origin.equals(o.currentOrigin))continue;let s=i.getBoundingClientRect();l(e,s,r)&&(m.didCollide=!0,e.right>s.right?m.oppositeDir=c:e.left<s.left?m.oppositeDir=a:e.bottom>s.bottom?m.oppositeDir=u:e.top<s.top&&(m.oppositeDir=d))}}return m}const f={"sound/speed1.ogg":!1,"sound/speed2.ogg":!1,"sound/speed3.ogg":!1,"sound/slipstream.ogg":!1,"sound/shiftup.mp3":!1,"sound/rezzin.ogg":!1,"sound/bit_spawn.ogg":!1,"sound/playerjoin.ogg":!1,"sound/derezz.mp3":!1,"sound/timertick.ogg":!1};function y(){G.players.forEach(async function(e){await e.soundPromise,e.sound.pause()})}function h(){new Audio("sound/bit_spawn.ogg").play()}function w(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}function k(e,t,n,o,r,i,l=1,a=3,c=s){const d=[];for(let s=0;s<r;s++){const r=p.makePolygon(e.x+w(-c,c),e.y+w(-c,c),w(l,a),3);r.fill=t,r.noStroke(),r.rotation=w(-10,10),r.translation.addSelf(new Two.Vector(w(n*c,n*i),w(o*c,o*i))),d.push(r)}return p.makeGroup(...d)}function T(e){let t=0,n=0;return"up"===e?n=1:"down"===e?n=-1:"right"===e?t=-1:"left"===e&&(t=1),{oppX:t,oppY:n}}function v(){const e=document.getElementById("timer").classList;G.gameTimer.timeLeft<=5?(e.contains("time-low")||e.add("time-low"),new Audio("sound/timertick.ogg").play()):e.contains("time-low")&&e.remove("time-low")}const b=(e,t)=>{clearInterval(G.gameTimer.id);const n={id:null,start:null,timeLeft:null,totalTime:e};G.gameTimer=n,G.gameTimer.timeLeft=e,document.getElementById("timer").classList.remove("time-low"),document.getElementById("timer").innerText=e,G.gameTimer.start=Date.now(),v(),G.gameTimer.id=setInterval(()=>{const e=Date.now()-G.gameTimer.start,n=document.getElementById("timer");G.gameTimer.timeLeft=G.gameTimer.totalTime-Math.floor(e/1e3),n.innerText=G.gameTimer.timeLeft,G.gameTimer.timeLeft<=0&&t&&t(),v()},1e3)};function C(e,t,n){document.getElementById(e).innerHTML=`\n    <h3>${t}</h3>\n    <div class="blink">\n      <p><small class="tiny">PRESS</small></p>\n      <p class="centered">${n}</p>\n      <p><small class="tiny">TO JOIN</small></p>\n    </div>\n  `}function O(e){const{el:t,name:n,wins:o,roundWins:r,speed:i,score:s}=e;let l="",a="",c="";if("2P"===G.mode){let e=['<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>'];for(let t=0;t<r;t++)e[t]='<span class="windot">&#9679;</span>';l=`<p><small>ROUND</small></p>\n    <div class="rounds">${e.join("")}</div>`,a=o>0?`<small class="tiny">\n            WINS: <span id="${n}-wins">${o}</span>\n          </small>`:""}else if("1P"===G.mode){c=`<p><small>SCORE</small></p>\n    <p><small>${s}</small></p>`;const e=localStorage.getItem(m);e>0&&(c+=`<p><small>RECORD</small></p>\n    <p><small>${e}</small></p>`)}document.getElementById(t).innerHTML=`\n    <div>\n      <h3>${n}</h3>\n      ${l}\n      <p><small>SPEED</small></p>\n      <h3 id="${n}-speed">${i}</h3>\n      ${a}\n      ${c}\n    </div>`}function E(e,t,n,o){const r=p.makeCircle(e,t,s);r.stroke=n,r.fill=o,r.linewidth=2;const i=p.makeRectangle(e,t,l,l);i.fill="red",i.noFill(),i.noStroke();const a=p.makeGroup(r,i);return a.center(),a.translation.set(e,t),a}function F(e,t,n,o,r,i,s,l,a,c,d){const u={el:d,name:e,prevDirection:o,direction:o,lastMoveFrame:0,_speed:1,get speed(){return this._speed},set speed(t){document.getElementById(`${e}-speed`).innerText=t,this._speed=t},get wins(){return this._wins},set wins(e){this._wins=e,O(this)},_roundWins:i,get roundWins(){return this._roundWins},set roundWins(e){this._roundWins=e,O(this)},_score:0,get score(){return this._score},set score(e){this._score=e,O(this)},isAccelerating:!1,isBraking:!1,lastDecelerateFrame:0,lastAccelerateFrame:0,lastBrakeFrame:0,alive:!0,_wins:r,group:E(t,n,s,l),fillColor:l,strokeColor:s,originalStroke:s,turboColor:a,sparkColor:c,currentOrigin:new Two.Vector(t,n),lightTrails:[],corpse:null,sparks:null,sound:new Audio,soundPromise:null};return O(u),u}function R(n=!1){return F("P1",Math.round(t/2),8*e,"down",G.user?G.user.wins:0,n&&G.user?G.user.roundWins:0,"#3498db","#ffffff","#67CBFF","#E7FFFF","userHud")}function P(o=!1){return F("P2",Math.round(t/2),n-8*e,"up",G.enemy?G.enemy.wins:0,o&&G.enemy?G.enemy.roundWins:0,"#e67e22","#000000","#FFB155","#FFFFD5","enemyHud")}function S(e=!1){1===G.noPlayer?(G.enemy=P(0),G.players=[G.enemy],C("userHud","P1","W")):2===G.noPlayer?(G.user=R(0),G.players=[G.user],C("enemyHud","P2",'<span>UP</span> <small class="tiny">ARROW</small>')):(G.user=R(e),G.enemy=P(e),G.players=[G.user,G.enemy])}function A(){let e,o,r;G.bit&&p.remove(G.bit.group),(r=p.makeCircle(0,0,6)).fill="#1abc9c",r.noStroke(),r.opacity=.9,(o=p.makeCircle(0,0,4)).fill="#E6FFFF",o.noStroke(),(e=p.makeGroup(r,o)).center(),e.translation.set(w(0,t),w(0,n)),G.bit={group:e,direction:null},g(G.bit.group.getBoundingClientRect()).didCollide?A():h()}const B="KeyT",D="BracketRight";function x(e,t){("down"===t&&"up"!==e.prevDirection||"up"===t&&"down"!==e.prevDirection||"right"===t&&"left"!==e.prevDirection||"left"===t&&"right"!==e.prevDirection)&&(e.direction=t)}function I(e){e.isAccelerating||new Audio("sound/shiftup.mp3").play(),e.isAccelerating=!0}function $(){new Audio("sound/playerjoin.ogg").play(),G.firstRun=!0,G.noPlayer=null,G.mode="2P",G.roundTime=30,W()}function W(){p.pause(),G.players.length>0&&(G.players.forEach(e=>{p.remove(e.group),p.remove(e.corpse),p.remove(e.sparks),e.lightTrails.forEach(e=>{p.remove(e)})}),y()),G.bit&&(p.remove(G.bit.group),G.bit=null),G.gameOverText=null,G.gameOver=!1,document.getElementById("gameOverContainer").style.display="none",!G.players||G.players.some(e=>3===e.roundWins)?S():S(!0),p.update(),y(),new Audio("sound/rezzin.ogg").play(),b(3,()=>{b(G.roundTime,()=>{G.gameOver=!0}),G.noPlayer&&A(),G.players.forEach(e=>{e.sound.src="sound/speed1.ogg",e.soundPromise=e.sound.play().catch(e=>{})}),G.instance.play()})}function M(e){const t=p.makeLine(e.currentOrigin.x,e.currentOrigin.y,e.group.translation.x,e.group.translation.y);if(t.stroke=e.strokeColor,t.linewidth=6,t.opacity=.9,t.origin=e.currentOrigin,e.lightTrails.length>0){const n=e.lightTrails[e.lightTrails.length-1];n.origin.equals(t.origin)&&n.stroke===t.stroke&&p.remove(e.lightTrails.pop())}e.lightTrails.push(t)}function L(e,t){let n=0;e.isAccelerating?e.speed<o&&t-e.lastAccelerateFrame>i[e.speed-1]&&(e.speed+=1,e.lastAccelerateFrame=t):t-e.lastDecelerateFrame>r&&e.speed>1&&(e.speed-=1,e.lastDecelerateFrame=t);const m=g(e.group._collection[0].getBoundingClientRect(),e,0,!0);m.didCollide&&(n=Math.ceil(.5*e.speed),e.strokeColor!==e.turboColor&&e.speed+n>o&&(e.strokeColor=e.turboColor,e.currentOrigin=e.group.translation.clone())),e.strokeColor===e.turboColor&&e.speed+n<=o&&(e.strokeColor=e.originalStroke,e.currentOrigin=e.group.translation.clone());const f=e.group.translation;for(let o=1;o<=e.speed+n;o++){switch("2P"===G.mode&&(e.score+=1),e.direction!==e.prevDirection&&(e.currentOrigin=e.group.translation.clone(),e.prevDirection=e.direction,e.lastMoveFrame=t,e.sound.currentTime=0),e.direction){case"left":f.addSelf(a);break;case"right":f.addSelf(c);break;case"up":f.addSelf(d);break;case"down":f.addSelf(u)}const n=g(e.group._collection[1].getBoundingClientRect(),e,l/2);if(n.didCollide){new Audio("sound/derezz.mp3").play(),e.alive=!1,p.remove(e.group);const{oppX:t,oppY:n}=T(e.direction);return void(e.corpse=k(e.group.translation,e.fillColor,t,n,w(3,3*e.speed),s*e.speed*(e.speed/2),2,3))}n.obtainedBit&&(e.score+=250,y=Math.max(10-Math.floor(e.score/2e3),5),G.gameTimer.start=Date.now(),G.gameTimer.totalTime=y,document.getElementById("timer").innerText=y,v(),h(),A())}var y;if(function(e,t){async function n(e,t){const n=e.sound.src.split("/");t!==n.slice(n.length-2,n.length).join("/")&&(await e.soundPromise,e.sound.src=t,e.soundPromise=e.sound.play().catch(e=>{}))}e.isAccelerating&&!e.isBraking?e.speed+t>o?n(e,"sound/slipstream.ogg"):e.speed===o?n(e,"sound/speed3.ogg"):n(e,"sound/speed2.ogg"):n(e,"sound/speed1.ogg")}(e,n),G.toggleTrails?M(e):e.isAccelerating?M(e):e.currentOrigin=e.group.translation.clone(),p.remove(e.sparks),m.didCollide){const t=1+e.speed,{x:n,y:o}=m.oppositeDir||{x:0,y:0},{oppX:r,oppY:i}=T(e.direction);e.sparks=k(e.group.translation,e.sparkColor,n+r*t,o+i*t,w(3,3+e.speed),1+Math.round(2*e.speed),2,2,s/2)}p.remove(e.group),e.group=E(f.x,f.y,e.strokeColor,e.fillColor)}function _(){const e=[d,u,a,c][w(0,3)];G.bit.direction=e}function q(){const e=G.bit.group.translation.clone();return e.addSelf(G.bit.direction),!(e.x>t-10||e.x<10||e.y>n-10||e.y<10)}Object.keys(f).forEach(e=>{var t=new Audio;t.addEventListener("canplaythrough",()=>{f[e]=!0}),t.src=e}),function(){const o=p.makeRectangle(t/2,n/2,t,n);o.fill="#2c3e50",o.stroke="#ecf0f1",o.linewidth=3;for(let o=0;o<=t;o+=e)p.makeLine(o,0,o,n).stroke="#fff";for(let o=0;o<=n;o+=e)p.makeLine(0,o,t,o).stroke="#fff";p.update()}(),document.body.onkeydown=(e=>{if("KeyR"===e.code){const e=document.documentElement;e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen(),G.gameOver&&W()}else if("Pause"===e.code&&G.pauseEnabled)G.instance.playing?G.instance.pause():G.instance.play();else if(!G.enemy&&"ArrowUp"===e.code||!G.user&&"KeyW"===e.code)$();else if(!G.gameOver){if(G.user)switch(e.code){case"KeyS":x(G.user,"down");break;case"KeyW":x(G.user,"up");break;case"KeyA":x(G.user,"left");break;case"KeyD":x(G.user,"right");break;case B:I(G.user)}if(G.enemy)switch(e.code){case"ArrowDown":x(G.enemy,"down");break;case"ArrowUp":x(G.enemy,"up");break;case"ArrowLeft":x(G.enemy,"left");break;case"ArrowRight":x(G.enemy,"right");break;case D:I(G.enemy)}}}),document.body.onkeyup=(e=>{if(!G.gameOver)switch(e.code){case B:G.user&&(G.user.isAccelerating=!1);break;case D:G.enemy&&(G.enemy.isAccelerating=!1)}}),G.instance=p.bind("update",e=>{if(stats.begin(),G.gameOver){clearInterval(G.gameTimer.id);let e="Press `R` to play next round.";if("1P"===G.mode){let t=G.players[0].score;t>(localStorage.getItem(m)||0)?(localStorage.setItem(m,t),e=`You set a new record, ${t} pts!`):e=`You got ${t} pts!`,e+="<p>Press `R` to try again. </p>"}if(G.players.every(e=>!e.alive))"2P"===G.mode?G.gameOverText="DRAW":G.gameOverText="YOU DEREZZED";else if(G.gameTimer.timeLeft<=0){if(G.gameOverText="TIME UP","2P"===G.mode){let t=null,n=0,o="";G.players.forEach(e=>{o+=`<p>${e.name}: ${e.score} pts</p>`,e.score>n?(n=e.score,t=e):e.score===n&&(t=null)}),t?(t.roundWins+=1,e=`${t.name} WINS <p>${t.name} has a longer jetwall. </p>\n          ${o}\n          <p>${e}</p>`):e=`DRAW. <p>${e} </p>`}}else G.players.some(e=>{if(e.alive)return G.gameOverText=`${e.name} WINS`,e.roundWins+=1,!0});document.getElementById("gameOverSubtext").innerHTML=e,G.players.some(e=>{if(3===e.roundWins)return e.wins+=1,G.gameOverText=`${e.name} WINS THE MATCH`,document.getElementById("gameOverSubtext").innerText="Press `R` for rematch.",!0}),document.getElementById("gameOverContainer").style.display="flex",document.getElementById("gameOverText").innerText=G.gameOverText,y(),p.pause()}else{for(let t=0;t<G.players.length;t++)if(L(G.players[t],e),"1P"===G.mode&&G.bit){const e=w(0,G.players[t].score/500);for(G.bit.direction&&0!==e||_();!q();)_();G.bit.group.translation.addSelf(G.bit.direction)}for(let e=0;e<G.players.length;e++)G.players[e].alive||(G.gameOver=!0)}stats.end()})}();
