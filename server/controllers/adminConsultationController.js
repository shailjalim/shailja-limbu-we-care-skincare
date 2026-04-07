const Consultation = require('../models/Consultation');

const toApiStatus = (status) => {
  if (status === 'completed') return 'resolved';
  return 'pending';
};

const toModelStatus = (status) => {
  if (status === 'resolved') return 'completed';
  if (status === 'pending') return 'pending';
  return undefined;
};

const formatConsultation = (consultation) => ({
  _id: consultation._id,
  userId: consultation.user?._id || consultation.user,
  user: consultation.user
    ? {
        _id: consultation.user._id,
        name: consultation.user.name,
        email: consultation.user.email,
      }
    : undefined,
  message: consultation.details ? `${consultation.concern}\n${consultation.details}` : consultation.concern,
  concern: consultation.concern,
  details: consultation.details,
  status: toApiStatus(consultation.status),
  adminReply: consultation.response || '',
  requestedAt: consultation.requestedAt,
  respondedAt: consultation.respondedAt,
});

exports.getAdminConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('user', 'name email')
      .sort({ requestedAt: -1 });

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
    const consultation = await Consultation.findById(req.params.id).populate('user', 'name email');
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    const nextStatus = toModelStatus(req.body.status);
    if (nextStatus) {
      consultation.status = nextStatus;
    }

    if (typeof req.body.adminReply === 'string') {
      consultation.response = req.body.adminReply;
      if (!nextStatus) {
        consultation.status = 'completed';
      }
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
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    return res.status(200).json({ success: true, message: 'Consultation deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while deleting consultation' });
  }
};