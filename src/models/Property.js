const mongoose = require('mongoose');

const mapLocationSchema = new mongoose.Schema({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null }
}, { _id: false });

const areaDetailsSchema = new mongoose.Schema({
  originalValue: { type: Number },
  sqft: { type: Number },
  sqm: { type: Number },
  guntha: { type: Number },
  acre: { type: Number }
}, { _id: false });

const propertySchema = new mongoose.Schema({
  // Registry and date
  registryDocument: { type: String },
  propertyDate: { type: Date, default: Date.now },

  // Land record documents
  satbara: { type: String },
  ferfar: { type: String },
  eightA: { type: String },
  tochNakasha: { type: String },

  // Location identifiers
  gatNumber: { type: String },
  citySurveyNo: { type: String },

  // Dimensions
  length: { type: Number },
  breadth: { type: Number },
  size: { type: String }, // auto-calculated as `${length} * ${breadth}`

  // Area
  area: { type: String },
  areaUnit: { type: String, default: 'sqft' },
  areaDetails: areaDetailsSchema,

  // Location & zone
  zone: { type: String },
  location: { type: String },
  mapLocation: mapLocationSchema,

  // Land details
  qualityOfLand: { type: String }, // e.g., "Fertile", "Rocky"
  waterSource: { type: String, default: 'none' }, // e.g., "well", "bore"

  // Financials
  valuation: { type: Number },
  demandPrice: { type: Number },
  offerPrice: { type: Number },
  plotRateNearby: { type: Number },
  pricing : {type: Number ,required:false},

  // Status
  status: {
    type: String,
    enum: ['pending', 'sold','active'],
    default: 'active'
  },

  // Payment info
  paymentCondition: {
    type: String,
    enum: ['down payment', 'full payment', 'installment', 'negotiable'],
    default: 'negotiable'
  },

  // Additional details
  site: { type: String },
  direction: { type: String },

  // Issues
  problem: [{ type: String }], // e.g., ['litigation', 'access']

  // Agent info
  agentName: { type: String },
  agentMobile: { type: String },

  // Files
  photos: [{ type: String }],
  details: { type: String },

  // Ownership
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: { type: String }
  }

}, {
  timestamps: true // includes createdAt and updatedAt
});

module.exports = mongoose.model('Property', propertySchema);
