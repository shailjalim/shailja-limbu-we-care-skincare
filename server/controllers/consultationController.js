const Consultation = require('../models/Consultation');
const SkinProfile = require('../models/SkinProfile');

const sanitizeText = (value) => String(value || '').replace(/[<>]/g, '').trim();

const normalizeConsultation = (consultation) => {
  const title = consultation.title || consultation.concern || '';
  const description = consultation.description || consultation.details || '';

  return {
    _id: consultation._id,
    userId: consultation.userId || consultation.user,
    title,
    description,
    images: Array.isArray(consultation.images) ? consultation.images : [],
    profileSnapshot: consultation.profileSnapshot || {
      skinType: '',
      concerns: [],
      allergies: [],
      sensitivityLevel: '',
    },
    status: consultation.status || 'pending',
    adminReply: consultation.adminReply || consultation.response || '',
    adminReplyImages: Array.isArray(consultation.adminReplyImages) ? consultation.adminReplyImages : [],
    createdAt: consultation.createdAt || consultation.requestedAt,
    updatedAt: consultation.updatedAt || consultation.respondedAt || consultation.requestedAt,
  };
};

exports.requestConsultation = async (req, res) => {
  try {
    const title = sanitizeText(req.body.title);
    const description = sanitizeText(req.body.description);

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    if (title.length > 120 || description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Title or description exceeds allowed length',
      });
    }

    const profile = await SkinProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your skin profile before requesting a consultation',
      });
    }

    const imagePaths = (req.files || []).map((file) => `/uploads/consultations/${file.filename}`);

    const profileSnapshot = {
      skinType: profile.skinType || '',
      concerns: Array.isArray(profile.concerns) ? profile.concerns : [],
      allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
      sensitivityLevel: profile.sensitivityLevel || '',
    };

    const consultation = await Consultation.create({
      userId: req.user._id,
      user: req.user._id,
      title,
      description,
      images: imagePaths,
      profileSnapshot,
      // Maintain these for old consumers/records.
      concern: title,
      details: description,
      requestedAt: new Date(),
    });

    res.status(201).json({ success: true, consultation: normalizeConsultation(consultation) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error requesting consultation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getMyConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      $or: [{ userId: req.user._id }, { user: req.user._id }],
    }).sort({ createdAt: -1, requestedAt: -1 });

    res.status(200).json({
      success: true,
      consultations: consultations.map(normalizeConsultation),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching consultations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
