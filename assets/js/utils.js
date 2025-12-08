/**
 * Muestra una notificación animada en la esquina de la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - 'success' o 'error'.
 */
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // La animación CSS se encarga de mostrar y ocultar, pero la eliminamos del DOM después.
    setTimeout(() => {
        notification.remove();
    }, 3000); // Coincide con la duración de la animación
}