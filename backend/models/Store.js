const { TABLES, nowISO, insert, updateRow } = require('../config/mysql');
const { selectOne, selectAll } = require('./baseMysql');

const TABLE = TABLES.Stores;

const DEFAULT_HOURS = { open: '09:00', close: '21:00' };

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.store_id,
    storeId: item.store_id,
    name: item.name,
    location: item.city || item.location || null,
    city: item.city || null,
    address: item.address || null,
    latitude: item.latitude !== null && item.latitude !== undefined ? Number(item.latitude) : null,
    longitude: item.longitude !== null && item.longitude !== undefined ? Number(item.longitude) : null,
    hours: parseHours(item.hours),
    capacityPerSlot: item.capacity_per_slot !== null && item.capacity_per_slot !== undefined ? item.capacity_per_slot : 10,
    is_active: item.is_active !== null && item.is_active !== undefined ? !!Number(item.is_active) : true,
    updatedAt: item.updated_at,
  };
};

const parseHours = (value) => {
  if (value === null || value === undefined) return DEFAULT_HOURS;
  if (typeof value === 'object') return { ...DEFAULT_HOURS, ...value };
  try {
    return { ...DEFAULT_HOURS, ...JSON.parse(value) };
  } catch {
    return DEFAULT_HOURS;
  }
};

const findById = async (storeId) => {
  const row = await selectOne(TABLE, { store_id: storeId });
  return toAPI(row);
};

const findAll = async () => {
  const rows = await selectAll(TABLE, { orderBy: { field: 'name', dir: 'ASC' } });
  return rows.map(toAPI).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
};

const create = async (data) => {
  const now = nowISO();
  const row = {
    store_id: data.storeId || data.id,
    name: data.name,
    city: data.city || data.location || null,
    address: data.address || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    hours: JSON.stringify(data.hours || DEFAULT_HOURS),
    capacity_per_slot: data.capacityPerSlot || 10,
    is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
    created_at: now,
    updated_at: now,
  };
  await insert(TABLE, row);
  return toAPI(row);
};

const update = async (storeId, updates) => {
  const data = { store_id: storeId };
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    const column = key === 'capacityPerSlot' ? 'capacity_per_slot' : key;
    data[column] = key === 'is_active' ? (value ? 1 : 0) : (key === 'hours' && typeof value === 'object' ? JSON.stringify(value) : value);
  }
  data.updated_at = nowISO();
  await updateRow(TABLE, data, ['store_id']);
  return toAPI(await selectOne(TABLE, { store_id: storeId }));
};

module.exports = { toAPI, findById, findAll, create, update };