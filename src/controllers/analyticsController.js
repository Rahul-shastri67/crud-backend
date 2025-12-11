const User = require('../models/User');

// GET /api/analytics/users-by-location
exports.usersByLocation = async (req, res) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: { city: '$city', state: '$state' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const majorBase = data[0] || null;

    res.json({
      usersByLocation: data,
      majorUserBase: majorBase,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
