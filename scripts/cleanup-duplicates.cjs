/**
 * PEX Dashboard - Cleanup Duplicates Script
 * 
 * This script identifies duplicate products in the 'inventory' collection
 * based on 'ean' or 'name', keeps the most recent one (based on Firestore createTime),
 * and deletes the others using writeBatch.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('Erro: Arquivo serviceAccountKey.json não encontrado em: ' + serviceAccountPath);
    console.log('---');
    console.log('Para usar este script:');
    console.log('1. Vá ao Firebase Console -> Configurações do Projeto -> Contas de Serviço.');
    console.log('2. Clique em "Gerar nova chave privada".');
    console.log('3. Salve o arquivo como "serviceAccountKey.json" na raiz do projeto.');
    console.log('4. Execute: npm install firebase-admin');
    console.log('5. Execute: node scripts/cleanup-duplicates.cjs');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanupDuplicates() {
    console.log('--- Iniciando limpeza de duplicados (Coleção: inventory) ---');

    const inventoryRef = db.collection('inventory');
    const snapshot = await inventoryRef.get();

    if (snapshot.empty) {
        console.log('Nenhum produto encontrado.');
        return;
    }

    console.log(`Documentos encontrados: ${snapshot.size}`);

    const groups = new Map();

    // Grouping documents
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Use EAN if available, otherwise use Name as the unique key
        const key = (data.ean && data.ean.trim().length > 0)
            ? `EAN:${data.ean.trim()}`
            : `NAME:${data.name.toUpperCase().trim()}`;

        if (!groups.has(key)) {
            groups.set(key, []);
        }

        groups.get(key).push({
            id: doc.id,
            createTime: doc.createTime.toDate(),
            ref: doc.ref,
            name: data.name
        });
    });

    let batch = db.batch();
    let batchCount = 0;
    let totalDeleted = 0;
    let totalKept = 0;

    for (const [key, docs] of groups.entries()) {
        if (docs.length > 1) {
            // Sort by createTime descending (most recent first)
            docs.sort((a, b) => b.createTime - a.createTime);

            const [keep, ...toDelete] = docs;
            console.log(`[DUPLICADO] Chave: ${key}`);
            console.log(`   > Mantendo: ${keep.id} (${keep.createTime.toLocaleString()})`);

            for (const docToDelete of toDelete) {
                console.log(`   - Removendo: ${docToDelete.id} (${docToDelete.createTime.toLocaleString()})`);
                batch.delete(docToDelete.ref);
                batchCount++;
                totalDeleted++;

                // Firestore batches are limited to 500 operations
                if (batchCount === 500) {
                    await batch.commit();
                    console.log('   --- Batch parcial enviado (500 operações) ---');
                    batch = db.batch();
                    batchCount = 0;
                }
            }
        }
        totalKept++;
    }

    if (batchCount > 0) {
        await batch.commit();
    }

    console.log('---');
    console.log('Resumo da Operação:');
    console.log(`Total de produtos únicos mantidos: ${totalKept}`);
    console.log(`Total de duplicados removidos: ${totalDeleted}`);
    console.log('--- Limpeza concluída com sucesso! ---');
}

cleanupDuplicates().catch(err => {
    console.error('Erro durante a limpeza:', err);
});
