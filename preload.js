window.addEventListener("DOMContentLoaded", () => {

  const injectScript = () => {
    const script = document.createElement("script");
    script.textContent = `
      (function(){
        'use strict';

        let sniperModeEnabled = false; 
        let isRightMousePressed = false; 
        let kKeyInterval = null; 
        let activeCrosshairElement = null; 
        let playerData = null; 
        let isKeyLayoutEnabled = false; 
        const keyLayoutContainerStyles = { 
            position: 'fixed',
            top: '20px',
            left: '20px',
            pointerEvents: 'none',
            zIndex: 99999,
            display: 'none', 
            fontFamily: 'Arial, sans-serif'
        };
        const keyStyles = { 
            display: 'inline-block',
            width: '45px',
            height: '45px',
            margin: '2px',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            borderRadius: '5px',
            textAlign: 'center',
            lineHeight: '25px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 3px 0 rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        };
        const crosshairStyles = [ 
          { name: "Default Dot", css: "width: 4px; height: 4px; background-color: white; border-radius: 50%; border: 1px solid black;" },
            { name: "Precision Reticle", css: "width:22px; height:22px; display:block; background: radial-gradient(circle at center, rgba(255,255,255,0.95) 2px, rgba(184,75,255,0.06) 3px, transparent 5px); border-radius:50%; box-shadow: 0 0 0 1px rgba(0,0,0,0.85), 0 4px 12px rgba(184,75,255,0.08);" },
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
                    playerData = r; 
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
                  display: 'none' 
              });
              document.body.appendChild(activeCrosshairElement);

              
          }

          function applyCrosshairStyle(cssString) {
              if (!activeCrosshairElement) {
                  createCrosshairElement(); 
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

              settingsDiv.insertBefore(menu, settingsDiv.children[1]); 
              return menu;
          }
          
          function toggleCrosshair(enabled) {
              if (enabled) {
                  createCrosshairElement(); 
                  applyCrosshairStyle(crosshairStyles[0].css); 
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
          
          
          function createKeyLayoutElement() {
              let container = document.getElementById('vfKeyLayout');
              if (container) return container;

              container = document.createElement('div');
              container.id = 'vfKeyLayout';
              Object.assign(container.style, keyLayoutContainerStyles);

              container.innerHTML = \`
                  <div style="display:flex; justify-content:flex-start; margin-bottom: 2px;">
                      <div id="kl-tab" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')} width: 60px;">Left Tab</div>
                      <div id="kl-w" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')}">W</div>
                  </div>
                  <div style="display:flex; justify-content:flex-start; margin-bottom: 2px;">
                      <div id="kl-shift" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')} width: 60px;">LShift</div>
                      <div id="kl-a" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')}">A</div>
                      <div id="kl-s" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')}">S</div>
                      <div id="kl-d" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')}">D</div>
                      <div id="kl-r" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')}">R</div>
                  </div>
                  <div style="display:flex; justify-content:flex-start; margin-bottom: 2px;">
                      <div id="kl-space" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')} width: 140px;">Space</div>
                      <div id="kl-lmb" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')} width: 70px; background-color: rgba(0, 100, 255, 0.2);">LMB</div>
                      <div id="kl-rmb" style="\${Object.entries(keyStyles).map(([k,v])=>\`\${k}:\${v}\`).join(';')} width: 70px; background-color: rgba(0, 100, 255, 0.2);">RMB</div>
                  </div>
              \`;

              document.body.appendChild(container);
              return container;
          }

          const activeKeysMap = {
              'KeyW': 'kl-w', 'KeyA': 'kl-a', 'KeyS': 'kl-s', 'KeyD': 'kl-d',
              'ShiftLeft': 'kl-shift', 'Space': 'kl-space', 'KeyR': 'kl-r',
              'Tab': 'kl-tab', 'Mouse0': 'kl-lmb', 'Mouse2': 'kl-rmb'
          };
          
          function toggleKey(keyId, isPressed) {
              const element = document.getElementById(keyId);
              if (element) {
                  element.style.backgroundColor = isPressed ? 'red' : keyId.includes('lmb') || keyId.includes('rmb') ? 'rgba(0, 100, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)';
                  element.style.boxShadow = isPressed ? '0 0 10px red' : '0 3px 0 rgba(0, 0, 0, 0.4)';
              }
          }

          function setupKeyLayoutListeners(enabled) {
              if (enabled) {
                  window.addEventListener('keydown', handleKeyLayoutKeydown);
                  window.addEventListener('keyup', handleKeyLayoutKeyup);
                  window.addEventListener('mousedown', handleKeyLayoutMousedown);
                  window.addEventListener('mouseup', handleKeyLayoutMouseup);
              } else {
                  window.removeEventListener('keydown', handleKeyLayoutKeydown);
                  window.removeEventListener('keyup', handleKeyLayoutKeyup);
                  window.removeEventListener('mousedown', handleKeyLayoutMousedown);
                  window.removeEventListener('mouseup', handleKeyLayoutMouseup);
              }
          }

          function handleKeyLayoutKeydown(e) {
              const keyId = activeKeysMap[e.code];
              if (keyId) {
                  toggleKey(keyId, true);
              }
          }

          function handleKeyLayoutKeyup(e) {
              const keyId = activeKeysMap[e.code];
              if (keyId) {
                  toggleKey(keyId, false);
              }
          }
          
          function handleKeyLayoutMousedown(e) {
              if (e.button === 0) toggleKey(activeKeysMap['Mouse0'], true); 
              if (e.button === 2) toggleKey(activeKeysMap['Mouse2'], true); 
          }
          
          function handleKeyLayoutMouseup(e) {
              if (e.button === 0) toggleKey(activeKeysMap['Mouse0'], false);
              if (e.button === 2) toggleKey(activeKeysMap['Mouse2'], false);
          }


          function toggleKeyLayout(enabled) {
              isKeyLayoutEnabled = enabled;
              const container = createKeyLayoutElement();
              container.style.display = enabled ? 'block' : 'none';
              setupKeyLayoutListeners(enabled);
              if (!enabled) {
                  Object.values(activeKeysMap).forEach(keyId => toggleKey(keyId, false));
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
                  
                  vfMenu.innerHTML = \`
  <div class="setting button" style="padding:9px 30px;">
    <button style="font-size:21px;" class="vf-btn" id="vfProfile">KILL Profile</button>
  </div>
  <div class="setting toggle" style="padding:9px 30px; background:rgba(255,255,255,0.03);">
    <p style="font-size:21px;">Activate ingame crosshair</p>
    <label><input type="checkbox" id="vfCrosshairToggle" class="checkbox"><span></span></label>
  </div>
  <div class="setting toggle" style="padding:9px 30px;">
    <p style="font-size:21px;">Key Layout</p>
    <label><input type="checkbox" id="vfKeyLayoutToggle" class="checkbox"><span></span></label>
  </div>
  <div class="setting toggle" style="padding:9px 30px;background:rgba(255,255,255,0.03);">
    <p style="font-size:21px;">AWP Auto-Fire on Scope Release</p>
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
                  style.textContent = \`\n  .vf-btn {\n    width: 300px !important;\n    text-align: center;\n    display: inline-block;\n    padding: 8px 12px;\n    border-radius: 8px;\n    background: rgba(255,255,255,0.03);\n    color: #fff;\n    border: 1px solid rgba(255,255,255,0.03);\n cursor: pointer;\n    font-weight: 700;\n    letter-spacing: 0.2px;\n    transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;\n  }\n  .vf-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05); filter: brightness(1.03); }\n  .vf-btn:active { transform: translateY(0px); box-shadow: 0 6px 12px rgba(0,0,0,0.6); }\n\n  .vf-crosshair-btn {\n    padding: 6px 10px;\n    margin: 5px;\n    background: transparent;\n    border: 1px solid rgba(255,255,255,0.06);\n    color: #ffffff;\n    border-radius: 6px;\n    cursor: pointer;\n    transition: border-color 120ms ease, box-shadow 120ms ease;\n  }\n  .vf-crosshair-btn:hover { border-color: #b84bff; box-shadow: 0 6px 18px rgba(184,75,255,0.08); }\n\n  /* Smaller utility classes to keep settings looking native */\n  .vf-btn.small { width: 120px !important; padding: 6px 8px; font-weight:600; }\n\n  /* NEW: Profile Popup Styles */\n  .vf-profile-popup {\n    position: fixed;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    width: 450px; /* Wider for more content */\n    padding: 25px;\n    background: linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(30, 0, 50, 0.95)); /* Gradient background */\n    color: #eee;\n    border: 3px solid #b84bff; /* Client color accent */\n    border-radius: 12px;\n    box-shadow: 0 0 25px rgba(184,75,255,0.3);\n    z-index: 10000;\n    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n  }\n  .vf-profile-popup h2 {\n    color: #b84bff;\n    text-align: center;\n    margin-top: 0;\n    font-size: 28px;\n    letter-spacing: 1px;\n  }\n  .vf-profile-header {\n    display: flex;\n    align-items: center;\n    margin-bottom: 20px;\n    padding-bottom: 15px;\n    border-bottom: 1px solid rgba(184,75,255,0.3);\n  }\n  .vf-profile-pic {\n    width: 80px;\n    height: 80px;\n    border-radius: 50%;\n    border: 3px solid #fff;\n    margin-right: 15px;\n    object-fit: cover;\n  }\n  .vf-profile-info {\n    flex-grow: 1;\n  }\n  .vf-profile-info p {\n    margin: 4px 0;\n    font-size: 16px;\n  }\n  .vf-profile-info .vf-username {\n    font-size: 24px;\n    font-weight: bold;\n    color: #fff;\n  }\n  .vf-profile-stats p {\n    background: rgba(255,255,255,0.05);\n    padding: 8px 10px;\n    border-radius: 6px;\n    margin: 8px 0;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    font-weight: 500;\n  }\n  .vf-profile-stats span {\n    color: #b84bff;\n    font-weight: bold;\n    font-size: 18px;\n  }\n  .vf-profile-skins-title {\n    color: #b84bff;\n    margin: 15px 0 5px 0;\n    text-align: center;\n    font-size: 20px;\n  }\n  .vf-profile-skins-list {\n    display: flex;\n    flex-wrap: wrap;\n    justify-content: center;\n    gap: 8px;\n    max-height: 100px;\n    overflow-y: auto;\n    padding: 5px;\n    border: 1px solid rgba(255,255,255,0.1);\n    border-radius: 8px;\n  }\n  .vf-skin-tag {\n    background: #000;\n    color: #ccc;\n    padding: 4px 8px;\n    border-radius: 4px;\n    font-size: 12px;\n    white-space: nowrap;\n    border: 1px solid #b84bff;\n  }\n\`;
document.head.appendChild(style);

                  settingsDiv.appendChild(vfMenu);
                  console.log('[VF] Custom settings shown');

                  document.getElementById('vfCredits').addEventListener('click', showVFCreditsPopup);
                  document.getElementById('vfRankSearch').addEventListener('click', createSearchPopup); 
                  document.getElementById('vfProfile').addEventListener('click', showVFProfilePopup); 
                  document.getElementById('vfGuide').addEventListener('click', showVFGuidePopup); 
                  
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

                
                  document.getElementById('vfKeyLayoutToggle').addEventListener('change', (event) => {
                      toggleKeyLayout(event.target.checked);
                      
                  });
                  
                } else {
                  if (vfMenu) vfMenu.remove();
                  toggleCrosshair(false);
                  toggleKeyLayout(false); 
                  
                  originalChildren.forEach(el => el.style.display = '');
                  console.log('[VF] Default settings restored');

                  const vfCreditsBtn = document.getElementById('vfCredits');
                  if(vfCreditsBtn) vfCreditsBtn.removeEventListener('click', showVFCreditsPopup);
                  const vfRankSearchBtn = document.getElementById('vfRankSearch');
                  if(vfRankSearchBtn) vfRankSearchBtn.removeEventListener('click', createSearchPopup);
                  const vfProfileBtn = document.getElementById('vfProfile'); 
                  if(vfProfileBtn) vfProfileBtn.removeEventListener('click', showVFProfilePopup);
                  const vfGuideBtn = document.getElementById('vfGuide'); 
                  if(vfGuideBtn) vfGuideBtn.removeEventListener('click', showVFGuidePopup); 
                  const vfSniperModeBtn = document.getElementById('vfSniperMode');
                  if(vfSniperModeBtn) vfSniperModeBtn.removeEventListener('change', this); 
                  const vfCrosshairToggle = document.getElementById('vfCrosshairToggle');
                  if(vfCrosshairToggle) vfCrosshairToggle.removeEventListener('change', this);

                
                  const vfKeyLayoutToggle = document.getElementById('vfKeyLayoutToggle');
                  if(vfKeyLayoutToggle) vfKeyLayoutToggle.removeEventListener('change', this); 
                }
              });
            }, 500);
          }
          
          function showVFProfilePopup() {
            const existingPopup = document.querySelector('.vf-profile-popup');
            if(existingPopup) existingPopup.remove();

            if (!playerData) {
                const tempPopup = document.createElement('div');
                tempPopup.className = 'vf-profile-popup';
                tempPopup.innerHTML = \`<span class="close-btn">❌</span><h2>KILL Profile</h2><p style="text-align:center; color:red;">Player data not yet loaded. Please start a game or check connection.</p><button class="vf-btn" style="margin-top:15px; width:100px !important;">Close</button>\`;
                document.body.appendChild(tempPopup);
                tempPopup.querySelector('.close-btn').addEventListener('click', () => tempPopup.remove());
                tempPopup.querySelector('button').addEventListener('click', () => tempPopup.remove());
                return;
            }

            const { username, pic, clan, coins, diamonds, st, equippedSkins } = playerData;
            
            const [wins, losses, winRate, kills, deaths, kdRatio, lastPlayed] = st;

            const equippedSkinsHtml = equippedSkins.map(skin => 
                \`<span class="vf-skin-tag">\${skin.name} (\${skin.weapon.toUpperCase()})</span>\`
            ).join('');

            const popup = document.createElement('div');
            popup.className = 'vf-profile-popup';
            popup.innerHTML = \`
              <span class="close-btn">❌</span>
              <h2>KILL Profile</h2>
              <div class="vf-profile-header">
                  <img src="\${pic || 'https://via.placeholder.com/80?text=No+Pic'}" class="vf-profile-pic" alt="Profile Picture"/>
                  <div class="vf-profile-info">
                      <p class="vf-username">[\${clan || 'NO CLAN'}] \${username}</p>
                      <p>Coins: <span>\${coins}</span></p>
                      <p>Diamonds: <span>\${diamonds}</span></p>
                  </div>
              </div>

              <div class="vf-profile-stats">
                  <p>Kills: <span>\${kills}</span></p>
                  <p>Deaths: <span>\${deaths}</span></p>
                  <p>K/D Ratio: <span>\${parseFloat(kdRatio).toFixed(3)}</span></p>
                  <p>Wins: <span>\${wins}</span></p>
                  <p>Losses: <span>\${losses}</span></p>
                  <p>Win Rate: <span>\${winRate}</span></p>
              </div>

              <p class="vf-profile-skins-title">Equipped Skins</p>
              <div class="vf-profile-skins-list">
                  \${equippedSkinsHtml || '<p style="text-align:center; color:#ccc;">No skins equipped.</p>'}
              </div>

              <button class="vf-btn" style="margin-top:20px; width:150px !important; background: #b84bff; border-color:#b84bff;">Close</button>
            \`;
            document.body.appendChild(popup);

            popup.querySelector('.close-btn').addEventListener('click', () => {
              popup.remove();
            });
            popup.querySelector('button').addEventListener('click', () => {
              popup.remove();
            });
            console.log('[VF] Profile popup shown');
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
              <p>[KILL] Menace</p>
              <p>[KILL] xLiam1</p>
              <p>[KILL] Ezi</p>
              <p>[KILL] Rex</p>
              <p>[KILL] Godlike</p>
              <p>[KILL] TheFreak</p>
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
          
          function showVFGuidePopup() {
            const existingPopup = document.querySelector('.vf-guide-popup');
            if(existingPopup) existingPopup.remove();

            const popup = document.createElement('div');
            popup.className = 'vf-guide-popup';
            popup.innerHTML = \`
              <span class="close-btn">❌</span>
              <h2>[KILL] Client Guide</h2>
              
              <div style="text-align: left; margin-top: 15px;">
                  <h3 style="color:#fff; margin-bottom: 5px;">Features:</h3>
                  <p><strong>VC On/Off</strong>: <span style="color:#b84bff;">Shift+Alt+V</span></p>
                  <p><strong>Chat On/Off</strong>: <span style="color:#b84bff;">LeftAlt</span></p>
                  <p><strong>Sniper Mode</strong>: Hold scope (RMB) and release to auto-fire a single shot.</p>
                  <p><strong>Key Layout</strong>: Displays a real-time key press indicator on screen.</p>
                  <p><strong>KILL Profile</strong>: Detailed new profile section, displaying stats and equipped skins. Works once logged in.</p>
                  <p><strong>FPS Unlocker</strong>: Removes the frame rate limit (Unlimited FPS by default).</p>
                  <p><strong>Ingame Crosshair</strong>: Adds a custom crosshair overlay with adjustable styles.</p>
                  <p><strong>Rank Search</strong>: Finds the player's leaderboard position by username.</p>
                  
                  <h3 style="color:#fff; margin-top: 20px; margin-bottom: 5px;">Added Extras:</h3>
                  <p style="color:#b84bff;">» New headshot sound</p>
                  <p style="color:#b84bff;">» New AWP scope texture</p>
                  <p style="color:#b84bff;">» FPS Display (Bottom right corner)</p>
              </div>

              <button class="vf-btn" style="margin-top:20px; width:150px !important; background: #b84bff; border-color:#b84bff;">Close</button>
            \`;

            document.body.appendChild(popup);

            const style = document.createElement('style');
            style.textContent = \`
              .vf-guide-popup {
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 400px; /* Slightly wider for better readability */
                  padding: 25px;
                  background: linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(30, 0, 50, 0.95));
                  color: #eee;
                  border: 3px solid #b84bff;
                  border-radius: 12px;
                  box-shadow: 0 0 25px rgba(184,75,255,0.3);
                  z-index: 10000;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  text-align: center;
              }
              .vf-guide-popup h2 {
                  color: #b84bff;
                  text-align: center;
                  margin-top: 0;
                  font-size: 28px;
              }
              .vf-guide-popup p {
                  margin: 6px 0;
                  font-size: 16px;
                  line-height: 1.4;
                  color: #ccc;
              }
            \`;
            document.head.appendChild(style);

            popup.querySelector('.close-btn').addEventListener('click', () => {
              popup.remove();
              style.remove(); // Clean up style tag
            });
            popup.querySelector('button').addEventListener('click', () => {
              popup.remove();
              style.remove(); // Clean up style tag
            });
            console.log('[VF] Guide popup shown');
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
            
            .vf-credits-popup, .vf-rank-popup, .vf-search-input-popup, .vf-guide-popup { /* Added .vf-guide-popup to shared styles */
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
            .vf-credits-popup h2, .vf-rank-popup h2, .vf-search-input-popup h2, .vf-guide-popup h2 {
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
            .vf-credits-popup .close-btn, .vf-rank-popup .close-btn, .vf-search-input-popup .close-btn, .vf-profile-popup .close-btn, .vf-guide-popup .close-btn {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 20px;
              cursor: pointer;
              transition: transform 0.2s;
            }
            .vf-credits-popup .close-btn:hover, .vf-rank-popup .close-btn:hover, .vf-search-input-popup .close-btn:hover, .vf-profile-popup .close-btn:hover, .vf-guide-popup .close-btn:hover {
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
            if(e.keyCode===18){ 
              chat.style.display = (chat.style.display==='none') ? 'flex' : 'none';
            }
          });

          
          const vc = document.createElement('div');
          vc.id = 'vfVC';
          vc.innerHTML = '<div id="vfVCHeader"><input id="vfVCLobby" placeholder="Lobby code"/></div>' +
                         '<div id="vfVCStatus">Not connected</div>' +
                         '<div id="vfVCControls">' +
                           '<button id="vfVCJoin" class="vf-btn">Join VC</button>' +
                           '<button id="vfVCLeave" class="vf-btn" style="display:none">Leave VC</button>' +
                           '<label style="display:inline-block;margin-left:8px;color:#fff;"><input type="checkbox" id="vfVCMute"> Mute</label>' +
                         '</div>' +
                         '<audio id="vfRemoteAudio" autoplay></audio>';
          Object.assign(vc.style,{
            position:'fixed',bottom:'50px',left:'50px',width:'240px',height:'140px',background:'rgba(0,0,0,0.8)',color:'#fff',
            border:'1px solid #444',borderRadius:'10px',fontFamily:'sans-serif',display:'none',flexDirection:'column',overflow:'hidden',zIndex:9999,padding:'8px'
          });
          document.body.appendChild(vc);

          const vcStatus = vc.querySelector('#vfVCStatus');
          const vcJoinBtn = vc.querySelector('#vfVCJoin');
          const vcLeaveBtn = vc.querySelector('#vfVCLeave');
          const vcLobbyInput = vc.querySelector('#vfVCLobby');
          const vcMute = vc.querySelector('#vfVCMute');
          const remoteAudio = vc.querySelector('#vfRemoteAudio');

          
          vcLobbyInput.value = lobbyInput.value || lobby;

          let pc = null;
          let localStream = null;
          let isInVC = false;
          let isCaller = false;
          let offerRef = null, answerRef = null, offerCandidatesRef = null, answerCandidatesRef = null;

          vcJoinBtn.onclick = async () => {
            if (isInVC) return;
            const vcLobby = (vcLobbyInput.value || lobby).trim() || 'default';
            vcStatus.textContent = 'Connecting...';
            try {
              localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err) {
              console.error('[VC] getUserMedia failed', err);
              vcStatus.textContent = 'Microphone access denied';
              return;
            }

            pc = new RTCPeerConnection({ 
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }, 
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ] 
});
            localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

            pc.ontrack = (event) => {
              try {
                remoteAudio.srcObject = event.streams[0];
                vcStatus.textContent = 'Connected';
              } catch (e) { console.error(e); }
            };

            pc.oniceconnectionstatechange = () => {
              console.log('[VC] ICE state', pc.iceConnectionState);
              if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                vcStatus.textContent = 'Disconnected';
              }
            };

            
            const baseRef = firebase.database().ref('vcRooms/' + vcLobby);
            offerRef = baseRef.child('offer');
            answerRef = baseRef.child('answer');
            offerCandidatesRef = baseRef.child('offerCandidates');
            answerCandidatesRef = baseRef.child('answerCandidates');

            pc.onicecandidate = (e) => {
              if (!e.candidate) return;
              const cand = e.candidate.toJSON();
              try {
                if (isCaller) {
                  offerCandidatesRef.push(cand);
                } else {
                  answerCandidatesRef.push(cand);
                }
              } catch (err) { console.error('[VC] push candidate failed', err); }
            };

            
            const offerSnap = await offerRef.once('value');
            if (!offerSnap.exists()) {
              
              isCaller = true;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              await offerRef.set(offer.toJSON());

              
              answerRef.on('value', async (snap) => {
                if (snap.exists() && pc && !pc.remoteDescription) {
                  const ans = snap.val();
                  await pc.setRemoteDescription(new RTCSessionDescription(ans));
                }
              });

              
              answerCandidatesRef.on('child_added', (snap) => {
                const c = snap.val();
                pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
              });
            } else {
              
              isCaller = false;
              const remoteOffer = offerSnap.val();
              await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await answerRef.set(answer.toJSON());

              
              offerCandidatesRef.on('child_added', (snap) => {
                const c = snap.val();
                pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
              });
            }


            isInVC = true;
            vc.style.display = 'block';
            vcJoinBtn.style.display = 'none';
            vcLeaveBtn.style.display = 'inline-block';
            lobbyInput.value = vcLobby; 

            vcStatus.textContent = 'Waiting for peer...';
          };

          vcLeaveBtn.onclick = async () => {
            await stopVC();
          };

          vcMute.addEventListener('change', () => {
            if (!localStream) return;
            localStream.getAudioTracks().forEach(t => t.enabled = !vcMute.checked);
          });

          vcLobbyInput.addEventListener('change', () => {
            
            if (!isInVC) lobby = vcLobbyInput.value.trim() || 'default';
          });

          async function stopVC() {
            try {
              if (pc) {
                pc.getSenders().forEach(s => { try { if (s.track) s.track.stop(); } catch(e){} });
                pc.close();
                pc = null;
              }
              if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
                localStream = null;
              }
              // detach firebase listeners
              if (answerRef) answerRef.off();
              if (offerCandidatesRef) offerCandidatesRef.off();
              if (answerCandidatesRef) answerCandidatesRef.off();
              isInVC = false;
              isCaller = false;
              vc.style.display = 'none';
              vcJoinBtn.style.display = 'inline-block';
              vcLeaveBtn.style.display = 'none';
              vcStatus.textContent = 'Not connected';
              remoteAudio.srcObject = null;
            } catch (err) { console.error('[VC] stop error', err); }
          }

          window.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'v') {
              vc.style.display = (vc.style.display === 'none') ? 'block' : 'none';
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

          addVFSettingsToggle();
          changeSelectorBarColor();
          fpsDisplay();
          loadMessages();
          console.log('[VF] Chat + FPS + Settings initialized');
          createCrosshairElement(); 
          createKeyLayoutElement(); 
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