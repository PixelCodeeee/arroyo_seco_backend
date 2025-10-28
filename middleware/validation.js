// Validate ID parameter
exports.validateId = (req, res, next) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
            error: 'ID inválido. Debe ser un número positivo' 
        });
    }
    
    req.params.id = id;
    next();
};

// Validate email format
exports.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate required fields
exports.validateRequiredFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `Campos requeridos faltantes: ${missingFields.join(', ')}` 
            });
        }
        
        next();
    };
};

// Sanitize input
exports.sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
};