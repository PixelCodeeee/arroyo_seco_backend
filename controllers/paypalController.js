const paypal = require('@paypal/checkout-server-sdk');
const paypalClient = require('../config/paypal').client;
const Orden = require('../models/Order');

/**
 * Create PayPal Order
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No hay items en el carrito' });
    }

    // Validate total
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.precio) * parseInt(item.cantidad));
    }, 0);

    if (Math.abs(calculatedTotal - parseFloat(total)) > 0.01) {
      return res.status(400).json({ error: 'El total no coincide' });
    }

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'MXN',
            value: parseFloat(total).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'MXN',
                value: parseFloat(total).toFixed(2)
              }
            }
          },
          items: items.map(item => ({
            name: item.nombre.substring(0, 127),
            description: (item.descripcion || '').substring(0, 127),
            unit_amount: {
              currency_code: 'MXN',
              value: parseFloat(item.precio).toFixed(2)
            },
            quantity: item.cantidad.toString()
          })),
          description: `Compra en Arroyo Seco - ${items.length} producto(s)`
        }
      ],
      application_context: {
        brand_name: 'Arroyo Seco',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING'
      }
    });

    // Execute PayPal order creation
    const order = await paypalClient().execute(request);

    console.log('✅ PayPal order created:', order.result.id);

    res.json({
      success: true,
      orderID: order.result.id
    });

  } catch (error) {
    console.error('❌ Error creating PayPal order:', error);
    res.status(500).json({ 
      error: 'Error al crear orden de PayPal',
      details: error.message 
    });
  }
};

/**
 * Capture PayPal Order (After user approves)
 */
exports.captureOrder = async (req, res) => {
  try {
    const { orderID, cartData, id_usuario } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: 'OrderID es requerido' });
    }

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      return res.status(400).json({ error: 'Datos del carrito inválidos' });
    }

    console.log('📦 Capturing PayPal order:', orderID);

    // Capture PayPal payment
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient().execute(request);
    
    console.log('💰 PayPal capture status:', capture.result.status);

    // Check if payment was successful
    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({ 
        error: 'El pago no fue completado',
        status: capture.result.status 
      });
    }

    // Extract payment details
    const paymentDetails = capture.result.purchase_units[0].payments.captures[0];
    const transactionId = paymentDetails.id;
    const amount = parseFloat(paymentDetails.amount.value);

    // Create order in database
    // Use provided id_usuario or default to 1 for testing
    const ordenData = {
      id_usuario: id_usuario || 1, // Default test user
      id_oferente: cartData.id_oferente,
      total: amount,
      estado: 'pagado',
      metodo_pago: 'paypal',
      transaction_id: transactionId,
      items: JSON.stringify(cartData.items),
      fecha_orden: new Date()
    };

    const nuevaOrden = await Orden.create(ordenData);

    console.log('✅ Orden created in DB:', nuevaOrden.id_orden);

    res.json({
      success: true,
      message: 'Pago completado exitosamente',
      orden: nuevaOrden,
      transaction: {
        id: transactionId,
        status: capture.result.status,
        payer_email: capture.result.payer?.email_address || 'N/A'
      }
    });

  } catch (error) {
    console.error('❌ Error capturing PayPal order:', error);
    res.status(500).json({ 
      error: 'Error al procesar el pago',
      details: error.message 
    });
  }
};

/**
 * Get order details
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderID } = req.params;

    const request = new paypal.orders.OrdersGetRequest(orderID);
    const order = await paypalClient().execute(request);

    res.json({
      success: true,
      order: order.result
    });

  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({ 
      error: 'Error al obtener detalles de orden',
      details: error.message 
    });
  }
};