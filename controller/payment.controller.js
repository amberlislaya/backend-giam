const { MercadoPagoConfig,Payment, Preference } = require('mercadopago');
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const nodemailer = require('nodemailer');

//arreglo temporal para almacenar pedidos
let pendingOrders = [];


const createOrder = async (req, res) => {

   try{ 
    const data = req.body;
    const {nroOrden} = req.query;
    const {costEnv} = req.query;
    


    const client = new 
    MercadoPagoConfig({ accessToken: "TEST-6955259791859110-022400-494fd3c3c43aa43208a814c41642aa5c-1698431408", 
    options: { timeout: 5000 } });
    
    const preference = new Preference(client);
    
     const items = data.map((item,index)=> ({
             id: index,
             title: item.title,
             quantity: item.quantity,
             unit_price: item.price
      }))

    const result = await preference.create({body: {
     items:items,
     
    "shipments":{
        "cost": Number(costEnv)
     },
        back_urls: {
            success: "http://localhost:3000/",
            failure: "http://localhost:3000/"
        },
        metadata:{"NumOrd":nroOrden},
        notification_url: "https://4435-38-25-15-10.ngrok-free.app/api/payment/webhook",

            }
        })

        console.log(result);   
        res.json(result);
   } catch (error) {
    console.error('Error en createOrder:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
}
};



const receiveWebhook = async (req, res) => {
    
     console.log(req.query);
     const {query} = req;      
     const oc = query.id;
     console.log("ulalala");
     const id = query['data.id'];

    
     if (req.query.type == "payment") {
        
           try{
             const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
                 method: 'GET',
                headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${'TEST-6955259791859110-022400-494fd3c3c43aa43208a814c41642aa5c-1698431408'}`
                 }
             })
        
              
    
         if (!response.ok) {
                 throw new Error('Network response was not ok');
             }
    
             const data = await response.json();
             console.log("nro" + data.metadata.num_ord);
             const numoc = data.metadata.num_ord;
            
             const oc =  await Order.findOne({OrderId : numoc}).populate('orderItems.product')

            console.log(oc);

             if(oc){
                 oc.orderStatus= 'Procesado'

                 await oc.save()

                 console.log("id" + oc.user);
                 console.log("productid" + oc.orderItems.map(item => item.product.title));

                 for( item of oc.orderItems){
                     console.log("line 100" + item.product);
                     await Cart.deleteOne({ userId: oc.user});
                 
                 }

                 contentHTML = `
                        <h1>Orden de Compra ${oc.OrderId}</h1>
                        <h2>Cliente : ${oc.shippingInfo.firstName.concat(oc.shippingInfo.lastName)}</h2>
                        
                        <ul>
                        <li>
                        product Cantidad precio Subtotal
                        </li>`

                        for(item of oc.orderItems){
                            contentHTML+=`
                              <li>
                                ${item.product.title} ${item.quantity} ${item.price} ${item.quantity * item.price}
                              </li> 
                               
                            `;
                        }
                        
                       contentHTML += `</ul>
                       
                            <label>Total : ${oc.totalPrice}</label>
                       `

                 let transporter = nodemailer.createTransport(
                    {
                        host: 'smtp-mail.outlook.com',
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                        user: 'giamteam420@hotmail.com',
                        pass: 'Giam420123'
                    }
                    }
                 )

                 let mailOptions = {
                    from: 'giamteam420@hotmail.com',
                    to: `${oc.email}`,
                    subject: `Orden de compra ${oc.OrderId}`,
                    html: contentHTML
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Correo electrónico enviado: ' + info.response);
                    }
                
            
                 })  

            
                 console.log(oc);
                
             }else{
                 console.log('No se encontro el dato')
             }



//         }
         } catch (error) {
            console.error('Error:', error);
        
 }
    

  }

     res.send("webhook");

}

const OrdenTemporal = async(req,res) => {

     res.json(pendingOrders);

}

const deleteOrd =  async(req,res) => {
    console.log("borrando bd");
    pendingOrders = [];
    res.send('Datos de Orden temporal borrados');


}


module.exports = { createOrder, receiveWebhook, OrdenTemporal, deleteOrd };
