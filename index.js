const apiPath = "fleur";
const baseUrl = "https://livejs-api.hexschool.io/"
const productUrl = `${baseUrl}api/livejs/v1/customer/${apiPath}/products`
const cartUrl = `${baseUrl}api/livejs/v1/customer/${apiPath}/carts`
const orderUrl = `${baseUrl}api/livejs/v1/customer/${apiPath}/orders`
const productList = document.querySelector(".productList")
const productSelect = document.querySelector(".productSelect")
const cartTable = document.querySelector(".shoppingCart-table")
const cartTbody = document.querySelector(".cartTbody")
const showTotal = document.querySelector(".js-showTotal")
const discardAllBtn = document.querySelector(".discardAllBtn")
const orderBtn = document.querySelector(".orderInfo-btn")
const orderForm = document.querySelector(".orderInfo-form")
const alertMessage = document.querySelector(".orderInfo-message")
const searchInput = document.querySelector(".searchInput")
const searchBtn = document.querySelector(".searchBtn")
let totalPrice = 0;
let productData = [];
let cartData = [];

function init() {
  getProduct()
  getCart()
}
init()

//取得商品資料
function getProduct() {
  axios.get(productUrl)
    .then(res => {
      productData = res.data.products;
      renderProduct(productData)
      getSelectItem(productData)
    })
}

//渲染商品在網頁上
function renderProduct(productData) {
  let str = ""
  productData.forEach(item => {
    str +=
      `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="${item.title}">
    <a href="#" class="addCardBtn" data-id="${item.id}" data-name="${item.title}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${hundredth(item.origin_price)}</del>
    <p class="nowPrice">NT$${hundredth(item.price)}</p>
    <label for="productNum">商品數量</label>
    <input type="number" name="productNum" id="productNum" class="productNum" data-num="${item.title}-num" min="1" max="50">
    </li>`
  });
  productList.innerHTML = str;
}

//產品篩選
productSelect.addEventListener("change", e => {
  let selectCategloy = e.target.value;
  if (selectCategloy == "全部") {
    renderProduct(productData)
  } else {
    let selectProduct = []
    productData.forEach(item => {
      if (selectCategloy == item.category) {
        selectProduct.push(item)
      }
    })
    renderProduct(selectProduct)
  }
})

//做出篩選選項 
function getSelectItem() {
  let unsort = productData.map(item => {
    return item.category
  })
  let sorted = unsort.filter(function (item, i) {
    return unsort.indexOf(item) === i;
  })
  renderSelect(sorted)
}
function renderSelect(sorted) {
  str = `<option value="全部" selected>全部</option>`
  sorted.forEach(item => {
    str += `<option value="${item}">${item}</option>`
  })
  productSelect.innerHTML = str;
}

// 搜尋商品
searchBtn.addEventListener("click", keywordSearch)
function keywordSearch() {
  let keyword = searchInput.value.trim().toLowerCase();
  let targetProduct = [];
  targetProduct = productData.filter(item => {
    let title = item.title.toLowerCase();
    return title.match(keyword)
  })
  renderProduct(targetProduct)
}



