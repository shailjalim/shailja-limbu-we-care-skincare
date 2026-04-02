const Consultation = require('../models/Consultation');

exports.requestConsultation = async (req, res) => {
  try {
    const { concern, details } = req.body;
    if (!concern) {
      return res.status(400).json({ success: false, message: 'Consultation concern is required' });
    }

    const consultation = await Consultation.create({
      user: req.user._id,
      concern,
      details,
    });

    res.status(201).json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error requesting consultation' });
  }
};

exports.getMyConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user._id }).sort({ requestedAt: -1 });
    res.status(200).json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching consultations' });
  }
};

exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().populate('user', 'name email').sort({ requestedAt: -1 });
    res.status(200).json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching consultations' });
  }
};

exports.respondToConsultation = async (req, res) => {
  try {
    const { response } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    consultation.status = 'completed';
    consultation.response = response;
    consultation.respondedAt = new Date();
    await consultation.save();

    res.status(200).json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error responding to consultation' });
  }
};
