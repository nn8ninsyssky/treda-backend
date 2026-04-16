exports.create = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Created successfully',
      data: req.body,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Fetched all records',
      data: [],
    });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: `Fetched record ${req.params.id}`,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: `Updated record ${req.params.id}`,
    });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: `Deleted record ${req.params.id}`,
    });
  } catch (err) {
    next(err);
  }
};