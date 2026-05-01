const categoryRepo = require('./category.repo');
const { ApiError } = require('../../middlewares/error.middleware');

const getAll = (userId) => categoryRepo.findAllForUser(userId);

const getOne = async (id, userId) => {
  const cat = await categoryRepo.findById(id, userId);
  if (!cat) throw new ApiError(404, 'Category not found');
  return cat;
};

const create = async (userId, data) => {
  return categoryRepo.create({ user_id: userId, ...data });
};

const update = async (id, userId, data) => {
  const cat = await categoryRepo.findById(id, userId);
  if (!cat) throw new ApiError(404, 'Category not found');
  if (cat.is_default) throw new ApiError(403, 'Cannot modify default categories');
  const updated = await categoryRepo.update(id, userId, data);
  return updated;
};

const remove = async (id, userId) => {
  const cat = await categoryRepo.findById(id, userId);
  if (!cat) throw new ApiError(404, 'Category not found');
  if (cat.is_default) throw new ApiError(403, 'Cannot delete default categories');
  if (cat.user_id !== userId) throw new ApiError(403, 'Not your category');
  await categoryRepo.remove(id, userId);
  return { message: 'Category deleted. Existing transactions are now uncategorized.' };
};

module.exports = { getAll, getOne, create, update, remove };