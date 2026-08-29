import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    productId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    subCategory: v.string(),
    brand: v.string(),
    rating: v.number(),
    isArEnabled: v.boolean(),
    source: v.string(),
    attributes: v.optional(v.any()),
    embedding: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const product = {
      productId: args.productId,
      title: args.title,
      price: args.price,
      category: args.category,
      subCategory: args.subCategory,
      brand: args.brand,
      rating: args.rating,
      isArEnabled: args.isArEnabled,
      source: args.source,
      updatedAt: now,
    };
    if (args.description !== undefined) product.description = args.description;
    if (args.attributes !== undefined) product.attributes = args.attributes;
    if (args.embedding !== undefined) product.embedding = args.embedding;
    await ctx.db.insert("products", product);
    return { ...args, updatedAt: now };
  },
});

export const findById = query({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db.query("products").filter(q => q.eq(q.field("productId"), args.productId)).first();
    return product || null;
  },
});

export const update = mutation({
  args: {
    productId: v.string(),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      price: v.optional(v.number()),
      category: v.optional(v.string()),
      subCategory: v.optional(v.string()),
      brand: v.optional(v.string()),
      rating: v.optional(v.number()),
      isArEnabled: v.optional(v.boolean()),
      attributes: v.optional(v.any()),
      embedding: v.optional(v.array(v.number())),
    }),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.query("products").filter(q => q.eq(q.field("productId"), args.productId)).first();
    if (!product) return null;
    await ctx.db.patch(product._id, { ...args.updates, updatedAt: new Date().toISOString() });
    return { ...product, ...args.updates, updatedAt: new Date().toISOString() };
  },
});

export const list = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    category: v.optional(v.union(v.string(), v.null())),
    sub_category: v.optional(v.union(v.string(), v.null())),
    brand: v.optional(v.union(v.string(), v.null())),
    gender: v.optional(v.union(v.string(), v.null())),
    colour: v.optional(v.union(v.string(), v.null())),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    rating: v.optional(v.number()),
    search: v.optional(v.union(v.string(), v.null())),
    sort: v.optional(v.union(v.string(), v.null())),
    order: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    const normalizedSearch = (args.search || "").toLowerCase().trim();

    products = products.filter(p => {
      if (args.category && !(p.category || "").toLowerCase().includes(args.category.toLowerCase())) return false;
      if (args.sub_category && !(p.subCategory || "").toLowerCase().includes(args.sub_category.toLowerCase())) return false;
      if (args.brand && !(p.brand || "").toLowerCase().includes(args.brand.toLowerCase())) return false;
      if (args.minPrice && p.price < args.minPrice) return false;
      if (args.maxPrice && p.price > args.maxPrice) return false;
      if (args.rating && p.rating < args.rating) return false;
      if (normalizedSearch) {
        const haystack = [
          p.title, p.description, p.brand, p.category,
          p.subCategory,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }
      return true;
    });

    const sortField = ["price", "rating", "title"].includes(args.sort || "") ? args.sort! : "updatedAt";
    products.sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      let cmp = 0;
      if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
      else cmp = String(va || "").localeCompare(String(vb || ""));
      return (args.order || "DESC").toUpperCase() === "ASC" ? cmp : -cmp;
    });

    const page = args.page || 1;
    const limit = args.limit || 20;
    const total = products.length;
    const start = (page - 1) * limit;
    const paginated = products.slice(start, start + limit);

    return {
      products: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
});

export const topRated = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    return products
      .sort((a, b) => (b.rating - a.rating) || 0)
      .slice(0, args.limit || 12);
  },
});

export const listByIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").filter(q => q.any(...args.ids.map(id => q.eq(q.field("productId"), id)))).collect();
    return products;
  },
});

export const getCategories = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const set = new Set<string>();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return [...set].sort();
  },
});

export const getBrands = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const set = new Set<string>();
    products.forEach(p => { if (p.brand) set.add(p.brand); });
    return [...set].sort();
  },
});

export const count = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.length;
  },
});

export const scanAllForAnalytics = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const scanAllRaw = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});