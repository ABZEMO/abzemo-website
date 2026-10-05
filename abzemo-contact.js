(function(){
  if(document.getElementById("abzemoContactDock")) return;

  var dock=document.createElement("nav");
  dock.id="abzemoContactDock";
  dock.className="abzemo-contact-dock";
  dock.setAttribute("aria-label","ABZEMO quick contact");

  var icons={
    whatsapp:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.83 11.83 0 0 0 12.08 0C5.55 0 .24 5.3.24 11.84c0 2.09.55 4.13 1.59 5.93L.13 24l6.38-1.67a11.82 11.82 0 0 0 5.57 1.41h.01c6.53 0 11.84-5.31 11.84-11.84 0-3.17-1.24-6.14-3.41-8.42ZM12.09 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.84 9.84 0 0 1-1.51-5.29C2.17 6.4 6.61 1.96 12.09 1.96c2.65 0 5.14 1.03 7.01 2.9a9.86 9.86 0 0 1 2.91 7.03c0 5.48-4.45 9.91-9.92 9.91Zm5.43-7.42c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.71.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z"/></svg>',
    phone:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.03-.24c1.13.38 2.34.58 3.56.58a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C11.72 21 3 12.28 3 2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.22.2 2.43.58 3.56a1 1 0 0 1-.24 1.03l-2.22 2.2Z"/></svg>',
    mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/></svg>',
    contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"/></svg>',
    message:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4v3l4-3h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 13H11.33L10 17v-1H4V5h16v11Z"/></svg>'
  };

  function item(href,label,detail,action,icon,extra){
    return '<a href="'+href+'" '+(extra||'')+' aria-label="'+label+'">'
      +'<span class="dock-icon">'+icon+'</span>'
      +'<span class="dock-panel" aria-hidden="true">'
      +'<span class="dock-panel-title">'+label+'</span>'
      +'<span class="dock-panel-detail">'+detail+'</span>'
      +'<span class="dock-panel-action">'+action+'</span>'
      +'</span></a>';
  }

  dock.innerHTML=
    item("https://wa.me/923337108770","WhatsApp","+92 333 7108770","Open WhatsApp",icons.whatsapp,'target="_blank" rel="noopener noreferrer"')
    +item("tel:+923337108770","Hotline","+92 333 7108770","Call Hotline",icons.phone)
    +item("mailto:info@abzemo.com","E-mail","info@abzemo.com","Send E-mail",icons.mail)
    +item("contact.html","Contact Us","Talk to the ABZEMO team","Open Contact Us",icons.contact)
    +item("online-message.html","Online Message","Send us your message","Open Online Message",icons.message);

  document.body.appendChild(dock);
})();