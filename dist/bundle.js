!function(){"use strict";const e=16,t=36*e,n=36*e,o=6,r=3,i=[3,4,6,14,16],s=6,l=4,a=new Two.Vector(-1,0),c=new Two.Vector(1,0),d=new Two.Vector(0,-1),u=new Two.Vector(0,1),m="lightcycles/HISCORE",p=6,g=new Two({width:t,height:n}).appendTo(document.getElementById("stage"));function f(e,o=null,r=0,i=!1){function l(e,t,n=0){let r=0,i=0,l=0,a=0;const c=s;if(o&&("up"===o.direction?i=c:"down"===o.direction?r=c:"left"===o.direction?l=c:"right"===o.direction&&(a=c)),!(e.right<t.left+n+l||e.left>t.right-n-a||e.bottom<t.top+n+i||e.top>t.bottom-n-r))return!0}const m={didCollide:!1};if(G.bit&&l(e,G.bit.group.getBoundingClientRect())&&(m.obtainedBit=!0),!i&&(e.right>=t||e.left<=0||e.bottom>=n||e.top<=0))return m.didCollide=!0,m;for(let t=0;t<G.players.length;t++){if(o&&o.name!==G.players[t].name&&l(e,G.players[t].group._collection[1].getBoundingClientRect(),r))return m.didCollide=!0,m;for(let n=0;n<G.players[t].lightTrails.length;n++){let i=G.players[t].lightTrails[n];if(o&&i.origin.equals(o.currentOrigin))continue;let s=i.getBoundingClientRect();l(e,s,r)&&(m.didCollide=!0,e.right>s.right?m.oppositeDir=c:e.left<s.left?m.oppositeDir=a:e.bottom>s.bottom?m.oppositeDir=u:e.top<s.top&&(m.oppositeDir=d))}}return m}const y={"sound/speed1.ogg":!1,"sound/speed2.ogg":!1,"sound/speed3.ogg":!1,"sound/slipstream.ogg":!1,"sound/shiftup.mp3":!1,"sound/rezzin.ogg":!1,"sound/bit_spawn.ogg":!1,"sound/playerjoin.ogg":!1,"sound/derezz.mp3":!1,"sound/timertick.ogg":!1};function h(){G.players.forEach(async function(e){await e.soundPromise,e.sound.pause()})}function w(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}function T(e,t,n,o,r,i,l=1,a=3,c=s){const d=[];for(let s=0;s<r;s++){const r=g.makePolygon(e.x+w(-c,c),e.y+w(-c,c),w(l,a),3);r.fill=t,r.noStroke(),r.rotation=w(-10,10),r.translation.addSelf(new Two.Vector(w(n*c,n*i),w(o*c,o*i))),d.push(r)}return g.makeGroup(...d)}function k(e){let t=0,n=0;return"up"===e?n=1:"down"===e?n=-1:"right"===e?t=-1:"left"===e&&(t=1),{oppX:t,oppY:n}}function b(){const e=document.getElementById("timer").classList;G.gameTimer.timeLeft<=5?(e.contains("time-low")||e.add("time-low"),new Audio("sound/timertick.ogg").play()):e.contains("time-low")&&e.remove("time-low")}const v=(e,t)=>{clearInterval(G.gameTimer.id);const n={id:null,start:null,timeLeft:null,totalTime:e};G.gameTimer=n,G.gameTimer.timeLeft=e,document.getElementById("timer").classList.remove("time-low"),document.getElementById("timer").innerText=e,G.gameTimer.start=Date.now(),b(),G.gameTimer.id=setInterval(()=>{const e=Date.now()-G.gameTimer.start,n=document.getElementById("timer");G.gameTimer.timeLeft=G.gameTimer.totalTime-Math.floor(e/1e3),n.innerText=G.gameTimer.timeLeft,G.gameTimer.timeLeft<=0&&t&&t(),b()},1e3)};function C(e){G.gameTimer.start=Date.now(),G.gameTimer.totalTime=e,document.getElementById("timer").innerText=e,b()}function O(e,t,n){document.getElementById(e).innerHTML=`\n    <h3>${t}</h3>\n    <div class="blink">\n      <p><small class="tiny">PRESS</small></p>\n      <p class="centered">${n}</p>\n      <p><small class="tiny">TO JOIN</small></p>\n    </div>\n  `}function E(e){const{el:t,name:n,wins:o,roundWins:r,speed:i,score:s}=e;let l="",a="",c="";if("2P"===G.mode){let e=['<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>'];for(let t=0;t<r;t++)e[t]='<span class="windot">&#9679;</span>';l=`<p><small>ROUND</small></p>\n    <div class="rounds">${e.join("")}</div>`,a=o>0?`<small class="tiny">\n            WINS: <span id="${n}-wins">${o}</span>\n          </small>`:""}else if("1P"===G.mode){c=`<p><small>SCORE</small></p>\n    <p><small>${s}</small></p>`;const e=localStorage.getItem(m);e>0&&(c+=`<p><small>RECORD</small></p>\n    <p><small>${e}</small></p>`)}document.getElementById(t).innerHTML=`\n    <div>\n      <h3>${n}</h3>\n      ${l}\n      <p><small>SPEED</small></p>\n      <h3 id="${n}-speed">${i}</h3>\n      ${a}\n      ${c}\n    </div>`}function R(e,t,n,o){const r=g.makeCircle(e,t,s);r.stroke=n,r.fill=o,r.linewidth=2;const i=g.makeRectangle(e,t,l,l);i.fill="red",i.noFill(),i.noStroke();const a=g.makeGroup(r,i);return a.center(),a.translation.set(e,t),a}function B(e,t,n,o,r,i,s,l,a,c,d){const u={el:d,name:e,direction:o,directionBuffer:[],lastMoveDist:0,_speed:1,get speed(){return this._speed},set speed(t){document.getElementById(`${e}-speed`).innerText=t,this._speed=t},get wins(){return this._wins},set wins(e){this._wins=e,E(this)},_roundWins:i,get roundWins(){return this._roundWins},set roundWins(e){this._roundWins=e,E(this)},_score:0,get score(){return this._score},set score(e){this._score=e,E(this)},isAccelerating:!1,lastDecelerateFrame:0,lastAccelerateFrame:0,alive:!0,_wins:r,group:R(t,n,s,l),fillColor:l,strokeColor:s,originalStroke:s,turboColor:a,sparkColor:c,currentOrigin:new Two.Vector(t,n),lightTrails:[],corpse:null,sparks:null,sound:new Audio,soundPromise:null};return E(u),u}function F(n=!1){return B("P1",Math.round(t/2),8*e,"down",G.user?G.user.wins:0,n&&G.user?G.user.roundWins:0,"#3498db","#ffffff","#67CBFF","#E7FFFF","userHud")}function P(o=!1){return B("P2",Math.round(t/2),n-8*e,"up",G.enemy?G.enemy.wins:0,o&&G.enemy?G.enemy.roundWins:0,"#e67e22","#000000","#FFB155","#FFFFD5","enemyHud")}function S(e=!1){1===G.noPlayer?(G.enemy=P(0),G.players=[G.enemy],O("userHud","P1","W")):2===G.noPlayer?(G.user=F(0),G.players=[G.user],O("enemyHud","P2",'<span>UP</span> <small class="tiny">ARROW</small>')):(G.user=F(e),G.enemy=P(e),G.players=[G.user,G.enemy])}function A(){let e,o,r;G.bit&&g.remove(G.bit.group),(r=g.makeCircle(0,0,6)).fill="#1abc9c",r.noStroke(),r.opacity=.9,(o=g.makeCircle(0,0,4)).fill="#E6FFFF",o.noStroke(),(e=g.makeGroup(r,o)).center(),e.translation.set(w(0,t),w(0,n)),G.bit={group:e,direction:null},f(G.bit.group.getBoundingClientRect()).didCollide?A():new Audio("sound/bit_spawn.ogg").play()}const x="KeyT",I="BracketRight";function D(e,t){const n=e.directionBuffer;n.length<2?n.push(t):(n.shift(),n.push(t))}function $(e){e.isAccelerating||new Audio("sound/shiftup.mp3").play(),e.isAccelerating=!0}function M(){new Audio("sound/playerjoin.ogg").play(),G.firstRun=!0,G.noPlayer=null,G.mode="2P",G.roundTime=30,W()}function W(){g.pause(),G.players.length>0&&(G.players.forEach(e=>{g.remove(e.group),g.remove(e.corpse),g.remove(e.sparks),e.lightTrails.forEach(e=>{g.remove(e)})}),h()),G.bit&&(g.remove(G.bit.group),G.bit=null),G.gameOverText=null,G.gameOver=!1,document.getElementById("gameOverContainer").style.display="none",!G.players||G.players.some(e=>3===e.roundWins)?S():S(!0),g.update(),h(),new Audio("sound/rezzin.ogg").play(),v(3,()=>{v(G.roundTime,()=>{G.gameOver=!0}),G.noPlayer&&A(),G.players.forEach(e=>{e.sound.src="sound/speed1.ogg",e.soundPromise=e.sound.play().catch(e=>{})}),G.instance.play()})}function L(e,t){return!("up"===e&&"down"===t.direction||"down"===e&&"up"===t.direction||"left"===e&&"right"===t.direction||"right"===e&&"left"===t.direction)}function _(e){const t=g.makeLine(e.currentOrigin.x,e.currentOrigin.y,e.group.translation.x,e.group.translation.y);if(t.stroke=e.strokeColor,t.linewidth=p,t.opacity=.9,t.origin=e.currentOrigin,e.lightTrails.length>0){const n=e.lightTrails[e.lightTrails.length-1];n.origin.equals(t.origin)&&n.stroke===t.stroke&&g.remove(e.lightTrails.pop())}e.lightTrails.push(t)}function q(e,t){let n=0;e.isAccelerating?e.speed<o&&t-e.lastAccelerateFrame>i[e.speed-1]&&(e.speed+=1,e.lastAccelerateFrame=t):t-e.lastDecelerateFrame>r&&e.speed>1&&(e.speed-=1,e.lastDecelerateFrame=t);const m=f(e.group._collection[0].getBoundingClientRect(),e,2,!0);m.didCollide&&(n=Math.ceil(.5*e.speed),e.strokeColor!==e.turboColor&&e.speed+n>o&&(e.strokeColor=e.turboColor,e.currentOrigin=e.group.translation.clone())),e.strokeColor===e.turboColor&&e.speed+n<=o&&(e.strokeColor=e.originalStroke,e.currentOrigin=e.group.translation.clone());const p=e.group.translation,y=s/2+1;for(let t=0;t<e.speed+n;t++){switch("2P"===G.mode&&(e.score+=1),e.directionBuffer.length>0&&e.lastMoveDist>y&&L(e.directionBuffer[0],e)&&(e.direction=e.directionBuffer.shift(),e.lastMoveDist=0,e.currentOrigin=e.group.translation.clone(),e.sound.currentTime=0),e.lastMoveDist+=1,e.direction){case"left":p.addSelf(a);break;case"right":p.addSelf(c);break;case"up":p.addSelf(d);break;case"down":p.addSelf(u)}const t=f(e.group._collection[1].getBoundingClientRect(),e,l/2);if(t.didCollide){new Audio("sound/derezz.mp3").play(),e.alive=!1,g.remove(e.group);const{oppX:t,oppY:n}=k(e.direction);return void(e.corpse=T(e.group.translation,e.fillColor,t,n,w(3,3*e.speed),s*e.speed*(e.speed/2),2,3))}t.obtainedBit&&(e.score+=250,C(Math.max(10-Math.floor(e.score/2e3),5)),A())}if(function(e,t){async function n(e,t){const n=e.sound.src.split("/");t!==n.slice(n.length-2,n.length).join("/")&&(await e.soundPromise,e.sound.src=t,e.soundPromise=e.sound.play().catch(e=>{}))}e.isAccelerating&&!e.isBraking?e.speed+t>o?n(e,"sound/slipstream.ogg"):e.speed===o?n(e,"sound/speed3.ogg"):n(e,"sound/speed2.ogg"):n(e,"sound/speed1.ogg")}(e,n),G.toggleTrails?e.isAccelerating?_(e):e.currentOrigin=e.group.translation.clone():_(e),g.remove(e.sparks),m.didCollide){const t=1+e.speed,{x:n,y:o}=m.oppositeDir||{x:0,y:0},{oppX:r,oppY:i}=k(e.direction);e.sparks=T(e.group.translation,e.sparkColor,n+r*t,o+i*t,w(3,3+e.speed),1+Math.round(2*e.speed),2,2,s/2)}g.remove(e.group),e.group=R(p.x,p.y,e.strokeColor,e.fillColor)}function z(){const e=[d,u,a,c][w(0,3)];G.bit.direction=e}function H(){const e=G.bit.group.translation.clone();return e.addSelf(G.bit.direction),!(e.x>t-0||e.x<0||e.y>n-0||e.y<0)}Object.keys(y).forEach(e=>{var t=new Audio;t.addEventListener("canplaythrough",()=>{y[e]=!0}),t.src=e}),function(){const o=g.makeRectangle(t/2,n/2,t,n);o.fill="#2c3e50",o.stroke="#ecf0f1",o.linewidth=3;for(let o=0;o<=t;o+=e)g.makeLine(o,0,o,n).stroke="#fff";for(let o=0;o<=n;o+=e)g.makeLine(0,o,t,o).stroke="#fff";g.update()}(),document.body.onkeydown=(e=>{if("KeyR"===e.code){const e=document.documentElement;e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen(),G.gameOver&&W()}else if("Pause"===e.code&&G.pauseEnabled)G.instance.playing?G.instance.pause():G.instance.play();else if(!G.enemy&&"ArrowUp"===e.code||!G.user&&"KeyW"===e.code)M();else if(!G.gameOver){if(G.user)switch(e.code){case"KeyS":D(G.user,"down");break;case"KeyW":D(G.user,"up");break;case"KeyA":D(G.user,"left");break;case"KeyD":D(G.user,"right");break;case x:$(G.user)}if(G.enemy)switch(e.code){case"ArrowDown":D(G.enemy,"down");break;case"ArrowUp":D(G.enemy,"up");break;case"ArrowLeft":D(G.enemy,"left");break;case"ArrowRight":D(G.enemy,"right");break;case I:$(G.enemy)}}}),document.body.onkeyup=(e=>{if(!G.gameOver)switch(e.code){case x:G.user&&(G.user.isAccelerating=!1);break;case I:G.enemy&&(G.enemy.isAccelerating=!1)}}),G.instance=g.bind("update",e=>{if(stats.begin(),G.gameOver){clearInterval(G.gameTimer.id);let e="Press `R` to play next round.";if("1P"===G.mode){let t=G.players[0].score;t>(localStorage.getItem(m)||0)?(localStorage.setItem(m,t),e=`You set a new record, ${t} pts!`):e=`You got ${t} pts!`,e+="<p>Press `R` to try again. </p>"}if(G.players.every(e=>!e.alive))"2P"===G.mode?G.gameOverText="DRAW":G.gameOverText="YOU DEREZZED";else if(G.gameTimer.timeLeft<=0){if(G.gameOverText="TIME UP","2P"===G.mode){let t=null,n=0,o="";G.players.forEach(e=>{o+=`<p>${e.name}: ${e.score} pts</p>`,e.score>n?(n=e.score,t=e):e.score===n&&(t=null)}),t?(t.roundWins+=1,e=`${t.name} WINS <p>${t.name} has a longer jetwall. </p>\n          ${o}\n          <p>${e}</p>`):e=`DRAW. <p>${e} </p>`}}else G.players.some(e=>{if(e.alive)return G.gameOverText=`${e.name} WINS`,e.roundWins+=1,!0});document.getElementById("gameOverSubtext").innerHTML=e,G.players.some(e=>{if(3===e.roundWins)return e.wins+=1,G.gameOverText=`${e.name} WINS THE MATCH`,document.getElementById("gameOverSubtext").innerText="Press `R` for rematch.",!0}),document.getElementById("gameOverContainer").style.display="flex",document.getElementById("gameOverText").innerText=G.gameOverText,h(),g.pause()}else{for(let t=0;t<G.players.length;t++){const n=G.players[t];if(q(n,e),"1P"===G.mode&&G.bit){f(G.bit.group.getBoundingClientRect()).didCollide&&(n.score+=250,C(Math.max(10-Math.floor(n.score/2e3),5)),A());const e=w(0,n.score/2e3);for(G.bit.direction&&0!==e||z();!H();)z();G.bit.group.translation.addSelf(G.bit.direction)}}for(let e=0;e<G.players.length;e++)G.players[e].alive||(G.gameOver=!0)}stats.end()})}();
