// REF: Configuración: https://cloud.google.com/firestore/docs/quickstart
const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');

// Inicializar la aplicación (usa Application Default Credentials automáticamente en v2)
admin.initializeApp();

// Obtener la referencia a Firestore
let db = admin.firestore();

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
