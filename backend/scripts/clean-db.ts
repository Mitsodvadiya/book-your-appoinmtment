import prisma from '../src/database/prisma';

async function cleanDb() {
    console.log('--- CLEANING DATABASE ---');
    
    const tableNames = [
        'AuditLog',
        'Notification',
        'Appointment',
        'Token',
        'Patient',
        'DoctorSchedule',
        'DoctorProfile',
        'ClinicMember',
        'ClinicWorkingHours',
        'Clinic',
        'User'
    ];

    try {
        for (const tableName of tableNames) {
            console.log(`Truncating ${tableName}...`);
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
        }
        console.log('✅ PASS: All tables truncated successfully');
    } catch (error: any) {
        console.error('❌ FAIL: Database cleanup failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

cleanDb();
