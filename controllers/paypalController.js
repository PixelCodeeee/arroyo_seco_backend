const paypal = require('@paypal/checkout-server-sdk');
const paypalClient = require('../config/paypal').client;
const Pedido = require('../models/Pedido');

/**
 * Create PayPal Order
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No hay items en el carrito' });
    }

    // Validate total
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.precio) * parseInt(item.cantidad));
    }, 0);

    if (Math.abs(calculatedTotal - parseFloat(total)) > 0.01) {
      return res.status(400).json({ 
        error: 'El total no coincide',
        calculated: calculatedTotal.toFixed(2),
        received: parseFloat(total).toFixed(2)
      });
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
            name: item.nombre.substring(0, 127), // PayPal limit
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
      orderID: order.result.id,
      status: order.result.status
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
 * Capture PayPal Order and Save to Database
 */
exports.captureOrder = async (req, res) => {
  try {
    const { orderID, cartData, id_usuario } = req.body;

    // Validations
    if (!orderID) {
      return res.status(400).json({ error: 'OrderID es requerido' });
    }

    if (!cartData || !cartData.items || !Array.isArray(cartData.items) || cartData.items.length === 0) {
      return res.status(400).json({ error: 'Datos del carrito inválidos' });
    }

    if (!id_usuario) {
      return res.status(400).json({ error: 'Usuario no autenticado' });
    }

    console.log('📦 Capturing PayPal order:', orderID);
    console.log('👤 User ID:', id_usuario);
    console.log('🛒 Cart items:', cartData.items.length);

    // Capture PayPal payment
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient().execute(request);
    
    console.log('💰 PayPal capture status:', capture.result.status);

    // Check if payment was successful
    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({ 
        success: false,
        error: 'El pago no fue completado',
        status: capture.result.status 
      });
    }

    // Extract payment details
    const paymentDetails = capture.result.purchase_units[0].payments.captures[0];
    const transactionId = paymentDetails.id;
    const amountPaid = parseFloat(paymentDetails.amount.value);

    console.log('💵 Amount paid:', amountPaid, paymentDetails.amount.currency_code);
    console.log('🔑 Transaction ID:', transactionId);

    // Validate that the amount paid matches cart total
    const cartTotal = parseFloat(cartData.total);
    if (Math.abs(amountPaid - cartTotal) > 0.01) {
      console.error('⚠️ Amount mismatch:', { paid: amountPaid, expected: cartTotal });
      return res.status(400).json({
        success: false,
        error: 'El monto pagado no coincide con el total del carrito'
      });
    }

    // Prepare items for database (using the new Pedido model structure)
    const items = cartData.items.map(item => ({
      id_producto: item.id_producto,
      cantidad: parseInt(item.cantidad),
      precio_compra: parseFloat(item.precio) // Price at time of purchase
    }));

    console.log('💾 Saving order to database...');

    // Create order in database using the new Pedido model
    const pedido = await Pedido.create({
      id_usuario: id_usuario,
      monto_total: amountPaid,
      estado: 'pagado', // Already paid successfully
      items: items
    });

    console.log('✅ Pedido created in DB:', pedido.id_pedido);

    // Return success response
    res.json({
      success: true,
      message: 'Pago completado exitosamente',
      pedido: pedido,
      transaction: {
        id: transactionId,
        status: capture.result.status,
        amount: amountPaid,
        currency: paymentDetails.amount.currency_code,
        payer_email: capture.result.payer?.email_address || 'N/A',
        payer_name: capture.result.payer?.name?.given_name 
          ? `${capture.result.payer.name.given_name} ${capture.result.payer.name.surname || ''}`.trim()
          : 'N/A'
      }
    });

  } catch (error) {
    console.error('❌ Error capturing PayPal order:', error);
    
    // More specific error handling
    if (error.message && error.message.includes('Ya existe')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Error al procesar el pago',
      details: error.message 
    });
  }
};

/**
 * Get PayPal order details
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderID } = req.params;

    if (!orderID) {
      return res.status(400).json({ error: 'OrderID es requerido' });
    }

    const request = new paypal.orders.OrdersGetRequest(orderID);
    const order = await paypalClient().execute(request);

    res.json({
      success: true,
      order: order.result
    });

  } catch (error) {
    console.error('❌ Error getting order details:', error);
    res.status(500).json({ 
      error: 'Error al obtener detalles de orden',
      details: error.message 
    });
  }
};