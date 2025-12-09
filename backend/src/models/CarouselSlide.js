/**
 * Modèle CarouselSlide - Slides du carrousel de la page d'accueil
 * Gère les images, titres, descriptions et ordre d'affichage
 */

const mongoose = require('mongoose');

const carouselSlideSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  description2: {
    type: String,
    default: ''
  },
  description3: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  highlight: {
    type: String,
    default: ''
  },
  subtitle2: {
    type: String,
    default: ''
  },
  highlight2: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  },
  textAnimation: {
    type: String,
    enum: ['fade-up', 'slide-left', 'zoom-in', 'rotate-in', 'bounce-in'],
    default: 'fade-up'
  },
  imageAnimation: {
    type: String,
    enum: ['ken-burns', 'zoom-out', 'slide-right', 'fade-scale'],
    default: 'ken-burns'
  },
  order: {
    type: Number,
    default: 0
  },
  imageSize: {
    type: String,
    enum: ['cover', 'contain', 'auto'],
    default: 'cover'
  },
  page: {
    type: String,
    enum: ['home', 'about', 'activities'],
    default: 'home'
  },
  overlayOpacity: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  contentPosition: {
    type: String,
    enum: ['top', 'center', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
    default: 'center'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour tri par ordre
carouselSlideSchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('CarouselSlide', carouselSlideSchema);
