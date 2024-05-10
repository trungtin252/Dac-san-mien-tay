const $ = document.querySelector.bind(document);

const currentUserAPI = "http://localhost:3000/currentUser";
const cartAPI = "http://localhost:3000/carts";
const storageAPI = "http://localhost:3000/storage";
function getCurrentUser(callback) {
    fetch(currentUserAPI)
        .then(res => res.json())
        .then(callback);
}

getCurrentUser(user => {
    if (user.id != null) {
        let link_taikhoan = document.querySelector("#link_taikhoan");
        link_taikhoan.href = "user.html";
        link_taikhoan.innerHTML =
            `
                <i class="bi bi-person-circle pe-2"></i>
                Xin chào ${user.username}
            `
    }
})
//----------------- Nut gio hang ----------------
const cart_icon = document.querySelector("#cart_icon");
cart_icon.addEventListener("click", () => {
    getCurrentUser(user => {
        if (user.id == null) {
            window.location.href = "login.html";
            alert("Vui lòng đăng nhập trước khi xem giỏ hàng");
        } else {
            window.location.href = "user.html";
        }
    })
})


// Lấy mã sản phẩm từ URL
const params = new URLSearchParams(window.location.search);
const productId = params.get('masp');

// Hàm để lấy dữ liệu sản phẩm và hiển thị chi tiết
function fetchProductDetail() {

    fetch("JsonServer/database.json")
        .then(response => response.json())
        .then(products => {
            const product = products.storage.find(p => p.masp === productId);
            displayProduct(product);
            detail(product);
            // addCart(product);
        })
        .catch(error => console.error('Lỗi khi lấy dữ liệu:', error));

}

function displayProduct(product) {
    if (product) {
        const container = document.getElementById('product-container');
        container.innerHTML = `
        <div class="product-detail" id="products">
        <div class="product-image">
            <!-- Carousel start -->
            <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                    <div class="carousel-item active">
                        <img src="${product.photo1}" class="d-block w-100" alt="${product.name}">
                    </div>
                    <div class="carousel-item">
                        <img src="${product.photo2}" class="d-block w-100" alt="${product.name}">
                    </div>
                    <!-- Thêm thẻ div với class 'carousel-item' cho mỗi hình ảnh khác bạn muốn hiển thị -->
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Trước</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Tiếp theo</span>
                </button>
            </div>
            <!-- Carousel end -->
        </div>
        <div class="product-info">
            <h1>${product.name}</h1>
            <h5 class="price">Giá : ${product.price}<sup>đ</sup>/${product.dvt}</h5>
            <p>Mô tả : ${product.content}</p>
            <div class="addcart">
                <input type="number" value="1" min="1" id="input_soluong">
                <button class="btn btn-primary" value="${product.masp}" id="addCartBtn">Thêm vào giỏ hàng</button>
            </div>
        </div>
    </div>
    `;
    } else {
        console.error('Sản phẩm không tồn tại!');
    }
}

// Hàm để hiển thị chi tiết sản phẩm
function detail(product) {
    if (product) {
        const container = document.getElementById('detail');
        container.innerHTML = `
        <br>
        <h3>Thông Tin Sản Phẩm</h3>
        <div class="product-detail">
            <div class="product-info">
                <table class="table">
                    <tbody>
                        <tr>
                            <td>Mã sản phẩm</td>
                            <td style="text-transform: uppercase;">${product.masp}</td>
                        </tr>
                        <tr>
                            <td>Mô tả sản phẩm</td>
                            <td>${product.content}</td>
                        </tr>
                        <tr>
                            <td>Xuất xứ</td>
                            <td>${product.xuatxu}</td>
                        </tr>
                        <tr>
                            <td>Bảo quản</td>
                            <td>Nơi khô ráo thoáng mát, tránh ánh nắng trực tiếp</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    } else {
        console.error('Sản phẩm không tồn tại!');
    }
}

// Gọi hàm để lấy dữ liệu và hiển thị chi tiết sản phẩm
fetchProductDetail();


//--------------------- add Cart -----------------------



//Trả về giỏ hàng của user dang sử dụng
// {
//     "id": "user1",
//     "danhSachSP": [
//       {
//         "masp": "sp001",
//         "soluong": 2
//       },
//       {
//         "masp": "sp002",
//         "soluong": 3
//       },
//       {
//         "masp": "sp003",
//         "soluong": 1
//       }
//     ]
// }
function getCart(callback) {
    getCurrentUser(user => {
        fetch(`${cartAPI}/${user.id}`)
            .then(res => res.json())
            .then(callback)
    })
}

function addCartAPI(danhSachSP) {
    getCurrentUser(user => {
        fetch(`${cartAPI}/${user.id}`, {
            method: 'PATCH',
            body: JSON.stringify(
                {
                    "danhSachSP": danhSachSP
                }
            ),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
    })
}

const addCart = () => {
    const addCartBtn = $("#addCartBtn");
    addCartBtn.addEventListener("click", event => {
        event.preventDefault();

        //kiem tra da dang nhap chua
        getCurrentUser(user => {
            if (user.id == null) {
                window.location.href = "login.html";
                alert("vui lòng đăng nhập trước khi thêm vào giỏ hàng");

            }
        })

        const masp = addCartBtn.value;
        let soluong = $("#input_soluong").value;
        let done = false;
        getCart(cart => {
            let danhSachSP = cart.danhSachSP;
            for (let i = 0; i < danhSachSP.length; i++) {
                if (masp === danhSachSP[i].masp) {
                    danhSachSP[i].soluong = parseInt(danhSachSP[i].soluong) + parseInt(soluong);
                    done = true;
                    addCartAPI(danhSachSP);
                    alert("đã thêm sản phẩm vào giỏ hàng");
                }
            }
            if (!done) {
                danhSachSP.push({"masp":masp, "soluong": soluong});
                addCartAPI(danhSachSP);
                alert("đã thêm sản phẩm vào giỏ hàng");
            }
        })
    })
}
setTimeout(addCart, 1000)
