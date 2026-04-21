import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create skills
  const skills = await Promise.all([
    prisma.skill.upsert({ where: { name: 'javascript' }, update: {}, create: { name: 'javascript', category: 'Tech' } }),
    prisma.skill.upsert({ where: { name: 'python' }, update: {}, create: { name: 'python', category: 'Tech' } }),
    prisma.skill.upsert({ where: { name: 'react' }, update: {}, create: { name: 'react', category: 'Tech' } }),
    prisma.skill.upsert({ where: { name: 'nodejs' }, update: {}, create: { name: 'nodejs', category: 'Tech' } }),
    prisma.skill.upsert({ where: { name: 'typescript' }, update: {}, create: { name: 'typescript', category: 'Tech' } }),
    prisma.skill.upsert({ where: { name: 'guitar' }, update: {}, create: { name: 'guitar', category: 'Music' } }),
    prisma.skill.upsert({ where: { name: 'piano' }, update: {}, create: { name: 'piano', category: 'Music' } }),
    prisma.skill.upsert({ where: { name: 'english' }, update: {}, create: { name: 'english', category: 'Language' } }),
    prisma.skill.upsert({ where: { name: 'spanish' }, update: {}, create: { name: 'spanish', category: 'Language' } }),
    prisma.skill.upsert({ where: { name: 'photography' }, update: {}, create: { name: 'photography', category: 'Art' } }),
    prisma.skill.upsert({ where: { name: 'painting' }, update: {}, create: { name: 'painting', category: 'Art' } }),
    prisma.skill.upsert({ where: { name: 'yoga' }, update: {}, create: { name: 'yoga', category: 'Fitness' } }),
  ]);

  console.log(`Created ${skills.length} skills`);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillswap.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@skillswap.com',
      password: hashedPassword,
      role: 'TEACHER',
      isAdmin: true,
    },
  });

  // Create teacher user
  const teacher = await prisma.user.upsert({
    where: { email: 'priya.sharma@university.edu' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'priya.sharma@university.edu',
      password: hashedPassword,
      role: 'TEACHER',
      bio: 'Experienced web developer with 5+ years in industry',
    },
  });

  // Create student user
  const student = await prisma.user.upsert({
    where: { email: 'aarav.gupta@student.edu' },
    update: {},
    create: {
      name: 'Aarav Gupta',
      email: 'aarav.gupta@student.edu',
      password: hashedPassword,
      role: 'STUDENT',
      bio: 'Eager to learn new skills',
    },
  });

  console.log('Created users: admin, teacher, student');

  // Add skills to teacher
  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId: teacher.id, skillId: skills[0].id } },
    update: {},
    create: { userId: teacher.id, skillId: skills[0].id, type: 'HAVE', isPaid: true, price: 500 },
  });
  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId: teacher.id, skillId: skills[2].id } },
    update: {},
    create: { userId: teacher.id, skillId: skills[2].id, type: 'HAVE', isPaid: true, price: 600 },
  });

  // Add skills to student
  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId: student.id, skillId: skills[5].id } },
    update: {},
    create: { userId: student.id, skillId: skills[5].id, type: 'HAVE' },
  });
  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId: student.id, skillId: skills[0].id } },
    update: {},
    create: { userId: student.id, skillId: skills[0].id, type: 'WANT' },
  });

  console.log('Added user skills');
  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@skillswap.com / admin123');
  console.log('  Teacher: priya.sharma@university.edu / admin123');
  console.log('  Student: aarav.gupta@student.edu / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });