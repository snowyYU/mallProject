<template>
    <div>
      <nav-header></nav-header>
      <nav-bread>
        <span>Goods</span>
      </nav-bread>
      
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a href="javascript:void(0)" class="price" @click="sortGoods">Price <svg class="icon icon-arrow-short" v-bind:class="{'sort-up':!sortFlag}"><use xlink:href="#icon-arrow-short"></use></svg></a>
            <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show': filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" v-bind:class="{'cur':priceChecked=='all'}" @click="priceChecked='all';setPriceFilter('all')">All</a></dd>
                <dd v-for="(price,index) in priceFilter">
                  <a href="javascript:void(0)" v-bind:class="{'cur':priceChecked==index}" @click="setPriceFilter(index)">{{price.startPrice}} - {{price.endPrice}}</a>
                </dd>
              </dl>
            </div>
            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="item in goodsList">
                    <div class="pic">
                      <a href="#"><img v-bind:src="'/static/'+item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
                <div class="load-more" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
                  <img src="./../assets/loading-spinning-bubbles.svg" alt="" v-show="loading">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
      <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
        <p slot="message">
          请先登录，否则无法登录到购物车中！
        </p>
        <div slot="btnGroup">
          <a href="javascript:void(0)" class="btn btn--m" @click="mdShow=false">关闭</a>
        </div>
      </modal>
      <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
        <p slot="message">
          <svg class="icon-status-ok">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
          </svg>
          <span>加入购物车成功！</span>
        </p>
        <div slot="btnGroup">
          <a href="javascript:void(0)" class="btn btn--m" @click="mdShowCart=false">继续购物</a>
          <router-link href="javascript:void(0)" class="btn btn--m" to="/cart">查看购物车</router-link>
        </div>
      </modal>
      <nav-footer></nav-footer>
    </div>
</template>
<style>
.load-more{
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.sort-up{
  transform: rotate(180deg);
  transition:all .3s ease-out
}
</style>

<script>
import NavHeader from '@/components/NavHeader.vue'
import NavFooter from '@/components/NavFooter.vue'
import NavBread from '@/components/NavBread.vue'
import Modal from '@/components/Modal.vue'
import axios from 'axios'
import { setTimeout } from 'timers';
    export default{
        data(){
            return {
              goodsList:[],
              loading:false,
              mdShow:false,
              mdShowCart:false,
              priceFilter:[
                {
                  startPrice:'0.00',
                  endPrice:'100.00'
                },
                {
                  startPrice:'100.00',
                  endPrice:'500.00'
                },
                {
                  startPrice:'500.00',
                  endPrice:'1000.00'
                },
                {
                  startPrice:'1000.00',
                  endPrice:'2000.00'
                },
              ],
              priceChecked:'all',
              filterBy:false,
              overLayFlag:false,
              // 排序部分
              sortFlag: true,
              page: 1,
              pageSize: 8,
              busy:true,

            }
        },
        components:{
          NavHeader,
          NavFooter,
          NavBread,
          Modal
        },
        mounted: function(){
          this.getCoodList()
        },
        methods:{
          getCoodList(flag){
            this.loading = true
            var param ={
              page:this.page,
              pageSize:this.pageSize,
              sort:this.sortFlag?1:-1,
              priceLevel:this.priceChecked
            }
            axios.get('/goods/list',{params:param}).then((result)=>{
              this.loading = false
              let res = result.data;
              if(res.status=="0"){
                if(flag){
                  this.goodsList = this.goodsList.concat(res.result.list);
                  if(res.result.count==0){
                    console.log("enough")
                    this.busy=true;
                  }else{
                    this.busy = false
                  }
                }else{
                  this.goodsList = res.result.list
                  this.busy = false
                }

              }else{
                this.goodsList = []
              }
              
            })
          },
          showFilterPop(){
            this.filterBy = true;
            this.overLayFlag = true;
          },
          closePop(){
            this.filterBy = false;
            this.overLayFlag = false;
          },
          setPriceFilter(index){
            this.priceChecked = index;
            this.closePop()
            this.page = 1;
            this.getCoodList();
          },
          sortGoods(){
            this.sortFlag = !this.sortFlag;
            this.page = 1;
            this.getCoodList();

          },
          loadMore(){
            this.busy = true;
            setTimeout(() =>{
              this.page++;
              this.getCoodList(true)
            },500);
          },
          addCart(productId){
            axios.post("/goods/addCart",{
              productId:productId
            }).then((res)=>{
              console.log(res);
              if(res.data.status==0){
                this.$store.commit("updateCartCount",1)
                this.mdShowCart=true
              }else{
                this.mdShow=true
              }
            })
          },
          closeModal(){
            this.mdShow=false;
          }
        }
    }
</script>
