import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando o script para garantir o usuário admin...');

    const myAdminEmail = 'hello@admin.com';
    const myAdminPassword = 'of426619052br';
    const myAdminName = 'Hellô Borges';

    if (!myAdminEmail || !myAdminPassword || !myAdminName) {
        throw new Error("Por favor, preencha os dados do administrador (myAdminEmail, myAdminPassword, myAdminName) no arquivo prisma/seed.ts");
    }

    // Criptografa a nova senha
    const hashedPassword = bcrypt.hashSync(myAdminPassword, 10);

    // Esta função "upsert" irá ATUALIZAR o admin se o e-mail já existir,
    // ou CRIAR um novo se não existir.
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

    console.log(`Administrador "${adminUser.name}" garantido/atualizado com sucesso no e-mail "${adminUser.email}".`);
    console.log('Script finalizado.');
}

// Executa a função principal
main()
    .catch((e) => {
        console.error('Ocorreu um erro ao rodar o script:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // Fecha a conexão com o banco de dados
        await prisma.$disconnect();
    });