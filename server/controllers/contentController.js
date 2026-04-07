const Content = require('../models/Content');

const normalize = (value) => String(value || '').trim().toLowerCase();

exports.getContent = async (req, res) => {
  try {
    const { category, tag } = req.query;
    const query = {};

    if (category) {
      query.category = normalize(category);
    }

    if (tag) {
      query.tags = { $in: [normalize(tag)] };
    }

    const content = await Content.find(query).sort({ createdAt: -1 });
    return res.json(content);
  } catch (error) {
    console.error('getContent error', error);
    return res.status(500).json({ error: 'Server error retrieving content' });
  }
};

exports.getContentById = async (req, res) => {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Content not found' });
    }

    return res.json(item);
  } catch (error) {
    console.error('getContentById error', error);
    return res.status(500).json({ error: 'Server error retrieving content' });
  }
};

exports.createContent = async (req, res) => {
  try {
    const item = await Content.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    console.error('createContent error', error);
    return res.status(400).json({ error: 'Invalid content data' });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const item = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ error: 'Content not found' });
    }

    return res.json(item);
  } catch (error) {
    console.error('updateContent error', error);
    return res.status(400).json({ error: 'Invalid content data' });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const item = await Content.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Content not found' });
    }

    return res.json({ message: 'Content deleted' });
  } catch (error) {
    console.error('deleteContent error', error);
    return res.status(500).json({ error: 'Server error deleting content' });
  }
};