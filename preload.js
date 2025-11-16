window.addEventListener("DOMContentLoaded", () => {
  console.log("KILL injections running...");

  const injectScript = () => {
    const script = document.createElement("script");
    script.textContent = `
      (function(){
        'use strict';
        console.log('[VF] Injecting Chat + Enhancements');

        let sniperModeEnabled = false; 
        let isRightMousePressed = false; 
        let kKeyInterval = null; 
        let activeCrosshairElement = null; // New: Holds the DOM element for the custom crosshair
        const crosshairStyles = [ // New: Crosshair definitions
            { name: "Default Dot", css: "width: 4px; height: 4px; background-color: white; border-radius: 50%; border: 1px solid black;" },
            { name: "Small Cross", css: "width: 10px; height: 10px; border: 2px solid white; border-radius: 0; border-left: none; border-right: none; border-bottom: none; transform: rotate(45deg);" },
            { name: "Classic Plus", css: "width: 12px; height: 12px; border: 1px solid white; border-radius: 0; border-top: none; border-bottom: none; border-left: none; border-right: none; box-shadow: 0 0 0 1px black, 0 6px 0 -5px white, 0 -6px 0 -5px white, 6px 0 0 -5px white, -6px 0 0 -5px white;" },
            { name: "Big Circle", css: "width: 16px; height: 16px; border: 1px dashed white; border-radius: 50%; background: none;" }
        ];

        function removeAds(){
          ['.adsbyvli','[id^=banner]','[id^=google_ads_iframe]'].forEach(sel=>{
            document.querySelectorAll(sel).forEach(e=>e.remove());
          });
        }
        setInterval(removeAds,3000);

        let fpsBox=null,last=performance.now(),count=0,fps=0;
        function fpsDisplay(){
          if(fpsBox)return;
          fpsBox=document.createElement('div');
          Object.assign(fpsBox.style,{
            position:'fixed',bottom:'10px',right:'10px',
            background:'rgba(0,0,0,0.6)',color:'#fff',
            padding:'6px 10px',borderRadius:'6px',zIndex:9999
          });
          fpsBox.innerText='FPS: 0';
          document.body.appendChild(fpsBox);
          requestAnimationFrame(update);
        }
        function update(){
          const now=performance.now();
          count++;
          if(now-last>=1000){
            fps=count;count=0;last=now;
            fpsBox.innerText='FPS: '+fps;
          }
          requestAnimationFrame(update);
        }

        const firebaseScript=document.createElement('script');
        firebaseScript.src='https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js';
        firebaseScript.onload=()=>{
          const dbScript=document.createElement('script');
          dbScript.src='https://www.gstatic.com/firebasejs/10.13.2/firebase-database-compat.js';
          dbScript.onload=initChat;
          document.head.appendChild(dbScript);
        };
        document.head.appendChild(firebaseScript);

        function initChat() {
          const config = {
            apiKey: "AIzaSyDUcQScmMCOh71z1VbtZwNwWeMhuYCVA8s",
            authDomain: "gaming-ddf63.firebaseapp.com",
            databaseURL: "https://gaming-ddf63-default-rtdb.firebaseio.com",
            projectId: "gaming-ddf63",
            storageBucket: "gaming-ddf63.firebasestorage.app",
            messagingSenderId: "474671180845",
            appId: "1:474671180845:web:b36e7d160abe0a55451ca4",
            measurementId: "G-CVSG56N7V0"
          };

          firebase.initializeApp(config);
          const db = firebase.database();
          let username = 'Player';
          let lobby = 'default';
          let isClanMode = false;
          let userClan = null;

      
          (function(open){
            XMLHttpRequest.prototype.open = function(m,u,a,user,pw){
              this.addEventListener('readystatechange',function(){
                if(this.readyState===4 && this.responseURL.includes('/login')){
                  try {
                    const r = JSON.parse(this.responseText);
                    username = r.username || 'Player';
                    userClan = r.clan || null;
                    const nameEl = document.getElementById('vfUser');
                    if(nameEl) nameEl.innerText = username;
                  } catch(e){}
                }
              });
              open.apply(this,arguments);
            };
          })(XMLHttpRequest.prototype.open);


          function createCrosshairElement() {
              if (activeCrosshairElement) return;

              activeCrosshairElement = document.createElement('div');
              activeCrosshairElement.id = 'vfCustomCrosshair';
              Object.assign(activeCrosshairElement.style, {
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: '99999',
                  display: 'none' // Start hidden
              });
              document.body.appendChild(activeCrosshairElement);

              
          }

          function applyCrosshairStyle(cssString) {
              if (!activeCrosshairElement) {
                  createCrosshairElement(); // Ensure element exists
              }
              activeCrosshairElement.style = '';
              Object.assign(activeCrosshairElement.style, {
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: '99999',
                  display: 'block'
              });
              
              cssString.split(';').forEach(style => {
                  if (style.trim()) {
                      const [prop, val] = style.split(':').map(s => s.trim());
                      activeCrosshairElement.style[prop] = val;
                  }
              });
              console.log('[VF] Crosshair style applied:', cssString);
          }

          function showCrosshairMenu(settingsDiv) {
              let menu = document.getElementById('vfCrosshairMenu');
              if (menu) return menu;

              menu = document.createElement('div');
              menu.id = 'vfCrosshairMenu';
              menu.style.marginTop = '10px';
              menu.style.padding = '10px 30px 10px 30px';
              menu.style.background = 'rgba(255,255,255,0.06)';
              menu.innerHTML = '<p style="font-size:18px; color:#b84bff; margin-bottom:5px;">Select Crosshair Style:</p>';

              crosshairStyles.forEach((style, index) => {
                  const button = document.createElement('button');
                  button.className = 'vf-btn vf-crosshair-btn';
                  button.id = 'chBtn-' + index;
                  button.textContent = style.name;
                  button.style.width = '100px !important';
                  button.style.margin = '5px';
                  button.addEventListener('click', () => {
                      applyCrosshairStyle(style.css);
                      document.querySelectorAll('.vf-crosshair-btn').forEach(btn => btn.style.border = 'none');
                      button.style.border = '2px solid #b84bff';
                  });
                  menu.appendChild(button);
              });
              
              const removeBtn = document.createElement('button');
              removeBtn.className = 'vf-btn vf-crosshair-btn';
              removeBtn.textContent = 'Remove';
              removeBtn.style.width = '100px !important';
              removeBtn.style.margin = '5px';
              removeBtn.style.backgroundColor = 'red';
              removeBtn.addEventListener('click', () => {
                  if (activeCrosshairElement) activeCrosshairElement.style.display = 'none';
                  document.getElementById('vfCrosshairToggle').checked = false;
              });
              menu.appendChild(removeBtn);

              settingsDiv.insertBefore(menu, settingsDiv.children[1]); // Insert after the crosshair toggle
              return menu;
          }
          
          function toggleCrosshair(enabled) {
              if (enabled) {
                  createCrosshairElement(); // Ensures crosshair element exists
                  applyCrosshairStyle(crosshairStyles[0].css); // Apply default style if enabling
                  if(document.getElementById('vfCrosshairMenu')) {
                      document.getElementById('vfCrosshairMenu').style.display = 'block';
                  }
              } else {
                  if (activeCrosshairElement) {
                      activeCrosshairElement.style.display = 'none';
                  }
                  if(document.getElementById('vfCrosshairMenu')) {
                      document.getElementById('vfCrosshairMenu').style.display = 'none';
                  }
              }
          }

          function addVFSettingsToggle() {
            const interval = setInterval(() => {
              const settingsDiv = document.getElementById('settingsDiv');
              if (!settingsDiv || document.getElementById('vfSwitchToggle')) return;
              clearInterval(interval);

              const vfSwitch = document.createElement('div');
              vfSwitch.className = "setting toggle";
              vfSwitch.style.padding = "10px 20px";
              vfSwitch.style.background = "rgba(255,255,255,0.03)";
              vfSwitch.innerHTML = \`
                <p style="font-size:21px;">Switch to KILL settings</p>
                <label>
                  <input id="vfSwitchToggle" class="checkbox" type="checkbox">
                  <span></span>
                </label>
              \`;

              settingsDiv.insertBefore(vfSwitch, settingsDiv.firstChild);

              const vfToggle = vfSwitch.querySelector('#vfSwitchToggle');
              const originalChildren = Array.from(settingsDiv.children).filter(el => el !== vfSwitch);
              let vfMenu = null;

              vfToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                  originalChildren.forEach(el => el.style.display = 'none');
                  vfMenu = document.createElement('div');
                  vfMenu.id = 'vfSettingsMenu';
                  vfMenu.style.marginTop = '10px';
                  
                  // NEW: Crosshair toggle with separate section for menu
                  vfMenu.innerHTML = \`
  <div class="setting toggle" style="padding:9px 30px;background:rgba(255,255,255,0.03);">
    <p style="font-size:21px;">Activate ingame crosshair</p>
    <label><input type="checkbox" id="vfCrosshairToggle" class="checkbox"><span></span></label>
  </div>
  <div class="setting toggle" style="padding:9px 30px;">
    <p style="font-size:21px;">Indicate enemy heads only</p>
    <label><input type="checkbox" id="vfHeadOnlyToggle" class="checkbox"><span></span></label>
  </div>
  <div class="setting toggle" style="padding:9px 30px;background:rgba(255,255,255,0.03);">
    <p style="font-size:21px;">Sniper Mode</p>
    <label><input type="checkbox" id="vfSniperMode" class="checkbox"><span></span></label>
  </div>
  <div class="setting button" style="padding:9px 30px;">
    <button style="font-size:21px;" class="vf-btn" id="vfRankSearch">Search player rank</button>
  </div>
  <div class="setting button" style="padding:9px 30px;background:rgba(255,255,255,0.03);">
    <button style="font-size:21px;" class="vf-btn" id="vfGuide">Client Guide</button>
  </div>
  <div class="setting button" style="padding:9px 30px;">
    <button style="font-size:21px;" class="vf-btn" id="vfCredits">Credits</button>
  </div>
\`;

const style = document.createElement('style');
style.textContent = \`
  .vf-btn {
    width: 300px !important;
    text-align: center;
    display: inline-block;
  }
\`;
document.head.appendChild(style);

                  settingsDiv.appendChild(vfMenu);
                  console.log('[VF] Custom settings shown');

                  document.getElementById('vfCredits').addEventListener('click', showVFCreditsPopup);
                  document.getElementById('vfRankSearch').addEventListener('click', createSearchPopup); 
                  
                  document.getElementById('vfSniperMode').addEventListener('change', (event) => {
                      sniperModeEnabled = event.target.checked;
                      console.log('[VF] Sniper Mode:', sniperModeEnabled ? 'Enabled' : 'Disabled');
                  });

                  document.getElementById('vfCrosshairToggle').addEventListener('change', (event) => {
                      const enabled = event.target.checked;
                      toggleCrosshair(enabled);
                      if (enabled) {
                          showCrosshairMenu(vfMenu);
                      }
                  });
                  
                  if (document.getElementById('vfCrosshairToggle').checked) {
                      showCrosshairMenu(vfMenu);
                  }
                  
                } else {
                  if (vfMenu) vfMenu.remove();
                  toggleCrosshair(false);
                  
                  originalChildren.forEach(el => el.style.display = '');
                  console.log('[VF] Default settings restored');

                  const vfCreditsBtn = document.getElementById('vfCredits');
                  if(vfCreditsBtn) vfCreditsBtn.removeEventListener('click', showVFCreditsPopup);
                  const vfRankSearchBtn = document.getElementById('vfRankSearch');
                  if(vfRankSearchBtn) vfRankSearchBtn.removeEventListener('click', createSearchPopup);
                  const vfSniperModeBtn = document.getElementById('vfSniperMode');
                  if(vfSniperModeBtn) vfSniperModeBtn.removeEventListener('change', this); 
                  const vfCrosshairToggle = document.getElementById('vfCrosshairToggle');
                  if(vfCrosshairToggle) vfCrosshairToggle.removeEventListener('change', this);
                }
              });
            }, 500);
          }
          
          function showVFCreditsPopup() {
            const existingPopup = document.querySelector('.vf-credits-popup');
            if(existingPopup) existingPopup.remove();

            const popup = document.createElement('div');
            popup.className = 'vf-credits-popup';
            popup.innerHTML = \`
              <span class="close-btn">❌</span>
              <h2>[KILL] Deadshot Client - Credits</h2>
              <h3>Ideas & Suggestions</h3>
              <p>[KILL] Stewart</p>
              <p>[KILL] Kira</p>
              <p>[KILL] Omicron</p>
              <br>
              <h3>Thanks to</h3>
              <p>[KILL] BLASTER</p>
              <p>[KILL] xLiam1</p>
              <p>[KILL] Ezi</p>
              <p>[KILL] Rex</p>
              <p>[KILL] Godlike</p>
              <p>[KILL] TheFreak</p>
              <p>[KILL] Menace</p>
              <br>
              <p style="font-size:12px;color:#aaa;">
                All rights reserved. Modifications without developer consent are prohibited.<br>
                Contact Developer on Discord: <span style="color:#b84bff">@dev.vish</span>
              </p>
            \`;
            document.body.appendChild(popup);

            popup.querySelector('.close-btn').addEventListener('click', () => {
              popup.remove();
            });
            console.log('[VF] Credits popup shown');
          }
          
          async function fetchLeaderboardRank(username) {
            try {
              const response = await fetch('https://login.deadshot.io/leaderboards');
              const data = await response.json();

              const categories = ["daily", "weekly", "alltime"];
              let foundRank = null;

              for (const category of categories) {
                if (data[category] && data[category].kills) {
                  const leaderboard = data[category].kills;
                  leaderboard.sort((a, b) => b.kills - a.kills);

                  const player = leaderboard.find(player => player.name.toLowerCase() === username.toLowerCase());

                  if (player) {
                    const rank = leaderboard.indexOf(player);
                    foundRank = foundRank || {}; 
                    foundRank[category] = {rank: rank + 1, kills: player.kills};
                  }
                }
              }

              if (foundRank) return foundRank;
              return 'Not found in any leaderboard';
            } catch (error) {
              console.error('Error fetching leaderboard:', error);
              return 'Error fetching leaderboard data.';
            }
          }

          function showRankPopup(username, rankData) {
            const existingPopup = document.querySelector('.vf-rank-popup');
            if(existingPopup) existingPopup.remove();
            
            const popup = document.createElement('div');
            popup.className = 'vf-rank-popup';
            
            let content;
            if (typeof rankData === 'string') {
              content = \`
                <h2>Rank Search Result</h2>
                <p>User: \${username}</p>
                <p style="color:red; font-weight:bold;">\${rankData}</p>
              \`;
            } else {
              let rankDetails = '';
              for (const category in rankData) {
                  rankDetails += \`<p>#\${rankData[category].rank} **(\${rankData[category].kills} Kills)** in **\${category.toUpperCase()}**</p>\`;
              }
              content = \`
                <h2>Rank Found: \${username}</h2>
                \${rankDetails}
              \`;
            }

            popup.innerHTML = \`
              <span class="close-btn">❌</span>
              \${content}
              <button class="vf-btn" style="margin-top:15px; width:100px !important;">Close</button>
            \`;

            document.body.appendChild(popup);
            popup.querySelector('.close-btn').addEventListener('click', () => popup.remove());
            popup.querySelector('button').addEventListener('click', () => popup.remove());
          }

          function createSearchPopup() {
            const existingPopup = document.querySelector('.vf-search-input-popup');
            if(existingPopup) existingPopup.remove();

            const popup = document.createElement('div');
            popup.className = 'vf-search-input-popup';
            popup.style.textAlign = 'center';
            popup.innerHTML = \`
              <span class="close-btn">❌</span>
              <h2>Search Player Rank</h2>
              <input type="text" id="rankUsernameInput" placeholder="Enter username" style="padding: 8px; font-size: 16px; margin-bottom: 10px; width: 80%; color: black; border-radius: 4px; border: 1px solid #555;"/>
              <button class="vf-btn" id="performRankSearch" style="width:120px !important;">Search</button>
            \`;
            document.body.appendChild(popup);

            popup.querySelector('.close-btn').addEventListener('click', () => popup.remove());
            
            popup.querySelector('#performRankSearch').onclick = async () => {
              const input = popup.querySelector('#rankUsernameInput');
              const username = input.value.trim();
              if (username) {
                input.disabled = true;
                const searchBtn = popup.querySelector('#performRankSearch');
                const originalText = searchBtn.textContent;
                searchBtn.textContent = 'Searching...';
                
                const rankData = await fetchLeaderboardRank(username);
                
                popup.remove();
                showRankPopup(username, rankData);
              }
            };
          }

          function dispatchKeyEvent(type, key) {
              const event = new KeyboardEvent(type, {
                  key: key,
                  code: 'Key' + key.toUpperCase(),
                  keyCode: key.toUpperCase().charCodeAt(0),
                  which: key.toUpperCase().charCodeAt(0),
                  bubbles: true,
                  cancelable: true,
              });
              document.dispatchEvent(event);
          }

          function startKKeyPress() {
              if (kKeyInterval) return;
              kKeyInterval = setInterval(() => {
                  dispatchKeyEvent('keydown', 'k');
              }, 100); 
          }

          function stopKKeyPress() {
              if (kKeyInterval) {
                  clearInterval(kKeyInterval);
                  kKeyInterval = null;
                  dispatchKeyEvent('keyup', 'k'); 
              }
          }

          function startShooting() {
              dispatchKeyEvent('keydown', 'k');
              setTimeout(() => dispatchKeyEvent('keyup', 'k'), 50); 
          }

          window.addEventListener('mousedown', (e) => {
              if (e.button === 2) {
                  isRightMousePressed = true;
              }
          });

          window.addEventListener('mouseup', (e) => {
              if (e.button === 2) {
                  if (sniperModeEnabled) {
                      // Sniper mode: Fire a single shot on scope release
                      startShooting();
                  }

                  isRightMousePressed = false;
              }
          });
          
          const chat = document.createElement('div');
          chat.id = 'vfChat';
          chat.innerHTML = \`
            <div id="vfHeader">
              <input id="vfLobby" placeholder="Lobby code"/>
              <span id="vfUser">Player</span>
            </div>
            <div id="vfMsgs"></div>
            <div id="vfInputArea">
              <input id="vfInput" placeholder="Type message..."/>
              <button id="vfSend">Send</button>
            </div>
            <button id="vfClanToggle" style="margin:5px;background:#007bff;color:white;border:none;padding:5px;cursor:pointer;">Switch to Clan Chat</button>
          \`;
          Object.assign(chat.style,{
            position:'fixed',bottom:'50px',right:'50px',width:'300px',
            height:'400px',background:'rgba(0,0,0,0.8)',color:'#fff',
            border:'1px solid #444',borderRadius:'10px',
            fontFamily:'sans-serif',display:'none',flexDirection:'column',
            overflow:'hidden',zIndex:9999
          });
          document.body.appendChild(chat);

          const style = document.createElement('style');
          style.textContent = \`
            #vfHeader{display:flex;justify-content:space-between;align-items:center;padding:5px;background:#111;}
            #vfHeader input{width:60%;padding:3px;color:#000;}
            #vfMsgs{flex:1;overflow-y:auto;padding:5px;}
            #vfInputArea{display:flex;}
            #vfInput{flex:1;padding:5px;color:#000;}
            #vfSend{background:#28a745;color:white;border:none;padding:5px 10px;cursor:pointer;}
            #vfSend:hover{background:#34d058;}
            #vfLobby::placeholder,#vfInput::placeholder{color:#000;}
            
            .vf-credits-popup, .vf-rank-popup, .vf-search-input-popup {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 350px;
              padding: 20px;
              background: rgba(10, 10, 10, 0.95);
              color: #eee;
              border: 2px solid #b84bff; /* Client color accent */
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
              z-index: 10000;
              text-align: center;
              font-family: sans-serif;
            }
            .vf-credits-popup h2, .vf-rank-popup h2, .vf-search-input-popup h2 {
              color: #b84bff;
              margin-top: 0;
              border-bottom: 1px solid #444;
              padding-bottom: 10px;
            }
            .vf-credits-popup h3 {
              color: #fff;
              margin-top: 15px;
              margin-bottom: 5px;
            }
            .vf-credits-popup p {
              margin: 3px 0;
              color: #ccc;
            }
            .vf-rank-popup p {
              margin: 8px 0;
            }
            .vf-credits-popup .close-btn, .vf-rank-popup .close-btn, .vf-search-input-popup .close-btn {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 20px;
              cursor: pointer;
              transition: transform 0.2s;
            }
            .vf-credits-popup .close-btn:hover, .vf-rank-popup .close-btn:hover, .vf-search-input-popup .close-btn:hover {
              transform: scale(1.2);
            }
          \`;
          document.head.appendChild(style);

          const msgsBox = chat.querySelector('#vfMsgs');
          const input = chat.querySelector('#vfInput');
          const sendBtn = chat.querySelector('#vfSend');
          const lobbyInput = chat.querySelector('#vfLobby');
          const toggleClanBtn = chat.querySelector('#vfClanToggle');

          function loadMessages() {
            msgsBox.innerHTML = '';
            firebase.database().ref('lobbies/'+lobby).off();
            firebase.database().ref('lobbies/'+lobby).on('child_added', snap => {
              const m = snap.val();
              const div = document.createElement('div');
              div.textContent = '['+m.user+']: '+m.text;
              msgsBox.appendChild(div);
              msgsBox.scrollTop = msgsBox.scrollHeight;
            });
          }

          sendBtn.onclick = () => {
            const text = input.value.trim();
            if(!text) return;
            firebase.database().ref('lobbies/'+lobby).push({user:username,text:text,time:Date.now()});
            input.value = '';
          };

          lobbyInput.onchange = () => {
            if (!isClanMode) {
              lobby = lobbyInput.value.trim() || 'default';
              loadMessages();
            }
          };

          toggleClanBtn.onclick = () => {
            if (!isClanMode && userClan) {
              lobby = userClan;
              isClanMode = true;
              lobbyInput.value = userClan;
              lobbyInput.readOnly = true;
              toggleClanBtn.textContent = "Switch to Clan Chat";
              loadMessages();
              console.log('[VF] Switched to Clan Chat:', userClan);
            } else {
              isClanMode = false;
              lobbyInput.readOnly = false;
              lobby = lobbyInput.value.trim() || 'default';
              toggleClanBtn.textContent = "Switch to Clan Chat";
              loadMessages();
              console.log('[VF] Back to normal chat');
            }
          };

          window.addEventListener('keydown', e => {
            if(e.keyCode===18){ // Left Alt
              chat.style.display = (chat.style.display==='none') ? 'flex' : 'none';
            }
          });

          function changeSelectorBarColor() {
            const style = document.createElement('style');
            style.innerHTML = \`
              .range::-webkit-slider-thumb { background: red !important; }
              .range::-moz-range-thumb { background: red !important; }
              .range::-ms-thumb { background: red !important; }
            \`;
            document.head.appendChild(style);
          }

          // Initialize
          addVFSettingsToggle();
          changeSelectorBarColor();
          fpsDisplay();
          loadMessages();
          console.log('[VF] Chat + FPS + Settings initialized');
          createCrosshairElement(); // Pre-create the crosshair element but keep it hidden
        }
      })();
    `;
    document.documentElement.appendChild(script);
  };

  window.addEventListener("load", () => {
    console.log("[VF] Injecting after load...");
    setTimeout(injectScript, 1000);
  });
});