import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando script de seed e diagnóstico ---');

    // 1. Testar a conexão com o banco de dados
    try {
        await prisma.$connect();
        console.log('✅ Conexão com o banco de dados bem-sucedida!');
    } catch (e) {
        console.error('❌ ERRO FATAL: Não foi possível conectar ao banco de dados.');
        console.error('Verifique se a variável DATABASE_URL no seu arquivo .env está correta.');
        throw e; // Interrompe a execução se a conexão falhar
    }

    // 2. Definir e criar/atualizar o usuário administrador
    console.log('Verificando o usuário administrador...');

    // --- COLOQUE SUAS CREDENCIAIS AQUI ---
    const myAdminEmail = 'helloborges@admin.com';
    const myAdminPassword = 'hf5316533ha';
    const myAdminName = 'Hellô Borges';
    // ------------------------------------

    if (!myAdminEmail.includes('@')) {
        throw new Error("Por favor, preencha as credenciais do admin no arquivo prisma/seed.ts antes de continuar.");
    }

    const hashedPassword = bcrypt.hashSync(myAdminPassword, 10);

    const adminUser = await prisma.admin.upsert({
        where: { email: myAdminEmail },
        update: {
            password: hashedPassword,
            name: myAdminName,
        },
        create: {
            email: myAdminEmail,
            password: hashedPassword,
            name: myAdminName,
        },
    });

    console.log(`✅ Administrador "${adminUser.name}" (${adminUser.email}) foi criado/atualizado com sucesso.`);
    console.log('--- Script finalizado com sucesso! ---');
}

main()
    .catch((e) => {
        process.exit(1);
    })
    .finally(async () => {
        // Fecha a conexão de forma segura
        await prisma.$disconnect();
    });