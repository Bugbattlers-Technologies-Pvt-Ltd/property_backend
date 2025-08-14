const Property = require('../models/Property');
const { responseHandler } = require('../utils/responseHandler');
const { ROLES } = require('../utils/constants');
const convertArea = require('../utils/areaConverter');
const moment = require('moment');

const propertyController = {
  // createProperty: async (req, res) => {
  //   try {
  //     const user = req.user;
  //     const uploadedUrls = {};
  //      const files = req.files;

  //     if (req.files) {
  //       for (const key in req.files) {
  //         uploadedUrls[key] = req.files[key].map(file => file.location);
  //       }
  //     }

  //     const {
  //       gatNumber, zone, side, location,
  //       mapLocation, valuation, direction, problem,
  //       agentName, agentMobile, areaValue, areaUnit = 'sqft',
  //       length, breadth, citySurveyNo, demandPrice, offerPrice,
  //       pricing, soldPrice,
  //       qualityOfLand, waterSource, details, paymentCondition ,propertyDate
  //     } = req.body;

  //     const satbara = uploadedUrls.satbara?.[0] || req.body.satbara;
  //     const ferfar = uploadedUrls.ferfar?.[0] || req.body.ferfar;
  //     //const photoUrls = files.photos?.map(file => file.location) || [];
  //     const photoUrls = uploadedUrls.photos || [];
  //     if (!gatNumber || !satbara || !ferfar || !areaValue) {
  //       return responseHandler.error(res, 'gatNumber, satbara, ferfar, and areaValue are required', 400);
  //     }

  //     const conversions = convertArea({
  //       area: Number(areaValue),
  //       unit: areaUnit,
  //       length: length ? Number(length) : undefined,
  //       breadth: breadth ? Number(breadth) : undefined
  //     });

  //     const areaDetails = {
  //       originalValue: Number(areaValue),
  //       sqft: conversions.sqft,
  //       sqm: conversions.sqm,
  //       guntha: conversions.guntha,
  //       acre: conversions.acre
  //     };
      

  //     const propertyData = {
  //       gatNumber,
  //       satbara: satbaraUrl,
  //       ferfar:ferfarUrl,
  //       zone,
  //       side,
  //       location,
  //       mapLocation,
  //       valuation,
  //       direction,
  //       problem,
  //       agentName,
  //       agentMobile,
  //       areaDetails,
  //       area: Number(areaValue),
  //       areaUnit,
  //       createdBy: user._id,
  //       citySurveyNo,
  //       demandPrice,
  //       offerPrice,
  //       length,
  //       breadth,
  //       size: length && breadth ? `${length} * ${breadth}` : undefined,
  //       photos: uploadedUrls.photos || [],
  //       eightA: uploadedUrls.eightA?.[0] || null,
  //       tochNakasha: uploadedUrls.tochNakasha?.[0] || null,
  //       qualityOfLand,
  //       waterSource,
  //       details,
  //       paymentCondition,
  //        propertyDate: propertyDate ? moment(propertyDate, 'DD-MM-YYYY').toDate() : new Date()
  //     };

  //     if (user.role === ROLES.ADMIN) {
  //       propertyData.pricing = pricing;
  //       propertyData.registryDocument = uploadedUrls.registryDocument?.[0] || null;
  //       propertyData.soldPrice = soldPrice;
  //     }

  //     const property = new Property(propertyData);
  //     await property.save();

  //     responseHandler.success(res, property, 'Property created successfully', 201);
  //   } catch (error) {
  //     console.error('Create property error:', error);
  //     responseHandler.error(res, 'Failed to create property', 500);
  //   }
  // },
  createProperty: async (req, res) => {
    try {
      const user = req.user;
      const uploadedUrls = {};
      if (req.files) {
        for (const key in req.files) {
          uploadedUrls[key] = req.files[key].map(f => f.location);
        }
      }

      const {
        gatNumber, zone, side, location,
        mapLocation, valuation, direction, problem,
        agentName, agentMobile, areaValue, areaUnit = 'sqft',
        length, breadth, citySurveyNo, demandPrice, offerPrice,
        pricing, soldPrice, qualityOfLand, waterSource,
        details, paymentCondition, propertyDate
      } = req.body;

      const satbaraUrl        = uploadedUrls.satbara?.[0]        || req.body.satbara;
      const ferfarUrl         = uploadedUrls.ferfar?.[0]         || req.body.ferfar;
      const photoUrls         = uploadedUrls.photos              || [];
      const eightAUrl         = uploadedUrls.eightA?.[0]         || null;
      const tochNakashaUrl    = uploadedUrls.tochNakasha?.[0]    || null;
      const registryDocument  = uploadedUrls.registryDocument?.[0]|| null;
      const profilePhotoUrl   = uploadedUrls.profilePhoto?.[0]   || null;
      const agentProofDocs    = uploadedUrls.agentProofDocs      || [];
      const importantDocs     = uploadedUrls.importantDocs       || [];

      // if (!gatNumber || !satbaraUrl || !ferfarUrl || !areaValue) {
      //   return responseHandler.error(res,
      //     'gatNumber, satbara, ferfar, and areaValue are required', 400);
      // }

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

      const propertyData = {
        gatNumber,
        satbara: satbaraUrl,
        ferfar: ferfarUrl,
        zone, side, location, mapLocation, valuation,
        direction, problem, agentName, agentMobile,
        areaDetails,
        area: Number(areaValue),
        areaUnit,
        createdBy: user._id,
        citySurveyNo, demandPrice, offerPrice,
        length, breadth,
        size: length && breadth ? `${length} * ${breadth}` : undefined,
        photos: photoUrls,
        eightA: eightAUrl,
        tochNakasha: tochNakashaUrl,
        registryDocument,
        pricing,
        profilePhoto: profilePhotoUrl,
        agentProofDocs,
        importantDocs,
        qualityOfLand, waterSource, details, paymentCondition,
        propertyDate: propertyDate ?
          moment(propertyDate, 'DD-MM-YYYY').toDate() : new Date()
      };

      if (user.role === ROLES.ADMIN) {
        propertyData.pricing = pricing;
        propertyData.soldPrice = soldPrice;
      }

      const property = new Property(propertyData);
      await property.save();

      responseHandler.success(res, property, 'Property created successfully', 201);
    } catch (error) {
      console.error('Create property error:', error);
      responseHandler.error(res, 'Failed to create property', 500);
    }
  },

  getByLocation: async (req, res) => {
    try {
      const { location } = req.query;
      const query = location ? { location: new RegExp(location, 'i') } : {};
      const properties = await Property.find(query).sort({ createdAt: -1 });
      responseHandler.success(res, properties);
    } catch (err) {
      console.error('Get by location error:', err);
      responseHandler.error(res, 'Failed to fetch properties by location');
    }
  },

  getByStatus: async (req, res) => {
    try {
      const { status } = req.query;
      const query = status ? { status } : {};
      const properties = await Property.find(query).sort({ createdAt: -1 });
      responseHandler.success(res, properties);
    } catch (err) {
      console.error('Get by status error:', err);
      responseHandler.error(res, 'Failed to fetch properties by status');
    }
  },

  getByDate: async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) return responseHandler.error(res, 'Date is required', 400);
      const parsedDate = moment(date, 'DD-MM-YYYY');
      if (!parsedDate.isValid()) return responseHandler.error(res, 'Invalid date format', 400);

      const start = parsedDate.startOf('day').toDate();
      const end = parsedDate.endOf('day').toDate();
      const properties = await Property.find({ propertyDate: { $gte: start, $lte: end } });
      responseHandler.success(res, properties);
    } catch (err) {
      console.error('Get by date error:', err);
      responseHandler.error(res, 'Failed to fetch properties by date');
    }
  },

  getFilteredProperties: async (req, res) => {
  try {
    const { location, status, date, zone, propertyDate } = req.query;
    const query = {};

    // Location search
    if (location) query.location = new RegExp(location, 'i');

    // Status search
    if (status) query.status = status;

    // Zone search
    if (zone) query.zone = new RegExp(zone, 'i');

    // Old date filter (DD-MM-YYYY format)
    if (date) {
      const targetDate = moment(date, 'DD-MM-YYYY');
      if (!targetDate.isValid()) return responseHandler.error(res, 'Invalid date format', 400);
      query.propertyDate = {
        $gte: targetDate.startOf('day').toDate(),
        $lte: targetDate.endOf('day').toDate()
      };
    }

    // PropertyDate filter from frontend (YYYY-MM-DD format)
    if (propertyDate) {
      const start = new Date(propertyDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(propertyDate);
      end.setHours(23, 59, 59, 999);
      query.propertyDate = { $gte: start, $lte: end };
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });
    responseHandler.success(res, properties);
  } catch (err) {
    console.error('Get filtered properties error:', err);
    responseHandler.error(res, 'Failed to fetch filtered properties');
  }
},




  // updateProperty: async (req, res) => {
  //   try {
  //     const user = req.user;
  //     const property = await Property.findById(req.params.id);
  //     if (!property) return responseHandler.error(res, 'Property not found', 404);

  //     if (user.role !== ROLES.ADMIN && !property.createdBy.equals(user._id)) {
  //       return responseHandler.error(res, 'Access denied', 403);
  //     }

  //     const editableFields = {
  //       [ROLES.ADMIN]: [
  //         'gatNumber', 'satbara', 'ferfar', 'zone', 'side', 'location', 'mapLocation',
  //         'valuation', 'direction', 'problem', 'agentName', 'agentMobile', 'pricing',
  //         'registryDocument', 'soldPrice', 'areaValue', 'areaUnit', 'length', 'breadth',
  //         'citySurveyNo', 'demandPrice', 'offerPrice', 'photos', 'eightA', 'tochNakasha',
  //         'qualityOfLand', 'waterSource', 'details', 'paymentCondition'
  //       ],
  //       [ROLES.EMPLOYEE]: [
  //         'gatNumber', 'satbara', 'ferfar', 'zone', 'side', 'location', 'mapLocation',
  //         'valuation', 'direction', 'problem', 'agentName', 'agentMobile',
  //         'areaValue', 'areaUnit', 'length', 'breadth', 'citySurveyNo',
  //         'photos', 'eightA', 'tochNakasha',
  //         'qualityOfLand', 'waterSource', 'details', 'paymentCondition'
  //       ],
  //       [ROLES.AGENT]: [
  //         'gatNumber', 'satbara', 'ferfar', 'zone', 'side', 'location', 'mapLocation',
  //         'valuation', 'direction', 'problem', 'agentName', 'agentMobile',
  //         'areaValue', 'areaUnit', 'length', 'breadth', 'citySurveyNo',
  //         'photos', 'eightA', 'tochNakasha',
  //         'qualityOfLand', 'waterSource', 'details', 'paymentCondition'
  //       ]
  //     };

  //     const allowedFields = editableFields[user.role] || [];
  //     const filteredUpdates = {};

  //     for (const key in req.body) {
  //       if (allowedFields.includes(key)) {
  //         filteredUpdates[key] = req.body[key];
  //       }
  //     }

  //     if (filteredUpdates.areaValue) {
  //       const conversions = convertArea({
  //         area: Number(filteredUpdates.areaValue),
  //         unit: filteredUpdates.areaUnit || 'sqft',
  //         length: filteredUpdates.length ? Number(filteredUpdates.length) : undefined,
  //         breadth: filteredUpdates.breadth ? Number(filteredUpdates.breadth) : undefined
  //       });

  //       filteredUpdates.areaDetails = {
  //         originalValue: Number(filteredUpdates.areaValue),
  //         sqft: conversions.sqft,
  //         sqm: conversions.sqm,
  //         guntha: conversions.guntha,
  //         acre: conversions.acre
  //       };

  //       filteredUpdates.area = Number(filteredUpdates.areaValue);
  //     }

  //     if (filteredUpdates.length && filteredUpdates.breadth) {
  //       filteredUpdates.size = `${filteredUpdates.length} * ${filteredUpdates.breadth}`;
  //     }

  //     if (req.files) {
  //       for (const key in req.files) {
  //         const fileUrls = req.files[key].map(file => file.location);
  //         if (key === 'photos') filteredUpdates.photos = fileUrls;
  //         else filteredUpdates[key] = fileUrls[0];
  //       }
  //     }

  //     Object.assign(property, filteredUpdates);
  //     await property.save();

  //     responseHandler.success(res, property, 'Property updated successfully');
  //   } catch (error) {
  //     console.error('Update property error:', error);
  //     responseHandler.error(res, 'Failed to update property', 500);
  //   }
  // },
