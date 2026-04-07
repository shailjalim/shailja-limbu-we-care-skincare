const Content = require('../models/Content');

const normalize = (value) => String(value || '').trim().toLowerCase();

const normalizeTags = (value) => {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => normalize(item)).filter(Boolean);
  return [];
};

exports.getAdminArticles = async (req, res) => {
  try {
    const articles = await Content.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, articles });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching articles' });
  }
};

exports.createAdminArticle = async (req, res) => {
  try {
    const article = await Content.create({
      title: req.body.title,
      category: normalize(req.body.category),
      content: req.body.content,
      tags: normalizeTags(req.body.tags),
    });

    return res.status(201).json({ success: true, article });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid article data' });
  }
};

exports.updateAdminArticle = async (req, res) => {
  try {
    const updateData = {
      ...(req.body.title !== undefined ? { title: req.body.title } : {}),
      ...(req.body.category !== undefined ? { category: normalize(req.body.category) } : {}),
      ...(req.body.content !== undefined ? { content: req.body.content } : {}),
      ...(req.body.tags !== undefined ? { tags: normalizeTags(req.body.tags) } : {}),
    };

    const article = await Content.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    return res.status(200).json({ success: true, article });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid article data' });
  }
};

exports.deleteAdminArticle = async (req, res) => {
  try {
    const article = await Content.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    return res.status(200).json({ success: true, message: 'Article deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while deleting article' });
  }
};