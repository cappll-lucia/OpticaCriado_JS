

class ProductLine{
    constructor(producto, cantidad){
        this.prod=producto;
        this.cant=cantidad;
    }
}

// --inicializaciones---
let carrito=document.getElementById("carrito");
let cartList=document.getElementById("cart_list");
let totalTag=document.getElementById("totalAcum");
let btnFinalizar=document.getElementById("btnFin");
let btnReiniciar=document.getElementById("btnReiniciar");
let htmlCarrito="";
let total=0;
let htmlProd=``;




const getProducts= async() =>
{
    try
    {
        const response= await fetch("data/products.json");
        const data = await response.json();
        loadProducts(data);
    }
    catch(error)
    {
        console.log(error);
    }
}


/*--- Mostrar productos ---*/
const loadProducts=(products)=>{
    for (const prod of products){
        htmlProd+=
        `
        <div class="card product--card col-xl-2 col-lg-4 col-md-5 col-sm-4 col-10" style="width:400px">
        <img class="card-img-bottom" src="${prod.img}" alt="Card image" style="width:100%">
        <div class="card-body">
            <h5 class="card-title">$ ${prod.price}</h5>
            <p class="card-text">${prod.brand}</p>
            <p class="card-text model">${prod.description}</p>
            <a href="#" class="btn card-btn btn-primary btn_buy" id="${prod.id}">Agregar <i class="fa-solid fa-cart-shopping"></i></a>
        </div>
        </div>
        `;
    }
    let shop_section=document.getElementById("shop_section");
    shop_section.innerHTML=htmlProd;
    loadEvents(products);
}


const loadEvents=(products)=>{
    for(const prod of products){
        let id=prod.id;
        let btn=document.getElementById(id);
        btn.addEventListener("click", function(){addToCart(prod)});
    }
    btnReiniciar.addEventListener("click", ()=>{
        prodEnCarrito=[];
        saveToJason(prodEnCarrito);
        mostrarProdEnJSON();
    })
}

function addToCart(prod){
    if (prodAlreadyInCart(prod)){
        let itemCarrito= new ProductLine(prod, 1);
        prodEnCarrito.push(itemCarrito);
        htmlCarrito+=`                                
        <div class="container-fluid unItem">
            <img src="${itemCarrito.prod.img}" alt="" class="imgList">
            <span class="marcaList">${itemCarrito.prod.brand}</span>
            <span class="modeloList">${itemCarrito.prod.description}</span>
            <span class="cantList" id="cantList_${itemCarrito.prod.id}">${itemCarrito.cant}</span>
            <span class="precioList">$ ${itemCarrito.prod.price}</span>
            <a href="#" id="quitar_${itemCarrito.prod.id}" class="btn btn_quitar "><i class="fa-solid fa-trash"></i></a>
        </div>`;
        cartList.innerHTML=htmlCarrito;
        saveToJason(prodEnCarrito);
        actualizarTotal();
        btnQuitarItem(prodEnCarrito);
        Toastify({
            text: "Se agregó un producto al carrito!",
            duration: 3000,
            style:{
                background: "linear-gradient(to top, #f77062 0%, #fe5196 100%)",
                color: "#fff",
                fontfamily: "Poppins"
            }
            }).showToast();
    }
    else{
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false,
        })
        
        swalWithBootstrapButtons.fire({
            title: 'El producto ya existe en su carrito!',
            text: "Desea agregar una unidad más del producto al carrito?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, agregar 1 unidad!',
            cancelButtonText: 'No agregar!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                addUnitToCart(prod);
                saveToJason(prodEnCarrito);
                Toastify({
                    text: "Se agregó un producto al carrito!",
                    duration: 3000,
                    style:{
                        background: "linear-gradient(to top, #f77062 0%, #fe5196 100%)",
                        color: "#fff",
                        fontfamily: "Poppins"
                    }
                    }).showToast();
            }
        })
    }
}

function saveToJason(listado){
    let carrito_json=JSON.stringify(listado);
    localStorage.setItem("carrito", carrito_json);
}

function mostrarProdEnJSON(){
    prodEnCarrito.forEach((itemCarrito) => {
        htmlCarrito+=`                                
        <div class="container-fluid unItem">
            <img src="${itemCarrito.prod.img}" alt="" class="imgList">
            <span class="marcaList">${itemCarrito.prod.brand}</span>
            <span class="modeloList">${itemCarrito.prod.description}</span>
            <span class="cantList" id="cantList_${itemCarrito.prod.id}">${itemCarrito.cant}</span>
            <span class="precioList">$ ${itemCarrito.prod.price}</span>
            <a href="#" id="quitar_${itemCarrito.prod.id}" class="btn btn_quitar "><i class="fa-solid fa-trash"></i></a>
        </div>`;
        cartList.innerHTML=htmlCarrito;
    });
    btnQuitarItem(prodEnCarrito);
    actualizarTotal();
}


function btnQuitarItem(prods){
    for(const item of prods){
        let id="quitar_"+item.prod.id;
        let btn_quitar=document.getElementById(id);
        btn_quitar.addEventListener("click", function(){
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })
        swalWithBootstrapButtons.fire({
            // title: 'Desea eliminar este producto de su carrito?',
            text: 'Desea eliminar una unidad de este producto de su carrito?',
            imageUrl: item.prod.img,
            imageWidth: 200,
            imageAlt: 'Custom image',
            showCancelButton: true,
            confirmButtonText: 'Si, quitar del carrito',
            cancelButtonText: 'No, cancelar',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
            swalWithBootstrapButtons.fire(
                'Eliminado!',
                'El producto fue removido de tu carrito',
                'success'
                );
            item.cant=item.cant-1;
            actualizarTotal();
            if (item.cant<1){
                let i=prods.indexOf(item);
                prods.splice(i,1);
                prodEnCarrito=prods;
            }
            saveToJason(prods);
            htmlCarrito=``;
            cartList.innerHTML=htmlCarrito;
            mostrarProdEnJSON();
            }
        });
    }
    );
    }
}

function prodAlreadyInCart(prod){
    if(prodEnCarrito.length!=0){
        let found=prodEnCarrito.filter(prodEnCarrito=> prodEnCarrito.prod.id==prod.id);
        if(found.length!=0){
            return false;
        }
        else{
            return true; 
        }
    }
    else{
        return true;
    }
}

function addUnitToCart(prod){
    prodEnCarrito.forEach((itemCarrito)=>{
        if(itemCarrito.prod.id==prod.id){
            itemCarrito.cant+=1;
            let cant_tag=document.getElementById("cantList_"+itemCarrito.prod.id);
            cant_tag.innerHTML=itemCarrito.cant;
            actualizarTotal();
            
        }
    })
}

function actualizarTotal(){
    let tot=0;
    for(const item of prodEnCarrito){
        tot+=item.prod.price*item.cant;
    }
    totalTag.innerText=tot;
}




//-------- Principal algorithm -------------

    // ---obtener productos de json----
    getProducts();

    // -- mostrar productos en localStorage---
    let prodEnCarrito;
    if(localStorage.getItem("carrito")==null){
        prodEnCarrito=[];
    }else{
        prodEnCarrito=JSON.parse(localStorage.getItem("carrito"));
        mostrarProdEnJSON();
    }
