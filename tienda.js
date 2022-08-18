
/*
class Producto{
    constructor(id, marca, modelo, precio, stock, img, categoria ){
        this.id=id
        this.marca=marca
        this.modelo=modelo
        this.precio=precio
        this.stock=stock
        this.img=img
        this.categ=categoria
    }
}
*/
class LineaProducto{
    constructor(producto, cantidad){
        this.prod=producto;
        this.cant=cantidad;
    }
}
/*
let productos=[]

/*----- carga productos----*/
/*
let prod1= new Producto(25120,"Valdez","sqr_black",20000,3,"/gallery/card_recetados.jpg", "prodeojo Recetado");
productos.push(prod1);

let prod2= new Producto(25121,"Wanama","sqr_blue",18450,5,"/gallery/card_recetados2.jpg", "prodeojo Recetado");
productos.push(prod2);

let prod3= new Producto(25122,"Valdez","sqr_gold",31000,1,"/gallery/card_recetados3.jpg", "prodeojo Recetado");
productos.push(prod3);

let prod4= new Producto(25123,"Vulk","triangle_black",13000,2,"/gallery/card_recetados4.jpg", "prodeojo Recetado");
productos.push(prod4);

let prod5= new Producto(25124,"Ossira","sqr_brown",15000,3,"/gallery/card_recetados5.jpg", "prodeojo Recetado");
productos.push(prod5);


let prod6= new Producto(25125,"RayBan","rb_black",41200,2,"/gallery/card_sol.png", "prodeojo de Sol");
productos.push(prod6);

let prod7= new Producto(25126,"Rusty","poligon_mirror",20780,3,"/gallery/card_sol2.png", "prodeojo de Sol");
productos.push(prod7);

let prod8= new Producto(25127,"Vonk","cover_black",19300,1,"/gallery/card_sol3.jpg", "prodeojo de Sol");
productos.push(prod8);

let prod9= new Producto(25128,"RayBan","circle_gold",50100,3,"/gallery/card_sol4.jpg", "prodeojo de Sol");
productos.push(prod9);

let prod10= new Producto(25129,"RayBan","circle_brown",32000,2,"/gallery/card_sol5.jpg", "prodeojo de Sol");
productos.push(prod10);
*/
// --inicializaciones---
let carrito=document.getElementById("carrito");
let cart_list=document.getElementById("cart_list");
let total_tag=document.getElementById("totalAcum");
let btnFinalizar=document.getElementById("btnFin");
let btnReiniciar=document.getElementById("btnReiniciar");
let htmlCarrito="";
let total=0;
let htmlProd=``;

// ---obtener productos de json----
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
getProducts();


// -- mostrar productos en localStorage---
let prodEnCarrito;
if(localStorage.getItem("carrito")==null){
    prodEnCarrito=[];
}else{
    prodEnCarrito=JSON.parse(localStorage.getItem("carrito"));
    mostrarProdEnJSON();
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
        btn.addEventListener("click", function(){add_to_cart(prod)});
    }
    btnReiniciar.addEventListener("click", ()=>{
        prodEnCarrito=[];
        saveToJason(prodEnCarrito);
        mostrarProdEnJSON();
    })
}

function add_to_cart(prod){
    if (prodInCart(prod)){
        let itemCarrito= new LineaProducto(prod, 1);
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
        cart_list.innerHTML=htmlCarrito;
        saveToJason(prodEnCarrito);
        actualizarTotal();
        quitarItem(prodEnCarrito);
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
        cart_list.innerHTML=htmlCarrito;
    });
    quitarItem(prodEnCarrito);
    actualizarTotal();
}


function quitarItem(prods){
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
            cart_list.innerHTML=htmlCarrito;
            mostrarProdEnJSON();
            }
        });
    }
    );
    }
}

function quitarItemCarrito(item){

}

function prodInCart(prod){
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
    total_tag.innerText=tot;
}