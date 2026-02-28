import express from 'express'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app=express()
app.use(cors())
app.use(express.json())

app.post('/create-payment',async(req,res)=>{
  const {cart,name,phone}=req.body
  const total=cart.reduce((a,b)=>a+b.price,0)

  const payment=await axios.post(
    'https://api.yookassa.ru/v3/payments',
    {
      amount:{value:total.toFixed(2),currency:'RUB'},
      confirmation:{type:'redirect',return_url:'https://example.com/success'},
      capture:true,
      description:'Заказ ЗАВЕРНИ'
    },
    {auth:{username:process.env.SHOP_ID,password:process.env.SECRET_KEY}}
  )

  if(process.env.TELEGRAM_TOKEN){
    await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,{
      params:{
        chat_id:process.env.TELEGRAM_CHAT_ID,
        text:`Новый заказ\nИмя:${name}\nТелефон:${phone}\nСумма:${total} ₽`
      }
    })
  }

  res.json(payment.data)
})

app.listen(3001,()=>console.log('Server started 3001'))