updateProperty: async (req, res) => {
    try {
      const user = req.user;
      const property = await Property.findById(req.params.id);
      if (!property) return responseHandler.error(res, 'Property not found', 404);
      if (user.role !== ROLES.ADMIN && !property.createdBy.equals(user._id)) {
        return responseHandler.error(res, 'Access denied', 403);
      }

      const editableFields = {
        [ROLES.ADMIN]: [
          'gatNumber', 'satbara', 'ferfar', 'zone', 'side', 'location', 'mapLocation',
          'valuation', 'direction', 'problem', 'agentName', 'agentMobile', 'pricing',
          'registryDocument', 'soldPrice', 'areaValue', 'areaUnit', 'length', 'breadth',
          'citySurveyNo', 'demandPrice', 'offerPrice', 'photos', 'eightA', 'tochNakasha',
          'qualityOfLand', 'waterSource', 'details', 'paymentCondition'
        ],
         [ROLES.EMPLOYEE]: [
    'gatNumber', 'citySurveyNo', 'satbara', 'ferfar', 'eightA', 'tochNakasha',
    'length', 'breadth', 'areaValue', 'areaUnit', 'zone', 'side', 'location',
    'photos', 'valuation', 'direction', 'problem', 'demandPrice', 'offerPrice',
    'agentName', 'agentMobile', 'qualityOfLand', 'waterSource', 'pricing','details',
    'paymentCondition', 'status', 'propertyDate', 'agentProofDocs', 'importantDocs',
    // Excludes 'registryDocument', 'soldPrice'
  ],
   [ROLES.AGENT]: [
    'gatNumber', 'citySurveyNo', 'satbara', 'ferfar', 'eightA', 'tochNakasha',
    'length', 'breadth', 'areaValue', 'areaUnit', 'zone', 'pricing','side', 'location',
    'photos', 'valuation', 'direction', 'problem', 'demandPrice', 'offerPrice',
    'agentName', 'agentMobile', 'qualityOfLand', 'waterSource', 'details',
    'paymentCondition', 'status', 'propertyDate', 'agentProofDocs', 'importantDocs'
    // Excludes 'registryDocument', 'soldPrice'
  ]
        
       // [ROLES.AGENT]: [/* as before */]
      };
      const allowed = editableFields[user.role] || [];
      const filtered = {};

      Object.keys(req.body).forEach(k => {
        if (allowed.includes(k)) filtered[k] = req.body[k];
      });

      if (filtered.areaValue) {
        const conv = convertArea({
          area: Number(filtered.areaValue),
          unit: filtered.areaUnit || 'sqft',
          length: filtered.length ? Number(filtered.length) : undefined,
          breadth: filtered.breadth ? Number(filtered.breadth) : undefined
        });
        filtered.areaDetails = {
          originalValue: Number(filtered.areaValue),
          sqft: conv.sqft,
          sqm: conv.sqm,
          guntha: conv.guntha,
          acre: conv.acre
        };
        filtered.area = Number(filtered.areaValue);
      }
      if (filtered.length && filtered.breadth) {
        filtered.size = `${filtered.length} * ${filtered.breadth}`;
      }

      if (req.files) {
        for (const key in req.files) {
          const urls = req.files[key].map(f => f.location);
          if (['photos', 'agentProofDocs', 'importantDocs'].includes(key)) {
            filtered[key] = urls;
          } else {
            filtered[key] = urls[0];
          }
        }
      }

      Object.assign(property, filtered);
      await property.save();
      responseHandler.success(res, property, 'Property updated successfully');
    } catch (err) {
      console.error('Update property error:', err);
      responseHandler.error(res, 'Failed to update property', 500);
    }
  },

  getProperties: async (req, res) => {
    try {
      const { page = 1, limit = 10, location, area, status, date} = req.query;
      const query = {};

      if (location) query.location = new RegExp(location, 'i');
      if (area) query['areaDetails.sqft'] = { $gte: Number(area) };
      if (status) query.status = status;
      
      if (date) {
        const targetDate = moment(date, 'DD-MM-YYYY');
        if (!targetDate.isValid()) {
          return responseHandler.error(res, 'Invalid date format. Use DD-MM-YYYY', 400);
        }

        const start = targetDate.startOf('day').toDate();
        const end = targetDate.endOf('day').toDate();
        query.propertyDate = { $gte: start, $lte: end };
      }

      if (req.user.role === ROLES.AGENT) {
  query.createdBy = req.user._id;
}

      

      let selectFields = '';
      if (req.user.role !== ROLES.ADMIN) {
        const adminOnly = ['pricing', 'registryDocument', 'soldPrice'];
        adminOnly.forEach(field => selectFields += `-${field} `);
      }

      const properties = await Property.find(query)
        .select(selectFields.trim())
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .sort({ createdAt: -1 });

          const formatted = properties.map(p => {
        const obj = p.toObject();
        obj.propertyDate = moment(obj.propertyDate).format('DD-MM-YY');
        return obj;
      });
      const total = await Property.countDocuments(query);

      responseHandler.paginated(res, properties, {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      });
    } catch (error) {
      console.error('Get properties error:', error);
      responseHandler.error(res, 'Failed to get properties', 500);
    }
  },

  getPropertyById: async (req, res) => {
  try {
    let selectFields = '';
    if (req.user.role !== ROLES.ADMIN) {
      const adminOnly = ['pricing', 'registryDocument', 'soldPrice'];
      adminOnly.forEach(field => selectFields += `-${field} `);
    }

    const property = await Property.findById(req.params.id)
      .select(selectFields.trim())
      .populate('createdBy', 'name email');

    if (!property) {
      return responseHandler.error(res, 'Property not found', 404);
    }

    // if ([ROLES.AGENT, ROLES.EMPLOYEE].includes(req.user.role)) {
    //   if (!property.createdBy || !property.createdBy._id.equals(req.user._id)) {
    //     return responseHandler.error(res, 'Access denied: not your property', 403);
    //   }
    // }

    return responseHandler.success(res, property);
  } catch (error) {
    console.error('Get property error:', error);
    return responseHandler.error(res, 'Failed to get property', 500);
  }
},


  deleteProperty: async (req, res) => {
    try {
      const user = req.user;
      const property = await Property.findById(req.params.id);
      if (!property) return responseHandler.error(res, 'Property not found', 404);
      if (user.role !== ROLES.ADMIN && !property.createdBy.equals(user._id)) {
        return responseHandler.error(res, 'Access denied', 403);
      }

      await property.deleteOne();
      responseHandler.success(res, null, 'Property deleted successfully');
    } catch (error) {
      console.error('Delete property error:', error);
      responseHandler.error(res, 'Failed to delete property', 500);
    }
  },

  getFilteredPropertiesForEmployee: async (req, res) => {
    try {
      const query = {};
      const selectFields = ['pricing', 'registryDocument', 'soldPrice'].map(field => `-${field}`).join(' ');
      const properties = await Property.find(query).select(selectFields);
      responseHandler.success(res, properties);
    } catch (err) {
      console.error('getFilteredPropertiesForEmployee error:', err);
      responseHandler.error(res, 'Failed to load employee dashboard data');
    }
  },

  getFilteredPropertiesForAgent: async (req, res) => {
    try {
      const query = { createdBy: req.user._id };
      const selectFields = ['pricing', 'registryDocument', 'soldPrice'].map(field => `-${field}`).join(' ');
      const properties = await Property.find(query).select(selectFields);
      responseHandler.success(res, properties);
    } catch (err) {
      console.error('getFilteredPropertiesForAgent error:', err);
      responseHandler.error(res, 'Failed to load agent dashboard data');
    }
  }
   
};

module.exports = propertyController;
