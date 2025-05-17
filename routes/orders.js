const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Créer une nouvelle commande
router.post('/', auth, async (req, res) => {
  try {
    console.log('Données reçues pour la commande:', req.body);
    console.log('Utilisateur:', req.user);

    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    
    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod
    });

    console.log('Commande à sauvegarder:', order);

    const savedOrder = await order.save();
    console.log('Commande sauvegardée avec succès:', savedOrder);

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(400).json({ message: error.message });
  }
});

// Récupérer toutes les commandes d'un utilisateur
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer une commande spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Annuler une commande
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Cette commande ne peut plus être annulée' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 