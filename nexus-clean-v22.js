(function(){
  document.documentElement.classList.add('nexus-v22');
  function titleOf(el){
    const h=el.querySelector('h1,h2,.section-title,.agent-title');
    const pill=el.querySelector('.pill,.agent-kicker');
    let main=(h&&h.textContent.trim())||'更多内容';
    main=main.replace(/。$/,'');
    let sub=(pill&&pill.textContent.trim())||'点击展开查看';
    return {main,sub};
  }
  function fold(el,open){
    if(!el||el.dataset.v22Folded)return;
    const t=titleOf(el);
    const body=document.createElement('div');
    body.className='fold-body';
    while(el.firstChild){body.appendChild(el.firstChild)}
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='fold-summary';
    btn.innerHTML='<div>'+t.main+'<span>'+t.sub+'</span></div>';
    btn.addEventListener('click',function(){el.classList.toggle('is-folded')});
    el.appendChild(btn); el.appendChild(body);
    el.classList.add('fold-section');
    if(!open)el.classList.add('is-folded');
    el.dataset.v22Folded='1';
  }
  const page=(location.pathname.split('/').pop()||'index.html');
  // Fold technical/explanatory secondary content by default, keep core product path open.
  document.querySelectorAll('.agent-panel').forEach(function(el){fold(el,false)});
  if(page==='index.html'||page===''){
    ['share','schools','agent-system'].forEach(function(id){const el=document.getElementById(id); if(el) fold(el,false)});
    document.querySelectorAll('section.card').forEach(function(el){
      const txt=el.textContent||'';
      if(txt.includes('哪里值得花钱')||txt.includes('少花冤枉钱')) fold(el,false);
    });
  }
  if(page==='status.html'){
    document.querySelectorAll('section.card').forEach(function(el){
      const txt=el.textContent||'';
      if(txt.includes('花钱建议')||txt.includes('后台由背景诊断')) fold(el,false);
    });
  }
  if(window.innerWidth<=760){
    // On mobile, make long secondary cards collapsible after the first two main sections.
    document.querySelectorAll('main section.card, .shell > section.card').forEach(function(el,i){
      if(i>1 && !el.dataset.v22Folded && !el.classList.contains('hero')) fold(el,false);
    });
  }
})();
