import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/nados?schema=public';

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log('Seeding templates...');

  const templates = [
    { name: 'أطروحة تخرج', slug: 'thesis', description: 'قالب لأطروحة التخرج مع فصول ومقدمة وخاتمة', category: 'thesis', schema: { fields: ['university', 'department', 'supervisor', 'chapters'] }, displayOrder: 1, isActive: true },
    { name: 'معرض أعمال', slug: 'portfolio', description: 'قالب لعرض الأعمال والمشاريع السابقة', category: 'portfolio', schema: { fields: ['title', 'description', 'skills', 'projects'] }, displayOrder: 2, isActive: true },
    { name: 'مشروع هندسي', slug: 'engineering', description: 'قالب للمشاريع الهندسية والمخططات', category: 'engineering', schema: { fields: ['projectName', 'location', 'area', 'materials'] }, displayOrder: 3, isActive: true },
    { name: 'خطة عمل', slug: 'business-plan', description: 'قالب لكتابة خطة عمل شاملة', category: 'business_plan', schema: { fields: ['executiveSummary', 'marketAnalysis', 'financialPlan'] }, displayOrder: 4, isActive: true },
    { name: 'بحث سوق', slug: 'market-research', description: 'قالب لبحث السوق والمنافسين', category: 'market_research', schema: { fields: ['targetAudience', 'competitors', 'trends'] }, displayOrder: 5, isActive: true },
    { name: 'دورة تدريبية', slug: 'course', description: 'قالب لإنشاء دورات تدريبية', category: 'course', schema: { fields: ['title', 'objectives', 'modules', 'duration'] }, displayOrder: 6, isActive: true },
    { name: 'مخصص', slug: 'custom', description: 'قالب مخصص بدون قيود', category: 'custom', schema: {}, displayOrder: 7, isActive: true },
    { name: 'تقرير', slug: 'report', description: 'قالب للتقارير الدورية', category: 'other', schema: { fields: ['title', 'period', 'sections'] }, displayOrder: 8, isActive: true },
  ];

  for (const t of templates) {
    await db.insert(schema.templates).values(t);
    console.log(`Created template: ${t.name}`);
  }

  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => client.end());