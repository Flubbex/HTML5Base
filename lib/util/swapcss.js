function swapCSS(el,path)
{
	el = el || function(){
              let out = document.createElement("link");
              window.document.head.appendChild(out);
             return out}();
             
  let out = {
  	el:el,
    swap:function(path){
      el.setAttribute('rel','stylesheet');
      el.setAttribute('href',path);
    }
  };
  
  if (path)
  	out.swap(path)
    
  return out
}

module.exports = swapCSS;