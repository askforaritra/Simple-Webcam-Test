(function(){
  var video = document.getElementById('webcam-stream');
  var $ = function(id){return document.getElementById(id)};
  var msg=$('msg'), startBtn=$('startBtn'), stopBtn=$('stopBtn'), shotBtn=$('shotBtn'), fsBtn=$('fsBtn');
  var deviceSel=$('deviceSel'), resSel=$('resSel'), mirror=$('mirror'), shots=$('shots');
  var status=$('status'), statusText=$('statusText');
  var stream=null, fpsTimer=null, shotCount=0;
  var liveFps=0, infoTimer=null, infoBusy=false, infoTab=false, audioInfo={mic:'–',spk:'–'};
  var NIDS=['n-name','n-score','n-mic','n-spk','n-fps','n-type','n-mode','n-mp','n-res','n-std','n-ar','n-png','n-jpg','n-bit','n-colors','n-rgb','n-light','n-lum','n-bri','n-hue','n-sat'];

  function selectTab(name){
    ['stream','info'].forEach(function(n){
      $('tabBtn-'+n).setAttribute('aria-selected', n===name ? 'true' : 'false');
      $('tab-'+n).hidden = n!==name;
    });
    infoTab = name==='info';
    if(infoTab) analyze();
  }
  $('tabBtn-stream').addEventListener('click', function(){ selectTab('stream'); });
  $('tabBtn-info').addEventListener('click', function(){ selectTab('info'); });

  function fmtSize(b){ return b>=1048576 ? (b/1048576).toFixed(2)+' MB' : Math.round(b/1024)+' KB'; }
  function pct(x){ return (x*100).toFixed(2)+'%'; }

  async function detectAudio(){
    try{
      var t = stream && stream.getVideoTracks()[0]; if(!t) return;
      var id = t.getSettings().deviceId;
      var all = await navigator.mediaDevices.enumerateDevices();
      var cam = all.filter(function(d){return d.kind==='videoinput' && d.deviceId===id;})[0];
      if(!cam || !cam.groupId){ audioInfo={mic:'Not detected',spk:'Not detected'}; return; }
      var pick = function(kind){ var m = all.filter(function(d){return d.kind===kind && d.groupId===cam.groupId;}); return m.length ? (m[0].label || 'Yes') : 'None'; };
      audioInfo = {mic:pick('audioinput'), spk:pick('audiooutput')};
    }catch(e){ audioInfo={mic:'Not detected',spk:'Not detected'}; }
  }

  function startInfo(){
    stopInfo();
    detectAudio().then(function(){ if(infoTab) analyze(); });
    infoTimer = setInterval(function(){ if(infoTab) analyze(); }, 2000);
    if(infoTab) analyze();
  }
  function stopInfo(){
    clearInterval(infoTimer); infoTimer=null;
    audioInfo={mic:'–',spk:'–'};
    NIDS.forEach(function(id){ $(id).textContent='–'; });
  }

  function analyze(){
    if(!stream || infoBusy || !video.videoWidth) return;
    var track = stream.getVideoTracks()[0]; if(!track) return;
    infoBusy = true;
    var w=video.videoWidth, h=video.videoHeight, n=w*h;
    var s = track.getSettings ? track.getSettings() : {};
    var fps = liveFps || s.frameRate || 0;
    var c = document.createElement('canvas'); c.width=w; c.height=h;
    var ctx = c.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(video,0,0,w,h);
    var data = ctx.getImageData(0,0,w,h).data;
    var seen = new Uint32Array(524288), colors=0, r=0, g=0, b=0;
    for(var i=0;i<data.length;i+=4){
      var R=data[i], G=data[i+1], B=data[i+2];
      r+=R; g+=G; b+=B;
      var k=(R<<16)|(G<<8)|B, wi=k>>>5, bit=1<<(k&31);
      if(!(seen[wi]&bit)){ seen[wi]|=bit; colors++; }
    }
    var ar=r/n, ag=g/n, ab=b/n, rr=ar/255, gg=ag/255, bb=ab/255;
    var mx=Math.max(rr,gg,bb), mn=Math.min(rr,gg,bb), d=mx-mn, l=(mx+mn)/2, sat=0, hue=0;
    if(d>0){
      sat = d/(1-Math.abs(2*l-1));
      if(mx===rr) hue=((gg-bb)/d)%6; else if(mx===gg) hue=(bb-rr)/d+2; else hue=(rr-gg)/d+4;
      hue*=60; if(hue<0) hue+=360;
    }
    var lum=0.2126*rr+0.7152*gg+0.0722*bb, bri=(rr+gg+bb)/3;
    var hgt = h>=2160 ? '4K UHD' : h>=1440 ? 'QHD' : h>=1080 ? 'FHD' : h>=720 ? 'HD' : h>=480 ? 'SD' : 'Below SD';
    var score = Math.round(Math.min(1,n/(1920*1080))*700 + Math.min(1,fps/30)*300);
    c.toBlob(function(png){
      c.toBlob(function(jpg){
        infoBusy=false;
        if(!stream) return;
        $('n-name').textContent = track.label || '–';
        $('n-score').textContent = score;
        $('n-mic').textContent = audioInfo.mic;
        $('n-spk').textContent = audioInfo.spk;
        $('n-fps').textContent = fps ? Math.round(fps)+' FPS' : '–';
        $('n-type').textContent = 'video';
        $('n-mode').textContent = 'rgb';
        $('n-mp').textContent = (n/1e6).toFixed(2)+' MP';
        $('n-res').textContent = w+'×'+h;
        $('n-std').textContent = hgt;
        $('n-ar').textContent = (w/h).toFixed(2);
        $('n-png').textContent = png ? fmtSize(png.size) : '–';
        $('n-jpg').textContent = jpg ? fmtSize(jpg.size) : '–';
        $('n-bit').textContent = (jpg && fps) ? (jpg.size*fps/1048576).toFixed(2)+' MB/s' : '–';
        $('n-colors').textContent = colors.toLocaleString();
        var box=$('n-rgb'), sw=document.createElement('span'), t=document.createElement('small');
        sw.className='swatch'; sw.style.background='rgb('+Math.round(ar)+','+Math.round(ag)+','+Math.round(ab)+')';
        t.textContent='rgb('+Math.round(ar)+', '+Math.round(ag)+', '+Math.round(ab)+')';
        box.textContent=''; box.appendChild(sw); box.appendChild(t);
        $('n-light').textContent = pct(l);
        $('n-lum').textContent = pct(lum);
        $('n-bri').textContent = pct(bri);
        $('n-hue').textContent = Math.round(hue)+'°';
        $('n-sat').textContent = pct(sat);
      }, 'image/jpeg', 0.92);
    }, 'image/png');
  }

  function setStatus(kind, text){
    status.className = 'status ' + (kind||'');
    statusText.textContent = text;
  }
  function showMsg(text, isErr){
    msg.hidden = !text; msg.textContent = text||''; msg.className = 'msg' + (isErr?' err':'');
  }
  function errText(e){
    switch(e && e.name){
      case 'NotAllowedError': return 'Camera access was blocked. Allow camera permission for this site in your browser, then select Start camera again.';
      case 'NotFoundError': return 'No camera was found. Connect a camera and try again.';
      case 'NotReadableError': return 'The camera is in use by another app or tab. Close it and try again.';
      case 'OverconstrainedError': return 'This camera does not support that resolution. Choose a different one.';
      case 'SecurityError': return 'The browser blocked camera access on this page. Open it over HTTPS in its own tab.';
      default: return 'Could not start the camera' + (e && e.message ? ': ' + e.message : '.');
    }
  }

  async function listDevices(currentId){
    try{
      var all = await navigator.mediaDevices.enumerateDevices();
      var cams = all.filter(function(d){return d.kind==='videoinput'});
      $('i-count').textContent = cams.length;
      deviceSel.innerHTML = '';
      cams.forEach(function(d,i){
        var o = document.createElement('option');
        o.value = d.deviceId; o.textContent = d.label || ('Camera ' + (i+1));
        if(d.deviceId===currentId) o.selected = true;
        deviceSel.appendChild(o);
      });
      deviceSel.disabled = cams.length === 0;
      if(!cams.length) deviceSel.innerHTML = '<option>No cameras found</option>';
    }catch(e){}
  }

  function updateInfo(){
    if(!stream) return;
    var track = stream.getVideoTracks()[0]; if(!track) return;
    var s = track.getSettings ? track.getSettings() : {};
    $('i-label').textContent = track.label || '–';
    $('i-res').textContent = (s.width && s.height) ? s.width+' × '+s.height : (video.videoWidth+' × '+video.videoHeight);
    $('i-fps').textContent = s.frameRate ? Math.round(s.frameRate)+' fps' : '–';
    $('i-facing').textContent = s.facingMode || 'not reported';
  }

  function startFpsMeter(){
    stopFpsMeter();
    if(!('requestVideoFrameCallback' in HTMLVideoElement.prototype)){ $('i-live').textContent='not supported'; return; }
    var frames=0, last=performance.now();
    function tick(now){
      frames++;
      if(now-last>=1000){ liveFps = frames*1000/(now-last); $('i-live').textContent = Math.round(liveFps)+' fps'; frames=0; last=now; }
      if(stream) video.requestVideoFrameCallback(tick);
    }
    video.requestVideoFrameCallback(tick);
  }
  function stopFpsMeter(){ liveFps=0; $('i-live').textContent='–'; }

  async function start(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      showMsg('This browser does not support camera access, or the page is not on HTTPS.', true);
      setStatus('err','Unsupported'); return;
    }
    stop(true);
    startBtn.disabled = true; setStatus('', 'Requesting access…'); showMsg('Waiting for camera permission…');
    var v = {};
    if(deviceSel.value && !deviceSel.disabled && deviceSel.options[deviceSel.selectedIndex] && deviceSel.value.length>8) v.deviceId = {exact: deviceSel.value};
    if(resSel.value){ var p=resSel.value.split('x'); v.width={ideal:+p[0]}; v.height={ideal:+p[1]}; }
    try{
      stream = await navigator.mediaDevices.getUserMedia({video: Object.keys(v).length ? v : true, audio:false});
      video.srcObject = stream;
      await video.play().catch(function(){});
      showMsg('');
      var track = stream.getVideoTracks()[0];
      track.addEventListener('ended', function(){ stop(); setStatus('err','Camera disconnected'); showMsg('The camera was disconnected.', true); });
      setStatus('live','Live');
      stopBtn.disabled=false; shotBtn.disabled=false; fsBtn.disabled=false;
      await listDevices(track.getSettings ? track.getSettings().deviceId : undefined);
      video.addEventListener('loadedmetadata', updateInfo, {once:true});
      updateInfo(); startFpsMeter(); startInfo(); setBlur();
    }catch(e){
      stream=null; showMsg(errText(e), true); setStatus('err','Not working');
    }finally{
      startBtn.disabled=false;
    }
  }

  function stop(silent){
    if(stream){ stream.getTracks().forEach(function(t){t.stop()}); stream=null; }
    video.srcObject = null;
    stopFpsMeter();
    stopBtn.disabled=true; shotBtn.disabled=true; fsBtn.disabled=true;
    ['i-label','i-res','i-fps','i-facing'].forEach(function(id){$(id).textContent='–'});
    stopInfo(); stopBlur();
    if(!silent){ setStatus('','Camera off'); showMsg('Camera stopped. Select Start camera to turn it on again.'); }
  }

  function snapshot(){
    if(!stream || !video.videoWidth) return;
    var c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    var ctx = c.getContext('2d');
    if(mirror.checked){ ctx.translate(c.width,0); ctx.scale(-1,1); }
    ctx.drawImage((!blurCv.hidden && blurCv.width===video.videoWidth) ? blurCv : video,0,0);
    var url = c.toDataURL('image/png');
    shotCount++;
    var a = document.createElement('a');
    a.href = url; a.download = 'snapshot-'+shotCount+'.png'; a.title='Download snapshot '+shotCount;
    var img = new Image(); img.src = url; img.alt = 'Snapshot '+shotCount;
    a.appendChild(img); shots.insertBefore(a, shots.firstChild);
  }

  function fullscreen(){
    var stage = video.parentElement;
    if(document.fullscreenElement){ document.exitFullscreen(); }
    else if(stage.requestFullscreen){ stage.requestFullscreen().catch(function(){}); }
  }

  var RES=[
    {name:'360p',size:'640×360',w:640,h:360,teams:'Yes',zoom:'Yes (default)',meet:'Yes (default)',slack:'Yes'},
    {name:'720p (HD)',size:'1280×720',w:1280,h:720,teams:'Yes',zoom:'Yes (HD setting)',meet:'Yes (selectable)',slack:'Yes'},
    {name:'1080p (Full HD)',size:'1920×1080',w:1920,h:1080,teams:'Yes (maximum)',zoom:'Yes (must be enabled)',meet:'Yes (selectable)',slack:'Yes'},
    {name:'4K (UHD)',size:'3840×2160',w:3840,h:2160,teams:'No',zoom:'No',meet:'No',slack:'Yes (up to 4K)'}
  ];
  var resCells=[];
  (function(){
    var tb=document.querySelector('#resTable tbody');
    RES.forEach(function(r){
      var tr=document.createElement('tr');
      [r.name,r.size,r.teams,r.zoom,r.meet,r.slack,'Not tested'].forEach(function(t,i){
        var td=document.createElement('td'); td.textContent=t; tr.appendChild(td);
        if(i===6) resCells.push(td);
      });
      tb.appendChild(tr);
    });
  })();

  async function testRes(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ $('resStatus').textContent='Camera access is not available here.'; return; }
    var btn=$('resTestBtn'), wasLive=!!stream;
    var devId=(deviceSel.value && !deviceSel.disabled && deviceSel.value.length>8) ? deviceSel.value : null;
    var temp=null, track=null, orig=null;
    btn.disabled=true; startBtn.disabled=true;
    $('resStatus').textContent='Testing…';
    try{
      if(wasLive){ track=stream.getVideoTracks()[0]; }
      else{
        $('resStatus').textContent='Testing… allow camera access once if asked.';
        temp=await navigator.mediaDevices.getUserMedia({video: devId ? {deviceId:{exact:devId}} : true, audio:false});
        track=temp.getVideoTracks()[0];
      }
    }catch(e){
      btn.disabled=false; startBtn.disabled=false;
      resCells.forEach(function(td){ td.textContent=e.name==='NotAllowedError' ? 'Blocked' : 'Camera busy'; });
      $('resStatus').textContent='Could not open the camera.'; return;
    }
    orig=track.getSettings();
    for(var i=0;i<RES.length;i++){
      var r=RES[i], td=resCells[i]; td.textContent='Testing…';
      try{
        await track.applyConstraints({width:{exact:r.w},height:{exact:r.h}});
        var st=track.getSettings();
        td.textContent=(st.width===r.w && st.height===r.h) ? 'Supported' : 'Not supported (got '+st.width+'×'+st.height+')';
      }catch(e){
        td.textContent=e.name==='NotAllowedError' ? 'Blocked' : e.name==='NotReadableError' ? 'Camera busy' : 'Not supported';
      }
    }
    if(wasLive){ try{ await track.applyConstraints({width:{ideal:orig.width},height:{ideal:orig.height}}); }catch(e){} updateInfo(); }
    else if(temp){ temp.getTracks().forEach(function(t){t.stop();}); }
    btn.disabled=false; startBtn.disabled=false;
    $('resStatus').textContent='Done.';
  }
  $('resTestBtn').addEventListener('click', testRes);

  var blurChk=$('blurChk'), blurAmt=$('blurAmt'), blurCv=$('blurCanvas'), blurMode=$('blurMode');
  var blurRaf=0, blurNative=false, small=document.createElement('canvas'), sharp=document.createElement('canvas');

  function nativeBlurCap(){
    try{ var t=stream&&stream.getVideoTracks()[0], c=t&&t.getCapabilities&&t.getCapabilities(); return !!(c&&c.backgroundBlur&&c.backgroundBlur.indexOf(true)>-1); }catch(e){ return false; }
  }
  function stopBlur(){
    cancelAnimationFrame(blurRaf); blurCv.hidden=true; blurNative=false; blurAmt.disabled=true; blurMode.textContent='';
  }
  function drawBlur(){
    blurRaf=requestAnimationFrame(drawBlur);
    if(!stream || !video.videoWidth) return;
    var w=video.videoWidth, h=video.videoHeight, k=+blurAmt.value;
    if(blurCv.width!==w || blurCv.height!==h){ blurCv.width=w; blurCv.height=h; sharp.width=w; sharp.height=h; }
    small.width=Math.max(1,Math.round(w/k)); small.height=Math.max(1,Math.round(h/k));
    small.getContext('2d').drawImage(video,0,0,small.width,small.height);
    var ctx=blurCv.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(small,0,0,w,h);
    var sx=sharp.getContext('2d');
    sx.globalCompositeOperation='source-over'; sx.clearRect(0,0,w,h); sx.drawImage(video,0,0,w,h);
    sx.globalCompositeOperation='destination-in';
    sx.save(); sx.translate(w/2,h/2); sx.scale(w*0.3,h*0.5);
    var gr=sx.createRadialGradient(0,0,0.5,0,0,1); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)');
    sx.fillStyle=gr; sx.fillRect(-3,-3,6,6); sx.restore();
    ctx.drawImage(sharp,0,0);
  }
  async function setBlur(){
    var t=stream&&stream.getVideoTracks()[0];
    if(blurNative && t){ try{ await t.applyConstraints({advanced:[{backgroundBlur:false}]}); }catch(e){} }
    stopBlur();
    if(!blurChk.checked || !t) return;
    if(nativeBlurCap()){
      try{ await t.applyConstraints({advanced:[{backgroundBlur:true}]}); blurNative=true; blurMode.textContent='Using device background blur'; return; }catch(e){}
    }
    blurCv.hidden=false; blurAmt.disabled=false; blurMode.textContent='Center focus blur'; drawBlur();
  }
  blurChk.addEventListener('change', setBlur);

  mirror.addEventListener('change', function(){ video.classList.toggle('mirror', mirror.checked); blurCv.classList.toggle('mirror', mirror.checked); });
  blurCv.classList.toggle('mirror', mirror.checked);
  video.classList.toggle('mirror', mirror.checked);
  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', function(){ stop(); });
  shotBtn.addEventListener('click', snapshot);
  fsBtn.addEventListener('click', fullscreen);
  deviceSel.addEventListener('change', function(){ if(stream) start(); });
  resSel.addEventListener('change', async function(){
    if(!stream) return;
    var t=stream.getVideoTracks()[0], p=(resSel.value||'640x480').split('x');
    try{
      await t.applyConstraints({width:{exact:+p[0]},height:{exact:+p[1]}});
      showMsg(''); updateInfo(); if(infoTab) analyze();
    }catch(e){
      var cur=t.getSettings();
      showMsg('This camera does not support '+p[0]+'×'+p[1]+'. Still showing '+cur.width+'×'+cur.height+'.', true);
      setTimeout(function(){ if(stream) showMsg(''); }, 3500);
    }
  });
  if(navigator.mediaDevices && navigator.mediaDevices.addEventListener){
    navigator.mediaDevices.addEventListener('devicechange', function(){ listDevices(deviceSel.value); });
  }
})();
