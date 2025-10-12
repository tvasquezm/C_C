// ==================== SERVICIO DE PRODUCTOS (localStorage) ====================
// Este servicio maneja la lógica para obtener, añadir, editar y eliminar productos
// del almacenamiento local del navegador (localStorage).

const ProductService = {
    _dbKey: 'pastelArteProducts',

    // Inicializa la base de datos con productos de ejemplo si no existe
    _initializeDB: function() {
        if (!localStorage.getItem(this._dbKey)) {
            const initialProducts = [
                { id: 'prod-001', name: 'Torta Selva Negra', category: 'Tortas y Kuchen', price: '$25.000', img: 'https://images.unsplash.com/photo-1589119912997-a1a8f313a7de?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400' },
                { id: 'prod-002', name: 'Galletas con Chips', category: 'Galletas y Tortas Temáticas', price: '$8.500', img: 'https://images.unsplash.com/photo-1621996346565-e326e20f4423?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400' },
                { id: 'prod-003', name: 'Cupcakes de Vainilla', category: 'Repostería y Otros Dulces', price: '$12.000', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400' },
                { id: 'prod-1606890737304', name: 'Torta Tres Leches', category: 'Tortas y Kuchen', price: '$24.000', img: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400' }
            ];
            localStorage.setItem(this._dbKey, JSON.stringify(initialProducts));
        }
    },

    // Obtiene todos los productos
    getAll: function() {
        this._initializeDB();
        return JSON.parse(localStorage.getItem(this._dbKey));
    },

    // Obtiene un producto por su ID
    getById: function(id) {
        const products = this.getAll();
        return products.find(p => p.id === id);
    },

    // Guarda todos los productos
    _saveAll: function(products) {
        localStorage.setItem(this._dbKey, JSON.stringify(products));
    },

    // Añade un nuevo producto
    add: function(productData) {
        const products = this.getAll();
        const newProduct = {
            id: `prod-${Date.now()}`, // ID único basado en el tiempo
            ...productData
        };
        products.push(newProduct);
        this._saveAll(products);
    },

    // Actualiza un producto existente
    update: function(updatedProduct) {
        let products = this.getAll();
        products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        this._saveAll(products);
    },

    // Elimina un producto por su ID
    delete: function(id) {
        let products = this.getAll();
        products = products.filter(p => p.id !== id);
        this._saveAll(products);
    }
};