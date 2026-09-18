import { pgTable, uuid, text, varchar, timestamp, boolean, integer, jsonb, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const projectStatusEnum = pgEnum('project_status', ['draft', 'active', 'review', 'delivered', 'archived']);
export const fileScanStatusEnum = pgEnum('file_scan_status', ['pending', 'clean', 'infected', 'failed']);
export const requestStatusEnum = pgEnum('request_status', ['submitted', 'under_review', 'accepted', 'rejected', 'needs_info']);
export const requestServiceTypeEnum = pgEnum('request_service_type', ['web_dev', 'mobile_dev', 'engineering', 'market_analysis', 'education', 'business_solutions', 'custom']);
export const templateCategoryEnum = pgEnum('template_category', ['thesis', 'portfolio', 'engineering', 'business_plan', 'market_research', 'course', 'custom', 'other']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  passwordHash: text('password_hash'),
  name: varchar('name', { length: 100 }),
  image: text('image'),
  role: userRoleEnum('role').notNull().default('user'),
  banned: boolean('banned').notNull().default(false),
  banReason: text('ban_reason'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  bannedIdx: index('users_banned_idx').on(table.banned),
}));

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: varchar('token_type', { length: 50 }),
  scope: varchar('scope', { length: 255 }),
  idToken: text('id_token'),
  sessionState: varchar('session_state', { length: 255 }),
}, (table) => ({
  providerIdx: uniqueIndex('accounts_provider_account_idx').on(table.provider, table.providerAccountId),
  userIdIdx: index('accounts_user_id_idx').on(table.userId),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
  userAgent: text('user_agent'),
  ip: varchar('ip', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
  expiresIdx: index('sessions_expires_idx').on(table.expires),
}));

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex('verification_tokens_token_idx').on(table.token),
  identifierTokenIdx: uniqueIndex('verification_tokens_identifier_token_idx').on(table.identifier, table.token),
}));

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
  tokenHashIdx: uniqueIndex('password_reset_tokens_token_hash_idx').on(table.tokenHash),
}));

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: text('description'),
  category: templateCategoryEnum('category').notNull(),
  templateId: uuid('template_id'),
  status: projectStatusEnum('status').notNull().default('draft'),
  progress: integer('progress').notNull().default(0),
  isPublic: boolean('is_public').notNull().default(false),
  publicSlug: varchar('public_slug', { length: 130 }).unique(),
  templateData: jsonb('template_data'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('projects_user_id_idx').on(table.userId),
  slugIdx: uniqueIndex('projects_slug_idx').on(table.slug),
  publicSlugIdx: uniqueIndex('projects_public_slug_idx').on(table.publicSlug),
  statusIdx: index('projects_status_idx').on(table.status),
  deletedAtIdx: index('projects_deleted_at_idx').on(table.deletedAt),
}));

export const projectFiles = pgTable('project_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  key: varchar('key', { length: 500 }).notNull().unique(),
  scanStatus: fileScanStatusEnum('scan_status').notNull().default('pending'),
  scanResult: text('scan_result'),
  scanRetries: integer('scan_retries').notNull().default(0),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  projectIdIdx: index('project_files_project_id_idx').on(table.projectId),
  userIdIdx: index('project_files_user_id_idx').on(table.userId),
  scanStatusIdx: index('project_files_scan_status_idx').on(table.scanStatus),
  keyIdx: uniqueIndex('project_files_key_idx').on(table.key),
}));

export const projectNotes = pgTable('project_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  projectIdIdx: index('project_notes_project_id_idx').on(table.projectId),
}));

export const projectActivity = pgTable('project_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  projectIdIdx: index('project_activity_project_id_idx').on(table.projectId),
  createdAtIdx: index('project_activity_created_at_idx').on(table.createdAt),
}));

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description').notNull(),
  category: templateCategoryEnum('category').notNull(),
  schema: jsonb('schema').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('templates_slug_idx').on(table.slug),
  categoryIdx: index('templates_category_idx').on(table.category),
  isActiveIdx: index('templates_is_active_idx').on(table.isActive),
}));

