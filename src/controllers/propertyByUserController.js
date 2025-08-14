const Property = require('../models/Property');
const User = require('../models/user');
const { responseHandler } = require('../utils/responseHandler');
const convertArea = require('../utils/areaConverter');
const moment = require('moment');
const mongoose = require('mongoose');

// ✅ Safe utility to generate Google Maps link
const generateMapLink = (coordinates) => {
  if (!coordinates || typeof coordinates !== 'object') {
    return null;
  }

  const lat = coordinates.lat ?? null;
  const lng = coordinates.lng ?? null;

  if (lat == null || lng == null) {
    return null;
  }

  return `https://www.google.com/maps?q=${lat},${lng}`;
};

const propertyByUserController = {
  // ✅ CREATE property by user ID
  createPropertyByUserId: async (req, res) => {
    try {
      const { userId } = req.params;

      const targetUser = await User.findById(userId);
      if (!targetUser) return responseHandler.error(res, 'Target user not found', 404);

      const uploadedUrls = {};
      if (req.files) {
        for (const key in req.files) {
          uploadedUrls[key] = req.files[key].map(f => f.location);
        }
      }

      const {
        registryDocument,
        propertyDate,
        satbara,
        ferfar,
        eightA,
        tochNakasha,
        gatNumber,
        citySurveyNo,
        length,
        breadth,
        areaValue,
        areaUnit = 'sqft',
        zone,
        location,
        mapLocation,
        qualityOfLand,
        waterSource = 'none',
        valuation,
        demandPrice,
        offerPrice,
        status = 'pending',
        paymentCondition,
        plotRateNearby,
        site,
        direction,
        problem,
        agentName,
        agentMobile,
        details
      } = req.body;

      const parsedMapLocation = (() => {
        try {
          return typeof mapLocation === 'string' ? JSON.parse(mapLocation) : mapLocation;
        } catch {
          return { lat: null, lng: null };
        }
      })();

      const parsedProblems = Array.isArray(problem) ? problem : [problem];

      const conversions = convertArea({
        area: Number(areaValue),
        unit: areaUnit,
        length: length ? Number(length) : undefined,
        breadth: breadth ? Number(breadth) : undefined
      });

      const areaDetails = {
        originalValue: Number(areaValue),
        sqft: conversions.sqft,
        sqm: conversions.sqm,
        guntha: conversions.guntha,
        acre: conversions.acre
      };

      const property = new Property({
        gatNumber,
        citySurveyNo,
        satbara: uploadedUrls.satbara?.[0] || satbara,
        ferfar: uploadedUrls.ferfar?.[0] || ferfar,
        eightA: uploadedUrls.eightA?.[0] || eightA,
        tochNakasha: uploadedUrls.tochNakasha?.[0] || tochNakasha,
        registryDocument: uploadedUrls.registryDocument?.[0] || registryDocument,
        length: length ? Number(length) : undefined,
        breadth: breadth ? Number(breadth) : undefined,
        size: length && breadth ? `${length} * ${breadth}` : undefined,
        area: Number(areaValue),
        areaUnit,
        areaDetails,
        zone,
        location,
        mapLocation: parsedMapLocation || { lat: null, lng: null },
        qualityOfLand,
        waterSource,
        valuation: Number(valuation),
        demandPrice: demandPrice ? Number(demandPrice) : null,
        offerPrice: offerPrice ? Number(offerPrice) : null,
        status,
        paymentCondition,
        plotRateNearby: plotRateNearby ? Number(plotRateNearby) : null,
        site,
        direction,
        problem: parsedProblems.filter(p => !!p),
        agentName,
        agentMobile,
        photos: uploadedUrls.photos || [],
        details,
        propertyDate: propertyDate ? moment(propertyDate, 'YYYY-MM-DD').toDate() : new Date(),
        createdBy: {
          id: new mongoose.Types.ObjectId(userId),
          role: targetUser.role
        }
      });

      await property.save();
      return responseHandler.success(res, property, 'Property created successfully');
    } catch (error) {
      console.error('❌ Create property error:', error);
      return responseHandler.error(res, 'Failed to create property', 500);
    }
  },

  // ✅ GET properties with selected fields + map link
  getPropertiesByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      const properties = await Property.find({ 'createdBy.id': userId })
        .select('photos location area areaDetails status agentName propertyDate mapLocation')
        .sort({ createdAt: -1 });

      const enriched = properties.map(p => ({
        ...p.toObject(),
        mapLink: generateMapLink(p.mapLocation)
      }));

      return responseHandler.success(res, enriched, 'Fetched properties successfully');
    } catch (error) {
      console.error('❌ Get properties error:', error);
      return responseHandler.error(res, 'Failed to fetch properties', 500);
    }
  },

  // ✅ GET full properties + map link
  // getMyPropertyFullDetails: async (req, res) => {
  //   try {
  //     const { userId } = req.params;

  //     const properties = await Property.find({ 'createdBy.id': userId }).sort({ createdAt: -1 });

  //     const enriched = properties.map(p => ({
  //       ...p.toObject(),
  //       mapLink: generateMapLink(p.mapLocation)
  //     }));

  //     return responseHandler.success(res, enriched, 'Full property details fetched');
  //   } catch (error) {
  //     console.error('❌ getMyPropertyFullDetails error:', error);
  //     return responseHandler.error(res, 'Failed to fetch full property details', 500);
  //   }
  // },

  getMyPropertyFullDetails: async (req, res) => {
  try {
    const { userId } = req.params;
    const { location, zone, status, propertyDate } = req.query; // ✅ matches frontend params

    const query = { "createdBy.id": userId };

    // Location filter
    if (location) {
      query.location = new RegExp(location, "i");
    }

    // Zone filter
    if (zone) {
      query.zone = new RegExp(zone, "i");
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date filter
    if (propertyDate) {
      const start = new Date(propertyDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(propertyDate);
      end.setHours(23, 59, 59, 999);
      query.propertyDate = { $gte: start, $lte: end };
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });

    const enriched = properties.map((p) => ({
      ...p.toObject(),
      mapLink: generateMapLink(p.mapLocation),
    }));

    return responseHandler.success(res, enriched, "Full property details fetched");
  } catch (error) {
    console.error("❌ getMyPropertyFullDetails error:", error);
    return responseHandler.error(res, "Failed to fetch full property details", 500);
  }
},


  // ✅ UPDATE property by user
  updatePropertyByUserId: async (req, res) => {
    try {
      const { userId, propertyId } = req.params;

      const existing = await Property.findOne({ _id: propertyId, 'createdBy.id': userId });
      if (!existing) return responseHandler.error(res, 'Property not found or unauthorized', 404);

      const uploadedUrls = {};
      if (req.files) {
        for (const key in req.files) {
          uploadedUrls[key] = req.files[key].map(f => f.location);
        }
      }

      const parsedMapLocation = (() => {
        try {
          return typeof req.body.mapLocation === 'string'
            ? JSON.parse(req.body.mapLocation)
            : req.body.mapLocation;
        } catch {
          return existing.mapLocation;
        }
      })();

      const updates = {
        ...req.body,
        mapLocation: parsedMapLocation ?? existing.mapLocation,
        photos: uploadedUrls.photos || existing.photos,
        satbara: uploadedUrls.satbara?.[0] || existing.satbara,
        ferfar: uploadedUrls.ferfar?.[0] || existing.ferfar,
        eightA: uploadedUrls.eightA?.[0] || existing.eightA,
        tochNakasha: uploadedUrls.tochNakasha?.[0] || existing.tochNakasha,
        registryDocument: uploadedUrls.registryDocument?.[0] || existing.registryDocument
      };

      await Property.findByIdAndUpdate(propertyId, updates, { new: true });
      return responseHandler.success(res, null, 'Property updated successfully');
    } catch (error) {
      console.error('❌ Update property error:', error);
      return responseHandler.error(res, 'Failed to update property', 500);
    }
  },

  // ✅ DELETE property by user
  deletePropertyByUserId: async (req, res) => {
    try {
      const { userId, propertyId } = req.params;

      const deleted = await Property.findOneAndDelete({ _id: propertyId, 'createdBy.id': userId });
      if (!deleted) return responseHandler.error(res, 'Property not found or unauthorized', 404);

      return responseHandler.success(res, null, 'Property deleted successfully');
    } catch (error) {
      console.error('❌ Delete property error:', error);
      return responseHandler.error(res, 'Failed to delete property', 500);
    }
  }
};

module.exports = propertyByUserController;
