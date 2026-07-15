// extracted from WZLAYOUT_INJECT (was a runtime monkey-patch)
/*WZLAYOUT_INJECT*/
(function(){if(window.__wzLayout)return;window.__wzLayout=1;
 function css(){if(document.getElementById('wz-layout-css'))return;var s=document.createElement('style');s.id='wz-layout-css';s.textContent="@media(min-width:900px){#p-dash.page.active{display:grid !important;}#dash-sidebar{position:sticky;top:56px;align-self:start;max-height:calc(100vh - 64px);overflow:auto;overscroll-behavior:contain;}}";document.head.appendChild(s);}
 setTimeout(css,100);setTimeout(css,700);setTimeout(css,1600);
})();