//取得購物車
function getCart() {
  axios.get(cartUrl)
    .then(res => {
      cartData = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCart(cartData, finalTotal)
    })
    .catch(function (error) {
      console.log(error.response.data.message)
    })
}
//渲染在購物車上
function renderCart(cartData, finalTotal) {
  let str = "";
  cartData.forEach(item => {
    str +=
      ` <tr>
    <td>
<div class="cardItem-title">
  <img src="${item.product.images}" alt="">
  <p>${item.product.title}</p>
</div>
</td>
<td>NT$${hundredth(item.product.price)}</td>
<td><a href="#"><span class="material-icons cartAmount-icon" data-num="${item.quantity - 1}" data-id="${item.id}">remove</span></a></td>
<td>${item.quantity}</td>
<td><a href="#"><span class="material-icons cartAmount-icon" data-num="${item.quantity + 1}" data-id="${item.id}">add</span></a>
</p></td>
<td>NT$${hundredth(item.product.price*item.quantity)}</td>
<td class="discardBtn">
<a href="#" class="material-icons deleteBtn" data-id="${item.id}">
  clear
</a>
</td>
</tr>`
  })
  cartTbody.innerHTML = str;
  showTotal.textContent = `NT$${hundredth(finalTotal)}`
  //單筆商品刪除
  let alldeleteSingleBtn = document.querySelectorAll(".deleteBtn");
  alldeleteSingleBtn.forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      let productId = e.target.dataset.id
      deleteSingleCart(productId)
    })
  })
  //修改購物車數量
  let cartNumEdit = document.querySelectorAll(".cartAmount-icon");
  cartNumEdit.forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      let cartNum = e.target.dataset.num;
      let cartId = e.target.dataset.id;
      editCartNum(cartNum, cartId)
    })
  })
}

//修改訂單數量
function editCartNum(cartNum, cartId) {
  if (cartNum > 0) {
    let data = {
      data: {
        id: cartId,
        quantity: parseInt(cartNum)
      }
    }
    axios.patch(cartUrl, data)
      .then(res => {
        getCart();
      })
      .catch(error => {
        console.log(error)
      })
  }else{
    deleteSingleCart(productId)
  }
}


//加入購物車
productList.addEventListener("click", e => {
  if (e.target.nodeName !== "A") {
    return
  } else {
    let productId = e.target.dataset.id;
    let productNum = 1;
    //   productData.forEach(item =>{
    //   productNumber = Number(document.querySelector(`[data-num="${item.title}-num"]`).value)
    //   console.log(typeof(productNum))
    //   return productNum
    // })
    let productName = e.target.dataset.name
    addCart(productId, productNum, productName)
  }
})
function addCart(productId, productNum, productName) {
  axios.post(cartUrl, {
    "data": {
      "productId": productId,
      "quantity": productNum
    }
  })
    .then(res => {
      alert(`${productName} 已加入購物車`)
      getCart()
    })
}

//刪除單筆購物車內容
function deleteSingleCart(productId) {
  let deleteUrl = `${cartUrl}/${productId}`
  axios.delete(deleteUrl)
    .then(res => {
      alert("刪除成功")
      getCart()
    })
}

//刪除全部購物車
discardAllBtn.addEventListener("click", e => {
  delectAllCart()
})
function delectAllCart() {
  axios.delete(cartUrl)
    .then(res => {
      alert("購物車已全部清空")
      getCart()
    })
}

//表單驗證
orderBtn.addEventListener("click", function (e) {
  e.preventDefault();
  //表單驗證
  let checkForm = {
    "姓名": {  //input的name元素
      presence: {
        message: "是必填欄位" //出現姓名為必填欄位
      }
    },
    "電話": {
      presence: {
        message: "是必填欄位"
      }
    },
    "信箱": {
      presence: {
        message: "是必填欄位"
      },
      email: {
        message: "不是合法的格式"
      }
    },
    "地址": {
      presence: {
        message: "是必填欄位"
      }
    }
  }

  let error = validate(orderForm, checkForm);
  if (error) {//表示內容沒過
    objKeys.forEach(function (key) {
      let el = document.querySelector(`[data-message="${key}"]`);
      el.textContent = `${error[key]}`
    });
  } else {
    let user = {}
    user.name = orderForm[0].value;
    user.tel = orderForm[1].value;
    user.email = orderForm[2].value;
    user.address = orderForm[3].value;
    user.payment = orderForm[4].value;
    sendOrder(user)
  }
})
//送出訂單
function sendOrder(user) {
  let data = {
    "data": {
      "user": user
    }
  }
  axios.post(orderUrl, data)
    .then(res => {
      alert("成功送出訂單")
      orderForm.reset();
    })
}


//千分位轉換器
function hundredth(num) {
  var parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}