export const serviceRequests = pgTable('service_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  idempotencyKey: varchar('idempotency_key', { length: 64 }).notNull().unique(),
  serviceType: requestServiceTypeEnum('service_type').notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description').notNull(),
  budget: integer('budget'),
  deadline: timestamp('deadline', { withTimezone: true }),
  status: requestStatusEnum('status').notNull().default('submitted'),
  adminNote: text('admin_note'),
  internalNote: text('internal_note'),
  assignedAdminId: uuid('assigned_admin_id').references(() => users.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('service_requests_user_id_idx').on(table.userId),
  statusIdx: index('service_requests_status_idx').on(table.status),
  idempotencyKeyIdx: uniqueIndex('service_requests_idempotency_key_idx').on(table.idempotencyKey),
  serviceTypeIdx: index('service_requests_service_type_idx').on(table.serviceType),
}));

export const requestFiles = pgTable('request_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: uuid('request_id').notNull().references(() => serviceRequests.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  key: varchar('key', { length: 500 }).notNull().unique(),
  scanStatus: fileScanStatusEnum('scan_status').notNull().default('pending'),
  scanResult: text('scan_result'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  requestIdIdx: index('request_files_request_id_idx').on(table.requestId),
  keyIdx: uniqueIndex('request_files_key_idx').on(table.key),
}));

export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: varchar('excerpt', { length: 300 }),
  category: varchar('category', { length: 100 }).notNull(),
  tags: text('tags').array(),
  isPublished: boolean('is_published').notNull().default(false),
  authorId: uuid('author_id').notNull().references(() => users.id),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('resources_slug_idx').on(table.slug),
  categoryIdx: index('resources_category_idx').on(table.category),
  isPublishedIdx: index('resources_is_published_idx').on(table.isPublished),
}));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }).notNull(),
  targetId: uuid('target_id'),
  metadata: jsonb('metadata'),
  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  actorIdIdx: index('audit_logs_actor_id_idx').on(table.actorId),
  targetIdx: index('audit_logs_target_idx').on(table.targetType, table.targetId),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
}));

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  projectFiles: many(projectFiles),
  projectNotes: many(projectNotes),
  projectActivity: many(projectActivity),
  serviceRequests: many(serviceRequests),
  requestFiles: many(requestFiles),
  resources: many(resources),
  assignedRequests: many(serviceRequests, { relationName: 'assignedAdmin' }),
  auditLogs: many(auditLogs),
  accounts: many(accounts),
  sessions: many(sessions),
  passwordResetTokens: many(passwordResetTokens),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  files: many(projectFiles),
  notes: many(projectNotes),
  activity: many(projectActivity),
  template: one(templates, { fields: [projects.templateId], references: [templates.id] }),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, { fields: [projectFiles.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectFiles.userId], references: [users.id] }),
}));

export const projectNotesRelations = relations(projectNotes, ({ one }) => ({
  project: one(projects, { fields: [projectNotes.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectNotes.userId], references: [users.id] }),
}));

export const projectActivityRelations = relations(projectActivity, ({ one }) => ({
  project: one(projects, { fields: [projectActivity.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectActivity.userId], references: [users.id] }),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  projects: many(projects),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  user: one(users, { fields: [serviceRequests.userId], references: [users.id] }),
  assignedAdmin: one(users, { fields: [serviceRequests.assignedAdminId], references: [users.id], relationName: 'assignedAdmin' }),
  files: many(requestFiles),
}));

export const requestFilesRelations = relations(requestFiles, ({ one }) => ({
  request: one(serviceRequests, { fields: [requestFiles.requestId], references: [serviceRequests.id] }),
  user: one(users, { fields: [requestFiles.userId], references: [users.id] }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  author: one(users, { fields: [resources.authorId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actorId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type NewProjectFile = typeof projectFiles.$inferInsert;
export type ProjectNote = typeof projectNotes.$inferSelect;
export type NewProjectNote = typeof projectNotes.$inferInsert;
export type ProjectActivity = typeof projectActivity.$inferSelect;
export type NewProjectActivity = typeof projectActivity.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;
export type RequestFile = typeof requestFiles.$inferSelect;
export type NewRequestFile = typeof requestFiles.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;