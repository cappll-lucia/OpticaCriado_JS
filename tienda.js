//navBar
function myFunction() {
    var x = document.getElementById("myTopnav");
    x.className = "topnav";
    x.className += " responsive";
}


//tienda
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
let btnFinalize=document.getElementById("btnFin");
let btnRestart=document.getElementById("btnReiniciar");
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
        <div class="card product--card col-xl-2 col-lg-4 col-md-5 col-sm-5 col-10" style="width:400px">
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
    let shopSection=document.getElementById("shop_section");
    shopSection.innerHTML=htmlProd;
    loadEvents(products);
}


const loadEvents=(products)=>{
    for(const prod of products){
        let id=prod.id;
        let btn=document.getElementById(id);
        btn.addEventListener("click", function(){addToCart(prod)});
    }

    btnRestart.addEventListener("click", ()=>{
        if(prodInCart.length!=0){
            Swal.fire({
                title: 'Vaciar carrito',
                text: 'Se eliminarán todos los productos de tu carrito. ¿Está seguro?',
                showDenyButton: true,
                confirmButtonText: 'Vaciar carrito',
                denyButtonText: `Cancelar`,
            }).then((result) => {
                if (result.isConfirmed) {
                    prodInCart=[];
                    htmlCarrito=``;
                    cartList.innerHTML=htmlCarrito;
                    saveToJason(prodInCart);
                    mostrarProdEnJSON();
                    Swal.fire('','Se eliminaron los productos de tu carrito', 'success')
                }
            })
        }
        else{
            Swal.fire('','Aún no hay productos en su carrito', 'info')
        }
    });

    btnFinalize.addEventListener("click", ()=>{
        if(prodInCart.length!=0){
            prodInCart.forEach((itemCart)=>{
                console.log("stock antes: ", itemCart.prod.stock);
                itemCart.prod.stock=itemCart.prod.stock-itemCart.cant;
                console.log("stock despues: ", itemCart.prod.stock);
                // updateDataProds();
                Swal.fire({
                    title: 'Finalizar compra!',
                    text:'Completá este campo con tu correo electrónico y recibirás información para relizar el pago',
                    input: 'email',
                    inputAttributes: {
                        autocapitalize: 'off'
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Enviar',
                    cancelButtonText: 'Cancelar',
                    showLoaderOnConfirm: true
                    }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                        text: `Revisá tu casilla de mail`,
                        icon: 'success'
                        })
                    }
                    })
            })
        }
        else{
            Swal.fire('','Aún no hay productos para comprar en su carrito', 'info')
        }
    })

}

function addToCart(prod){
    if (prodAlreadyInCart(prod)){
        if(prod.stock>0){
            let itemCart= new ProductLine(prod, 1);
            prodInCart.push(itemCart);
            htmlCarrito+=`                                
            <div class="container-fluid unItem">
                <img src="${itemCart.prod.img}" alt="" class="imgList">
                <span class="marcaList">${itemCart.prod.brand}</span>
                <span class="modeloList">${itemCart.prod.description}</span>
                <span class="cantList" id="cantList_${itemCart.prod.id}">${itemCart.cant}</span>
                <span class="precioList">$ ${itemCart.prod.price}</span>
                <a href="#" id="quitar_${itemCart.prod.id}" class="btn btn_quitar "><i class="fa-solid fa-trash"></i></a>
            </div>`;
            cartList.innerHTML=htmlCarrito;
            saveToJason(prodInCart);
            updateTotal();
            btnRemoveItem(prodInCart);
            Toastify({
                text: "Se agregó un producto al carrito!",
                duration: 3000,
                style:{
                    background: "linear-gradient(to top, #f77062 0%, #fe5196 100%)",
                    color: "#fff",
                    fontfamily: "Poppins"
                }
                }).showToast();
        }else{
            notifyNoStock();
        }
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
                if(addUnitToCart(prod)){
                    saveToJason(prodInCart);
                    Toastify({
                        text: "Se agregó un producto al carrito!",
                        duration: 3000,
                        style:{
                            background: "linear-gradient(to top, #f77062 0%, #fe5196 100%)",
                            color: "#fff",
                            fontfamily: "Poppins"
                        }
                        }).showToast();
                } else{
                    notifyNoStock();
                }
            }
        })
    }
}

function saveToJason(listado){
    let carrito_json=JSON.stringify(listado);
    localStorage.setItem("carrito", carrito_json);
}

function mostrarProdEnJSON(){
    prodInCart.forEach((itemCart) => {
        htmlCarrito+=`                                
        <div class="container-fluid unItem">
            <img src="${itemCart.prod.img}" alt="" class="imgList">
            <span class="marcaList">${itemCart.prod.brand}</span>
            <span class="modeloList">${itemCart.prod.description}</span>
            <span class="cantList" id="cantList_${itemCart.prod.id}">${itemCart.cant}</span>
            <span class="precioList">$ ${itemCart.prod.price}</span>
            <a href="#" id="quitar_${itemCart.prod.id}" class="btn btn_quitar "><i class="fa-solid fa-trash"></i></a>
        </div>`;
        cartList.innerHTML=htmlCarrito;
    });
    btnRemoveItem(prodInCart);
    updateTotal();
}


function btnRemoveItem(prods){
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
            updateTotal();
            if (item.cant<1){
                let i=prods.indexOf(item);
                prods.splice(i,1);
                prodInCart=prods;
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
    if(prodInCart.length!=0){
        let found=prodInCart.filter(prodInCart=> prodInCart.prod.id==prod.id);
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
    let rta;
    prodInCart.forEach((itemCart)=>{
        if(itemCart.prod.id==prod.id){
            if(itemCart.cant<prod.stock){
                itemCart.cant+=1;
                let cant_tag=document.getElementById("cantList_"+itemCart.prod.id);
                cant_tag.innerHTML=itemCart.cant;
                updateTotal();
                rta=true;
            } else{
                rta=false;
            }
        }
    })
    return rta;
}

function updateTotal(){
    let tot=0;
    for(const item of prodInCart){
        tot+=item.prod.price*item.cant;
    }
    totalTag.innerText=tot;
}

const notifyNoStock=()=>{
    Swal.fire({
        title: 'Producto sin stock',
        text: 'Lo sentimos, en este momento el producto se encuentra sin stock',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    })
}





//-------- onLoad -------------

    // ---obtener productos de json----
    getProducts();

    // -- mostrar productos en localStorage---
    let prodInCart;
    if(localStorage.getItem("carrito")==null){
        prodInCart=[];
    }else{
        prodInCart=JSON.parse(localStorage.getItem("carrito"));
        mostrarProdEnJSON();
    }
