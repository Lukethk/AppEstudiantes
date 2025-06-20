const { Expo } = require('expo-server-sdk');

// Crear una nueva instancia de Expo SDK
const expo = new Expo();

// Función para enviar notificación de prueba
async function sendTestNotification(pushToken) {
  // Verificar que el token sea válido
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Token inválido: ${pushToken}`);
    return;
  }

  // Crear el mensaje de notificación
  const message = {
    to: pushToken,
    sound: 'default',
    title: 'Prueba de Notificación 🧪',
    body: 'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.',
    data: {
      tipo: 'prueba',
      solicitudId: 999,
      materia: 'Prueba',
    },
  };

  // Enviar la notificación
  try {
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error al enviar chunk:', error);
      }
    }

    console.log('Notificación enviada exitosamente');
    console.log('Tickets:', tickets);

    // Verificar el estado de los tickets después de un tiempo
    setTimeout(async () => {
      const receiptIds = tickets
        .filter(ticket => ticket.id)
        .map(ticket => ticket.id);

      if (receiptIds.length > 0) {
        const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        for (let chunk of receiptIdChunks) {
          try {
            const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log('Receipts:', receipts);
          } catch (error) {
            console.error('Error al obtener receipts:', error);
          }
        }
      }
    }, 5000);

  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }
}

// Función para enviar notificación de solicitud aprobada
async function sendSolicitudAprobadaNotification(pushToken, materia = 'Matemáticas') {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Token inválido: ${pushToken}`);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: '¡Solicitud Aprobada! 🎉',
    body: `Tu solicitud para ${materia} ha sido aprobada. Fecha: ${new Date().toLocaleDateString()}`,
    data: {
      tipo: 'solicitud_aprobada',
      solicitudId: 1,
      materia: materia,
    },
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    console.log('Notificación de solicitud aprobada enviada');
  } catch (error) {
    console.error('Error al enviar notificación de solicitud aprobada:', error);
  }
}

// Función para enviar notificación de solicitud rechazada
async function sendSolicitudRechazadaNotification(pushToken, materia = 'Física', motivo = 'Insuficiente stock') {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Token inválido: ${pushToken}`);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: 'Solicitud Rechazada ❌',
    body: `Tu solicitud para ${materia} ha sido rechazada. Motivo: ${motivo}`,
    data: {
      tipo: 'solicitud_rechazada',
      solicitudId: 2,
      materia: materia,
      observaciones: motivo,
    },
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    console.log('Notificación de solicitud rechazada enviada');
  } catch (error) {
    console.error('Error al enviar notificación de solicitud rechazada:', error);
  }
}

// Función para enviar recordatorio
async function sendRecordatorioNotification(pushToken, materia = 'Química') {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Token inválido: ${pushToken}`);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: 'Recordatorio de Solicitud ⏰',
    body: `Tu solicitud para ${materia} comienza mañana. Prepárate para recoger los insumos.`,
    data: {
      tipo: 'recordatorio_solicitud',
      solicitudId: 3,
      materia: materia,
      fechaInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    console.log('Notificación de recordatorio enviada');
  } catch (error) {
    console.error('Error al enviar notificación de recordatorio:', error);
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests(pushToken) {
  console.log('🧪 Iniciando pruebas de notificaciones...\n');

  console.log('1. Enviando notificación de prueba...');
  await sendTestNotification(pushToken);
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n2. Enviando notificación de solicitud aprobada...');
  await sendSolicitudAprobadaNotification(pushToken, 'Matemáticas Avanzadas');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n3. Enviando notificación de solicitud rechazada...');
  await sendSolicitudRechazadaNotification(pushToken, 'Física Cuántica', 'Material no disponible');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n4. Enviando notificación de recordatorio...');
  await sendRecordatorioNotification(pushToken, 'Química Orgánica');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n✅ Todas las pruebas completadas');
}

// Exportar funciones para uso en otros archivos
module.exports = {
  sendTestNotification,
  sendSolicitudAprobadaNotification,
  sendSolicitudRechazadaNotification,
  sendRecordatorioNotification,
  runAllTests,
};

// Si se ejecuta directamente este archivo
if (require.main === module) {
  const pushToken = process.argv[2];
  
  if (!pushToken) {
    console.error('❌ Error: Debes proporcionar un token de notificación');
    console.log('Uso: node scripts/test-notifications.js <push-token>');
    console.log('Ejemplo: node scripts/test-notifications.js ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]');
    process.exit(1);
  }

  runAllTests(pushToken).catch(console.error);
} 