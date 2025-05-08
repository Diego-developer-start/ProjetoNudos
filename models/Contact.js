const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        minlength: [3, 'Nome deve ter pelo menos 3 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
        type: String,
        required: [true, 'Telefone é obrigatório'],
        trim: true,
        match: [/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato de telefone inválido. Use (XX) XXXXX-XXXX']
    },
    subject: {
        type: String,
        required: [true, 'Assunto é obrigatório'],
        trim: true,
        minlength: [5, 'Assunto deve ter pelo menos 5 caracteres']
    },
    message: {
        type: String,
        required: [true, 'Mensagem é obrigatória'],
        trim: true,
        minlength: [10, 'Mensagem deve ter pelo menos 10 caracteres']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'read', 'replied', 'archived'],
            message: 'Status inválido'
        },
        default: 'pending'
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: 'Prioridade inválida'
        },
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para atualizar o updatedAt antes de salvar
contactSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Método para marcar como lido
contactSchema.methods.markAsRead = async function() {
    this.status = 'read';
    return this.save();
};

// Método para marcar como respondido
contactSchema.methods.markAsReplied = async function() {
    this.status = 'replied';
    return this.save();
};

// Método para arquivar
contactSchema.methods.archive = async function() {
    this.status = 'archived';
    return this.save();
};

module.exports = mongoose.models.Contact || mongoose.model('Contact', contactSchema);