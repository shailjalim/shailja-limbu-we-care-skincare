const Consultation = require('../models/Consultation');
const fs = require('fs');
const path = require('path');

const VALID_STATUSES = new Set(['pending', 'in-progress', 'completed']);

const toModelStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (VALID_STATUSES.has(normalized)) {
    return normalized;
  }
  return undefined;
};

const formatConsultation = (consultation) => ({
  _id: consultation._id,
  userId: consultation.userId?._id || consultation.userId || consultation.user,
  user: consultation.userId
    ? {
        _id: consultation.userId._id,
        name: consultation.userId.name,
        email: consultation.userId.email,
      }
    : consultation.user
      ? {
          _id: consultation.user._id,
          name: consultation.user.name,
          email: consultation.user.email,
        }
      : undefined,
  title: consultation.title || consultation.concern || '',
  description: consultation.description || consultation.details || '',
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
});

const deleteConsultationImages = async (images = []) => {
  const deletePromises = images
    .filter((imagePath) => typeof imagePath === 'string' && imagePath.includes('/uploads/consultations/'))
    .map(async (imagePath) => {
      const fileName = path.basename(imagePath);
      const absolutePath = path.join(__dirname, '..', 'uploads', 'consultations', fileName);

      try {
        await fs.promises.unlink(absolutePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    });

  await Promise.all(deletePromises);
};

exports.getAdminConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('userId', 'name email')
      .populate('user', 'name email')
      .sort({ createdAt: -1, requestedAt: -1 });

    return res.status(200).json({
      success: true,
      consultations: consultations.map(formatConsultation),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching consultations' });
  }
};

exports.updateAdminConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('user', 'name email');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    if (req.body.status !== undefined) {
      const nextStatus = toModelStatus(req.body.status);
      if (!nextStatus) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: pending, in-progress, completed',
        });
      }
      consultation.status = nextStatus;
    }

    if (typeof req.body.adminReply === 'string') {
      const sanitizedReply = String(req.body.adminReply).replace(/[<>]/g, '').trim();
      consultation.adminReply = sanitizedReply;
      consultation.response = sanitizedReply;
      consultation.respondedAt = new Date();
    }

    if (Array.isArray(req.files) && req.files.length > 0) {
      await deleteConsultationImages(consultation.adminReplyImages || []);
      consultation.adminReplyImages = req.files.map((file) => `/uploads/consultations/${file.filename}`);
      consultation.respondedAt = new Date();
    }

    await consultation.save();

    return res.status(200).json({ success: true, consultation: formatConsultation(consultation) });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid consultation update data' });
  }
};

exports.deleteAdminConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    await deleteConsultationImages(consultation.images || []);
    await deleteConsultationImages(consultation.adminReplyImages || []);
    await consultation.deleteOne();

    return res.status(200).json({ success: true, message: 'Consultation deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while deleting consultation' });
  }
};