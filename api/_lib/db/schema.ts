import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => user.id),
});

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => user.id),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
});

import { integer, jsonb } from 'drizzle-orm/pg-core';

// --- Application Tables ---

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    location: text('location').notNull(),
    price: text('price'),
    description: text('description').notNull(),
    status: text('status').notNull(), // 'Ongoing' | 'Completed' | 'Upcoming'
    imageUrl: text('imageUrl').notNull(),
    logoUrl: text('logoUrl'),
    buildingAmenities: jsonb('buildingAmenities').$type<string[]>(),
    order: integer('order').default(0),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
});

export const projectUnits = pgTable('project_units', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('projectId').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    size: text('size').notNull(),
    bedrooms: integer('bedrooms').notNull(),
    bathrooms: integer('bathrooms').notNull(),
    balconies: integer('balconies').notNull(),
    features: jsonb('features').$type<string[]>(),
    floorPlanImage: text('floorPlanImage'),
});

export const galleryItems = pgTable('gallery_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    url: text('url').notNull(),
    caption: text('caption'),
    category: text('category'),
    createdAt: timestamp('createdAt').defaultNow(),
});

export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    message: text('message').notNull(),
    date: timestamp('date').defaultNow(),
    read: boolean('read').default(false),
});

export const siteSettings = pgTable('site_settings', {
    id: integer('id').primaryKey(), // Always 1
    settings: jsonb('settings').notNull(), // Store full JSON object for flexibility
    updatedAt: timestamp('updatedAt').defaultNow(),
});
