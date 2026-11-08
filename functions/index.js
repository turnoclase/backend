// REF: Configuración: https://firebase.google.com/docs/firestore/quickstart-server
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');

// Inicializar la aplicación
initializeApp();

// Obtener la referencia a Firestore
const db = getFirestore();

// REF: Generador de IDs únicos: https://sqids.org/
const Sqids = require("sqids");

// Generar el código de aula y retornarlo
exports.nuevoCodigo = onCall(
    {
        region: 'europe-west1',
        enforceAppCheck: true,
    },
    (request) => {

        // Verificar que haya un token de App Check válido y, si no, retornar un error 401
        if (request.app === undefined) {
            throw new HttpsError('failed-precondition', 'The function must be called from an App Check verified app.');
        }

        const sqids = new Sqids({
            minLength: 5,
            alphabet: '123456789ABCDEFGHIJKLNPQRSTUVXYZ',
        })

        const refContador = db.collection('total').doc('aulas'); // Max: 234255 (9RRRR)

        let contador = 0;

        // Incrementar el contador en una transacción y usarlo para generar el código
        return db.runTransaction(t => {
            return t.get(refContador)
                .then(doc => {
                    contador = doc.data().contador + 1;
                    t.update(refContador, { contador: contador });
                });
        }).then(() => {
            console.log('Nuevo código generado.');
            return {
                codigo: sqids.encode(contador)
            };
        }).catch(err => {
            console.log('Error al generar el código:', err);
            return {
                codigo: "?"
            };
        });
    }
);
