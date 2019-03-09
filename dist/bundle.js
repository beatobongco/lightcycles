!function(){"use strict";const e=16,t=36*e,o=36*e,n=6,i=3,r=[3,4,6,9,13],s=6,l=4,a=new Two.Vector(-1,0),d=new Two.Vector(1,0),c=new Two.Vector(0,-1),u=new Two.Vector(0,1),p="lightcycles/HISCORE",m=6,g=new Two({width:t,height:o}).appendTo(document.getElementById("stage"));function f(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}function y(e,t,o,n,i,r,l=1,a=3,d=s){const c=[];for(let s=0;s<i;s++){const i=g.makePolygon(e.x+f(-d,d),e.y+f(-d,d),f(l,a),3);i.fill=t,i.noStroke(),i.rotation=f(-10,10),i.translation.addSelf(new Two.Vector(f(o*d,o*r),f(n*d,n*r))),c.push(i)}return g.makeGroup(...c)}function h(e){let t=0,o=0;return"up"===e?o=1:"down"===e?o=-1:"right"===e?t=-1:"left"===e&&(t=1),{oppX:t,oppY:o}}const w={"sound/speed1.ogg":!1,"sound/speed2.ogg":!1,"sound/speed3.ogg":!1,"sound/slipstream.ogg":!1,"sound/shiftup.mp3":!1,"sound/rezzin.ogg":!1,"sound/bit_spawn.ogg":!1,"sound/playerjoin.ogg":!1,"sound/derezz.mp3":!1,"sound/timertick.ogg":!1,"sound/shield.ogg":!1,"sound/shield_spawn.ogg":!1,"sound/shield_pickup.ogg":!1};function b(){G.players.forEach(async function(e){await e.soundPromise,e.sound.pause()})}function T(){new Audio("sound/bit_spawn.ogg").play()}function k(e,t,o=0){const n=e.group._collection[1].getBoundingClientRect();let i=0,r=0,l=0,a=0;const d=s;if("up"===e.direction?r=d:"down"===e.direction?i=d:"left"===e.direction?l=d:"right"===e.direction&&(a=d),!(n.right<t.left+o+l||n.left>t.right-o-a||n.bottom<t.top+o+r||n.top>t.bottom-o-i))return!0}function v(e,t,o=0){if(!(e.right<t.left+o||e.left>t.right-o||e.bottom<t.top+o||e.top>t.bottom-o))return!0}function C(e,t=!1){let o=e,n=null,i=v,r=0;e.type&&"player"===e.type&&(o=(n=e).group._collection[1].getBoundingClientRect(),t&&(o=n.group._collection[0].getBoundingClientRect(),r=-4),i=k);const s={didCollide:!1};for(let l=0;l<G.players.length;l++)for(let p=0;p<G.players[l].lightTrails.length;p++){if(t&&n.name===G.players[l].name)continue;let m=G.players[l].lightTrails[p];if(n&&m.origin.equals(n.currentOrigin))continue;let g=m.getBoundingClientRect();i(e,g,r)&&(s.didCollide=!0,s.color=G.players[l].turboColor,o.right>g.right?s.oppositeDir=d:o.left<g.left?s.oppositeDir=a:o.bottom>g.bottom?s.oppositeDir=u:o.top<g.top&&(s.oppositeDir=c))}return s}function D(e){const n={didCollide:!1},i=e.group._collection[1].getBoundingClientRect();if(i.right>=t||i.left<=0||i.bottom>=o||i.top<=0)return n.didCollide=!0,n;for(let t=0;t<G.players.length;t++)if(e.name!==G.players[t].name&&v(e.group._collection[1].getBoundingClientRect(),G.players[t].group._collection[1].getBoundingClientRect()))return n.didCollide=!0,n;const r=C(e,!1);if(r.didCollide){if(!e.hasShield)return r;n.didCollide=!1,0===e.shieldDist&&(new Audio("sound/shield.ogg").play(),e.corpses.push(y(e.group.translation,r.color,0,0,f(3,3*e.speed),s*e.speed,2,3,2*s))),e.shieldDist+=1}return G.bit&&v(i,G.bit.group.getBoundingClientRect())&&(n.obtainedBit=!0),n}function E(e){const n={didCollide:!1};return e.right>=t||e.left<=0||e.bottom>=o||e.top<=0?(n.didCollide=!0,e.right>=t?n.oppositeDir=a:e.left<=0?n.oppositeDir=d:e.bottom>=o?n.oppositeDir=c:e.top<=0&&(n.oppositeDir=u),n):C(e)}function O(){const e=document.getElementById("timer").classList;G.gameTimer.timeLeft<=5?(e.contains("time-low")||e.add("time-low"),new Audio("sound/timertick.ogg").play()):e.contains("time-low")&&e.remove("time-low")}const S=(e,t)=>{clearInterval(G.gameTimer.id);const o={id:null,start:null,timeLeft:null,totalTime:e};G.gameTimer=o,G.gameTimer.timeLeft=e,document.getElementById("timer").classList.remove("time-low"),document.getElementById("timer").innerText=e,G.gameTimer.start=Date.now(),O(),G.gameTimer.id=setInterval(()=>{const e=Date.now()-G.gameTimer.start,o=document.getElementById("timer");G.gameTimer.timeLeft=G.gameTimer.totalTime-Math.floor(e/1e3),o.innerText=G.gameTimer.timeLeft,t(G.gameTimer.timeLeft),O()},1e3)};function B(e,t,o){document.getElementById(e).innerHTML=`\n    <h3>${t}</h3>\n    <div class="blink">\n      <p><small class="tiny">PRESS</small></p>\n      <p class="centered">${o}</p>\n      <p><small class="tiny">TO JOIN</small></p>\n    </div>\n  `}function R(e){const{el:t,name:o,wins:n,roundWins:i,speed:r,score:s}=e;let l="",a="",d="";if("2P"===G.mode){let e=['<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>','<span class="windot">&#9675;</span>'];for(let t=0;t<i;t++)e[t]='<span class="windot">&#9679;</span>';l=`<p><small>ROUND</small></p>\n    <div class="rounds">${e.join("")}</div>`,a=n>0?`<small class="tiny">\n            WINS: <span id="${o}-wins">${n}</span>\n          </small>`:""}if(d=`<p><small>SCORE</small></p>\n  <p><small>${s}</small></p>`,"1P"===G.mode){const e=localStorage.getItem(p);e>0&&(d+=`<p><small>RECORD</small></p>\n    <p><small>${e}</small></p>`)}document.getElementById(t).innerHTML=`\n    <div>\n      <h3>${o}</h3>\n      ${l}\n      <p><small>SPEED</small></p>\n      <h3 id="${o}-speed">${r}</h3>\n      ${d}\n      ${a}\n    </div>`}function x(e,t,o,n){const i=g.makeCircle(e,t,s);i.stroke=o,i.fill=n,i.linewidth=2;const r=g.makeRectangle(e,t,l,l);r.fill="red",r.noFill(),r.noStroke();const a=g.makeGroup(i,r);return a.center(),a.translation.set(e,t),a}function F(e,t,o,n,i,r,s,l,a,d,c){const u={el:c,name:e,direction:n,directionBuffer:[],lastMoveDist:0,_speed:1,get speed(){return this._speed},set speed(t){document.getElementById(`${e}-speed`).innerText=t,this._speed=t},get wins(){return this._wins},set wins(e){this._wins=e,R(this)},_roundWins:r,get roundWins(){return this._roundWins},set roundWins(e){this._roundWins=e,R(this)},_score:0,get score(){return this._score},set score(e){this._score=e,R(this)},type:"player",isAccelerating:!1,lastDecelerateFrame:0,lastAccelerateFrame:0,alive:!0,_wins:i,group:x(t,o,s,l),fillColor:l,strokeColor:s,originalStroke:s,originalFill:l,turboColor:a,sparkColor:d,currentOrigin:new Two.Vector(t,o),lightTrails:[],corpses:[],sparks:null,sound:new Audio,soundPromise:null,hasShield:!1,shieldDist:0};return R(u),u}function A(o=!1){return F("P1",Math.round(t/2),8*e,"down",G.user?G.user.wins:0,o&&G.user?G.user.roundWins:0,"#3498db","#ffffff","#67CBFF","#E7FFFF","userHud")}function P(n=!1){return F("P2",Math.round(t/2),o-8*e,"up",G.enemy?G.enemy.wins:0,n&&G.enemy?G.enemy.roundWins:0,"#e67e22","#000000","#FFB155","#FFFFD5","enemyHud")}function I(e=!1){1===G.noPlayer?(G.enemy=P(0),G.players=[G.enemy],B("userHud","P1","W")):2===G.noPlayer?(G.user=A(0),G.players=[G.user],B("enemyHud","P2",'<span>UP</span> <small class="tiny">ARROW</small>')):(G.user=A(e),G.enemy=P(e),G.players=[G.user,G.enemy])}function _(e){let n="normal";e?n=G.bit.type:0===f(0,4)&&(n="shield"),G.bit&&G.bit.remove();let i,r,s,l="#1abc9c",p="#E6FFFF";"shield"===n&&(p="#0652DD",l="#1B1464"),(s=g.makeCircle(0,0,7)).fill=l,s.noStroke(),s.opacity=.9,(r=g.makeCircle(0,0,5)).fill=p,r.noStroke(),(i=g.makeGroup(s,r)).center(),i.translation.set(f(0,t),f(0,o)),G.bit={group:i,direction:null,type:n,timeLeft:10,updateText:function(){G.bit.timeText&&g.remove(G.bit.timeText);const{x:e,y:t}=this.group.translation;G.bit.timeText=g.makeText(this.timeLeft,e+8,t-8,{fill:"white",family:"Press Start 2P",size:8})},remove:function(){g.remove(this.timeText),g.remove(this.group),G.bit=null},move:function(){f(0,1);!function(){const e=[c,u,a,d];let t=f(0,e.length-1),o=e.splice(t,1)[0];G.bit.group.translation.clone().addSelf(o),G.bit.group.translation.addSelf(o),G.bit.direction=o;const n=E(G.bit.group._collection[1].getBoundingClientRect());n.didCollide&&(G.bit.group.translation.subSelf(o),G.bit.group.translation.addSelf(n.oppositeDir),G.bit.direction=n.oppositeDir)}(),G.bit.updateText()}},G.bit.updateText(),E(G.bit.group.getBoundingClientRect()).didCollide?_():"shield"===n?new Audio("sound/shield_spawn.ogg").play():T()}const L="KeyT",$="BracketRight",W="Numpad1";function M(e,t){const o=e.directionBuffer;2===o.length&&o.shift(),o.push(t)}function z(e){e.isAccelerating||new Audio("sound/shiftup.mp3").play(),e.isAccelerating=!0}function q(){new Audio("sound/playerjoin.ogg").play(),G.firstRun=!0,G.noPlayer=null,G.mode="2P",G.roundTime=30,H()}function H(){document.getElementsByClassName("controls")[0].style.display="none",g.pause(),G.players.length>0&&(G.players.forEach(e=>{g.remove(e.group),e.corpses.forEach(e=>{g.remove(e)}),g.remove(e.sparks),e.lightTrails.forEach(e=>{g.remove(e)})}),b()),G.bit&&G.bit.remove(),G.gameOverText=null,G.gameOver=!1,document.getElementById("gameOverContainer").style.display="none",!G.players||G.players.some(e=>3===e.roundWins)?I():I(!0),g.update(),b(),new Audio("sound/rezzin.ogg").play(),S(3,e=>{e<=0&&(S(G.roundTime,e=>{G.bit&&(G.bit.timeLeft-=1,G.bit.updateText()),e<=0?G.gameOver=!0:e%5!=0||G.bit?G.bit&&G.bit.timeLeft<=0&&_(!0):_()}),_(),G.players.forEach(e=>{e.sound.src="sound/speed1.ogg",e.soundPromise=e.sound.play().catch(e=>{})}),G.instance.play())})}function N(e,t){return("up"!==e&&"down"!==e||"up"!==t.direction&&"down"!==t.direction)&&("left"!==e&&"right"!==e||"left"!==t.direction&&"right"!==t.direction)}function K(e){const t=g.makeLine(e.currentOrigin.x,e.currentOrigin.y,e.group.translation.x,e.group.translation.y);if(t.stroke=e.strokeColor,t.linewidth=m,t.opacity=.9,t.origin=e.currentOrigin,e.lightTrails.length>0){const o=e.lightTrails[e.lightTrails.length-1];o.origin.equals(t.origin)&&o.stroke===t.stroke&&g.remove(e.lightTrails.pop())}e.lightTrails.push(t)}function U(e,t){let o=0;e.isAccelerating?e.speed<n&&t-e.lastAccelerateFrame>r[e.speed-1]&&(e.speed+=1,e.lastAccelerateFrame=t):t-e.lastDecelerateFrame>i&&e.speed>1&&(e.speed-=1,e.lastDecelerateFrame=t);const p=C(e,!0);p.didCollide&&(o=Math.ceil(.5*e.speed),e.strokeColor!==e.turboColor&&e.speed+o>n&&(e.strokeColor=e.turboColor,e.currentOrigin=e.group.translation.clone())),e.strokeColor===e.turboColor&&e.speed+o<=n&&(e.strokeColor=e.originalStroke,e.currentOrigin=e.group.translation.clone());const w=e.group.translation,b=l/2+m/2;e.score+=Math.ceil((e.speed+o)/2);for(let t=0;t<e.speed+o;t++){if(e.directionBuffer.length>0&&e.lastMoveDist>b){const t=e.directionBuffer.shift();N(t,e)&&(e.direction=t,e.lastMoveDist=0,e.currentOrigin=e.group.translation.clone(),e.sound.currentTime=0)}switch(e.lastMoveDist+=1,e.direction){case"left":w.addSelf(a);break;case"right":w.addSelf(d);break;case"up":w.addSelf(c);break;case"down":w.addSelf(u)}const t=D(e);if(t.didCollide){new Audio("sound/derezz.mp3").play(),e.alive=!1,g.remove(e.group);const{oppX:t,oppY:o}=h(e.direction);return void e.corpses.push(y(e.group.translation,e.originalFill,t,o,f(3,3*e.speed),s*e.speed*(e.speed/2),2,3))}t.obtainedBit&&("shield"===G.bit.type?new Audio("sound/shield_pickup.ogg").play():T(),"shield"===G.bit.type&&(e.hasShield=!0,e.fillColor="#0652DD"),e.score+=1e3,G.bit.remove(),"1P"===G.mode&&(k=5,G.gameTimer.totalTime+=k,G.gameTimer.timeLeft+=k,_())),e.shieldDist>=m-1&&(e.hasShield=!1,e.shieldDist=0,e.fillColor=e.originalFill)}var k;if(function(e,t){async function o(e,t){const o=e.sound.src.split("/");t!==o.slice(o.length-2,o.length).join("/")&&(await e.soundPromise,e.sound.src=t,e.soundPromise=e.sound.play().catch(e=>{}))}e.isAccelerating&&!e.isBraking?e.speed+t>n?o(e,"sound/slipstream.ogg"):e.speed===n?o(e,"sound/speed3.ogg"):o(e,"sound/speed2.ogg"):o(e,"sound/speed1.ogg")}(e,o),G.toggleTrails?e.isAccelerating?K(e):e.currentOrigin=e.group.translation.clone():K(e),g.remove(e.sparks),p.didCollide){const t=1+e.speed,{x:o,y:n}=p.oppositeDir||{x:0,y:0},{oppX:i,oppY:r}=h(e.direction);e.sparks=y(e.group.translation,e.sparkColor,o+i*t,n+r*t,f(3,3+e.speed),1+Math.round(2*e.speed),2,2,s/2)}g.remove(e.group),e.group=x(w.x,w.y,e.strokeColor,e.fillColor)}Object.keys(w).forEach(e=>{var t=new Audio;t.addEventListener("canplaythrough",()=>{w[e]=!0}),t.src=e}),function(){const n=g.makeRectangle(t/2,o/2,t,o);n.fill="#2c3e50",n.stroke="#ecf0f1",n.linewidth=3;for(let n=0;n<=t;n+=e)g.makeLine(n,0,n,o).stroke="#fff";for(let n=0;n<=o;n+=e)g.makeLine(0,n,t,n).stroke="#fff";g.update()}(),document.body.onkeydown=(e=>{if("KeyR"===e.code){const e=document.documentElement;e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen(),G.gameOver&&H()}else if("Pause"!==e.code&&"KeyP"!==e.code||!G.pauseEnabled){if(!G.enemy&&"ArrowUp"===e.code||!G.user&&"KeyW"===e.code)q();else if(!G.gameOver){if(G.user)switch(e.code){case"KeyS":M(G.user,"down");break;case"KeyW":M(G.user,"up");break;case"KeyA":M(G.user,"left");break;case"KeyD":M(G.user,"right");break;case L:z(G.user)}if(G.enemy)switch(e.code){case"ArrowDown":M(G.enemy,"down");break;case"ArrowUp":M(G.enemy,"up");break;case"ArrowLeft":M(G.enemy,"left");break;case"ArrowRight":M(G.enemy,"right");break;case $:case W:z(G.enemy)}}}else G.instance.playing?G.instance.pause():G.instance.play()}),document.body.onkeyup=(e=>{if(!G.gameOver)switch(e.code){case L:G.user&&(G.user.isAccelerating=!1);break;case $:case W:G.enemy&&(G.enemy.isAccelerating=!1)}}),G.instance=g.bind("update",e=>{if(stats.begin(),G.gameOver){document.getElementsByClassName("controls")[0].style.display="block",clearInterval(G.gameTimer.id);let e="Press `R` to play next round.";if("1P"===G.mode){const t=G.players[0];t.alive?G.gameTimer.timeLeft<=0&&(G.gameOverText="TIME UP!"):G.gameOverText="YOU DEREZZED";let o=t.score;o>(localStorage.getItem(p)||0)?(localStorage.setItem(p,o),e=`You set a new record, ${o} pts!`):e=`You got ${o} pts!`,e+="<p>Press `R` to try again. </p>"}else if("2P"===G.mode)if(G.players.every(e=>!e.alive))G.gameOverText="DRAW";else if(G.gameTimer.timeLeft<=0){G.gameOverText="TIME UP";let t=null,o=0,n="";G.players.forEach(e=>{n+=`<p>${e.name}: ${e.score} pts</p>`,e.score>o?(o=e.score,t=e):e.score===o&&(t=null)}),t?(t.roundWins+=1,n+=`<p> ${t.name} WINS </p>`):n="<p>DRAW.</p>",e=`${n} ${e}`}else G.players.some(e=>{if(e.alive)return G.gameOverText=`${e.name} WINS`,e.roundWins+=1,!0});document.getElementById("gameOverSubtext").innerHTML=e,G.players.some(e=>{if(3===e.roundWins)return e.wins+=1,G.gameOverText=`${e.name} WINS THE MATCH`,document.getElementById("gameOverSubtext").innerText="Press `R` for rematch.",!0}),document.getElementById("gameOverContainer").style.display="flex",document.getElementById("gameOverText").innerText=G.gameOverText,b(),g.pause()}else{for(let t=0;t<G.players.length;t++){U(G.players[t],e)}G.bit&&G.bit.move();for(let e=0;e<G.players.length;e++)G.players[e].alive||(G.gameOver=!0)}stats.end()}),G.two=g}();
