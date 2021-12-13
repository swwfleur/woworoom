const apiPath="fleur";
const token= "hiNX57Ho0yVGr3n8cd3vNwYoSh32";
const baseUrl="https://livejs-api.hexschool.io/";
const orderUrl=`${baseUrl}api/livejs/v1/admin/${apiPath}/orders`;
const orderTbody= document.querySelector(".orderTbody")
const orderForm =document.querySelector(".orderPage-table")
const deleteAllBtn = document.querySelector(".discardAllBtn")
let orderData=[];

// header金鑰
function getAuthorization() {
  return {
    headers:{
        "Authorization" : token
    }
}
} 

//初始化
function init(){
    getOrder()
}
init()

//取得購物車列表
function getOrder(){
    axios.get(orderUrl,getAuthorization())
    .then(res =>{
        orderData=res.data.orders;
        renderOrder(orderData);
        // sortc3Data(orderData);
        dataCollaction(orderData);
    })
}

//渲染訂單
function renderOrder(){
    let str="";
    orderData.forEach(item =>{
        //組商品內容
        let productContent="";
        item.products.forEach(item => {
            productContent+=`<p>${item.title} x ${item.quantity}</p>`
        });

        //組正確日期
        let timestamp = new Date(item.createdAt*1000);
        let currectTime = `${timestamp.getFullYear()}/${timestamp.getMonth()}/${timestamp.getDate()}`
        
        //訂單狀態
        let state = item.paid;
        if(item.paid){
            state = "已處理"
        }else{
            state = "未處理"
        }

        str+=`<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <p>${productContent}</p>
        </td>
        <td>${currectTime}</td>
        <td class="orderStatus">
          <a href="#" data-id="${item.id}">${state}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
        </td>
    </tr>`
    })
    orderTbody.innerHTML=str;
}
//修改訂單狀態
orderForm.addEventListener("click",e=>{
    if(e.target.nodeName =="A" || e.target.nodeName =="INPUT"){
        //處理訂單狀態
        if(e.target.nodeName == "A"){
            let orderId = e.target.dataset.id;
            let newState;
            orderData.forEach(item =>{
                if(item.paid){
                    newState=false
                }else{
                    newState=true
                }
            })
            modifyOrder(orderId,newState)
        }
        if(e.target.nodeName == "INPUT"){
            let orderId = e.target.dataset.id;
            deleteSingleOrder(orderId)
            console.log(orderId)
        }
    }
})

//修改訂單狀態
function modifyOrder(orderId,newState){
  let data ={
    "data": {
      "id": orderId,
      "paid": newState
    }
  }
    axios.put(orderUrl,data,getAuthorization())
    .then(e =>{
      alert("已更新訂單")
      getOrder()
    })
  }

//刪除單筆訂單
function deleteSingleOrder(orderId){
    url=`${orderUrl}/${orderId}`
    console.log(url)
    axios.delete(url,getAuthorization())
    .then(res=>{
        console.log(res.data)
        alert("刪除成功")
    })
}

//刪除全部購物車
deleteAllBtn.addEventListener("click",deleteAllOrder)
function deleteAllOrder(){
  axios.delete(orderUrl,getAuthorization())
  .then(res =>{
    alert("訂單全部清空");
    getOrder()
  })
}

// //組c3資料
// function sortc3Data(){
//   let category ={}
//   orderData.forEach(item =>{
//     item.products.forEach(productItem =>{
//       if(category[productItem.category] == undefined){
//         category[productItem.category] =Number(productItem.price * productItem.quantity)
//       }else{
//         category[productItem.category] +=Number(productItem.price * productItem.quantity)
//       }
//     })
//   })
//   let c3Data =[];
//   let categoryList = Object.keys(category);
//   categoryList.forEach(item =>{
//     let ary =[]
//     ary.push(item)
//     ary.push(category[item])
//     c3Data.push(ary)
//   })
//   renderC3Chart(c3Data)
// }
//渲染c3資料


//做單筆項營收
function dataCollaction(){
  let singleItem={}
  orderData.forEach(item =>{
    item.products.forEach(productItem =>{
      if(singleItem[productItem.title] ==undefined){
        singleItem[productItem.title] = Number(productItem.price*productItem.quantity)
      }else{
        singleItem[productItem.title] += Number(productItem.price*productItem.quantity)
      }
    })
  })
  //拉出資料關聯
  let originAry = Object.keys(singleItem);
  let rankSortAry =[]
  originAry.forEach(item =>{
    let ary =[];
    ary.push(item)
    ary.push(singleItem[item])
    rankSortAry.push(ary)
  })
  rankSortAry.sort((a,b)=>{
    //因為陣列第一筆是名稱無法比較，陣列[1]是數字才能比較，所以是寫a[1]-a[b]，b-a是遞減
    return b[1]-a[1]
  })
  if (rankSortAry.length >3){
    let otherTotal =0;
    rankSortAry.forEach((item,index) =>{
      //index >2 因為是陣列第三筆之後做加總
      if(index > 2){
      //rankSortAry[index][1] 代表要加總的是陣列第二筆
      otherTotal+= rankSortAry[index][1];
      }
      
    })
    rankSortAry.splice(3,rankSortAry.length-1);
    rankSortAry.push(['其他',otherTotal])
  }
  renderC3Chart(rankSortAry)
}
function renderC3Chart(rankSortAry){
  let chart =c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      columns: rankSortAry, // 資料存放
      type:"pie", // 圖表種類
    },
    color:{
      pattern: ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF']
    }
  })
}

