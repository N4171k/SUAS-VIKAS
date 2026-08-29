const { ConvexHttpClient } = require("convex/browser");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const CONVEX_URL = process.env.CONVEX_URL || "https://impartial-dinosaur-936.eu-west-1.convex.site";

const client = new ConvexHttpClient(CONVEX_URL, { skipConvexDeploymentUrlCheck: true });

const api = {
  users: {
    create: "users:create",
    findById: "users:findById",
    findByEmail: "users:findByEmail",
    update: "users:update",
    count: "users:count",
  },
  products: {
    create: "products:create",
    findById: "products:findById",
    update: "products:update",
    list: "products:list",
    topRated: "products:topRated",
    listByIds: "products:listByIds",
    getCategories: "products:getCategories",
    getBrands: "products:getBrands",
    count: "products:count",
    scanAllForAnalytics: "products:scanAllForAnalytics",
    scanAllRaw: "products:scanAllRaw",
  },
  stores: {
    create: "stores:create",
    findById: "stores:findById",
    findAll: "stores:findAll",
    update: "stores:update",
  },
  carts: {
    create: "carts:create",
    findByUser: "carts:findByUser",
    findOne: "carts:findOne",
    setQuantity: "carts:setQuantity",
    remove: "carts:remove",
    clear: "carts:clear",
  },
  orders: {
    create: "orders:create",
    findByUser: "orders:findByUser",
    findById: "orders:findById",
    update: "orders:update",
    findAll: "orders:findAll",
    count: "orders:count",
  },
  reservations: {
    create: "reservations:create",
    findById: "reservations:findById",
    findByUser: "reservations:findByUser",
    findByStore: "reservations:findByStore",
    update: "reservations:update",
    findAll: "reservations:findAll",
    count: "reservations:count",
  },
  inventory: {
    findOne: "inventory:findOne",
    findByProduct: "inventory:findByProduct",
    findByStore: "inventory:findByStore",
    upsert: "inventory:upsert",
    reserveStock: "inventory:reserveStock",
    releaseStock: "inventory:releaseStock",
    fulfillStock: "inventory:fulfillStock",
    availableProductIds: "inventory:availableProductIds",
  },
  sessions: {
    create: "sessionsActions:create",
    findByToken: "sessions:findByToken",
    findActiveByUserAndToken: "sessions:findActiveByUserAndToken",
    deactivateByUserAndToken: "sessionsActions:deactivateByUserAndToken",
    findByUser: "sessions:findByUser",
  },
  categories: {
    create: "categories:create",
    findById: "categories:findById",
    findByName: "categories:findByName",
    findAll: "categories:findAll",
    update: "categories:update",
  },
  aiLogs: {
    create: "aiLogs:create",
    findByUser: "aiLogs:findByUser",
  },
};

async function callMutation(name, args) {
  return await client.mutation(name, args);
}

async function callQuery(name, args) {
  return await client.query(name, args);
}

const connectDB = async () => {
  try {
    await client.query("users:count", {});
    console.log(`✅ Convex connected (${CONVEX_URL})`);
  } catch (error) {
    console.error("❌ Convex connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { client, api, callMutation, callQuery, connectDB, CONVEX_URL };