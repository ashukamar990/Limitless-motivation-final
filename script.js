(function(){const imgs=[...document.querySelectorAll('#homeCarousel img')];if(!imgs.length)return;let i=0;setInterval(()=>{imgs[i].classList.remove('active');i=(i+1)%imgs.length;imgs[i].classList.add('active');},2500);})();const PRODUCTS=[{id:1,title:"Women's Floral Summer Dress",price:899,desc:"Lightweight breathable fabric",images:["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=60","https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=60","https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=60"]},{id:2,title:"Men's Casual T-Shirt",price:499,desc:"100% cotton, regular fit",images:["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=60","https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=60","https://images.unsplash.com/photo-1520971282009-2c7e9f7d8dbe?auto=format&fit=crop&w=900&q=60"]},{id:3,title:"Women's High‑Waist Jeans",price:999,desc:"Stretch denim with comfort fit",images:["https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=60","https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=60"]},{id:4,title:"Men's Formal Shirt",price:799,desc:"Slim fit, easy iron",images:["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=60","https://images.unsplash.com/photo-1520975698513-2d2a5c8b8f0b?auto=format&fit=crop&w=900&q=60"]}];function renderProducts(){const grid=document.getElementById('grid');if(!grid) return;grid.innerHTML='';PRODUCTS.forEach(p=>{const div=document.createElement('div');div.className='card';div.innerHTML=`
      <div class="img" style="background-image:url('${p.images[0]}')"></div>
      <div class="body">
        <div style="font-weight:900">${{p.title}}</div>
        <div><span class="price">₹${{p.price}}</span><span class="strike">₹${{Math.round(p.price*1.5)}}</span></div>
        <div style="color:#64748b;font-size:13px">${{p.desc}}</div>
        <div style="margin-top:auto;display:flex;gap:8px">
          <a class="btn primary" href="products.html#${{p.id}}">Start Shopping</a>
          <button class="btn secondary" onclick="openQuick(${{p.id}})">View</button>
        </div>
      </div>`;grid.appendChild(div);});}
function openQuick(id){const p=PRODUCTS.find(x=>x.id===id);const dlg=document.createElement('dialog');dlg.style.border='0';dlg.style.borderRadius='14px';dlg.style.maxWidth='860px';dlg.style.width='92%';let thumbs='';p.images.forEach((src,i)=>thumbs+=`<div class="thumb ${i===0?'sel':''}" data-src="${src}" style="background-image:url('${src}')"></div>`);dlg.innerHTML=`
    <div style="padding:12px">
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1 1 320px">
          <div id="mainImg" style="height:320px;border-radius:14px;background:#eee;background-size:cover;background-position:center;background-image:url('${p.images[0]}')"></div>
          <div class="thumbs">${thumbs}</div>
        </div>
        <div style="flex:1 1 280px">
          <h3 style="margin:4px 0">${p.title}</h3>
          <div><span class="price">₹${p.price}</span><span class="strike">₹${Math.round(p.price*1.5)}</span></div>
          <p style="color:#64748b">${p.desc}</p>
          <a class="btn primary" href="contact.html">Contact to Order</a>
          <button class="btn secondary" onclick="this.closest('dialog').close()">Close</button>
        </div>
      </div>
    </div>`;document.body.appendChild(dlg);dlg.showModal();dlg.addEventListener('close',()=>dlg.remove());dlg.querySelectorAll('.thumb').forEach(t=>t.addEventListener('click',()=>{dlg.querySelectorAll('.thumb').forEach(x=>x.classList.remove('sel'));t.classList.add('sel');dlg.querySelector('#mainImg').style.backgroundImage=`url('${t.dataset.src}')`;}));}
document.addEventListener('DOMContentLoaded',()=>{renderProducts();const s=document.getElementById('search');if(s){s.addEventListener('input',e=>{const q=e.target.value.toLowerCase().trim();const grid=document.getElementById('grid');grid.innerHTML='';(q?PRODUCTS.filter(p=>p.title.toLowerCase().includes(q)):PRODUCTS).forEach(p=>{const d=document.createElement('div');d.className='card';d.innerHTML=`<div class="img" style="background-image:url('${p.images[0]}')"></div>
        <div class="body">
          <div style="font-weight:900">${{p.title}}</div>
          <div><span class="price">₹${{p.price}}</span><span class="strike">₹${{Math.round(p.price*1.5)}}</span></div>
          <div style="color:#64748b;font-size:13px">${{p.desc}}</div>
          <div style="margin-top:auto;display:flex;gap:8px">
            <a class="btn primary" href="products.html#${{p.id}}">Grab deals</a>
            <button class="btn secondary" onclick="openQuick(${{p.id}})">View</button>
          </div>
        </div>`;grid.appendChild(d);});});}});